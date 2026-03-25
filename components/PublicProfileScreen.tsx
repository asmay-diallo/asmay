import React, { useState, useEffect, useCallback ,useRef} from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ImageBackground,
} from "react-native";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import { useAuth } from "../hooks/useAuth";
import { userAPI } from "../services/api";
import { useSocket } from "../hooks/useSocket";

interface PublicUser {
  _id: string;
  username: string;
  profilePicture?: string | null;
  interests?: string[];
  bio?: string;
  lastActive?: Date;
  isOnline?: boolean;
  privacySettings?: {
    isVisible: boolean;
    showCommonInterestsOnly: boolean;
    showOnRadar: boolean;
  };
  connections?: string[];
  followers?: string[];
  followings?: string[];
}

interface PublicProfileScreenProps {
  userId: string;
  onClose?: () => void; // Pour fermer le modal depuis l'intérieur
}

// Configuration publicitaire
const adUnitId = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : "ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy";

export default function PublicProfileScreen({ userId, onClose }: PublicProfileScreenProps) {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const { onlineUsers } = useSocket();

  const [profile, setProfile] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [commonInterests, setCommonInterests] = useState<string[]>([]);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  
    const bannerRef = useRef<BannerAd>(null);

  // ==================== CHARGEMENT DU PROFIL ====================
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userAPI.getUserById(userId);
      
      if (response.data.success && response.data.data) {
        const userData = response.data.data;
        setProfile(userData);

        // Vérifier si c'est le profil de l'utilisateur connecté
        setIsCurrentUser(currentUser?._id === userId);

        // Calculer les intérêts communs
        if (currentUser?.interests && userData.interests) {
          const common = currentUser.interests.filter(
            (interest) => userData.interests.includes(interest)
          );
          setCommonInterests(common);
        }

        // Vérifier si l'utilisateur est en ligne
        setIsConnected(onlineUsers?.includes(userData._id) || false);
      }
    } catch (error: any) {
      console.error("❌ Erreur chargement profil:", error);
      
      if (error.response?.status === 403) {
        Alert.alert(
          "Profil privé",
          "Cet utilisateur a rendu son profil privé"
        );
      } else if (error.response?.status === 404) {
        Alert.alert(
          "Utilisateur introuvable",
          "Ce profil n'existe pas ou a été supprimé"
        );
      } else {
        Alert.alert(
          "Erreur",
          "Impossible de charger le profil"
        );
      }
      
      // Si onClose est fourni, on ferme le modal, sinon on retourne
      if (onClose) {
        onClose();
      } else {
        router.back();
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, currentUser, onlineUsers, onClose, router]);

  // ==================== INITIALISATION ====================
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ==================== MISE À JOUR DU STATUT EN LIGNE ====================
  useEffect(() => {
    if (profile && onlineUsers) {
      setIsConnected(onlineUsers.includes(profile._id));
    }
  }, [onlineUsers, profile]);

  // ==================== FORMATAGE ====================
  const formatLastActive = (lastActive?: Date): string => {
    if (!lastActive) return 'Jamais connecté';
    
    const now = new Date();
    const diffMs = now.getTime() - new Date(lastActive).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'En ligne';
    if (diffMins < 60) return `Vu il y a ${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Vu il y a ${diffHours} h`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `Vu il y a ${diffDays} j`;
    
    return `Vu le ${new Date(lastActive).toLocaleDateString("fr-FR")}`;
  };

  // ==================== GESTIONNAIRES D'ACTIONS ====================
  const handleSendSignal = () => {
    // TODO: Implémenter l'envoi de signal
    Alert.alert("Info", "Cette fonctionnalité n'est pas encore active");
  };

  const handleAddConnection = () => {
    // TODO: Implémenter l'ajout de connexion
    Alert.alert("Info", "Cette fonctionnalité n'est pas encore active");
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  // ==================== RENDU ====================
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Chargement du profil...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="sad-outline" size={70} color="#fff" />
        <Text style={styles.errorTitle}>Profil introuvable</Text>
        <TouchableOpacity style={styles.backButton} onPress={handleClose}>
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={loadProfile} />
      }
    >
      {/* Header avec image de fond */}
      <ImageBackground
        source={require("../assets/images/asmay-home.png")}
        style={styles.header}
      >
        <TouchableOpacity 
          style={styles.backIcon}
          onPress={handleClose}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
      </ImageBackground>

      {/* Photo de profil */}
      <View style={styles.avatarContainer}>
        {profile.profilePicture ? (
          <Image 
            source={{ uri: profile.profilePicture }} 
            style={styles.avatar}
          />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {profile.username?.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        
        {/* Indicateur de statut */}
        {isConnected && <View style={styles.onlineIndicator} />}
      </View>

      {/* Informations principales */}
      <View style={styles.infoSection}>
        <View style={styles.nameRow}>
          <Text style={styles.username}>{profile.username}</Text>
          <Text style={styles.status}>
            {isConnected ? '● En ligne' : formatLastActive(profile.lastActive)}
          </Text>
        </View>

        {/* Bio */}
        {profile.bio ? (
          <Text style={styles.bio}>{profile.bio}</Text>
        ) : (
          <Text style={styles.bioEmpty}>Aucune bio</Text>
        )}
      </View>

      {/* Statistiques */}
      <View style={styles.statsSection}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{profile.connections?.length || 0}</Text>
          <Text style={styles.statLabel}>Connexions</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{profile.followers?.length || 0}</Text>
          <Text style={styles.statLabel}>Abonnés</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{profile.followings?.length || 0}</Text>
          <Text style={styles.statLabel}>Abonnements</Text>
        </View>
      </View>

      {/* Centres d'intérêt */}
      {profile.interests && profile.interests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Centres d'intérêt</Text>
          <View style={styles.interestsContainer}>
            {profile.interests.map((interest, index) => {
              const isCommon = commonInterests.includes(interest);
              return (
                <View 
                  key={index} 
                  style={[
                    styles.interestTag,
                    isCommon && styles.commonInterestTag
                  ]}
                >
                  <Text style={[
                    styles.interestText,
                    isCommon && styles.commonInterestText
                  ]}>
                    {interest}
                    {isCommon && ' ✓'}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Actions - Ne pas afficher pour son propre profil */}
      {!isCurrentUser && (
        <View style={styles.actionsSection}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleSendSignal}
          >
            <Ionicons name="flash" size={20} color="#fff" />
            <Text style={styles.actionText}>Envoyer un signal</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleAddConnection}
          >
            <Ionicons name="person-add" size={20} color="#fff" />
            <Text style={styles.actionText}>Ajouter</Text>
          </TouchableOpacity>
        </View>
      )}
             {/* Bannière publicitaire */}
                    <BannerAd 
                      ref={bannerRef} 
                      unitId={adUnitId} 
                      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} 
                    />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#203447ff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#203447ff',
    padding: 20,
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
  errorTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 20,
  },
  backButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    height: 150,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  backIcon: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    alignSelf: 'center',
    marginTop: -50,
    marginBottom: 16,
    position: 'relative',
  },
  avatar: {
    width: 210,
    height: 210,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#f99304',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
  },
  avatarText: {
    color: '#fff',
    fontSize: 48,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  infoSection: {
    padding: 20,
    alignItems: 'center',
  },
  nameRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  username: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  status: {
    color: 'rgba(246, 226, 4, 0.7)',
    fontSize: 14,
    fontWeight:"bold"
  },
  bio: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  bioEmpty: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  interestsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  commonInterestTag: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  interestText: {
    color: '#fff',
    fontSize: 14,
  },
  commonInterestText: {
    fontWeight: 'bold',
  },
  actionsSection: {
    padding: 20,
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#007bff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  secondaryButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});