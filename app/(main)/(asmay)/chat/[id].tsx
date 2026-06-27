// 
// import React, { useState, useEffect, useRef, useCallback, useMemo} from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   FlatList,
//   Alert,
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
//   ImageBackground,
//   Image,
//   Dimensions,
//   Modal,
//   
// } from "react-native";
// import Ionicons from "@expo/vector-icons/Ionicons";
// import { useFocusEffect } from "@react-navigation/native";
// import { useLocalSearchParams, useRouter } from "expo-router";
// import { Audio } from "expo-av";
// import { useAudioPlayer } from "expo-audio";
// import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
// import { popMessagesInfos } from "@/config/actions";
// 
// // Hooks Redux
// import { useMessages } from "../../../../hooks/useMessages";
// import { useChats } from "../../../../hooks/useChats";
// import { useAuth } from "../../../../hooks/useAuth";
// import { useSocket } from "../../../../hooks/useSocket";
// import { useAudioPlayer as useAudioPlayerHook } from "../../../../hooks/useAudioPlayer";
// import { chatAPI } from "@/services/api";
// import { receiveNewVoiceMessage, addTemporaryVoiceMessage, markVoiceMessageError, updateTemporaryVoiceMessage,receiveNewMessage,addTemporaryMessage,updateMessageStatus } from "@/store/slices/messageSlice";
// //Etats de query ====================
// // import { useMessagesQuery, useSendMessage, useDeleteMessage,useSendVoiceMessage,useMarkMessageAsRead } from '../../../../hooks/queries/useMessagesQuery';
// // import { useChatsQuery } from '../../../../hooks/queries/useChatsQuery';
// 
// // Components
// import { VoiceMessagePlayer } from "../../../../components/VoiceMessagePlayer";
// import PublicProfileScreen from "../../../../components/PublicProfileScreen";
// import Input from "@/components/Input";
// import { useDispatch } from "react-redux";
// import { Message } from "@/types";
// 
// const { width: SCREEN_WIDTH } = Dimensions.get('window');
// 
// // Configuration publicitaire
// const adUnitId:any = __DEV__
//   ? TestIds.ADAPTIVE_BANNER
//   :process.env.ANDROID_BANNER_UNIT_ID;
// 
// export default function ChatScreen() {
//   const dispatch = useDispatch();
//   const { id: chatId } = useLocalSearchParams<{ id: string }>();
//   const router = useRouter();
//   const { user } = useAuth();
//   const { socket, isConnected, onlineUsers } = useSocket();
//   
//   // Hook Redux pour les messages
//   const { 
//     messages, 
//     loading: messagesLoading, 
//     sendMessage: sendMessageRedux,
//     isSending,
//     markAllAsRead, 
//   unreadCount, 
//   enterChat,
//   leaveChat,
//   } = useMessages(chatId);
//   
//   // Hook Redux pour récupérer l'autre utilisateur
//   const { chats, getOtherUser,updateInChatLastMessage } = useChats();
// 
//   // //   //  TanStack Query pour les messages==============
//   // const { data: messages = [], isLoading, refetch } = useMessagesQuery(chatId);
//   // const { mutate: sendMessage, isPending: isSendingMessage } = useSendMessage(chatId);
//   // const { mutate: deleteMessage } = useDeleteMessage(chatId);
//   // const {mutate:sendVoiceMessage ,isPending:isSendingVoiceMessage }= useSendVoiceMessage(chatId)
//   // 
//   // // TanStack Query pour les chats
//   // const { data: chats = [] } = useChatsQuery();
//   
//   const [otherUser, setOtherUser] = useState<any>(null);
//   const [otherUserOnline, setOtherUserOnline] = useState(false);
//   const [otherUserLastActive, setOtherUserLastActive] = useState<Date | null>(null);
//   const [newMessage, setNewMessage] = useState("");
//   const [isSendingLocal, setIsSendingLocal] = useState(false);
//   const [isUserProfileVisible, setIsUserProfileVisible] = useState(false);
//     const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
//     const [userLocationPlace,setUserLocationPlace] = useState<string | undefined>(undefined)
//    const [userDistance,setUserDistance ] = useState<number | undefined>(undefined)
// 
//   const flatListRef = useRef<FlatList>(null);
//   const bannerRef = useRef<BannerAd>(null);
// 
//   // États pour l'enregistrement vocal
//  
//   const [isRecordingModalVisible, setIsRecordingModalVisible] = useState(false);
//   const [recording, setRecording] = useState<Audio.Recording | null>(null);
//   const [isRecording, setIsRecording] = useState(false);
//   const [isRecordingUI, setIsRecordingUI] = useState(false);
//   const [recordingDuration, setRecordingDuration] = useState(0);
//   const recordingDurationRef = useRef(0);
//   const recordingDurationIntervalRef = useRef<number | null>(null);
//   const recordingTimerRef = useRef<number | null>(null);
// 
//   const player = useAudioPlayer(require("../../../../assets/sound/sendMessage.mp3"));
//  const playReceivedMessageSound = () => {
//     player.seekTo(0); // Remet le son au début
//     player.play(); // Joue le son
//   };
//   // ==================== CHARGEMENT DES INFOS DU CHAT ====================
//    // Récupérer l'autre utilisateur============
//   // const otherUser = useMemo(() => {
//   //   const currentChat = chats.find(chat => chat._id === chatId);
//   //   if (!currentChat || !user) return null;
//   //   
//   //   const participant1 = typeof currentChat.participant1 === 'object' ? currentChat.participant1 : null;
//   //   const participant2 = typeof currentChat.participant2 === 'object' ? currentChat.participant2 : null;
//   //   
//   //   if (participant1?._id === user._id) return participant2;
//   //   return participant1;
//   // }, [chats, chatId, user]);
//   // // 
//  useEffect(() => {
//   enterChat();
//   return () => leaveChat();
// }, [enterChat, leaveChat]);
// useFocusEffect(
//   useCallback(() => {
//     if (unreadCount > 0) {
//       markAllAsRead();
//     }
//   }, [unreadCount, markAllAsRead])
// );
//   useEffect(() => {
//     const loadChatInfo = async () => {
//       try {
//         // Attendre que les chats soient chargés
//         if (chats.length > 0) {
//           const currentChat = chats.find((chat: any) => chat._id === chatId);
//           if (currentChat) {
//             const other = getOtherUser(currentChat);
//             setOtherUser(other);
//             setOtherUserLastActive(other?.lastActive);
//           }
//         }
//       } catch (error) {
//         console.error("Erreur chargement infos chat:", error);
//       }
//     };
//     loadChatInfo();
//   }, [chatId, chats, getOtherUser]);
// 
// // 1. Rejoindre la room du chat
// useEffect(() => {
//   if (!socket || !chatId) return;
//   socket.emit("join_chat", chatId);
// 
//   return () => {
//     socket.emit("leave_chat", chatId);
//   };
// }, [socket, chatId]);
// 
// // 2. Écouter les messages en temps réel
//   // useEffect(() => {
//   //   if (!socket) return;
//   //   
//   //   const handleNewMessage = (messageData: Message) => {
//   //     if ((messageData.chatId === chatId ) && messageData.sender._id !== user?._id) {
//   //       refetch();
//   //     }
//   //   };
//   //   
//   //   socket.on('new_message', handleNewMessage);
//   //   socket.on('new_voice_message', handleNewMessage);
//   //   
//   //   return () => {
//   //     socket.off('new_message', handleNewMessage);
//   //     socket.off('new_voice_message', handleNewMessage);
//   //   };
//   // }, [socket, chatId, user?._id, refetch]);
// 
//   useEffect(() => {
//   if (!socket) return;
// 
//   console.log("🎧 Configuration des écouteurs socket");
// 
//   const handleNewMessage = (messageData: any) => {
//     console.log("📨 Message reçu en temps réel:", messageData);
//     playReceivedMessageSound()
//     if ((messageData.chat === chatId || messageData.chatId === chatId) 
//         && messageData.sender._id !== user?._id) {
//       popMessagesInfos({
//         username:messageData.sender.username,
//         avatarUrl:messageData.sender.profilePicture,
//         message:messageData.content,
//         type:true
//       })
//       dispatch(receiveNewMessage(messageData));
//        updateInChatLastMessage({  
//       chatId: messageData.chatId || messageData.chat,
//       content: messageData.content,
//       senderId: messageData.sender._id,
//       currentUserId: user?._id || '',
//       lastActivity: messageData.createdAt,
//       type:messageData.type
//     });
//       // player.play();
//       scrollToBottom();
//     }
//   };
// 
//   const handleNewVoiceMessage = (messageData: any) => {
//     console.log("🎤 Message vocal reçu en temps réel:", messageData);
//     playReceivedMessageSound()
//     if ((messageData.chat === chatId || messageData.chatId === chatId) 
//         && messageData.sender._id !== user?._id) {
//           popMessagesInfos({
//         username:messageData.sender.username,
//         avatarUrl:messageData.sender.profilePicture,
//         message:messageData.content,
//         type:false
//       })
//       dispatch(receiveNewVoiceMessage(messageData));
//           updateInChatLastMessage({ 
//       chatId: messageData.chatId || messageData.chat,
//       content: messageData.content,
//       senderId: messageData.sender._id,
//       currentUserId: user?._id || '',
//       lastActivity: messageData.createdAt,
//       type:messageData.type
//     });
//       // player.play();
//       scrollToBottom();
//     }
//   };
// 
//   socket.on("new_message", handleNewMessage);
//   socket.on("new_voice_message", handleNewVoiceMessage);
// 
//   return () => {
//     socket.off("new_message", handleNewMessage);
//     socket.off("new_voice_message", handleNewVoiceMessage);
//   };
// }, [socket, chatId, user?._id, dispatch, player]);
// 
//   // ==================== SURVEILLANCE DU STATUT EN LIGNE ====================
//   
//   useEffect(() => {
//     if (otherUser?._id) {
//       setOtherUserOnline(otherUser);
//     }
//   }, [otherUser?._id]);
// 
//   // ==================== GESTION DU PROFIL ====================
//   const handleOpenProfile = (userId: string) => {
//     //  const userDist = user.find((userItem)=>userItem._id === userId)
//     const place = user?.precision?.text
//     const distance = user?.distance
//     setSelectedUserId(userId);
//     setUserLocationPlace(place)
//     setUserDistance(distance)
//     setIsUserProfileVisible(true);
//   };
// 
//   const handleCloseProfile = () => {
//     setIsUserProfileVisible(false);
//     setSelectedUserId(null);
//   };
// 
//   // ==================== ENVOI DE MESSAGE ====================
//  
//   // const handleSend = () => {
//   //   if (newMessage.trim()) {
//   //     sendMessage(newMessage);
//   //     setNewMessage("");
//   //     scrollToBottom();
//   //   }
//   // };
// const sendMessage = async () => {
//   const messageContent = newMessage.trim();
//   if (!messageContent || isSendingLocal) return;
// 
//   const tempId = `temp-${Date.now()}`;
// 
//   // Ajout optimiste via REDUX 
//   dispatch(addTemporaryMessage({
//     _id:tempId,
//     chatId: chatId,
//     content: messageContent,
//     sender: {
//       _id: user?._id || "",
//       username: user?.username || "Vous",
//       profilePicture: user?.profilePicture
//     },
//   }));
// 
//   setNewMessage("");
//   setIsSendingLocal(true);
//   scrollToBottom();
// 
//   // Envoyer via SOCKET
//   if (socket && isConnected) {
//  
//     socket.emit("send_message", {
//       chatId: chatId,
//       content: messageContent,
//       tempId: tempId,
//       timestamp: new Date(),
//     });
//     
//     // Écouter la confirmation
//     const handleMessageSent = (data: { tempId: string; messageId: string }) => {
//       if (data.tempId === tempId) {
//         console.log("✅ Message confirmé par le serveur:", data);
//         //  Mettre à jour via REDUX
//         dispatch(updateMessageStatus({
//           tempId: data.tempId,
//           status: 'sent',
//           messageId: data.messageId
//         }));
//         socket.off("message_sent", handleMessageSent);
//       }
//     };
//     
//     const handleMessageError = (error: { tempId: string; error: string }) => {
//       if (error.tempId === tempId) {
//         console.error("❌ Erreur envoi message:", error);
//         // ✅ Marquer l'erreur via REDUX
//         dispatch(updateMessageStatus({
//           tempId: error.tempId,
//           status: 'error'
//         }));
//         socket.off("message_error", handleMessageError);
//       }
//     };
//     
//     socket.on("message_sent", handleMessageSent);
//     socket.on("message_error", handleMessageError);
//     
//     // Timeout de sécurité
//     setTimeout(() => {
//       if (socket) {
//         socket.off("message_sent", handleMessageSent);
//         socket.off("message_error", handleMessageError);
//       }
//       dispatch(updateMessageStatus({
//         tempId: tempId,
//         status: 'error'
//       }));
//     }, 10000);
//     
//   } else {
//     // Fallback REST si socket pas connecté
//     try {
//       const response = await chatAPI.sendMessage(chatId as string, messageContent);
//       if (response.data.success) {
//         // Ajouter le vrai message via REDUX
//         dispatch(receiveNewMessage(response.data.data));
//       }
//     } catch (error: any) {
//       console.error("❌ Erreur envoi message:", error);
//       dispatch(updateMessageStatus({
//         tempId: tempId,
//         status: 'error'
//       }));
//     }
//   }
// 
//   setIsSendingLocal(false);
// };
// 
//   // ==================== ENREGISTREMENT VOCAL ====================
//   
//   const startRecording = async () => {
//     try {
//       const { status } = await Audio.requestPermissionsAsync();
//       if (status !== "granted") {
//         Alert.alert("Permission requise", "ASMAY a besoin d'accéder à votre microphone");
//         return;
//       }
// 
//       await Audio.setAudioModeAsync({
//         allowsRecordingIOS: true,
//         playsInSilentModeIOS: true,
//         staysActiveInBackground: true,
//       });
// 
//       const newRecording = new Audio.Recording();
//       await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
//       await newRecording.startAsync();
// 
//       setRecording(newRecording);
//       setIsRecording(true);
//       setRecordingDuration(0);
//       recordingDurationRef.current = 0;
// 
//       recordingDurationIntervalRef.current = setInterval(() => {
//         recordingDurationRef.current += 100;
//         setRecordingDuration(prev => prev + 100);
//       }, 100);
// 
//       console.log("🎤 Enregistrement démarré");
//     } catch (error) {
//       Alert.alert("Erreur", "Impossible de démarrer l'enregistrement");
//     }
//   };
// 
//   const stopRecording = async () => {
//     if (!recording) return;
// 
//     try {
//       if (recordingDurationIntervalRef.current) {
//         clearInterval(recordingDurationIntervalRef.current);
//       }
// 
//       await recording.stopAndUnloadAsync();
//       const uri = recording.getURI();
//        console.log("L'Url de l'audio est :" ,uri);
//        
//       if (!uri) throw new Error("Aucun URI d'audio retourné");
// 
//       const totalDuration = recordingDurationRef.current;
//       if (totalDuration < 1000) {
//         Alert.alert("Trop court", "Le message vocal doit durer au moins 1 seconde");
//         return;
//       }
// 
//       const durationInSeconds = Math.floor(totalDuration / 1000);
//       setIsRecordingModalVisible(false)
//        await sendVoiceMessage(uri, durationInSeconds);
// 
//       setRecordingDuration(0);
//       recordingDurationRef.current = 0;
//     } catch (error) {
//       Alert.alert("Erreur", "Impossible d'envoyer le message vocal");
//     } finally {
//       setRecording(null);
//       setIsRecording(false);
//       setIsRecordingModalVisible(false);
//     }
//   };
//  // OUVERTURE DU MODAL
//   const openRecordingModal = () => {
//     setIsRecordingModalVisible(true);
//     startRecording();
//   };
//    // FERMETURE DU MODAL (annulation)
//   const cancelRecording = async () => {
//     if (recording) {
//       await recording.stopAndUnloadAsync();
//       setRecording(null);
//       setIsRecording(false);
//       if (recordingDurationIntervalRef.current) {
//         clearInterval(recordingDurationIntervalRef.current);
//       }
//     }
//     setIsRecordingModalVisible(false);
//     setRecordingDuration(0);
//     recordingDurationRef.current = 0;
//   };
// 
//   const sendVoiceMessage = useCallback(async (audioUri: string, durationSeconds: number) => {
//     const tempId = `temp-voice-${Date.now()}`;
// 
//     // 1. Message temporaire via Redux
//     dispatch(addTemporaryVoiceMessage({
//       _id:tempId,
//       chatId: chatId as string,
//       content:"",
//       audioUrl:audioUri,
//       duration: durationSeconds,
//       sender: {
//         _id: user?._id || "",
//         username: user?.username || "Vous",
//         profilePicture: user?.profilePicture
//       },
//     }));
//  
//     scrollToBottom();
// 
//     // 2. Notification socket
//     if (socket && isConnected) {
//       socket.emit("send_voice_message", {
//         chatId: chatId,
//         tempId: tempId,
//         duration: durationSeconds,
//         audioUrl: `temp://voice/${tempId}`,
//         timestamp: new Date(),
//       });
//     }
// 
//     try {
//       // 3. Upload
//       const response = await chatAPI.sendVoiceMessage(chatId as string, audioUri, durationSeconds);
//       
//       if (response.data.success) {
//         const data = response.data.data;
//         
//         // 4. Mise à jour du message
//         dispatch(updateTemporaryVoiceMessage({
//           tempId,
//           chatId:data.chatId,
//           messageId: data._id,
//           audioUrl: data.audioFullUrl || data.audioUrl,
//           duration: data.duration,
//         }));
// 
//         // 5. Confirmation socket
//         if (socket && isConnected) {
//           socket.emit("voice_message_stored", {
//             tempId: tempId,
//             messageId: data._id,
//             chatId: chatId,
//           });
//         }
//       } else {
//         throw new Error(response.data.message);
//       }
//     } catch (error: any) {
//       console.error("❌ Erreur envoi vocal:", error);
//       
//       dispatch(markVoiceMessageError({ tempId,chatId }));
//       
//     
//     }
//   }, [chatId, user, socket, isConnected, dispatch]);
// 
//   // ==================== UTILITAIRES ====================
//   
//   const scrollToBottom = () => {
//     setTimeout(() => {
//       flatListRef.current?.scrollToEnd({ animated: true });
//     }, 70);
//   };
// 
//   const getLastActiveText = (lastActive?: Date): string => {
//     if (!lastActive) return '';
//     
//     const now = new Date();
//     const diffMs = now.getTime() - new Date(lastActive).getTime();
//     const diffMins = Math.floor(diffMs / 60000);
//     
//     if (diffMins === 0) return '● En ligne';
//     if  (diffMins > 0 && diffMins < 1 ) return `Il y a ${diffMins}s`
//     if (diffMins < 60) return `Il y a ${diffMins} min`;
//     
//     const diffHours = Math.floor(diffMins / 60);
//     if (diffHours < 24) return `Il y a ${diffHours} h`;
//     
//     const diffDays = Math.floor(diffHours / 24);
//     return `Il y a ${diffDays} j`;
//   };
//   // SUPPRIMER UN MESSAGE 
//   const handleDeleteOneMessage = (chatId:string,messageId:string) =>{
//         
//     Alert.alert("Supprimer","Voulez-vous vraiment supprimer ce message ?",[
//       {text:"Non",style:"cancel"},
//       {text:"Oui",style:"destructive",
//         onPress: async() : Promise<void> =>{
//             try {
//              const response =  await chatAPI.deleteOneMessage(messageId,chatId) 
//             //  const messagefiltered = message
//              console.log("📋 Message supprimé est  : ",response.data);
//              
//              if(response.data.data && response.data.success){
//                Alert.alert("Supprimé" ,"Ce message disparaîtra dans quelques minutes ")
//               }
// 
//             } catch (error:any) {
//               const msg = error.response.data.message
//               Alert.alert("Désolé", msg)
//             }
//         }
//       }
//     ])
//   }
//   // ==================== RENDU DES MESSAGES ====================
//   const renderMessage = ({ item }: { item: any }) => {
//     0
//     if (!item?.sender) return null;
// 
//     const isMyMessage = item.sender._id === user?._id;
//     const isVoiceMessage = item.type === "audio" || !!item.audioUrl;
//     const sending =isSendingLocal;
//     
//     return (
//       <TouchableOpacity
//         style={[
//           styles.messageRow,
//           isMyMessage ? styles.myMessageRow : styles.theirMessageRow,
//         ]}
//         // onLongPress={() =>{
//         //    isMyMessage ? 
//         //    deleteMessage(item._id)
//         //    : Alert.alert("Désolé","Vous ne pouvez supprimer que votre propre message ce Chat")
//         //   }}
//       >
//         <View style={styles.avatarContainer}> 
//           {item.sender.profilePicture ? (
//             <Image
//               source={{ uri: item.sender.profilePicture }}
//               style={styles.avatar}
//             />
//           ) : (
//             <View style={styles.avatarPlaceholder}>
//               <Text style={styles.avatarText}>
//                 {item.sender.username?.charAt(0).toUpperCase() || "?"}
//               </Text>
//             </View>
//           )}
//         </View>
// 
//         <View
//           style={[
//             styles.messageBubble,
//             isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble,
//             item.hasError && styles.messageError,
//           ]}
//         >
//           {!isMyMessage && (
//             <Text style={styles.senderName}>{item.sender.username}</Text>
//           )}
// 
//           {isVoiceMessage ? (
//             <VoiceMessagePlayer
//               audioUrl={item.audioUrl}
//               duration={item.duration || 0}
//               isMyMessage={isMyMessage}
//               messageId={item._id}
//             />
//           ) : (
//             <Text
//               style={[
//                 styles.messageText,
//                 isMyMessage && styles.myMessageText,
//               ]}
//             >
//               {item.content}
//             </Text>
//           )}
// 
//           <View style={styles.messageFooter}>
//             <Text style={[styles.time, isMyMessage && styles.myTime]}>
//               {new Date(item.createdAt).toLocaleDateString("fr-FR", {
//                 day: "numeric",
//                 month: "short",
//                 hour: "2-digit",
//                 minute: "2-digit",
//               })}
//             </Text>
//             {isMyMessage && (
//               <View style={styles.statusContainer}>
//                 {sending ? (
//                   <ActivityIndicator size="small" color="#fff" />
//                 ) : (
//                   <>
//                     {item.hasError ? (
//                       <Ionicons name="alert-circle" size={16} color="#ff4444" />
//                     ) : (
//                       otherUserOnline ? (
//                         <Ionicons name="checkmark-done" size={18} color="#a2f5a5" />
//                       ) : (
//                         <Ionicons name="checkmark" size={18} color="#fff" />
//                       )
//                     )}
//                   </>
//                 )}
//               </View>
//             )}
//           </View>
//         </View>
//       </TouchableOpacity>
//     );
//   };
// 
//   if (messagesLoading) {
//     return (
//       <View style={styles.centerContainer}>
//         <ActivityIndicator size="large" color="#007bff" />
//         <Text style={styles.loadingText}>Chargement des messages...</Text>
//       </View>
//     );
//   }
// 
//   return (
//     <KeyboardAvoidingView
//       style={styles.container}
//       behavior={Platform.OS === "ios" ? "padding" : "height"}
//       keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
//     >
//       <ImageBackground
//         source={require("../../../../assets/images/asmay-icon.png")}
//         resizeMode="cover"
//         style={styles.background}
//       >
//         <BannerAd ref={bannerRef} unitId={adUnitId} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
// 
//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => router.replace("/(main)/(asmay)/message")} style={styles.headerButton}>
//             <Ionicons name="arrow-back" size={24} color="#fff" />
//           </TouchableOpacity>
//           
//           {otherUser && (
//             <TouchableOpacity 
//               style={styles.headerInfo} 
//               onPress={() => handleOpenProfile(otherUser._id)}
//             >
//               {otherUser.profilePicture ? (
//                 <Image source={{ uri: otherUser.profilePicture }} style={styles.headerAvatar} />
//               ) : (
//                 <View style={styles.headerAvatarPlaceholder}>
//                   <Text style={styles.headerAvatarText}>
//                     {otherUser.username?.charAt(0).toUpperCase()}
//                   </Text>
//                 </View>
//               )}
//               <View style={styles.headerTextContainer}>
//                 <Text style={styles.headerUsername}>{otherUser.username}</Text>
//                 <Text style={[styles.headerStatus, otherUserOnline && styles.headerStatusOnline]}>
//                   {otherUserOnline && getLastActiveText(otherUser.lastActive)}
//                 </Text>
//               </View>
//             </TouchableOpacity>
//           )}
//         </View>
// 
//         {/* Liste des messages */}
//         <FlatList
//           ref={flatListRef}
//           data={messages}
//           renderItem={renderMessage}
//           keyExtractor={(item) => item._id}
//           contentContainerStyle={styles.messagesList}
//           onContentSizeChange={scrollToBottom}
//           onLayout={scrollToBottom}
//           showsVerticalScrollIndicator={false}
//           ListEmptyComponent={
//             <View style={styles.emptyContainer}>
//               <Text style={styles.emptyText}>Aucun message</Text>
//               <Text style={styles.emptySubtext}>Envoyez le premier message !</Text>
//             </View>
//           }
//         />
// 
//    {/* MODAL D'ENREGISTREMENT VOCAL */}
//         <Modal
//           visible={isRecordingModalVisible}
//           transparent
//           animationType="fade"
//           onRequestClose={cancelRecording}
//         >
//           <View style={styles.recordingModalOverlay}>
//             <View style={styles.recordingModalContainer}>
//               {/* Indicateur d'enregistrement */}
//               <View style={styles.recordingIndicator}>
//                 <View style={styles.recordingDot} />
//                 <Text style={styles.recordingTitle}>Enregistrement vocal</Text>
//               </View>
// 
//               {/* Animation de vague sonore */}
//               <View style={styles.waveAnimationContainer}>
//                 {[...Array(5)].map((_, i) => (
//                   <View
//                     key={i}
//                     style={[
//                       styles.waveBar,
//                       {
//                         height: 30 + Math.sin(Date.now() / 300 + i) * 20,
//                         animationDelay: `${i * 0.1}s`,
//                       },
//                     ]}
//                   />
//                 ))}
//               </View>
// 
//               {/* Timer */}
//               <Text style={styles.recordingTimer}>
//                 {Math.floor(recordingDuration / 1000)}s
//               </Text>
// 
//               {/* Instructions */}
//               <Text style={styles.recordingHint}>
//                 💛 J'aime le vocal  
//               </Text>
// 
//               {/* Boutons */}
//               <View style={styles.recordingButtons}>
//                 <TouchableOpacity
//                   style={[styles.recordingButton, styles.cancelButton]}
//                   onPress={cancelRecording}
//                 >
//                   <Ionicons name="close" size={28} color="#fff" />
//                 </TouchableOpacity>
// 
//                 <TouchableOpacity
//                   style={[styles.recordingButton, styles.sendVocalButton]}
//                   onPress={stopRecording}
//                 >
//                   <Ionicons name="send" size={28} color="#fff" />
//                 </TouchableOpacity>
//               </View>
//             </View>
//           </View>
//         </Modal>
// 
// 
//         {/* Modal profil public */}
//         <Modal
//           visible={isUserProfileVisible}
//           transparent
//           animationType="slide"
//           onRequestClose={handleCloseProfile}
//         >
//           <View style={styles.modalContainer}>
//             {selectedUserId && (
//               <PublicProfileScreen
//                userId={selectedUserId} 
//                onClose={handleCloseProfile} 
//                userPlace={userLocationPlace}
//               userDistance={userDistance}
//               />
//             )}
//           </View>
//         </Modal>
// 
//         {/* Zone de saisie */}
//         <View style={styles.inputContainer}>
//           <TouchableOpacity
//             onPress={openRecordingModal}
//             style={[styles.micButton, isRecordingModalVisible && styles.micButtonActive]}
//           >
//             <Ionicons name="mic" size={24} color="#fff" />
//           </TouchableOpacity>
// 
//           <Input
//             placeholder="Tapez votre Asmay 💛"
//             style={styles.input}
//             value={newMessage}
//             onChangeText={setNewMessage}
//             multiline
//             maxLength={500}
//           />
// 
//           <TouchableOpacity
//             style={[styles.sendTextButton, (!newMessage.trim() || isSendingLocal) && styles.disabled]}
//             onPress={sendMessage}
//             // disabled={isSending}
//           >
//             {isSendingLocal ? (
//               <ActivityIndicator size="small" color="#fff" />
//             ) : (
//               <Ionicons name="send" size={20} color="#fff" />
//             )}
//           </TouchableOpacity>
//         </View>
//       </ImageBackground>
//     </KeyboardAvoidingView>
//   );
// }
// 
// 
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   background: {
//     flex: 1,
//     backgroundColor: "#203447ff",
//   },
//   centerContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#203447ff",
//   },
//   loadingText: {
//     color: "#fff",
//     marginTop: 10,
//     fontSize: 16,
//   },
//   modalContainer: {
//     flex: 1,
//     backgroundColor: '#203447ff',
//   },
//   header: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     paddingTop: 5,
//     backgroundColor: "rgba(0,0,0,0.3)",
//   },
//   headerButton: {
//     padding: 8,
//   },
//   headerInfo: {
//     flex: 1,
//     flexDirection: "row",
//     alignItems: "center",
//     marginLeft: 8,
//   },
//   headerAvatar: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     borderWidth: 2,
//     borderColor: "#fff",
//   },
//   headerAvatarPlaceholder: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: "#007bff",
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 2,
//     borderColor: "#fff",
//   },
//   headerAvatarText: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   headerTextContainer: {
//     marginLeft: 12,
//   },
//   headerUsername: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#fff",
//   },
//   headerStatus: {
//     fontSize: 12,
//     color: "rgba(255,255,255,0.7)",
//     marginTop: 2,
//   },
//   headerStatusOnline: {
//     color: "#4CAF50",
//     fontWeight: "600",
//   },
//   messagesList: {
//     padding: 16,
//     paddingBottom: 20,
//     flexGrow: 1,
//   },
//   messageRow: {
//     flexDirection: "row",
//     marginBottom: 12,
//     alignItems: "flex-end",
//     maxWidth: "90%",
//   },
//   myMessageRow: {
//     alignSelf: "flex-end",
//   },
//   theirMessageRow: {
//     alignSelf: "flex-start",
//   },
//   avatarContainer: {
//     marginHorizontal: 8,
//     alignSelf: "flex-end",
//   },
//   avatar: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     borderWidth: 2,
//     borderColor: "#fff",
//   },
//   avatarPlaceholder: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: "#007bff",
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 2,
//     borderColor: "#fff",
//   },
//   avatarText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   messageBubble: {
//     padding: 12,
//     borderRadius: 18,
//     maxWidth: "85%",
//     minWidth: 80,
//   },
//   myMessageBubble: {
//     backgroundColor: "#3a5879ff",
//     borderBottomRightRadius: 4,
//   },
//   theirMessageBubble: {
//     backgroundColor: "#fff",
//     borderBottomLeftRadius: 4,
//   },
//   messageError: {
//     borderWidth: 1,
//     borderColor: "#f44336",
//     opacity: 0.8,
//   },
//   senderName: {
//     fontSize: 12,
//     color: "#666",
//     marginBottom: 4,
//     fontWeight: "500",
//   },
//   messageText: {
//     fontSize: 15,
//     color: "#000",
//     lineHeight: 20,
//   },
//   myMessageText: {
//     color: "#fff",
//   },
//   messageFooter: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginTop: 6,
//   },
//   time: {
//     fontSize: 10,
//     color: "#666",
//   },
//   myTime: {
//     color: "rgba(255,255,255,0.7)",
//   },
//   statusContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginLeft: 8,
//     gap: 4,
//   },
//   inputContainer: {
//     flexDirection: "row",
//     padding: 10,
//     alignItems: "center",
//     backgroundColor: "#203447ff",
//     borderTopWidth: 1,
//     borderTopColor: "#39434eff",
//   },
//   micButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: "#007bff",
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 8,
//     borderWidth: 1,
//     borderColor: "#fff",
//   },
//   micButtonActive: {
//     backgroundColor: "#ff4444",
//   },
//   input: {
//     flex: 1,
//     top:5,
//     minHeight: 45,
//     maxHeight: 300,
//     maxWidth:230,
//     minWidth:200,
//     backgroundColor: "#fff",
//     borderRadius: 20,
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     marginRight: 8,
//     fontSize: 14,
//     color: "#333",
//     zIndex:100
//   },
//   sendTextButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: "#007bff",
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 1,
//     borderColor: "#fff",
//   },
//   disabled: {
//     backgroundColor: "#457a78ff",
//     opacity: 0.5,
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingVertical: 50,
//   },
//   emptyText: {
//     fontSize: 18,
//     fontWeight: "bold",
//     color: "#fff",
//     marginBottom: 8,
//   },
//   emptySubtext: {
//     fontSize: 14,
//     color: "#d6c8c8ff",
//     textAlign: "center",
//   },
//    //  Styles pour le Modal d'enregistrement
//   recordingModalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.9)", justifyContent: "center", alignItems: "center" },
//   recordingModalContainer: { backgroundColor: "#203447ff", borderRadius: 30, padding: 30, alignItems: "center", width: SCREEN_WIDTH * 0.85, borderWidth: 2, borderColor: "#118502ff" },
//   recordingIndicator: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
//   recordingDot: { width: 14, height: 14, borderRadius: 7, backgroundColor: "#ff4444", marginRight: 10 },
//   recordingTitle: { fontSize: 18, fontWeight: "bold", color: "#fff" },
//   waveAnimationContainer: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 80, marginBottom: 20, gap: 8 },
//   waveBar: { width: 6, backgroundColor: "#4CAF50", borderRadius: 3, minHeight: 20 },
//   recordingTimer: { fontSize: 48, fontWeight: "bold", color: "#ff4444", marginVertical: 20 },
//   recordingHint: { fontSize: 15, color: "#e9e2e2", textAlign: "center", marginBottom: 20,fontWeight:"bold" },
//   recordingButtons: { flexDirection: "row", justifyContent: "space-between", width: "80%", gap: 15 },
//   recordingButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 25, gap: 8 },
//   cancelButton: { backgroundColor: "#dc3545" },
//   sendVocalButton: { backgroundColor: "#28a745" },
//   recordingButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
//   recordingOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "center", alignItems: "center", zIndex: 1000 },
//   recordingBox: { backgroundColor: "#fff", borderRadius: 20, padding: 30, alignItems: "center", width: SCREEN_WIDTH * 0.8, borderWidth: 2, borderColor: "#118502ff" },
//   recordingText: { fontSize: 16, fontWeight: "600", color: "#333" },
//   recordingTime: { fontSize: 48, fontWeight: "bold", color: "#ff4444", marginVertical: 20 },
// });


import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  Image,
  Dimensions,
  Modal,
  Animated,
  ListRenderItemInfo,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Audio} from "expo-av";
