// import React, { useState, useEffect, useCallback ,useRef} from "react";
// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   StyleSheet,
//   ActivityIndicator,
//   RefreshControl,
//   TextInput,
//   Alert,
//   Image,
//   Platform
// } from "react-native";
//  import { BannerAd, BannerAdSize, TestIds, useForeground } from 'react-native-google-mobile-ads';
// import { useRouter } from "expo-router";
// import { chatAPI } from "../../services/api";
// import { useAuth } from "../../hooks/useAuth";
// import { useSocket } from "../../hooks/useSocket";
// import { Chat } from "../../types";
// import Input from "@/components/Input";
// import { useFocusEffect } from "@react-navigation/native";
//
// //--------------------- EN PRODUCTION -----------------//
//
// // const adUnitId = Platform.select({
// //   ios: 'ca-app-pub-xxxxxxxxxxxxxxxx/aaaaaaaaaa', //  Ad Unit ID pour iOS
// //   android: 'ca-app-pub-xxxxxxxxxxxxxxxx/bbbbbbbbbb', // Ad Unit ID pour Android
// // });
//
// const adUnitId = __DEV__ ? TestIds.ADAPTIVE_BANNER : 'ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy';
//
// export default function MessagesScreen() {
//   const [chats, setChats] = useState<Chat[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const { user } = useAuth();
//   const router = useRouter();
//   const { socket, isConnected } = useSocket();
//    const bannerRef = useRef<BannerAd>(null);
//
//
//
//   useFocusEffect(
//     useCallback(() => {
//       // console.log("🔄 Focus sur l'écran - Chargement des notifications");
//       loadChats();
//     }, [])
//   );
//   useEffect(() => {
//     // loadChats();
//     setupSocketListeners();
//
//     return () => {
//       if (socket) {
//         socket.off("new_message");
//         socket.off("chat_updated");
//       }
//     };
//   }, [socket]);
//
//  useForeground(() => {
//     Platform.OS === 'ios' && bannerRef.current?.load();
//   });
//
//   const loadChats = useCallback(async () => {
//     try {
//       console.log(" Chargement des chats...");
//       const response = await chatAPI.getChats();
//
//       if (response.data.success && response.data.data) {
//         const chatsData = response.data.data; //  data contient les chats
//         console.log(` ${chatsData.length} chats chargés`);
//         setChats(chatsData);
//       } else {
//         throw new Error(
//           response.data.message || "Erreur de chargement des conversations"
//         );
//       }
//     } catch (error) {
//       // console.error("❌ Erreur chargement chats:", error);
//       // Alert.alert("Erreur", "Impossible de charger les conversations");
//     } finally {
//       setIsLoading(false);
//       setRefreshing(false);
//     }
//   }, []);
//
//   const setupSocketListeners = () => {
//     if (!socket) return;
//
//     // Nouveau message reçu
//     socket.on("new_message", (messageData: any) => {
//       console.log("📨 Nouveau message pour mise à jour liste:", messageData);
//
//       setChats((prevChats) => {
//         const chatIndex = prevChats.findIndex(
//           (chat) =>
//             chat._id === messageData.chat || chat._id === messageData.chatId
//         );
//
//         if (chatIndex > -1) {
//           const updatedChats = [...prevChats];
//           updatedChats[chatIndex] = {
//             ...updatedChats[chatIndex],
//             lastActivity: messageData.createdAt,
//             lastMessage: messageData.content,
//           };
//
//           // Déplacer en haut
//           const [updatedChat] = updatedChats.splice(chatIndex, 1);
//           return [updatedChat, ...updatedChats];
//         }
//
//         // Si nouveau chat, recharger
//         loadChats();
//         return prevChats;
//       });
//     });
//
//     // Chat mis à jour
//     socket.on("chat_updated", (chatData: Chat) => {
//       console.log("🔄 Chat mis à jour:", chatData);
//       setChats((prev) => {
//         const index = prev.findIndex((chat) => chat._id === chatData._id);
//         if (index > -1) {
//           const updated = [...prev];
//           updated[index] = chatData;
//           return updated;
//         }
//         return [chatData, ...prev];
//       });
//     });
//   };
//
//   const handleRefresh = () => {
//     setRefreshing(true);
//     loadChats();
//   };
//
//   const getOtherUser = (chat: Chat) => {
//     if (!user) return null;
//     // Adapter selon  structure
//     return chat.participant1?._id === user._id
//       ? chat.participant2
//       : chat.participant1;
//   };
//
//   const formatTime = (timestamp: string) => {
//     const date = new Date(timestamp);
//     const now = new Date();
//     const diff = now.getTime() - date.getTime();
//     const hours = diff / (1000 * 60 * 60);
//
//     if (hours < 1) return "Maintenant";
//     if (hours < 24) return `${Math.floor(hours)} H`;
//     if (hours < 48) return "Hier";
//     return date.toLocaleDateString();
//   };
//
//   const filteredChats = chats.filter((chat) => {
//     if (!searchQuery.trim()) return true;
//     const otherUser = getOtherUser(chat);
//     return otherUser?.username
//       ?.toLowerCase()
//       .includes(searchQuery.toLowerCase());
//   });
//
//   const renderChatItem = ({ item }: { item: Chat }) => {
//     const otherUser = getOtherUser(item);
//     if (!otherUser) return null;
//
//     return (
//       <TouchableOpacity
//         style={styles.chatItem}
//         onPress={() => router.push(`/(main)/chat/${item._id}`)}
//       >
//         {otherUser.profilePicture ? (
//           <Image
//             source={{ uri: otherUser.profilePicture }}
//             style={styles.image}
//           />
//         ) : (
//           <View style={styles.avatar}>
//             <Text style={styles.avatarText}>
//               {otherUser.username?.charAt(0)?.toUpperCase() || "?"}
//             </Text>
//           </View>
//         )}
//
//         <View style={styles.chatInfo}>
//           <Text style={styles.username}>{otherUser.username}</Text>
//           <Text style={styles.lastMessage} numberOfLines={1}>
//             {item.lastMessage || "Démarrer la conversation"}
//           </Text>
//           <View style={styles.interests}>
//             {otherUser.interests?.slice(0, 2).map((interest, idx) => (
//               <Text key={idx} style={styles.interestTag}>
//                 {interest}
//               </Text>
//             ))}
//           </View>
//         </View>
//
//         <Text style={styles.time}>{formatTime(item.lastActivity)}</Text>
//       </TouchableOpacity>
//     );
//   };
//
//   if (isLoading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" color="#007bff" />
//         <Text>Chargement des conversations...</Text>
//       </View>
//     );
//   }
//
//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         {/* <Text style={styles.title}>Chats</Text> */}
//         <View
//           style={[
//             styles.connection,
//             isConnected ? styles.online : styles.offline,
//           ]}
//         >
//           <Text style={styles.connectionText}>
//             {isConnected ? "En ligne" : "Hors ligne"}
//           </Text>
//         </View>
//       </View>
//
//       <Input
//         style={styles.search}
//         placeholder="🔍 Recherche..."
//         value={searchQuery}
//         onChangeText={setSearchQuery}
//       />
//
//       <FlatList
//         data={filteredChats}
//         renderItem={renderChatItem}
//         keyExtractor={(item) => item._id}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
//         }
//         ListEmptyComponent={
//           <View style={styles.empty}>
//             <Text style={styles.emptyText}>Aucune conversation</Text>
//             <Text style={styles.emptySub}>
//               Envoyez des signaux à des persnnes proches sur radar pour
//               commencer à chatter
//             </Text>
//           </View>
//         }
//       />
//         <BannerAd ref={bannerRef} unitId={adUnitId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
//     </View>
//   );
// }
//
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#dad4d4ff" },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   header: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     padding: 20,
//     backgroundColor: "#fff",
//   },
//   image: {
//     height: 78,
//     width: 78,
//     borderRadius: 40,
//     marginRight: 8,
//     borderColor:"#f3c222ff",
//     borderWidth:2
//   },
//   title: { fontSize: 24, fontWeight: "bold" },
//   connection: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
//   online: { backgroundColor: "#4CAF50" },
//   offline: { backgroundColor: "#F44336" },
//   connectionText: { color: "#fff", fontSize: 12 },
//   search: {
//     backgroundColor: "#fff",
//     margin: 16,
//     padding: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: "#ded9d9ff",
//     elevation: 8,
//   },
//   chatItem: {
//     flexDirection: "row",
//     backgroundColor: "#f2f5f7ff",
//     marginHorizontal: 16,
//     marginVertical: 4,
//     padding: 14,
//     borderRadius: 12,
//     borderLeftWidth: 6,
//     borderRightWidth: 0,
//     borderTopWidth: 5,
//     borderBottomWidth: 0,
//     alignItems: "center",
//     shadowColor: "#080808ff",
//     shadowOffset: { width: 6, height: 4 },
//     shadowOpacity: 2,
//     shadowRadius: 6,
//     borderLeftColor: "#2a75e6ff",
//     borderTopColor: "#2a75e6ff",
//     borderRightColor: "#d15a0aff",
//     borderBottomColor: "#e6502aff",
//     elevation: 15,
//   },
//   avatar: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: "#007bff",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 12,
//   },
//   avatarText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
//   chatInfo: { flex: 1 },
//   username: { fontSize: 20, fontWeight: "bold", marginBottom: 4 },
//   lastMessage: { fontSize: 14, color: "#666", marginBottom: 4 },
//   interests: { flexDirection: "row", flexWrap: "wrap" },
//   interestTag: {
//     fontSize: 10,
//     backgroundColor: "#e3f2fd",
//     color: "#1976d2",
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 8,
//     marginRight: 4,
//   },
//   time: { fontSize: 12, color: "#999" },
//   empty: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     padding: 40,
//   },
//   emptyText: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
//   emptySub: { fontSize: 14, color: "#666", textAlign: "center" },
// });

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
  Image,
  Platform,
} from "react-native";
import {
  BannerAd,
  BannerAdSize,
  TestIds,
  useForeground,
} from "react-native-google-mobile-ads";
import  NetInfo from "@react-native-community/netinfo";
import { useRouter } from "expo-router";
import { chatAPI } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { useSocket } from "../../hooks/useSocket";
import { Chat } from "../../types";
import Input from "@/components/Input";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";

