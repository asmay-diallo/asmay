
import { useEffect, useState, useRef, useCallback } from 'react';
import { Alert, Platform,Vibration } from 'react-native';
import { useAudioPlayer } from "expo-audio";
import io, { Socket } from 'socket.io-client';
import { useAuth } from './useAuth';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import {useDispatch,useSelector} from 'react-redux'
import { incrementLikes,setLastLike} from '../store/slices/likesSlice'
import { popUserInfos,popSignalsInfos,popMessagesInfos,popSignalsAcceptedInfos,popSignalsDeclinedInfos,popSalutationInfos } from '@/config/actions';
import {
  fetchChats,
  setCurrentChat,
  receiveNewChat,
  updateChatLastMessage,
  markChatAsRead,
  updateUnreadCount,
  resetChats,
} from '../store/slices/chatSlice';
import HiReplyModal from '@/components/HiReplyModal';
import type { HiReplyUser } from "@/components/HiReplyModal";
import {
  setIncomingCall,
  callCancelled,
  callEnded,
  acceptCall as acceptCallAction,
  resetIncomingCall,
  setCallState
} from '../store/slices/incomingCallSlice';

interface SignalResponse {
  success: boolean;
  delivered: boolean;
  targetUserId: string;
  timestamp: string;
  signalId?: string;
  message?: string;
}

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
   // États pour la réponse à une salutation
  const [hiReplyModal, setHiReplyModal] = useState<{
    visible: boolean;
    fromUser: { _id: string; username: string; profilePicture?: string } | null;
    message: string;
  }>({
    visible: false,
    fromUser: null,
    message: '',
  });
  const [replyMessage, setReplyMessage] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
    
  const { user, isAuthenticated,token } = useAuth();
  const dispatch = useDispatch();
  //  const inComeCall = useSelector((state:any)=>state.inComeCalls.inComeCallData)
  const router = useRouter();
  const faceMode = useSelector((state:any)=>state.face.faceMode)
  

  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const receivedNotificationsRef = useRef<Set<string>>(new Set());

  
  const player = useAudioPlayer(require("../assets/sound/sentSignal.mp3"));
  const playSignalSound = () => {
    player.seekTo(0); // Remet le son au début
    player.play(); // Joue le son
   };
  const playerCorrect = useAudioPlayer(require("../assets/sound/correctSound.mp3"));
 const playCorrectSound = () => {
    playerCorrect.seekTo(0); // Remet le son au début
    playerCorrect.play(); // Joue le son
  };