import { useAudioPlayer } from "expo-audio";
import Constants from 'expo-constants';
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import NetInfo from "@react-native-community/netinfo";

// Hooks Redux
import { useMessages } from "../../../../hooks/useMessages";
import { useChats } from "../../../../hooks/useChats";
import { useAuth } from "../../../../hooks/useAuth";
import { useSocket } from "../../../../hooks/useSocket";
import LoadingHeart from "../../../../components/LoadingHeart"
import { chatAPI } from "@/services/api";
import {
  receiveNewVoiceMessage,
  addTemporaryVoiceMessage,
  markVoiceMessageError,
  updateTemporaryVoiceMessage,
  receiveNewMessage,
  addTemporaryMessage,
  updateMessageStatus,
} from "@/store/slices/messageSlice";

// Components
import { VoiceMessagePlayer } from "../../../../components/VoiceMessagePlayer";
import PublicProfileScreen from "../../../../components/PublicProfileScreen";
import Input from "@/components/Input";
 import { useDispatch } from "react-redux";
 import { Message } from "@/types";

// ==================== TYPES ====================

interface ChatParams {
  id: string;
}

interface User {
  _id: string;
  username: string;
  profilePicture?: string;
  precision?: {
    text?: string;
  };
  distance?: number;
  lastActive?: Date;
  likers?: string[];
}