//--------------------- EN PRODUCTION -----------------//

// const adUnitId = Platform.select({
//   ios: 'ca-app-pub-xxxxxxxxxxxxxxxx/aaaaaaaaaa', //  Ad Unit ID pour iOS
//   android: 'ca-app-pub-xxxxxxxxxxxxxxxx/bbbbbbbbbb', // Ad Unit ID pour Android
// });

const adUnitId = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : "ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy";

export default function MessagesScreen() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [networkConnected,setNetworkConnected] = useState<boolean>(false)

  const { user } = useAuth();
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const bannerRef = useRef<BannerAd>(null);

  useFocusEffect(
    useCallback(() => {
      // console.log("🔄 Focus sur l'écran - Chargement des notifications");
      loadChats();
    }, [])
  );
  useEffect(() => {
        const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
          console.log('Etat de connexion : ',state);
          
          const isNowConnected = !!state.isConnected;
          setNetworkConnected(isNowConnected);
    
          if (isNowConnected) {
            
            // console.log("🌐 Connexion rétablie - Traitement de la file...");
            // processRewardQueue().then((successCount) => {
            //   if (successCount > 0) {
            //     console.log(`✅ ${successCount} récompense(s) synchronisées`);
              }
            });
          
      
        return () => unsubscribeNetInfo();
      }, []);
  
  useEffect(() => {
    // loadChats();
    setupSocketListeners();

    return () => {
      if (socket) {
        socket.off("new_message");
        socket.off("chat_updated");
      }
    };
  }, [socket]);

  useForeground(() => {
    Platform.OS === "ios" && bannerRef.current?.load();
  });
  // if (!networkConnected) {
  //            Alert.alert("📡 Hors ligne vous n'êtes pas connectés","Veuillez activer donnée mobile ou vous connecter à Wi-Fi pour bien utiliser Asmay")
  //         return 
  //        }
    
  const loadChats = useCallback(async () => {
       

    try {
      console.log(" Chargement des chats...");
      const response = await chatAPI.getChats();

      if (response.data.success && response.data.data) {
        const chatsData = response.data.data; //  data contient les chats
        console.log(` ${chatsData.length} chats chargés`);
        setChats(chatsData);
      } else {
        throw new Error(
          response.data.message || "Erreur de chargement des conversations"
        );
      }
    } catch (error) {
      // console.error("❌ Erreur chargement chats:", error);
      // Alert.alert("Erreur", "Impossible de charger les conversations");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  const setupSocketListeners = () => {
    if (!socket) return;

    // Nouveau message reçu
    socket.on("new_message", (messageData: any) => {
      console.log("📨 Nouveau message pour mise à jour liste:", messageData);

      setChats((prevChats) => {
        const chatIndex = prevChats.findIndex(
          (chat) =>
            chat._id === messageData.chat || chat._id === messageData.chatId
        );

        if (chatIndex > -1) {
          const updatedChats = [...prevChats];
          updatedChats[chatIndex] = {
            ...updatedChats[chatIndex],
            lastActivity: messageData.createdAt,
            lastMessage: messageData.content,
          };

          // Déplacer en haut
          const [updatedChat] = updatedChats.splice(chatIndex, 1);
          return [updatedChat, ...updatedChats];
        }

        // Si nouveau chat, recharger
        loadChats();
        return prevChats;
      });
    });

    // Chat mis à jour
    socket.on("chat_updated", (chatData: Chat) => {
      console.log("🔄 Chat mis à jour:", chatData);
      setChats((prev) => {
        const index = prev.findIndex((chat) => chat._id === chatData._id);
        if (index > -1) {
          const updated = [...prev];
          updated[index] = chatData;
          return updated;
        }
        return [chatData, ...prev];
      });
    });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadChats();
  };

  const getOtherUser = (chat: Chat) => {
    if (!user) return null;
    // Adapter selon  structure
    return chat.participant1?._id === user._id
      ? chat.participant2
      : chat.participant1;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 1) return "Maintenant";
    if (hours < 24) return `${Math.floor(hours)} H`;
    if (hours < 48) return "Hier";
    return date.toLocaleDateString();
  };

  const filteredChats = chats.filter((chat) => {
    if (!searchQuery.trim()) return true;
    const otherUser = getOtherUser(chat);
    return otherUser?.username
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());
  });

  const renderChatItem = ({ item }: { item: Chat }) => {
    const otherUser = getOtherUser(item);
    if (!otherUser) return null;

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => router.push(`/(main)/chat/${item._id}`)}
      >
        {otherUser.profilePicture ? (
          <Image
            source={{ uri: otherUser.profilePicture }}
            style={styles.image}
          />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {otherUser.username?.charAt(0)?.toUpperCase() || "?"}
            </Text>
          </View>
        )}

        <View style={styles.chatInfo}>
          <Text style={styles.username}>{otherUser.username}</Text>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage || "Démarrer la conversation"}
          </Text>
          <View style={styles.interests}>
            {otherUser.interests?.slice(0, 2).map((interest, idx) => (
              <Text key={idx} style={styles.interestTag}>
                {interest}
              </Text>
            ))}
          </View>
        </View>

        <Text style={styles.time}>{formatTime(item.lastActivity)}</Text>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Chargement des conversations...</Text>
      </View>
    );
  }
  if (!networkConnected) {
      return (
          <View style={styles.centerContainer}>
            <ActivityIndicator size={70} color="#a89005ff" />
            <Text style={styles.loadingText}> Vous êtes hors ligne</Text>
            <Ionicons
             name="wifi"
             size={70}
             color={"#9c7676ff"}
            />
             <Text style={styles.wifiBar}>/</Text>
          </View>
        );
  }
  

  return (
    <View style={styles.container}>
      {/* <View style={styles.header}>
        {/* <Text style={styles.title}>Chats</Text> */}
      {/* <View
          style={[
            styles.connection,
            isConnected ? styles.online : styles.offline,
          ]}
        >
          <Text style={styles.connectionText}>
            {isConnected ? "En ligne" : "Hors ligne"}
          </Text>
        </View>
      </View> */}

      <Input
        style={styles.search}
        placeholder="🔍 Recherche..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {/* <Ionicons 
                           name={"search"} 
                           size={24} 
                           color={"red"} 
                         /> */}
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
              Envoyez des signaux à des persnnes proches sur Asmay pour
              commencer à chatter
            </Text>
            <Ionicons 
            name="clipboard-outline"
             size={80}
             color={"#9e9b9bff"}
              style={styles.iconEmpty}
             />
          </View>
        }
      />
      <BannerAd
        ref={bannerRef}
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#203447ff",
    paddingTop: 40,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
  },
  iconEmpty:{
  top:10
  }