const  handleSendHiReply = () => {
  if (!replyMessage.trim() || !hiReplyModal.fromUser || isSendingReply) return;

  setIsSendingReply(true);

  try {
    if (socket && isConnected) {
      // Émettre un événement de réponse avec message
      socket.emit("hi_reply", {
        toUserId: hiReplyModal.fromUser._id,
        message: replyMessage.trim(),
        originalHi: hiReplyModal.message,
      });

      // Afficher une confirmation
      Alert.alert(
        ' Envoyé !',
        `Votre réponse a été envoyée à ${hiReplyModal.fromUser.username}`,
        [{ text: 'OK' }]
      );

      // Fermer le modal
      setHiReplyModal({ visible: false, fromUser: null, message: '' });
      setReplyMessage('');
    } else {
      
      Alert.alert(' Envoyé !', 'Votre réponse a été envoyée.');
      setHiReplyModal({ visible: false, fromUser: null, message: '' });
      setReplyMessage('');
    }
  } catch (error: any) {
    Alert.alert('Erreur', error.message || "Impossible d'envoyer la réponse");
  } finally {
    setIsSendingReply(false);
  }
};

  const connectSocket = useCallback(() => {
    if (!isAuthenticated || !user || !token) {
      console.log(' Non authentifié, annulation connexion Socket');
      return;
    }

    console.log('🔌 connectSocket appelée');

    // Nettoyer toute connexion existante
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }:
    

    // const socketUrl ='http://192.168.81.123:5000'

const socketUrl =`${Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL}`
    // Configuration améliorée 
    const newSocket: Socket = io(socketUrl, {
      transports: ['websocket','polling'],
      upgrade: true,
      forceNew: true,
      auth: {
        token: token
      },
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts:2,
      reconnectionDelay: 6000,
      reconnectionDelayMax: 200,
      ...(Platform.OS !== 'web' && {
        extraHeaders: {
          'Authorization': `Bearer ${token}`
        }
      })
    });

    // Événements de connexion
    newSocket.on('connect', () => {
      console.log('✅ Connecté au serveur Socket.io, ID:', newSocket.id);
      setIsConnected(true);
      
      // S'identifier auprès du serveur
      newSocket.emit('user_authenticated', { 
        userId: user._id,
        username: user.username,
        timestamp: new Date().toISOString()
      });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔌 Déconnecté de Socket.io:', reason);
      setIsConnected(false);
      
      if (reason !== 'io client disconnect') {
        console.log('🔄 Tentative de reconnexion dans 3s...');
        reconnectTimeoutRef.current = setTimeout(() => {
          connectSocket();
        }, 3000) as unknown as number;
      }
    });

    newSocket.on('connect_error', (error) => {
      setIsConnected(false);
    });

    //  Écouter les confirmations d'envoi de signal
    newSocket.on('signal_sent', (data) => {
      console.log(' Confirmation envoi signal:', data);
      // Cet événement sera utilisé dans handleSendSignal
    });

    newSocket.on('signal_error', (error) => {
    });

    // Écouter les nouveaux signaux
    newSocket.on('new_signal', (signalData) => {
      
      playCorrectSound()
      popSignalsInfos({
        username:signalData.fromUser.username,
        avatarUrl:signalData.fromUser.profilePicture,
        message:`${signalData.fromUser.username} vous a envoyé un signal`
      })
      // Vérifier que le signal est pour l'utilisateur courant
      const isForCurrentUser = signalData.toUser === user._id;
      
      if (isForCurrentUser) {
        Alert.alert(
          '✨ Nouveau signal !', 
          `${signalData.fromUser?.username || 'Quelqu\'un'} vous a envoyé un signal`,
          [
            { 
              text: 'Voir', 
              onPress: () => {
                router.navigate('/notifications' as any);
              }
            },
            { text: 'Plus tard', style: 'cancel' }
          ]
        );
      }
    });

    // Écouter l'acceptation des signaux
  newSocket.on('signal_accepted', (data) => {
      playCorrectSound()
      popSignalsAcceptedInfos({
          username:data.acceptedBy?.username,
        avatarUrl:data.acceptedBy.profilePicture,
        message:`🎉 Match 🎉! Maintenant  vous pouvez ouvrir et commencer la conversation avec moi`
      })
    Alert.alert(
      '🎉 Match 🎉', 
      `${data.acceptedBy?.username } a accepté votre signal. Vous pouvez commencer à chatter maintenant`,
      [
        {
          text: "💬 Chat",
          onPress: () => {
            console.log(' Navigation vers chat:', data.chatId);
            // Navigation forcée
            router.navigate({
              pathname: "/(main)/(asmay)/message",
              // params: { id: data.chatId }
            });
          }
        },
        { 
          text: "Plus tard", 
          onPress: () => console.log('Navigation différée'),
          style: "cancel" 
        }
      ]
    );

    });

    //  Écouter le refus des dignaux 
  newSocket.on('signal_declined',(data)=> {
        playCorrectSound()
        popSignalsDeclinedInfos({
            username:data.declinedBy?.username,
          avatarUrl:data.acceptedBy.profilePicture,
          message:`🎉 Ooops 🎉! ${data.declinedBy?.username} a refusé votre signal ! Mais vous pouvez lui envoyer un nouveau signal encore`
        })
       Alert.alert('🎉 Ooops 🎉',`${data.declinedBy?.username} a refusé votre signal ! Mais vous pouvez lui envoyer un nouveau signal encore`,
     [
    {
     text:"D'accord",style:"cancel"
    }
   ]
    )
   })
// Ecouter l'envie du message texte 
   newSocket.on('new_message',(messageData) => {
        popMessagesInfos({
               username: messageData.sender.username,
               avatarUrl: messageData.sender.profilePicture,
               message: messageData.content,
               type: true,
             } );
    //   dispatch(updateChatLastMessage({
    //   chatId:updateData._id,
    //   content:updateData.lastMessage,
    //   senderId:updateData.senderId,
    //   currentUserId:user._id,
    //   type:updateData.type
    //  }))
   })
   // Ecouter la mise en jour du chat
   newSocket.on('chat_updated',(updateData)=>{
    console.log("Chat update :" ,updateData);
    
     dispatch(updateUnreadCount({
      chatId:updateData._id,
      unreadCount:updateData.unreadCount
     }))
   
   })
// Ecouter l'envie du message texte 
   newSocket.on('new_voice_message',(messageData) => {
       popMessagesInfos({
               username: messageData.sender.username,
               avatarUrl: messageData.sender.profilePicture,
               message: messageData.content,
               type: false,
             });
   })
  // Écouter like de la présence d'un user en line 
  newSocket.on('user_online_liked',(data)=>{
        playCorrectSound()

        // les likes dans Redux 
        dispatch(incrementLikes())
        dispatch(setLastLike(data))
     
       popUserInfos({
       username: data.likedByUser.username,
        avatarUrl: data.likedByUser.profilePicture, 
        message: `${data.likedByUser.username} a aimé votre présence en ligne aimer en retour`
        });
    })
  // ========== GESTION DES APPELS ENTRANTS ==========
newSocket.on('call:incoming', (data: any) => {
  console.log('🔔 [useSocket] Appel entrant reçu:', data.callerName, data.callType);
  
  // Vérifier que l'utilisateur est authentifié
  if (!user || !isAuthenticated) {
    console.log('⚠️ Utilisateur non authentifié, appel ignoré');
    return;
  }

  // ✅ Dispatcher directement dans Redux
  dispatch(setIncomingCall({
    callId: data.callId,
    callerId: data.callerId,
    callerName: data.callerName || 'Inconnu',
    callerProfilePicture: data.callerProfilePicture || null,
    calleeId: data.calleeId,
    calleeName: data.calleeName,
    calleeProfilePicture: data.calleeProfilePicture,
    callType: data.callType || 'audio',
    offer: data.offer || null,
    timestamp: data.timestamp || new Date().toISOString(),
  }));

  // Vibration
  if (Platform.OS !== 'web') {
    Vibration.vibrate([1000, 2000], true);
  }
});
// ========== SONNERIE (appel sortant) ==========
newSocket.on('call:ringing', (data: any) => {
  console.log('📳 [useSocket] Sonnerie en cours');
  dispatch(setCallState('calling'));
});

// // ========== APPEL ACCEPTÉ ==========
// newSocket.on('call:accepted', (data: any) => {
//   console.log('✅ [useSocket] Appel accepté par le destinataire');
//   dispatch(acceptCallAction());
//   dispatch(setCallState('connecting'));
// });
// Call cancelled
newSocket.on('call:cancelled', (data: any) => {
  console.log('🚫 [useSocket] Appel annulé');
  dispatch(callCancelled());
  if (Platform.OS !== 'web') Vibration.cancel();
});

// Call ended
newSocket.on('call:ended', (data: any) => {
  console.log('📴 [useSocket] Appel terminé');
  dispatch(callEnded());
  if (Platform.OS !== 'web') Vibration.cancel();
});

// Call error
newSocket.on('call:error', (data: any) => {
  console.error('❌ [useSocket] Erreur appel:', data);
  dispatch(resetIncomingCall());
  dispatch(setCallState('idle'));
  if (Platform.OS !== 'web') Vibration.cancel();
});
    //Nouvel utilisateur connecté 
  newSocket.on('user_connected',(data)=>{
      //  Alert.alert('🎉Asmay Infos ',`Un nouvel utilisateur vient de se connecter, c'est ${data.username}`,
      //      [
      //    {
      //      text:"Voir Profil",style:"cancel"
      //         }
      //  ]
      //  )
       })
      // Nouvel reconnection 
  newSocket.on('user_reconnected',(data)=>{
    // Alert.alert('🎉Asmay Infos ',`${data.username} vient de se connecter tout de soute`,
    //    [
    //     {
    //        text:"Voir Profil",style:"cancel"
    //           }
    //    ]
    //  )
  })
  
  newSocket.on('user_disconnected',(data)=>{
    // Alert.alert('🎉Asmay Infos ',`${data.username} vient de se deconnecter tout de soute`,
    //    [
    //     {
    //        text:"Bye Bye",style:"cancel"
    //           }
    //    ]
    //    )
       })
  // Ecouter la salutation 
   newSocket.on('user_online_hi',(data) =>{
     popSalutationInfos({
            username:data.hiedByUser?.username,
          avatarUrl:data.hiedByUser.profilePicture,
          message:data.message
        })
      Alert.alert(
      '👋 Salutation !',
      `${data.hiedByUser?.username} vous dit : "${data.message || 'Salut !'}"`,
      [
        {
          text: 'Ignorer',
          style: 'cancel',
        },
        {
          text: '💬 Répondre',
          onPress: () => {
            // Ouvrir le modal de réponse rapide
            setHiReplyModal({
              visible: true,
              fromUser: data.hiedByUser,
              message: data.message || `Salut 👋`,
            });
          },
        },
      ]
    );
   })
   newSocket.on('hi_sent',(data)=>{
    Alert.alert('🎉 Bonne Nouvelle ',`${data.message} `,
      [
    {
     text:"D'accord",style:"cancel"
    }
      ]
     )
    })

     //  Écouter les statuts des utilisateurs
   newSocket.on('user_online', (data) => {
      setOnlineUsers(prev => 
        prev.includes(data.userId) ? prev : [...prev, data.userId]
      );
    });
    newSocket.on('user_offline', (data) => {
      setOnlineUsers(prev => prev.filter(id => id !== data.userId));
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return newSocket;
   }, [isAuthenticated, user, token, router]);

  const disconnectSocket = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (socketRef.current) {
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && user && token) {
      connectSocket();
    } else {
      disconnectSocket();
    }

    return disconnectSocket;
  }, [connectSocket, disconnectSocket, isAuthenticated, user, token]);



    const sendSignal = useCallback((targetUserId: string, message?: string): Promise<SignalResponse> => {
  return new Promise((resolve, reject) => {
    if (!socketRef.current || !isConnected) {
      reject(new Error('Socket non connecté'));
      return;
    }

    const timeout = setTimeout(() => {
      reject(new Error('Timeout - Pas de réponse du serveur'));
    }, 5000);

    const onSignalSent = (data: SignalResponse) => { 
      clearTimeout(timeout);
      socketRef.current?.off('signal_sent', onSignalSent);
      socketRef.current?.off('signal_error', onSignalError);
      resolve(data);
    };

    const onSignalError = (error: any) => {
      clearTimeout(timeout);
      socketRef.current?.off('signal_sent', onSignalSent);
      socketRef.current?.off('signal_error', onSignalError);
      reject(error);
    };

    socketRef.current.on('signal_sent', onSignalSent);
    socketRef.current.on('signal_error', onSignalError);

    socketRef.current.emit('send_signal', {
      targetUserId,
      message:  message || `Salut ! Je suis ${user?.username}`
    });
  });
   }, [isConnected, user?.username]);

  const sendPing = useCallback(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('ping', { timestamp: Date.now() });
    }
  }, [isConnected]);

  const isUserOnline = useCallback((userId: string) => {
    return onlineUsers.includes(userId);
  }, [onlineUsers]);

  return { 
    socket: socketRef.current, 
    isConnected, 
    onlineUsers,
    sendPing,
    sendSignal, 
    isUserOnline,
    reconnect: connectSocket,
    disconnect: disconnectSocket,
      // 🆕 Salutation
    hiReplyModal,
    setHiReplyModal,
    handleSendHiReply,
   faceMode
};
}