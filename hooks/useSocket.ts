

import { useEffect, useState, useRef, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import Toast, { ToastConfigParams } from 'react-native-toast-message';
import { useAudioPlayer } from "expo-audio";
import io, { Socket } from 'socket.io-client';
import { useAuth } from './useAuth';
import { useRouter } from 'expo-router';
import {useDispatch} from 'react-redux'
import { incrementLikes,setLastLike} from '../store/slices/likesSlice'

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
  const { user, isAuthenticated,token } = useAuth();
  const dispatch = useDispatch();
  const router = useRouter();

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
  // Poper les infos de l'utilisateur qui a liké 
const popUserInfos = useCallback((userData: { 
  username: string; 
  avatarUrl?: string; 
  message?: string;
   }) => {
  Toast.show({
    type: 'userInfos',
    text1: "💛 Nouveau like",
    text2: userData.username,
    props: {
      avatarUrl: userData.avatarUrl,
      message: userData.message || 'Vous a envoyé un like',
    },
    position: "top",
    visibilityTime: 5000,
    autoHide: true,
    swipeable: true,
    onPress: () => {
      console.log(`Navigation vers profil de ${userData.username}`);
      // router.navigate(`/profile/${userId}`);
    }
  });
 }, []);

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
    }


    // const socketUrl =process.env.EXPO_PUBLIC_API_URL;

    const socketUrl ='http://10.83.109.123:5000'

    // process.env.EXPO_PUBLIC_API_URL ||
  
    console.log('Connexion à:', socketUrl);

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
      reconnectionAttempts: 5,
      reconnectionDelay: 60,
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
      
      console.log('📨 NOUVEAU SIGNAL REÇU EN TEMPS RÉEL!', signalData);
      playSignalSound()
      
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
      console.log(' Votre signal a été accepté!', data);
      playCorrectSound()
 
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
       Alert.alert('🎉 Ooops 🎉',`${data.declinedBy?.username} a refusé votre signal !`,
  [
    {
     text:"D'accord",style:"cancel"
    }
  ]
)
})
  // Écouter like de la présence d'un user en line 
    newSocket.on('user_online_liked',(data)=>{
        playCorrectSound()

        // les likes dans Redux 
        dispatch(incrementLikes())
        dispatch(setLastLike())
     
      // Créer un identifiant unique pour cette notification
     const notificationId = `${data.likedByUser._id}-${Date.now()}`;
  
     // Vérifier si déjà reçu récemment (éviter les doublons)
      if (receivedNotificationsRef.current.has(data.likedByUser._id)) {
    return;
     }
  
     // Ajouter à la liste des reçues
      receivedNotificationsRef.current.add(data.likedByUser._id);
  
  // Nettoyer après 0.2 secondes
  setTimeout(() => {
    receivedNotificationsRef.current.delete(data.likedByUser._id);
  }, 200);
  
    popUserInfos({
    username: data.likedByUser.username,
    avatarUrl: data.likedByUser.profilePicture, 
    message: `${data.likedByUser.username} a aimé votre présence en ligne aimer en retour`
  });
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
    disconnect: disconnectSocket
  };
};
