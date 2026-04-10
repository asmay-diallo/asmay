// 
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import { api} from './api';
// import { User } from '../types/index';
// 
// const TOKEN_KEY = 'token';
// const USER_KEY = 'user';
// 
// // utilisez ces fonctions partout
// 
// export const saveUserData = async (user: User, token: string): Promise<void> => {
//   try {
//     await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
//     await AsyncStorage.setItem(TOKEN_KEY, token);
//     // Configurez le header axios global
//     api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//   } catch (error) {
//     console.error('Error saving user data:', error);
//     throw error;
//   }
// };
// 
// export const getUserData = async (): Promise<{ user: any; token: string } | null> => {
//   try {
//     const [userData, token] = await Promise.all([
//       AsyncStorage.getItem(USER_KEY),
//       AsyncStorage.getItem(TOKEN_KEY),
//     ]);
// 
//     if (!token || !userData) {
//       return null;
//     }
// 
//     return {
//       user: JSON.parse(userData),
//       token: token
//     };
//   } catch (error) {
//     console.error('Error getting user data:', error);
//     return null;
//   }
// };
// 
// export const removeUserData = async (): Promise<void> => {
//   try {
//     await Promise.all([
//       AsyncStorage.removeItem(USER_KEY),
//       AsyncStorage.removeItem(TOKEN_KEY)
//     ]);
//     delete api.defaults.headers.common['Authorization'];
//   } catch (error) {
//     console.error('Error removing user data:', error);
//     throw error;
//   }
// };
// 
// export const storeToken = async (token: string): Promise<void> => {
//   await AsyncStorage.setItem(TOKEN_KEY, token);
// };
// 
// export const getToken = async (): Promise<string | null> => {
//   return await AsyncStorage.getItem(TOKEN_KEY);
// };
// 
// export const removeToken = async (): Promise<void> => {
//   await AsyncStorage.removeItem(TOKEN_KEY);
// };
// 
// export const storeUserData = async (userData: any): Promise<void> => {
//   await AsyncStorage.setItem(USER_KEY, JSON.stringify(userData));
// };

import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from './api';
import { User } from '../types/index';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';
const CURRENT_USER_ID_KEY = 'currentUserId';

export const saveUserData = async (user: User, token: string): Promise<void> => {
  try {
    //  Vérifier qu'on a un utilisateur valide avec un ID
    if (!user || !user._id) {
      throw new Error('Utilisateur invalide ou sans ID');
    }

    // Vérifier qu'on ne sauvegarde pas un tableau par erreur
    if (Array.isArray(user)) {
      user = user[0];
    }

    //  Sauvegarder l'utilisateur avec son ID comme clé unique
    const userKey = `${USER_KEY}_${user._id}`;
    await AsyncStorage.setItem(userKey, JSON.stringify(user));
    
    // Sauvegarder le token
    await AsyncStorage.setItem(TOKEN_KEY, token);
    
    //  Sauvegarder l'ID de l'utilisateur courant (celui qui est connecté)
    await AsyncStorage.setItem(CURRENT_USER_ID_KEY, user._id);
    
    // Configurer le header axios global
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    console.log(` Utilisateur ${user.username} (${user._id}) sauvegardé avec succès`);
    
    //  afficher tous les utilisateurs stockés
    const allUsers = await listAllUsers();
    console.log(`📊 Total utilisateurs en storage: ${allUsers.length}`);
    
  } catch (error) {
    console.error('❌ Error saving user data:', error);
    throw error;
  }
};

/**
 * Récupère l'utilisateur actuellement connecté
 * Utilise CURRENT_USER_ID_KEY pour charger le bon utilisateur
 */