,  centerContainer: {
    flex: 1,
    height:"100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#030914ff",
    // top:-80
  },
  loadingText: {
    marginTop: 16,
    marginBottom:16,
    fontSize: 20,
    fontFamily:"serif",
    fontWeight:"bold",
    color: "#f1efefff",
  },
  wifiBar:{
    position:"absolute",
    bottom:250,
    color:"#fff",
    fontSize:72,

  }
  ,
  image: {
    height: 78,
    width: 78,
    borderRadius: 40,
    marginRight: 8,
    borderColor: "#f3c222ff",
    borderWidth: 2,
  },
  title: { fontSize: 24, fontWeight: "bold" },
  connection: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  online: { backgroundColor: "#4CAF50" },
  offline: { backgroundColor: "#F44336" },
  connectionText: { color: "#fff", fontSize: 12 },
  search: {
    backgroundColor: "transparent",
    color: "white",
    margin: 16,
    padding: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#ded9d9ff",
    elevation: 8,
  },
  chatItem: {
    flexDirection: "row",
    backgroundColor: "#f2f5f7ff",
    marginHorizontal: 16,
    marginVertical: 4,
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 6,
    borderRightWidth: 0,
    borderTopWidth: 5,
    borderBottomWidth: 0,
    alignItems: "center",
    shadowColor: "#080808ff",
    shadowOffset: { width: 6, height: 4 },
    shadowOpacity: 2,
    shadowRadius: 6,
    borderLeftColor: "#2a75e6ff",
    borderTopColor: "#2a75e6ff",
    borderRightColor: "#d15a0aff",
    borderBottomColor: "#e6502aff",
    elevation: 15,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  chatInfo: { flex: 1 },
  username: { fontSize: 20, fontWeight: "bold", marginBottom: 4 },
  lastMessage: { fontSize: 14, color: "#666", marginBottom: 4 },
  interests: { flexDirection: "row", flexWrap: "wrap" },
  interestTag: {
    fontSize: 10,
    backgroundColor: "#e3f2fd",
    color: "#1976d2",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 4,
  },
  time: { fontSize: 12, color: "#999" },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
    top:90
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  emptySub: { fontSize: 14, color: "#f3efefff", textAlign: "center" },
});
