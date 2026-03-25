

import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
  ImageBackground,
} from "react-native";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import NetInfo from "@react-native-community/netinfo";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";

// Hooks Redux
import { useChats } from "../../../hooks/useChats";
import { useAuth } from "../../../hooks/useAuth";
import { useSocket } from "../../../hooks/useSocket";

// Components
import Input from "@/components/Input";

// Configuration publicitaire
const adUnitId = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : "ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy";

export default function MessagesScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { onlineUsers } = useSocket();
  const bannerRef = useRef<BannerAd>(null);

  // Hook Redux pour les chats
  const { 
    chats, 
    loading, 
    loadChats, 
    getOtherUser, 
    getLastMessageTime, 
    unreadCount: globalUnreadCount,
    getChatUnreadCount,
    markAsRead
  } = useChats();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [networkConnected, setNetworkConnected] = useState(true);

  // Vérifier connexion réseau
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetworkConnected(!!state.isConnected);
    });
    return () => unsubscribe();
  }, []);

  // Recharger au focus
  useFocusEffect(
    useCallback(() => {
      loadChats();
    }, [loadChats])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadChats().finally(() => setRefreshing(false));
  };

  const formatTime = (timestamp: string): string => {
    return getLastMessageTime(timestamp);
  };

  const isUserOnline = (userId: string): boolean => {
    return onlineUsers?.includes(userId) || false;
  };

  const getLastActiveText = (lastActive?: string | Date): string => {
    if (!lastActive) return 'Hors ligne';
    
    const now = new Date();
    const lastActiveDate = new Date(lastActive);
    const diffMs = now.getTime() - lastActiveDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'En ligne';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Il y a ${diffDays} j`;
  };

  const filteredChats = chats.filter((chat) => {
    if (!searchQuery.trim()) return true;
    const otherUser = getOtherUser(chat);
    if (otherUser && typeof otherUser === 'object') {
      return otherUser.username?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return false;
  });

  const renderChatItem = ({ item }: { item: any }) => {
    const otherUser = getOtherUser(item);
    if (!otherUser || typeof otherUser !== 'object') return null;

    const online = isUserOnline(otherUser._id);
    const lastActiveText = getLastActiveText(otherUser.lastActive);
    
    // 🔥 Utiliser getChatUnreadCount pour obtenir le vrai compteur
    const chatUnreadCount = getChatUnreadCount(item._id);
      console.log("Chat unreadCount : ",chatUnreadCount);
      
  const lastMessage = item.lastMessage || "Démarrer la conversation";
      
    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => {
          // Marquer comme lu avant de naviguer
          markAsRead(item._id);
          router.push(`/(main)/(asmay)/chat/${item._id}`);
        }}
        activeOpacity={0.7}
      >
        <View style={styles.avatarWrapper}>
          {otherUser.profilePicture ? (
            <Image source={{ uri: otherUser.profilePicture }} style={styles.image} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {otherUser.username?.charAt(0)?.toUpperCase() || "?"}
              </Text>
            </View>
          )}
          <View style={[styles.statusDot, online ? styles.online : styles.offline]} />
        </View>

        <View style={styles.chatInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.username} numberOfLines={1}>
              {otherUser.username}
            </Text>
            <Text style={[styles.statusText, online && styles.onlineText]}>
              {online ? "● En ligne" : lastActiveText}
            </Text>
          </View>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {lastMessage || "Démarrer la conversation"}
          </Text>
          {otherUser.interests && otherUser.interests.length > 0 && (
            <View style={styles.interests}>
              {otherUser.interests.slice(0, 2).map((interest: string, idx: number) => (
                <Text key={idx} style={styles.interestTag}>
                  {interest}
                </Text>
              ))}
            </View>
          )}
        </View>

        <View style={styles.rightContainer}>
          <Text style={styles.time}>{formatTime(item.lastActivity)}</Text>
          
          {/* 🔥 Afficher le badge avec le vrai compteur */}
          {chatUnreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {chatUnreadCount > 99 ? '99+' : chatUnreadCount}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (!networkConnected) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="cloud-offline" size={70} color="#fff" />
        <Text style={styles.loadingTitle}>Aucune connexion internet</Text>
        <Text style={styles.loadingText}>Vérifiez votre connexion</Text>
      </View>
    );
  }

  if (loading && chats.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Chargement des messages...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("../../../assets/images/asmay-home.png")}
      resizeMode="cover"
      style={styles.container}
    >
      {/* Header avec badge global */}
      {/* <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Messages</Text>
        {globalUnreadCount > 0 && (
          <View style={styles.globalBadge}>
            <Text style={styles.globalBadgeText}>
              {globalUnreadCount > 99 ? '99+' : globalUnreadCount}
            </Text>
          </View>
        )}
      </View> */}

      <Input
        style={styles.search}
        placeholder="🔍 Rechercher..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={filteredChats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Aucune conversation</Text>
            <Text style={styles.emptySub}>
              Envoyez des signaux à des personnes proches pour commencer à chatter
            </Text>
            <Ionicons name="chatbubble-outline" size={80} color="#fff" style={styles.iconEmpty} />
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
      
      <BannerAd 
        ref={bannerRef} 
        unitId={adUnitId} 
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} 
      />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#203447ff", 
    paddingTop: 40 
  },
  centerContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    backgroundColor: "#030914ff" 
  },
  loadingTitle: { 
    marginTop: 16, 
    fontSize: 20, 
    fontWeight: "bold", 
    color: "#fff" 
  },
  loadingText: { 
    fontSize: 15, 
    color: "#fff", 
    marginTop: 10 
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(32, 52, 71, 0.9)',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  globalBadge: {
    backgroundColor: '#F44336',
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  globalBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  search: { 
    backgroundColor: "transparent", 
    color: "#fff", 
    margin: 16, 
    padding: 12, 
    borderRadius: 25, 
    borderWidth: 1, 
    borderColor: "#ded9d9ff" 
  },
  
  // Avatar avec statut
  avatarWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  image: { 
    height: 60, 
    width: 60, 
    borderRadius: 30, 
    borderWidth: 2, 
    borderColor: "#f3c222ff" 
  },
  avatar: { 
    width: 60, 
    height: 60, 
    borderRadius: 30, 
    backgroundColor: "#007bff", 
    justifyContent: "center", 
    alignItems: "center" 
  },
  avatarText: { 
    color: "#fff", 
    fontSize: 24, 
    fontWeight: "bold" 
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
  online: {
    backgroundColor: '#4CAF50',
  },
  offline: {
    backgroundColor: '#9e9e9e',
  },

  chatItem: { 
    flexDirection: "row", 
    backgroundColor: "#fff", 
    marginHorizontal: 16, 
    marginVertical: 4, 
    padding: 12, 
    borderRadius: 12, 
    alignItems: "center", 
    elevation: 3 
  },
  chatInfo: { 
    flex: 1 
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: { 
    fontSize: 16, 
    fontWeight: "bold",
    flex: 1,
  },
  statusText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 8,
  },
  onlineText: {
    color: '#4CAF50',
    fontWeight: '600',
  },
  lastMessage: { 
    fontSize: 13, 
    color: "#666", 
    marginBottom: 4 
  },
  interests: { 
    flexDirection: "row", 
    flexWrap: "wrap" 
  },
  interestTag: { 
    fontSize: 10, 
    backgroundColor: "#e3f2fd", 
    color: "#1976d2", 
    paddingHorizontal: 6, 
    paddingVertical: 2, 
    borderRadius: 8, 
    marginRight: 4 
  },
  rightContainer: {
    alignItems: 'flex-end',
  },
  time: { 
    fontSize: 11, 
    color: "#999", 
    marginBottom: 4 
  },
  unreadBadge: { 
    backgroundColor: "#007bff", 
    borderRadius: 12, 
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6, 
    paddingVertical: 2, 
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: { 
    color: "#fff", 
    fontSize: 10, 
    fontWeight: "bold" 
  },
  empty: { 
    alignItems: "center", 
    justifyContent: "center", 
    padding: 40, 
    marginTop: 100 
  },
  emptyText: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#fff", 
    marginBottom: 8 
  },
  emptySub: { 
    fontSize: 14, 
    color: "#fff", 
    textAlign: "center", 
    marginBottom: 20 
  },
  iconEmpty: { 
    marginTop: 20 
  },
});