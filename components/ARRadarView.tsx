
import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Dimensions,
  TextInput,
  Modal
} from "react-native";
import { useSocket } from "../hooks/useSocket";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import PublicProfileScreen from "./PublicProfileScreen";

const { width } = Dimensions.get("window");

// Types
export interface ARUser {
  _id: string;
  username: string;
  profilePicture?: string | null;
  distance: number;
  bearing: number;
  interests?: {
    common: string[];
    count: number;
  };
  precision?: {
    level: number;
    text: string;
    icon: string;
    type:string,
    shortName:string,
    fullName:string
  };
  lastActive?: Date;
  isOnline?: boolean;
}

export interface UserListViewProps {
  users: ARUser[];
  isSendingSignal: string | null;
  onUserPress: (userId: string) => void;
  currentLocation: { latitude: number; longitude: number };
  onRefresh?: () => void;
  refreshing?: boolean;
  ListHeaderComponent?: React.ReactElement;
  onSearch?: (query: string) => void;
  showSearchBar?: boolean;
}

const ARRadarView: React.FC<UserListViewProps> = ({
  users,
  isSendingSignal,
  onUserPress,
  currentLocation,
  onRefresh,
  refreshing = false,
  ListHeaderComponent,
  onSearch,
  showSearchBar = true,
}) => {
  const { onlineUsers } = useSocket();
  const router = useRouter();
  
  // États
  const [onlineCount, setOnlineCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState<ARUser[]>(users);
  const [searchMode, setSearchMode] = useState<'local' | 'api'>('local');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userLocationPlace,setUserLocationPlace] = useState<string | undefined>(undefined)
  const [userDistance,setUserDistance]= useState<number | undefined>(undefined)

  const [isUserProfileVisible, setIsUserProfileVisible] = useState(false);

  // Mettre à jour le compteur en ligne
  useEffect(() => {
    if (users.length > 0 && onlineUsers) {
      const count = users.filter(user => onlineUsers.includes(user._id)).length;
      setOnlineCount(count);
    }
  }, [users, onlineUsers]);

  // Mettre à jour les utilisateurs filtrés
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter(user => {
        const usernameMatch = user.username.toLowerCase().includes(query);
        const interestsMatch = user.interests?.common?.some(
          interest => interest.toLowerCase().includes(query)
        ) || false;
        return usernameMatch || interestsMatch;
      });
      setFilteredUsers(filtered);
    }
  }, [users, searchQuery]);

  // Gestionnaire de recherche
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (onSearch && text.length > 2) {
      setSearchMode('api');
      onSearch(text);
    } else {
      setSearchMode('local');
    }
  };

  // Gestionnaire d'ouverture de profil
  const handleOpenProfile = (userId: string,) => {
    const user = users.find((user)=>user._id === userId)
    const place = user?.precision?.text
    const distance = user?.distance
    setSelectedUserId(userId);
    setUserLocationPlace(place)
    setUserDistance(distance)
    setIsUserProfileVisible(true);
  };

  // Gestionnaire de fermeture de profil
  const handleCloseProfile = () => {
    setIsUserProfileVisible(false);
   setUserLocationPlace(undefined)
    setSelectedUserId(null);
  };

  //  Vérifier si un utilisateur est en ligne
   
  const isUserOnline = (userId: string): boolean => {
    return onlineUsers?.includes(userId) || false;
  };

  //  Obtient la couleur en fonction de la distance
  const getDistanceColor = (distance: number): string => {
    if (distance <= 25) return '#FF3B30';
    if (distance <= 50) return '#FF9500';
    if (distance <= 100) return '#34C759';
    if (distance <= 500) return '#007AFF';
    return '#8E8E93';
  };

  /**
   * Obtient l'icône de précision
   */
  const getPrecisionIcon = (precision?: ARUser['precision']): string => {
    if (!precision) return '📍';
    if (precision.level >= 7) return '🏠';
    if (precision.level >= 5) return '🏘️';
    if (precision.level >= 4) return '🏙️';
    if (precision.level >= 2) return '🌍';
    return '🌎';
  };

  /**
   * Obtient la flèche directionnelle
   */
  const getDirectionArrow = (bearing: number): string => {
    const normalizedBearing = ((bearing % 360) + 360) % 360;
    
    if (normalizedBearing >= 337.5 || normalizedBearing < 22.5) return '⬆️';
    if (normalizedBearing >= 22.5 && normalizedBearing < 67.5) return '↗️';
    if (normalizedBearing >= 67.5 && normalizedBearing < 112.5) return '➡️';
    if (normalizedBearing >= 112.5 && normalizedBearing < 157.5) return '↘️';
    if (normalizedBearing >= 157.5 && normalizedBearing < 202.5) return '⬇️';
    if (normalizedBearing >= 202.5 && normalizedBearing < 247.5) return '↙️';
    if (normalizedBearing >= 247.5 && normalizedBearing < 292.5) return '⬅️';
    if (normalizedBearing >= 292.5 && normalizedBearing < 337.5) return '↖️';
    return '⬆️';
  };

  /**
   * Formate la distance
   */
  const formatDistance = (distance: number): string => {
    if (distance < 1000) {
      return `${Math.round(distance)} m`;
    } else {
      return `${(distance / 1000).toFixed(0)} km`;
    }
  };

  /**
   * Calcule le temps écoulé depuis la dernière activité
   */
  const getLastActiveText = (lastActive?: Date): string => {
    if (!lastActive) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - new Date(lastActive).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'En ligne';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Il y a ${diffDays} j`;
  };

  /**
   * Rendu de la barre de recherche
   */
  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Ionicons name="search" size={20} color="rgba(255,255,255,0.5)" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher par nom ou intérêt..."
          placeholderTextColor="rgba(255,255,255,0.5)"
          value={searchQuery}
          onChangeText={handleSearch}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch("")}>
            <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        )}
      </View>
      
      {searchQuery.length > 0 && (
        <View style={styles.searchResultsInfo}>
          <Text style={styles.searchResultsText}>
            {filteredUsers.length} résultat{filteredUsers.length > 1 ? 's' : ''}
            {searchMode === 'api' ? ' (recherche avancée)' : ''}
          </Text>
        </View>
      )}
    </View>
  );

  /**
   * Rendu de l'en-tête avec le compteur
   */
  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <View style={styles.onlineCounter}>
        <View style={styles.onlineDot} />
        <Text style={styles.onlineCounterText}>
          {onlineCount} en ligne
        </Text>
      </View>
    </View>
  );

  /**
   * Rendu d'un élément utilisateur
   */
  const renderUserItem = ({ item: user }: { item: ARUser }) => {
    const isSending = isSendingSignal === user._id;
    const online = isUserOnline(user._id);
    
    
    // Mettre en évidence les termes recherchés
    const highlightSearch = (text: string): JSX.Element => {
      if (!searchQuery || searchQuery.length < 2) {
        return <Text style={styles.username}>{text}</Text>;
      }
      
      const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
      return (
        <Text style={styles.username}>
          {parts.map((part, index) => 
            part.toLowerCase() === searchQuery.toLowerCase() ? (
              <Text key={index} style={styles.highlightedText}>{part}</Text>
            ) : (
              <Text key={index}>{part}</Text>
            )
          )}
        </Text>
      );
    };

    return (
      <TouchableOpacity
        style={[
          styles.userCard,
          online && styles.userCardOnline
        ]}
        disabled={isSending}
        activeOpacity={0.7}
        testID={`user-card-${user._id}`}
      >
        {/* Photo de profil avec indicateur de statut */}
        <TouchableOpacity 
          style={styles.avatarContainer} 
          onPress={() => handleOpenProfile(user._id)}
        >
          {user.profilePicture ? (
            <Image 
              source={{ uri: user.profilePicture }} 
              style={styles.avatar}
              defaultSource={require('../assets/images/asmay-splash-screen.png')}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user.username?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
          )}
          
          {online && <View style={styles.onlineIndicator} />}
          
          {isSending && (
            <View style={styles.sendingBadge}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          )}
        </TouchableOpacity>

        {/* Informations utilisateur */}
        <TouchableOpacity 
          style={styles.userInfo}
         onPress={() => onUserPress(user._id)}
        >
          {/* Nom et distance */}
          <View style={styles.nameRow}>
            {highlightSearch(user.username)}
            <Text style={[styles.distance, { color: getDistanceColor(user.distance) }]}>
              {formatDistance(user.distance)}
            </Text>
          </View>

          {/* Localisation */}
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>
              {user.precision?.icon}
            </Text>
            <Text style={styles.locationText} numberOfLines={1}>
             {user.precision?.fullName}
            </Text>
          </View>
            <Text style={styles.locationText} numberOfLines={1}>
               {user.precision?.type}
            </Text>

          {/* Intérêts communs */}
          {user.interests && user.interests.count > 0 && (
            <View style={styles.interestsContainer}>
              <Text style={styles.interestsText}>
                {user.interests.count} intérêt{user.interests.count > 1 ? 's' : ''} commun{user.interests.count > 1 ? 's' : ''}
              </Text>
              
              {/* Aperçu des intérêts */}
              {user.interests.common && user.interests.common.length > 0 && (
                <View style={styles.interestsPreview}>
                  {user.interests.common.slice(0, 2).map((interest: string, idx: number) => (
                    <Text key={`${user._id}-interest-${idx}`} style={styles.interestTag}>
                      {interest}
                    </Text>
                  ))}
                  {user.interests.common.length > 2 && (
                    <Text style={styles.moreInterests}>
                      +{user.interests.common.length - 2}
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Statut en ligne ou dernière activité */}
          <Text style={styles.statusText}>
            {online ? (
              <Text style={styles.onlineText}>● En ligne</Text>
            ) : (
              user.lastActive && getLastActiveText(user.lastActive)
            )}
          </Text>
        </TouchableOpacity>

        {/* Direction */}
        <View style={styles.directionContainer}>
          <Text style={styles.directionArrow}>
            {getDirectionArrow(user.bearing)}
          </Text>
          <Text style={styles.bearing}>{Math.round(user.bearing)}°</Text>
        </View>
      </TouchableOpacity>
    );
  };

  /**
   * Rendu de la liste vide
   */
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>
        {searchQuery.length > 0 ? '🔍' : '👥'}
      </Text>
      <Text style={styles.emptyTitle}>
        {searchQuery.length > 0 ? 'Aucun résultat' : 'Aucun utilisateur trouvé'}
      </Text>
      <Text style={styles.emptyText}>
        {searchQuery.length > 0 
          ? `Aucun utilisateur ne correspond à "${searchQuery}"`
          : 'Élargissez votre recherche ou réessayez plus tard'}
      </Text>
      {searchQuery.length > 0 && (
        <TouchableOpacity 
          style={styles.clearSearchButton}
          onPress={() => handleSearch("")}
        >
          <Text style={styles.clearSearchText}>Effacer la recherche</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  /**
   * Rendu du séparateur
   */
  const renderSeparator = () => <View style={styles.separator} />;

  return (
    <>
      <FlatList
        data={filteredUsers}
        keyExtractor={(item) => item._id}
        renderItem={renderUserItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        ListHeaderComponent={
          <>
            {ListHeaderComponent}
            {showSearchBar && renderSearchBar()}
            {renderHeader()}
          </>
        }
        ItemSeparatorComponent={renderSeparator}
        onRefresh={onRefresh}
        refreshing={refreshing}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
      />

      {/* {/* Modal de profil public - } */}
      <Modal
        visible={isUserProfileVisible}
        transparent
        animationType="slide"
        onRequestClose={handleCloseProfile}
      >
        <View style={styles.modalContainer}>
          {/* <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCloseProfile} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View> */}
          {selectedUserId && (
            <PublicProfileScreen 
              userId={selectedUserId} 
              userPlace={userLocationPlace}
              userDistance={userDistance}
              onClose={handleCloseProfile}
            />
          )}
        </View>
      </Modal>
    </>
  );
};

// Styles
const styles = StyleSheet.create({
  listContainer: {
    paddingTop: 16,
    paddingBottom: 32,
    flexGrow: 1,
  },
  // Styles de recherche
  searchContainer: {
    top: 25,
    paddingHorizontal: 14,
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    width: 260,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#fff',
    fontSize: 12,
    paddingVertical: 6,
  },
  searchResultsInfo: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  searchResultsText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    fontStyle: 'italic',
  },
  // Styles d'en-tête
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  onlineCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(52, 199, 89, 0.3)',
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
    marginRight: 6,
  },
  onlineCounterText: {
    color: '#34C759',
    fontSize: 13,
    fontWeight: '600',
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(8, 8, 8, 0.08)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 252, 252, 0.1)',
    width: width - 32,
    alignSelf: 'center',
  },
  userCardOnline: {
    borderColor: '#34C759',
    borderWidth: 1.5,
    backgroundColor: 'rgba(52, 199, 89, 0.05)',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#34C759',
    borderWidth: 2,
    borderColor: '#fff',
  },
  sendingBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#fff',
  },
  userInfo: {
    flex: 1,
    marginRight: 8,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  highlightedText: {
    backgroundColor: 'rgba(255, 215, 0, 0.3)',
    color: '#FFD700',
    fontWeight: 'bold',
  },
  distance: {
    fontSize: 14,
    fontWeight: '600',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  locationText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    flex: 1,
  },
  interestsContainer: {
    marginBottom: 4,
  },
  interestsText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  interestsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  interestTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 2,
    color: '#fff',
    fontSize: 10,
  },
  moreInterests: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
    marginLeft: 2,
  },
  statusText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    marginTop: 2,
  },
  onlineText: {
    color: '#34C759',
    fontWeight: '600',
  },
  directionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },
  directionArrow: {
    fontSize: 24,
  },
  bearing: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  clearSearchButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  clearSearchText: {
    color: '#fff',
    fontSize: 14,
  },
  separator: {
    height: 8,
  },
  // Styles pour le modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#203447ff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 50,
    paddingRight: 20,
    paddingBottom: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ARRadarView;