export const getUserData = async (): Promise<{ user: User | null; token: string | null }> => {
  try {
    // 1. Récupérer le token
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (!token) {
      console.log(' Aucun token trouvé');
      return { user: null, token: null };
    }

    // 2. Récupérer l'ID de l'utilisateur courant
    const currentUserId = await AsyncStorage.getItem(CURRENT_USER_ID_KEY);
    
    if (!currentUserId) {
      console.log('⚠️ Aucun ID utilisateur courant trouvé');
      return { user: null, token: token };
    }

    // 3. Récupérer l'utilisateur spécifique par son ID
    const userKey = `${USER_KEY}_${currentUserId}`;
    const userData = await AsyncStorage.getItem(userKey);

    if (!userData) {
      console.log(`⚠️ Aucune donnée pour l'utilisateur ${currentUserId}`);
      
      // Tentative de récupération depuis l'ancien format (pour migration)
      const oldUserData = await AsyncStorage.getItem(USER_KEY);
      if (oldUserData) {
        console.log(' Tentative de migration depuis ancien format...');
        const parsed = JSON.parse(oldUserData);
        
        // Si c'est un tableau, chercher l'utilisateur avec le bon ID
        if (Array.isArray(parsed)) {
          const correctUser = parsed.find(u => u._id === currentUserId);
          if (correctUser) {
            // Sauvegarder au nouveau format
            await AsyncStorage.setItem(userKey, JSON.stringify(correctUser));
            console.log(` Utilisateur ${correctUser.username} migré avec succès`);
            return { user: correctUser, token };
          }
        }
      }
      
      return { user: null, token: token };
    }

    const user = JSON.parse(userData);
    
    console.log(` Utilisateur ${user.username} (${user._id}) chargé depuis AsyncStorage`);
    
    return {
      user: user,
      token: token
    };
    
  } catch (error) {
    console.error('❌ Error getting user data:', error);
    return { user: null, token: null };
  }
};

/**
 * Supprime les données de l'utilisateur courant
 */
export const removeUserData = async (): Promise<void> => {
  try {
    const currentUserId = await AsyncStorage.getItem(CURRENT_USER_ID_KEY);
    
    if (currentUserId) {
      const userKey = `${USER_KEY}_${currentUserId}`;
      await AsyncStorage.removeItem(userKey);
      await AsyncStorage.removeItem(CURRENT_USER_ID_KEY);
      console.log(`✅ Utilisateur ${currentUserId} supprimé`);
    }
    
    await AsyncStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common['Authorization'];
    
    console.log('✅ Toutes les données utilisateur supprimées');
    
  } catch (error) {
    console.error('❌ Error removing user data:', error);
    throw error;
  }
};

/**
 * Stocke uniquement le token
 */
export const storeToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log('✅ Token sauvegardé');
  } catch (error) {
    console.error('❌ Error storing token:', error);
    throw error;
  }
};

/**
 * Récupère uniquement le token
 */
export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('❌ Error getting token:', error);
    return null;
  }
};

/**
 * Supprime uniquement le token
 */
export const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common['Authorization'];
    console.log('✅ Token supprimé');
  } catch (error) {
    console.error('❌ Error removing token:', error);
    throw error;
  }
};

export const storeUserData = async (userData: any): Promise<void> => {
  console.warn('⚠️ storeUserData est déprécié, utilisez saveUserData');
  try {
    if (!userData) return;
    
    // Si c'est un tableau, prendre le premier élément
    const userToStore = Array.isArray(userData) ? userData[0] : userData;
    
    if (userToStore && userToStore._id) {
      const userKey = `${USER_KEY}_${userToStore._id}`;
      await AsyncStorage.setItem(userKey, JSON.stringify(userToStore));
      await AsyncStorage.setItem(CURRENT_USER_ID_KEY, userToStore._id);
      console.log(`✅ Données utilisateur ${userToStore.username} sauvegardées (via storeUserData)`);
    } else {
      console.error('❌ Impossible de sauvegarder: utilisateur sans ID');
    }
    
  } catch (error) {
    console.error('❌ Error storing user data:', error);
    throw error;
  }
};

/**
 * Change d'utilisateur (utile pour le debug)
 */
export const switchUser = async (userId: string): Promise<boolean> => {
  try {
    const userKey = `${USER_KEY}_${userId}`;
    const userData = await AsyncStorage.getItem(userKey);
    
    if (!userData) {
      console.log(`❌ Utilisateur ${userId} non trouvé`);
      return false;
    }
    
    await AsyncStorage.setItem(CURRENT_USER_ID_KEY, userId);
    const user = JSON.parse(userData);
    console.log(`🔄 Utilisateur changé pour ${user.username} (${userId})`);
    
    return true;
    
  } catch (error) {
    console.error('❌ Erreur switch user:', error);
    return false;
  }
};

/**
 * Liste tous les utilisateurs stockés (pour debug)
 */
export const listAllUsers = async (): Promise<User[]> => {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const userKeys = allKeys.filter(key => key.startsWith(`${USER_KEY}_`));
    
    const users = await Promise.all(
      userKeys.map(async (key) => {
        const data = await AsyncStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      })
    );
    
    return users.filter(u => u !== null);
    
  } catch (error) {
    console.error('❌ Erreur liste users:', error);
    return [];
  }
};