interface MessageSender {
  _id: string;
  username: string;
  profilePicture?: string;
}

interface ChatMessage {
  _id: string;
  chatId?: string;
  chat?: string;
  content: string;
  sender: MessageSender;
  createdAt: string;
  type?: "text" | "audio";
  audioUrl?: string;
  duration?: number;
  hasError?: boolean;
  status?: "sending" | "sent" | "error";
}

interface Chat {
  _id: string;
  participant1: User | string;
  participant2: User | string;
  lastActivity?: Date;
  lastMessage?: string;
  isActive: boolean;
}

interface VoiceMessageData {
  chatId: string;
  messageId: string;
  _id: string;
  audioFullUrl?: string;
  audioUrl?: string;
  duration: number;
}

interface TempVoiceMessage {
  _id: string;
  chatId: string;
  content: string;
  audioUrl: string;
  duration: number;
  sender: MessageSender;
}

interface AdUnitId {
  adaptiveBanner: string;
}

// ==================== COMPOSANT ====================

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const adUnitId: string = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  : (Constants.expoConfig?.extra?.ANDROID_BANNER_UNIT_ID as string);

export default function ChatScreen(): React.JSX.Element {
  const dispatch = useDispatch();
  const { id: chatId } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth() as { user: User | null };
  const { socket, isConnected, onlineUsers } = useSocket();
    const [isOnlineConnected, setIsOnlineConnected] = useState(false);

  // Hook Redux pour les messages
  const {
    messages,
    loading: messagesLoading,
    isSending,
    markAllAsRead,
    unreadCount,
    enterChat,
    leaveChat,
  } = useMessages(chatId as string);

  // Hook Redux pour les chats
  const { chats, getOtherUser, updateInChatLastMessage } = useChats();

  // ==================== STATE ====================
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [otherUserOnline, setOtherUserOnline] = useState<boolean>(false);
  const [otherUserLastActive, setOtherUserLastActive] = useState<Date | null>(null);
  const [newMessage, setNewMessage] = useState<string>("");
  const [isSendingLocal, setIsSendingLocal] = useState<boolean>(false);
  const [isUserProfileVisible, setIsUserProfileVisible] = useState<boolean>(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userLocationPlace, setUserLocationPlace] = useState<string | undefined>(undefined);
  const [userDistance, setUserDistance] = useState<number | undefined>(undefined);
  const [networkConnected, setNetworkConnected] = useState<boolean>(false);
    const [networkEnabled, setNetworkEnabled] = useState(true)

  // Présence et Typing
  const [otherUserInChat, setOtherUserInChat] = useState<boolean>(false);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState<boolean>(false);
  const [typingUsername, setTypingUsername] = useState<string>("");
  const [liveText, setLiveText] = useState<string>("");
   const [isOtherUserRecording, setIsOtherUserRecording] = useState<boolean>(false);
  const [recordingUsername, setRecordingUsername] = useState<string>("");
  const [otherRecordingDuration, setOtherRecordingDuration] = useState<number>(0);
  
  const typingTimeoutRef = useRef<number | 0>(0);
  const typingEmitTimeoutRef = useRef<number | 0>(0);
   const recordingTimeoutRef = useRef<number | 0>(0);
  const audioProgressIntervalRef = useRef<number | 0>(0);
  const recordingDurationRef = useRef<number>(0);
  const recordingDurationIntervalRef = useRef<number | 0>(0);
  const typingDotsAnimation = useRef(new Animated.Value(0)).current;

  // Enregistrement vocal
  const [isRecordingModalVisible, setIsRecordingModalVisible] = useState<boolean>(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  

  // Refs
  const flatListRef = useRef<FlatList<ChatMessage>>(null);
  const bannerRef = useRef<BannerAd>(null);

  // Audio
  const player = useAudioPlayer(
    require("../../../../assets/sound/sendMessage.mp3")
  );

  // ==================== HELPERS ====================

  const playReceivedMessageSound = (): void => {
    player.seekTo(0);
    player.play();
  };
// ==================== MISE À JOUR DU STATUT EN LIGNE ====================
  useEffect(() => {
    if (otherUser && onlineUsers) {
      setIsOnlineConnected(onlineUsers.includes(otherUser._id));
    }
  }, [onlineUsers, otherUser]);

  // ==================== ANIMATION TYPING DOTS ====================
  useEffect(() => {
    if (isOtherUserTyping) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(typingDotsAnimation, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(typingDotsAnimation, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => {
        animation.stop();
      };
    } else {
      typingDotsAnimation.setValue(0);
    }
  }, [isOtherUserTyping, typingDotsAnimation]);

  // ==================== CHARGEMENT INFOS CHAT ====================
  useEffect(() => {
    enterChat();
    return () => {
      leaveChat();
    };
  }, [enterChat, leaveChat]);

  useFocusEffect(
    useCallback(() => {
      if (unreadCount > 0) {
       
        markAllAsRead();
      }
    }, [unreadCount, markAllAsRead])
  );

  useEffect(() => {
    const loadChatInfo = async (): Promise<void> => {
      try {
        if (chats.length > 0) {
          const currentChat = chats.find(
            (chat) => chat._id === chatId
          );
          if (currentChat) {
            const other = getOtherUser(currentChat) as User | null;
            setOtherUser(other);
            
        console.log("Participant est 1:", other);
            setOtherUserLastActive(other?.lastActive ?? null);
          }
        }
      } catch (error) {
        console.error("Erreur chargement infos chat:", error);
      }
    };
    loadChatInfo();
  }, [chatId, chats, getOtherUser]);

  // ==================== SOCKET ROOM ====================

//   useFocusEffect(
//     useCallback(() => {
//       if (!socket || !chatId) return;
//           socket.emit("join_chat", chatId);
//        
//       return () => {
// 
//         if (socket && chatId ) {
//           socket.emit("leave_chat", chatId);
//           socket.emit("typing_stop", { chatId });
//           
//           setOtherUserInChat(false);
//           setIsOtherUserTyping(false);
//           setLiveText("");
//         }
//       };
//     }, [socket, chatId])
//   );

 useFocusEffect(
    useCallback(() => {
      if (!socket || !chatId) return;
      socket.emit("join_chat", chatId);

      return () => {
        if (socket && chatId) {
          socket.emit("leave_chat", chatId);
          socket.emit("typing_stop", { chatId });
          //  Annuler l'enregistrement si en cours
          if (isRecording) {
            socket.emit("audio_recording_cancel", { chatId, username: user?.username, timestamp: new Date().toISOString() });
          }
          setOtherUserInChat(false);
          setIsOtherUserTyping(false);
          setIsOtherUserRecording(false);
          setLiveText("");
          setOtherRecordingDuration(0);
        }
      };
    }, [socket, chatId])
  );
  // ==================== PRÉSENCE DANS LE CHAT ====================
  useEffect(() => {
    if (!socket) return;

    const handleUserEntered = (data:any): void => {
      if (data.chatId === chatId && data.userId !== user?._id) {
        setOtherUserInChat(true);
        console.log(`${data.username} est entré dans le CHAT !`)
      }
    };

    const handleUserLeft = (data: any): void => {
      if (data.chatId === chatId && data.userId !== user?._id) {
        setOtherUserInChat(false);
        setIsOtherUserTyping(false);
        setLiveText("");
        console.log(`${data.username} a quitté le CHAT !`)
      }
    };

    const handlePresenceList = (data: any): void => {
      if (data.chatId === chatId) {
        const otherUsers = data.users.filter(
          (u:any) => u.userId !== user?._id
        );
        setOtherUserInChat(otherUsers.length > 0);
      }
    };

    socket.on("user_entered_chat", handleUserEntered);
    socket.on("user_left_chat", handleUserLeft);
    socket.on("chat_presence_list", handlePresenceList);

    return () => {
      socket.off("user_entered_chat", handleUserEntered);
      socket.off("user_left_chat", handleUserLeft);
      socket.off("chat_presence_list", handlePresenceList);
    };
  }, [socket, chatId, user?._id]);

  // ==================== TYPING ====================
  useEffect(() => {
    if (!socket) return;

    const handleTypingStart = (data:any): void => {
      if (data.chatId === chatId && data.userId !== user?._id) {
        setIsOtherUserTyping(true);
        setTypingUsername(data.username ?? "");

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          setIsOtherUserTyping(false);
          setLiveText("");
        }, 3000);
      }
    };

    const handleTypingUpdate = (data:any): void => {
      if (data.chatId === chatId && data.userId !== user?._id) {
        setIsOtherUserTyping(true);
        setTypingUsername(data.username ?? typingUsername);
        setLiveText(data.text ?? "");

        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
          setIsOtherUserTyping(false);
          setLiveText("");
        }, 3000);
      }
    };

    const handleTypingStop = (data: any): void => {
      if (data.chatId === chatId && data.userId !== user?._id) {
        setIsOtherUserTyping(false);
        setLiveText("");
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
    };

    socket.on("user_typing_start", handleTypingStart);
    socket.on("user_typing_update", handleTypingUpdate);
    socket.on("user_typing_stop", handleTypingStop);

    return () => {
      socket.off("user_typing_start", handleTypingStart);
      socket.off("user_typing_update", handleTypingUpdate);
      socket.off("user_typing_stop", handleTypingStop);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [socket, chatId, user?._id, typingUsername]);

   // ====================  AUDIO RECORDING  ====================
  useEffect(() => {
    if (!socket) return;
    const h1 = (d: any) => { if (d.chatId === chatId && d.userId !== user?._id) { setIsOtherUserRecording(true); setRecordingUsername(d.username ?? "Utilisateur"); setOtherRecordingDuration(0); resetRecordingTimeout(); } };
    const h2 = (d: any) => { if (d.chatId === chatId && d.userId !== user?._id) { setOtherRecordingDuration(d.duration); resetRecordingTimeout(); } };
    const h3 = (d: any) => { if (d.chatId === chatId && d.userId !== user?._id) { setIsOtherUserRecording(false); setOtherRecordingDuration(0); clearRecordingTimeout(); } };
    const h4 = (d: any) => { if (d.chatId === chatId && d.userId !== user?._id) { setIsOtherUserRecording(false); setOtherRecordingDuration(0); clearRecordingTimeout(); } };
    socket.on("audio_recording_start", h1); socket.on("audio_recording_progress", h2); socket.on("audio_recording_stop", h3); socket.on("audio_recording_cancel", h4);
    return () => { socket.off("audio_recording_start", h1); socket.off("audio_recording_progress", h2); socket.off("audio_recording_stop", h3); socket.off("audio_recording_cancel", h4); clearRecordingTimeout(); };
  }, [socket, chatId, user?._id]);

  const resetRecordingTimeout = () => { if (recordingTimeoutRef.current) clearTimeout(recordingTimeoutRef.current); recordingTimeoutRef.current = setTimeout(() => { setIsOtherUserRecording(false); setOtherRecordingDuration(0); }, 120000); };
  const clearRecordingTimeout = () => { if (recordingTimeoutRef.current) { clearTimeout(recordingTimeoutRef.current); recordingTimeoutRef.current = 0; } };


  // ==================== MESSAGES EN TEMPS RÉEL ====================
  useEffect(() => {
    if (!socket) return;

    console.log(" Configuration des écouteurs socket");

    const handleNewMessage = (messageData:any): void => {
      console.log("📨 Message reçu en temps réel:", messageData);
      playReceivedMessageSound();
      if (
        (messageData.chat === chatId || messageData.chatId === chatId) &&
        messageData.sender._id !== user?._id
      ) {
     
        dispatch(receiveNewMessage(messageData));
        updateInChatLastMessage({
          chatId: (messageData.chatId || messageData.chat) as string,
          content: messageData.content,
          senderId: messageData.sender._id,
          currentUserId: user?._id || "",
          lastActivity: messageData.createdAt,
          type: messageData.type,
        });
        scrollToBottom();
      }
    };

    const handleNewVoiceMessage = (messageData:any): void => {
      console.log("🎤 Message vocal reçu en temps réel:", messageData);
      playReceivedMessageSound();
      if (
        (messageData.chat === chatId || messageData.chatId === chatId) &&
        messageData.sender._id !== user?._id
      ) {
      
        dispatch(receiveNewVoiceMessage(messageData));
        updateInChatLastMessage({
          chatId: (messageData.chatId || messageData.chat) as string,
          content: messageData.content,
          senderId: messageData.sender._id,
          currentUserId: user?._id || "",
          lastActivity: messageData.createdAt,
          type: messageData.type,
        });
        scrollToBottom();
      }
    };

    socket.on("new_message", handleNewMessage);
    socket.on("new_voice_message", handleNewVoiceMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("new_voice_message", handleNewVoiceMessage);
    };
  }, [socket, chatId, user?._id, dispatch, player]);

  // ==================== STATUT EN LIGNE ====================
  useEffect(() => {
    if (otherUser?._id) {
      setOtherUserOnline(true);
    }
  }, [otherUser?._id]);
 useEffect(() => {
    if (otherUser && onlineUsers) {
      setIsOnlineConnected(onlineUsers.includes(otherUser._id));
      console.log("Participant est : ", otherUser)
    }
  }, [onlineUsers, otherUser]);

//    Surveillance de la connexion réseau
  useEffect(() => {
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      console.log("L'atat de connexion :",state);
          setNetworkConnected(!!state.isConnected);
      setNetworkEnabled(!!state.isInternetReachable);
   
    });

    return () => unsubscribeNetInfo();
  }, []);

  // ==================== GESTION PROFIL ====================
  const handleOpenProfile = (userId: string): void => {
    const place = user?.precision?.text;
    const distance = user?.distance;
    setSelectedUserId(userId);
    setUserLocationPlace(place);
    setUserDistance(distance);
    setIsUserProfileVisible(true);
  };

  const handleCloseProfile = (): void => {
    setIsUserProfileVisible(false);
    setSelectedUserId(null);
  };

  // ==================== GESTION TYPING ====================
  const handleTextChange = (text: string): void => {
    setNewMessage(text);

    if (!socket) return;

    if (text.length > 0) {
      socket.emit("typing_start", {
        chatId,
        username: user?.username,
      });

      if (typingEmitTimeoutRef.current) {
        clearTimeout(typingEmitTimeoutRef.current);
      }
      typingEmitTimeoutRef.current = setTimeout(() => {
        socket.emit("typing_text", {
          chatId,
          text,
        });
      }, 200);
    } else {
      socket.emit("typing_stop", { chatId });
      if (typingEmitTimeoutRef.current) {
        clearTimeout(typingEmitTimeoutRef.current);
      }
    }
  };

  // ==================== ENVOI MESSAGE ====================
  const sendMessage = async (): Promise<void> => {
    const messageContent = newMessage.trim();
    if (!messageContent || isSendingLocal) return;

    const tempId = `temp-${Date.now()}`;

    dispatch(
      addTemporaryMessage({
        _id: tempId,
        chatId: chatId as string,
        content: messageContent,
        sender: {
          _id: user?._id || "",
          username: user?.username || "Vous",
          profilePicture: user?.profilePicture,
        },
      })
    );

    setNewMessage("");
    setIsSendingLocal(true);
    scrollToBottom();

    // Arrêter le typing
    if (socket) {
      socket.emit("typing_stop", { chatId });
    }
    if (typingEmitTimeoutRef.current) {
      clearTimeout(typingEmitTimeoutRef.current);
    }

    if (socket && isConnected) {
      socket.emit("send_message", {
        chatId,
        content: messageContent,
        tempId,
        timestamp: new Date(),
      });

      const handleMessageSent = (data: {
        tempId: string;
        messageId: string;
      }): void => {
        if (data.tempId === tempId) {
          console.log("✅ Message confirmé par le serveur:", data);
          dispatch(
            updateMessageStatus({
              tempId: data.tempId,
              status: "sent",
              messageId: data.messageId,
            })
          );
          socket.off("message_sent", handleMessageSent);
        }
      };

      const handleMessageError = (error: {
        tempId: string;
        error: string;
      }): void => {
        if (error.tempId === tempId) {
          console.error("❌ Erreur envoi message:", error);
          dispatch(
            updateMessageStatus({
              tempId: error.tempId,
              status: "error",
            })
          );
          socket.off("message_error", handleMessageError);
        }
      };

      socket.on("message_sent", handleMessageSent);
      socket.on("message_error", handleMessageError);

      setTimeout(() => {
        if (socket) {
          socket.off("message_sent", handleMessageSent);
          socket.off("message_error", handleMessageError);
        }
        dispatch(
          updateMessageStatus({
            tempId,
            status: "error",
          })
        );
      }, 10000);
    } else {
      try {
        const response = await chatAPI.sendMessage(
          chatId as string,
          messageContent
        );
        if (response.data.success) {
          dispatch(receiveNewMessage(response.data.data));
        }
      } catch (error: unknown) {
        console.error("❌ Erreur envoi message:", error);
        dispatch(
          updateMessageStatus({
            tempId,
            status: "error",
          })
        );
      }
    }

    setIsSendingLocal(false);
  };

  // ==================== ENREGISTREMENT VOCAL ====================

    const startRecording = async (): Promise<void> => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") { Alert.alert("Permission requise", "ASMAY a besoin d'accéder à votre microphone"); return; }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true, staysActiveInBackground: true });
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      await newRecording.startAsync();
      setRecording(newRecording); setIsRecording(true); setRecordingDuration(0); recordingDurationRef.current = 0;
      recordingDurationIntervalRef.current = setInterval(() => { recordingDurationRef.current += 100; setRecordingDuration((prev) => prev + 100); }, 100);

      // 🆕 Émettre début enregistrement
      if (socket) {
        socket.emit("audio_recording_start", { chatId, username: user?.username, timestamp: new Date().toISOString() });
        audioProgressIntervalRef.current = setInterval(() => {
          if (socket) socket.emit("audio_recording_progress", { chatId, duration: Math.floor(recordingDurationRef.current / 1000), timestamp: new Date().toISOString() });
        }, 2000);
      }
      console.log("🎤 Enregistrement démarré + event socket");
    } catch { Alert.alert("Erreur", "Impossible de démarrer l'enregistrement"); }
  };

  const stopRecording = async (): Promise<void> => {
    if (!recording) return;
    try {
      if (audioProgressIntervalRef.current) { clearInterval(audioProgressIntervalRef.current); audioProgressIntervalRef.current = 0; }
      if (recordingDurationIntervalRef.current) clearInterval(recordingDurationIntervalRef.current);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      if (!uri) throw new Error("Aucun URI");
      const totalDuration = recordingDurationRef.current;
      if (totalDuration < 1000) {
        if (socket) socket.emit("audio_recording_cancel", { chatId, username: user?.username, timestamp: new Date().toISOString() });
        Alert.alert("Trop court", "Le message vocal doit durer au moins 1 seconde"); return;
      }
      if (socket) socket.emit("audio_recording_stop", { chatId, username: user?.username, timestamp: new Date().toISOString() });
      const durationInSeconds = Math.floor(totalDuration / 1000);
      setIsRecordingModalVisible(false);
      await sendVoiceMessage(uri, durationInSeconds);
      setRecordingDuration(0); recordingDurationRef.current = 0;
    } catch { Alert.alert("Erreur", "Impossible d'envoyer le message vocal"); }
    finally { setRecording(null); setIsRecording(false); setIsRecordingModalVisible(false); if (audioProgressIntervalRef.current) { clearInterval(audioProgressIntervalRef.current); audioProgressIntervalRef.current = 0; } }
  };

  const openRecordingModal = (): void => { setIsRecordingModalVisible(true); startRecording(); };

  const cancelRecording = async (): Promise<void> => {
    if (audioProgressIntervalRef.current) { clearInterval(audioProgressIntervalRef.current); audioProgressIntervalRef.current = 0; }
    if (recording) { await recording.stopAndUnloadAsync(); setRecording(null); setIsRecording(false); if (recordingDurationIntervalRef.current) clearInterval(recordingDurationIntervalRef.current); }
    if (socket) socket.emit("audio_recording_cancel", { chatId, username: user?.username, timestamp: new Date().toISOString() });
    setIsRecordingModalVisible(false); setRecordingDuration(0); recordingDurationRef.current = 0;
  };

  const sendVoiceMessage = useCallback(
    async (audioUri: string, durationSeconds: number): Promise<void> => {
      const tempId = `temp-voice-${Date.now()}`;
      const reelUrl = `${process.env.EXPO_PUBLIC_API_URL}${audioUri}`
      const tempVoiceData: TempVoiceMessage = {
        _id: tempId,
        chatId: chatId as string,
        content: "",
        audioUrl:reelUrl ,
        duration: durationSeconds,
        sender: {
          _id: user?._id || "",
          username: user?.username || "Vous",
          profilePicture: user?.profilePicture,
        },
      };

      dispatch(addTemporaryVoiceMessage(tempVoiceData));

      scrollToBottom();

      if (socket && isConnected) {
        socket.emit("send_voice_message", {
          chatId,
          tempId,
          duration: durationSeconds,
          audioUrl:reelUrl,
          timestamp: new Date(),
        });
      }

      try {
        const response = await chatAPI.sendVoiceMessage(
          chatId as string,
          audioUri,
          durationSeconds
        );

        if (response.data.success) {
          const data: VoiceMessageData = response.data.data;

          dispatch(
            updateTemporaryVoiceMessage({
              tempId,
              chatId: data.chatId,
              messageId: data._id,
              audioUrl: data.audioFullUrl || data.audioUrl || "",
              duration: data.duration,
            })
          );

          if (socket && isConnected) {
            socket.emit("voice_message_stored", {
              tempId,
              messageId: data._id,
              chatId,
            });
          }
        } else {
          throw new Error(response.data.message);
        }
      } catch (error: unknown) {
        console.error("❌ Erreur envoi vocal:", error);
        dispatch(markVoiceMessageError({ tempId, chatId: chatId as string }));
      }
    },
    [chatId, user, socket, isConnected, dispatch]
  );

  // ==================== UTILITAIRES ====================
  const scrollToBottom = (): void => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 70);
  };
 // ==================== FORMATAGE ====================
 const formatLastActive = (lastActive?: Date): string => {
    if (!lastActive) return 'Jamais connecté';
    
    const now = new Date();
    const diffMs = now.getTime() - new Date(lastActive).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 0.2) return '● En ligne';
    if (diffMins < 60) return `Vu il y a ${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Vu il y a ${diffHours} h`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `Vu il y a ${diffDays} j`;
    
    return `Vu le ${new Date(lastActive).toLocaleDateString("fr-FR")}`;
  };
  const getLastActiveText = (lastActive?: Date): string => {
    if (!lastActive) return "";

    const now = new Date();
    const diffMs = now.getTime() - new Date(lastActive).getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins === 0) return "● En ligne";
    if (diffMins > 0 && diffMins < 1) return `Il y a ${diffMins}s`;
    if (diffMins < 60) return `Il y a ${diffMins} min`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours} h`;

    const diffDays = Math.floor(diffHours / 24);
    return `Il y a ${diffDays} j`;
  };

  const handleDeleteOneMessage = (
    chatId: string,
    messageId: string
  ): void => {
    Alert.alert(
      "Supprimer",
      "Voulez-vous vraiment supprimer ce message ?",
      [
        { text: "Non", style: "cancel" },
        {
          text: "Oui",
          style: "destructive",
          onPress: async (): Promise<void> => {
            try {
              const response = await chatAPI.deleteOneMessage(
                messageId,
                chatId
              );
              console.log("📋 Message supprimé est  : ", response.data);

              if (response.data.data && response.data.success) {
                Alert.alert(
                  "Supprimé",
                  "Ce message disparaîtra dans quelques minutes "
                );
              }
            } catch (error: unknown) {
              const err = error as { response?: { data?: { message?: string } } };
              const msg = err?.response?.data?.message ?? "Erreur inconnue";
              Alert.alert("Désolé", msg);
            }
          },
        },
      ]
    );
  };

 if (!networkConnected || !networkEnabled) {
     return (
      <LoadingHeart 
             message = "Connexion Internet 💛"
             subMessage = "Vérifier votre connexion intrenet et réessayer💛"
             />
      );
 }

  // ==================== RENDU MESSAGE ====================
  const renderMessage = ({
    item,
  }: ListRenderItemInfo<ChatMessage>): React.JSX.Element | null => {
    if (!item?.sender) return null;

    const isMyMessage = item.sender._id === user?._id;
    const isVoiceMessage = item.type === "audio" || !!item.audioUrl;

    return (
      <TouchableOpacity
        style={[
          styles.messageRow,
          isMyMessage ? styles.myMessageRow : styles.theirMessageRow,
        ]}
        onLongPress={() => {
          if (isMyMessage) {
            handleDeleteOneMessage(chatId as string, item._id);
          } else {
            Alert.alert(
              "Désolé",
              "Vous ne pouvez supprimer que votre propre message"
            );
          }
        }}
      >
        <View style={styles.avatarContainer}>
          {item.sender.profilePicture ? (
            <Image
              source={{ uri: item.sender.profilePicture }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {item.sender.username?.charAt(0).toUpperCase() || "?"}
              </Text>
            </View>
          )}
        </View>

        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble,
            item.hasError && styles.messageError,
          ]}
        >
          {!isMyMessage && (
            <Text style={styles.senderName}>{item.sender.username}</Text>
          )}

          {isVoiceMessage ? (
            <VoiceMessagePlayer
              audioUrl={item.audioUrl || ""}
              duration={item.duration || 0}
              isMyMessage={isMyMessage}
              messageId={item._id}
            />
          ) : (
            <Text
              style={[
                styles.messageText,
                isMyMessage && styles.myMessageText,
              ]}
            >
              {item.content}
            </Text>
          )}

          <View style={styles.messageFooter}>
            <Text style={[styles.time, isMyMessage && styles.myTime]}>
              {new Date(item.createdAt).toLocaleDateString("fr-FR", {
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>
            {isMyMessage && (
              <View style={styles.statusContainer}>
                {isSendingLocal ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    {item.hasError ? (
                      <Ionicons
                        name="alert-circle"
                        size={16}
                        color="#ff4444"
                      />
                    ) : otherUserOnline ? (
                      <Ionicons
                        name="checkmark-done"
                        size={18}
                        color="#a2f5a5"
                      />
                    ) : (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color="#fff"
                      />
                    )}
                  </>
                )}
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ==================== LOADING ====================
  if (messagesLoading) {
    return (
      <LoadingHeart 
             message = ""
             subMessage = "Chargement des messages...💛"
             />
    );
  }

  // ==================== RENDU PRINCIPAL ====================
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <ImageBackground
        source={require("../../../../assets/images/asmay-icon.png")}
        resizeMode="cover"
        style={styles.background}
      >
        <BannerAd
          ref={bannerRef}
          unitId={adUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        />

        {/* HEADER */}
       <View style={styles.header}>
          <TouchableOpacity onPress={() => router.replace("/(main)/(asmay)/message")} style={styles.headerButton}><Ionicons name="arrow-back" size={24} color="#fff" /></TouchableOpacity>
          {otherUser && (
            <TouchableOpacity style={styles.headerInfo} onPress={() => handleOpenProfile(otherUser._id)}>
              <View style={styles.headerAvatarContainer}>
                {otherUser.profilePicture ? <Image source={{ uri: otherUser.profilePicture }} style={styles.headerAvatar} /> : <View style={styles.headerAvatarPlaceholder}><Text style={styles.headerAvatarText}>{otherUser.username?.charAt(0).toUpperCase()}</Text></View>}
                {otherUserInChat && <View style={styles.inChatDot} />}
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerUsername}>{otherUser.username}</Text>
                {/*  Enregistrement > Typing > Présence > En ligne */}
                {isOtherUserRecording ? (
                  <View style={styles.recordingIndicator}><View style={styles.recordingDotAnimated} /><Text style={styles.recordingText}>Enregistre un vocal... {otherRecordingDuration > 0 ? `${otherRecordingDuration}s` : ""}</Text></View>
                ) : isOtherUserTyping ? (
                  <View style={styles.typingIndicator}><View style={styles.typingDotsContainer}><Animated.View style={[styles.typingDot, { opacity: typingDotsAnimation.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 1, 0.3] }) }]} /><Animated.View style={[styles.typingDot, styles.typingDot2, { opacity: typingDotsAnimation.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.3, 1] }) }]} /><Animated.View style={[styles.typingDot, styles.typingDot3, { opacity: typingDotsAnimation.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 1, 0.3] }) }]} /></View><Text style={styles.typingText}>écrit...</Text></View>
                ) : otherUserInChat ? <Text style={styles.inChatText}>💬 Dans le chat</Text> : isOnlineConnected ? <Text style={styles.onlineText}>🟢 En ligne</Text> : <Text style={styles.offlineText}>{formatLastActive(otherUser.lastActive)}</Text>}
              </View>
            </TouchableOpacity>
          )}
          {/* <TouchableOpacity style={styles.callButton}><Ionicons name="call" size={22} color="#fff" /></TouchableOpacity> */}
        </View>

        {/* 🆕 BANDEAU ENREGISTREMENT VOCAL EN DIRECT */}
        {isOtherUserRecording && (
          <View style={styles.liveRecordingBanner}>
            <View style={styles.liveRecordingContent}>
              <View style={styles.recordingDotAnimatedLarge} />
              <Text style={styles.liveRecordingLabel}>{recordingUsername || otherUser?.username} enregistre un vocal...</Text>
              {otherRecordingDuration > 0 && <Text style={styles.liveRecordingTimer}>{otherRecordingDuration}s</Text>}
            </View>
            <View style={styles.recordingProgressBar}><View style={[styles.recordingProgressFill, { width: `${Math.min((otherRecordingDuration / 120) * 100, 100)}%` }]} /></View>
          </View>
        )}

        {/* BANDEAU TYPING EN DIRECT */}
        {isOtherUserTyping && liveText && !isOtherUserRecording && (
          <View style={styles.liveTypingBanner}>
            <View style={styles.liveTypingContent}><Ionicons name="text" size={14} color="#FFD700" style={{ marginRight: 6 }} /><Text style={styles.liveTypingLabel}>{typingUsername || otherUser?.username} écrit :</Text><Text style={styles.liveTypingText} numberOfLines={1}>{liveText}</Text></View>
            <View style={styles.liveTypingCursor}><Animated.View style={[styles.cursorLine, { opacity: typingDotsAnimation }]} /></View>
          </View>
        )}


        {/* LISTE MESSAGES */}
        <FlatList<ChatMessage>
          ref={flatListRef}
          data={messages as ChatMessage[]}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={scrollToBottom}
          onLayout={scrollToBottom}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Aucun message</Text>
              <Text style={styles.emptySubtext}>
                Envoyez le premier message !
              </Text>
            </View>
          }
        />

        {/* MODAL ENREGISTREMENT VOCAL */}
        <Modal
          visible={isRecordingModalVisible}
          transparent
          animationType="fade"
          onRequestClose={cancelRecording}
        >
          <View style={styles.recordingModalOverlay}>
            <View style={styles.recordingModalContainer}>
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingTitle}>
                  Enregistrement vocal
                </Text>
              </View>

              <View style={styles.waveAnimationContainer}>
                {[...Array(5)].map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.waveBar,
                      {
                        height: 30 + Math.sin(Date.now() / 300 + i) * 20,
                      },
                    ]}
                  />
                ))}
              </View>

              <Text style={styles.recordingTimer}>
                {Math.floor(recordingDuration / 1000)}s
              </Text>

              <Text style={styles.recordingHint}>💛 J'aime le vocal</Text>

              <View style={styles.recordingButtons}>
                <TouchableOpacity
                  style={[styles.recordingButton, styles.cancelButton]}
                  onPress={cancelRecording}
                >
                  <Ionicons name="close" size={28} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.recordingButton, styles.sendVocalButton]}
                  onPress={stopRecording}
                >
                  <Ionicons name="send" size={28} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* MODAL PROFIL PUBLIC */}
        <Modal
          visible={isUserProfileVisible}
          transparent
          animationType="slide"
          onRequestClose={handleCloseProfile}
        >
          <View style={styles.modalContainer}>
            {selectedUserId && (
              <PublicProfileScreen
                userId={selectedUserId}
                onClose={handleCloseProfile}
                userPlace={userLocationPlace}
                userDistance={userDistance}
              />
            )}
          </View>
        </Modal>

        {/* ZONE DE SAISIE */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            onPress={openRecordingModal}
            style={[
              styles.micButton,
              isRecordingModalVisible && styles.micButtonActive,
            ]}
          >
            <Ionicons name="mic" size={24} color="#fff" />
          </TouchableOpacity>

          <Input
            placeholder={
               "Tapez votre Asmay 💛"
            }
            style={styles.input}
            value={newMessage}
            onChangeText={handleTextChange}
            multiline
            maxLength={500}
            onBlur={() => {
              if (socket && newMessage.length === 0) {
                socket.emit("typing_stop", { chatId });
              }
            }}
          />

          <TouchableOpacity
            style={[
              styles.sendTextButton,
              (!newMessage.trim() || isSendingLocal) && styles.disabled,
            ]}
            onPress={sendMessage}
          >
            {isSendingLocal ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

// ==================== STYLES ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    backgroundColor: "#203447ff",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#203447ff",
  },
    loadingTitle: {
    marginTop: 16,
    marginBottom:16,
    fontSize: 20,
    fontWeight:"bold",
    color: "#f1efefff",
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#203447ff",
  },
  // HEADER
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingTop: 5,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  headerButton: {
    padding: 8,
  },
  headerInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  headerAvatarContainer: {
    position: "relative",
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
  },
  headerAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  headerAvatarText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  headerTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  headerUsername: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
   // RECORDING HEADER
  recordingDotAnimated: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#ff4444" },
  recordingText: { fontSize: 11, color: "#fdf62e", fontStyle: "italic", fontWeight: "600" },
   // BANDEAU RECORDING
  liveRecordingBanner: { backgroundColor: "rgba(40, 38, 38, 0.15)", paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "rgba(255, 68, 68, 0.3)" },
  liveRecordingContent: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  recordingDotAnimatedLarge: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#ff4444" },
  liveRecordingLabel: { fontSize: 13, color: "#e4770b", fontWeight: "600", flex: 1 },
  liveRecordingTimer: { fontSize: 14, color: "#bec32f", fontWeight: "bold", fontVariant: ["tabular-nums"] },
  recordingProgressBar: { height: 3, backgroundColor: "rgba(255, 68, 68, 0.2)", borderRadius: 1.5, overflow: "hidden" },
  recordingProgressFill: { height: "100%", backgroundColor: "#ff4444", borderRadius: 1.5 },
  // POINT VERT PRÉSENCE
  inChatDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50",
    borderWidth: 2,
    borderColor: "#203447ff",
  },
  // STATUT DYNAMIQUE
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  typingDotsContainer: {
    flexDirection: "row",
    gap: 3,
  },
  typingDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: "#FFD700",
  },
  typingDot2: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  typingDot3: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  typingText: {
    fontSize: 11,
    color: "#FFD700",
    fontStyle: "italic",
  },
  inChatText: {
    fontSize: 11,
    color: "#4CAF50",
    fontWeight: "600",
    marginTop: 2,
  },
  onlineText: {
    fontSize: 11,
    color: "#4CAF50",
    fontWeight: "600",
    marginTop: 2,
  },
  offlineText: {
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    marginTop: 2,
  },
  // BOUTON APPEL
  callButton: {
    padding: 8,
    marginLeft: 4,
  },
  // BANDEAU TYPING DIRECT
  liveTypingBanner: {
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
    flexDirection: "row",
    alignItems: "center",
  },
  liveTypingContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  liveTypingLabel: {
    fontSize: 11,
    color: "#FFD700",
    fontWeight: "600",
  },
  liveTypingText: {
    fontSize: 13,
    color: "#fff",
    fontStyle: "italic",
    flex: 1,
  },
  liveTypingCursor: {
    marginLeft: 6,
    justifyContent: "center",
  },
  cursorLine: {
    width: 2,
    height: 16,
    backgroundColor: "#FFD700",
  },
  // MESSAGES
  messagesList: {
    padding: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-end",
    maxWidth: "90%",
  },
  myMessageRow: {
    alignSelf: "flex-end",
  },
  theirMessageRow: {
    alignSelf: "flex-start",
  },
  avatarContainer: {
    marginHorizontal: 8,
    alignSelf: "flex-end",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  avatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  messageBubble: {
    padding: 12,
    borderRadius: 18,
    maxWidth: "85%",
    minWidth: 80,
  },
  myMessageBubble: {
    backgroundColor: "#3a5879ff",
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
  },
  messageError: {
    borderWidth: 1,
    borderColor: "#f44336",
    opacity: 0.8,
  },
  senderName: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    fontWeight: "500",
  },
  messageText: {
    fontSize: 15,
    color: "#000",
    lineHeight: 20,
  },
  myMessageText: {
    color: "#fff",
  },
  messageFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  time: {
    fontSize: 10,
    color: "#666",
  },
  myTime: {
    color: "rgba(255,255,255,0.7)",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
    gap: 4,
  },
  // INPUT
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    alignItems: "center",
    backgroundColor: "#203447ff",
    borderTopWidth: 1,
    borderTopColor: "#39434eff",
  },
  micButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#fff",
  },
  micButtonActive: {
    backgroundColor: "#ff4444",
  },
  input: {
    flex: 1,
    top: 5,
    minHeight: 45,
    maxHeight: 300,
    maxWidth: 230,
    minWidth: 200,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 14,
    color: "#333",
    zIndex: 100,
  },
  sendTextButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#fff",
  },
  disabled: {
    backgroundColor: "#457a78ff",
    opacity: 0.5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#d6c8c8ff",
    textAlign: "center",
  },
  // MODAL ENREGISTREMENT
  recordingModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  recordingModalContainer: {
    backgroundColor: "#203447ff",
    borderRadius: 30,
    padding: 30,
    alignItems: "center",
    width: SCREEN_WIDTH * 0.85,
    borderWidth: 2,
    borderColor: "#118502ff",
  },
  recordingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  recordingDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#ff4444",
    marginRight: 10,
  },
  recordingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  waveAnimationContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 80,
    marginBottom: 20,
    gap: 8,
  },
  waveBar: {
    width: 6,
    backgroundColor: "#4CAF50",
    borderRadius: 3,
    minHeight: 20,
  },
  recordingTimer: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#ff4444",
    marginVertical: 20,
  },
  recordingHint: {
    fontSize: 15,
    color: "#e9e2e2",
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
  },
  recordingButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    gap: 15,
  },
  recordingButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  cancelButton: {
    backgroundColor: "#dc3545",
  },
  sendVocalButton: {
    backgroundColor: "#28a745",
  },
});