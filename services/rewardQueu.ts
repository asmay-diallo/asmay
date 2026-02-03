import AsyncStorage from '@react-native-async-storage/async-storage';
import { userAPI, RewardRequest } from './api';

const REWARD_QUEUE_KEY = '@asmay_pending_rewards';
const MAX_ATTEMPTS = 5;
const BASE_DELAY = 60000; // 1 minute

// Types pour la file d'attente
export interface PendingReward {
  id: string;
  rewardType: RewardRequest['rewardType'];
  timestamp: string;
  attempts: number;
  nextRetry: string | null;
}

// Structure d'une récompense en attente
const createPendingReward = (rewardType: RewardRequest['rewardType']): PendingReward => ({
  id: `reward_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  rewardType,
  timestamp: new Date().toISOString(),
  attempts: 0,
  nextRetry: null
});

// Calcul du délai de backoff (1, 2, 4, 8, 16 min... max 1h)
const calculateBackoff = (attempts: number): number => {
  return Math.min(BASE_DELAY * Math.pow(2, attempts), 3600000);
};

// AJOUTER à la file
export const addRewardToQueue = async (rewardType: RewardRequest['rewardType']): Promise<string | null> => {
  try {
    const queue = await getRewardQueue();
    
    // Limite de sécurité
    if (queue.length >= 50) {
      console.warn('⚠️ File d\'attente pleine (50+)');
      return null;
    }
    
    const newReward = createPendingReward(rewardType);
    queue.push(newReward);
    await AsyncStorage.setItem(REWARD_QUEUE_KEY, JSON.stringify(queue));
    console.log('📥 Ajouté à la file:', newReward.id);
    return newReward.id;
  } catch (error) {
    console.error('❌ Erreur addRewardToQueue:', error);
    return null;
  }
};

// RÉCUPÉRER la file
export const getRewardQueue = async (): Promise<PendingReward[]> => {
  try {
    const queue = await AsyncStorage.getItem(REWARD_QUEUE_KEY);
    return queue ? JSON.parse(queue) : [];
  } catch (error) {
    console.error('❌ Erreur getRewardQueue:', error);
    return [];
  }
};

// Mettre à jour la file (utilitaire interne)
const updateRewardQueue = async (queue: PendingReward[]): Promise<void> => {
  await AsyncStorage.setItem(REWARD_QUEUE_KEY, JSON.stringify(queue));
};

// TRAITER la file (à appeler quand la connexion revient)
export const processRewardQueue = async (): Promise<number> => {
  const queue = await getRewardQueue();
  if (queue.length === 0) return 0;

  const now = new Date();
  const updatedQueue: PendingReward[] = [];
  let successCount = 0;

  for (const reward of queue) {
    // Vérifier si on peut retenter
    const canRetry = !reward.nextRetry || new Date(reward.nextRetry) <= now;
    const maxAttemptsReached = reward.attempts >= MAX_ATTEMPTS;

    if (!canRetry || maxAttemptsReached) {
      updatedQueue.push(reward);
      continue;
    }

    try {
      // Tenter la synchronisation
      await userAPI.addReward({
        rewardType: reward.rewardType,
        rewardId: reward.id
      });
      
      console.log(`✅ Récompense ${reward.id} synchronisée`);
      successCount++;
      // NE PAS remettre dans updatedQueue = suppression
      
    } catch (error: any) {
      // Échec : mettre à jour avec backoff
      reward.attempts++;
      const delay = calculateBackoff(reward.attempts);
      reward.nextRetry = new Date(Date.now() + delay).toISOString();
      updatedQueue.push(reward);
      
      console.log(`⏳ Nouvelle tentative dans ${delay/1000}s (tentative ${reward.attempts})`);
      
      if (reward.attempts >= MAX_ATTEMPTS) {
        console.warn(`🚨 Récompense ${reward.id} abandonnée après ${MAX_ATTEMPTS} tentatives`);
        // Optionnel: Notifier l'utilisateur ou envoyer aux logs serveur
      }
    }
  }

  // Sauvegarder la file mise à jour
  await updateRewardQueue(updatedQueue);
  console.log(`📊 File traitée: ${successCount} succès, ${updatedQueue.length} en attente`);
  
  return successCount;
};

// Nettoyer les anciennes entrées (optionnel)
export const cleanupRewardQueue = async (maxAgeDays: number = 7): Promise<void> => {
  const queue = await getRewardQueue();
  const cutoffDate = new Date(Date.now() - maxAgeDays * 24 * 60 * 60 * 1000);
  
  const filteredQueue = queue.filter(reward => 
    new Date(reward.timestamp) > cutoffDate
  );
  
  if (filteredQueue.length !== queue.length) {
    await updateRewardQueue(filteredQueue);
    console.log(`🧹 Nettoyage file: ${queue.length - filteredQueue.length} entrées supprimées`);
  }
};