export const migrateFromOldFormat = async (): Promise<void> => {
  try {
    console.log('🔄 Vérification de l\'ancien format de stockage...');
    
    // Vérifier si l'ancien format existe
    const oldUserData = await AsyncStorage.getItem(USER_KEY);
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    
    if (!oldUserData) {
      console.log('✅ Ancien format non trouvé, pas de migration nécessaire');
      return;
    }
    
    const parsed = JSON.parse(oldUserData);
    
    // Si c'est un tableau, c'est l'ancien format
    if (Array.isArray(parsed)) {
      console.log(`📊 Ancien format trouvé: ${parsed.length} utilisateurs`);
      
      // Migrer chaque utilisateur vers le nouveau format
      for (const user of parsed) {
        if (user && user._id) {
          const userKey = `${USER_KEY}_${user._id}`;
          await AsyncStorage.setItem(userKey, JSON.stringify(user));
          console.log(`  ✅ ${user.username} (${user._id}) migré`);
        }
      }
      
      // Définir le premier utilisateur comme courant (ou celui qui correspond au token)
      if (parsed.length > 0 && parsed[0]._id) {
        await AsyncStorage.setItem(CURRENT_USER_ID_KEY, parsed[0]._id);
        console.log(`👤 Utilisateur courant défini: ${parsed[0].username}`);
      }
      
      // Supprimer l'ancien format
      await AsyncStorage.removeItem(USER_KEY);
      console.log('✅ Migration terminée, ancien format supprimé');
      
    } else {
      // C'est déjà un objet unique, mais on vérifie s'il a un ID
      if (parsed && parsed._id) {
        const userKey = `${USER_KEY}_${parsed._id}`;
        await AsyncStorage.setItem(userKey, JSON.stringify(parsed));
        await AsyncStorage.setItem(CURRENT_USER_ID_KEY, parsed._id);
        await AsyncStorage.removeItem(USER_KEY);
        console.log(`✅ Objet unique migré: ${parsed.username}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erreur migration:', error);
  }
};

/**
 * Fonction de debug pour voir l'état complet du storage
 */
export const debugStorage = async (): Promise<void> => {
  try {
    console.log('\n🔍 ÉTAT COMPLET DU STORAGE:');
    
    const allKeys = await AsyncStorage.getAllKeys();
    const allData = await AsyncStorage.multiGet(allKeys);
    
    // Trier les clés pour une meilleure lisibilité
    allData.sort(([keyA], [keyB]) => keyA.localeCompare(keyB));
    
    allData.forEach(([key, value]) => {
      try {
        const parsed = value ? JSON.parse(value) : null;
        if (key.startsWith(USER_KEY)) {
          console.log(`  📌 ${key}:`, parsed?.username ? `User: ${parsed.username}` : parsed);
        } else {
          console.log(`  📌 ${key}:`, parsed ?? value);
        }
      } catch {
        console.log(`  📌 ${key}:`, value);
      }
    });
    
    // Informations spécifiques
    const currentUserId = await AsyncStorage.getItem(CURRENT_USER_ID_KEY);
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    
    console.log('\n👤 UTILISATEUR COURANT:');
    if (currentUserId) {
      const userKey = `${USER_KEY}_${currentUserId}`;
      const userData = await AsyncStorage.getItem(userKey);
      if (userData) {
        const user = JSON.parse(userData);
        console.log(`  ID: ${user._id}`);
        console.log(`  Nom: ${user.username}`);
        console.log(`  Email: ${user.email}`);
        console.log(`  Photo: ${user.profilePicture ? '✓' : '✗'}`);
      } else {
        console.log(`  ID: ${currentUserId} (données manquantes)`);
      }
    } else {
      console.log('  Aucun utilisateur courant');
    }
    
    console.log(`🔑 Token: ${token ? token.substring(0, 20) + '...' : 'absent'}\n`);
    
  } catch (error) {
    console.error('❌ Erreur debug:', error);
  }
};

/**
 * Reset complet du storage (à utiliser en dernier recours)
 */
export const resetAllStorage = async (): Promise<void> => {
  try {
    await AsyncStorage.clear();
    delete api.defaults.headers.common['Authorization'];
    console.log('🗑️ Tous les stockages ont été réinitialisés');
  } catch (error) {
    console.error('❌ Erreur reset:', error);
    throw error;
  }
};