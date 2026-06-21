// // screens/VideoCallScreen.tsx
// 
// import React, { useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   SafeAreaView,
//   Alert,
//   ActivityIndicator,
//   StatusBar,
//   Platform,
//   Image
// } from 'react-native';
// import { RTCView } from 'react-native-webrtc';
// import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
// import { StackNavigationProp } from '@react-navigation/stack';
// import { Ionicons } from '@expo/vector-icons';
// import { useWebRTC } from '../../../hooks/webrtc/useCall';
// import { VideoCallRouteParams, CallType } from '../../../types';
// 
// type RootStackParamList = {
//   VideoCall: VideoCallRouteParams;
// };
// 
// type VideoCallScreenNavigationProp = StackNavigationProp<RootStackParamList, 'VideoCall'>;
// type VideoCallScreenRouteProp = RouteProp<RootStackParamList, 'VideoCall'>;
// 
// interface Props {
//   navigation?: VideoCallScreenNavigationProp;
//   route?: VideoCallScreenRouteProp;
// }
// 
// const VideoCallScreen: React.FC<Props> = () => {
//   const navigation = useNavigation<VideoCallScreenNavigationProp>();
//   const route = useRoute<VideoCallScreenRouteProp>();
//   const { targetUserId, currentUser, callType } = route.params;
//   
//   const {
//     localStream,
//     remoteStream,
//     callState,
//     incomingCall,
//     callError,
//     isMuted,
//     isCameraOn,
//     initiateCall,
//     acceptCall,
//     rejectCall,
//     endCall,
//     toggleMic,
//     toggleCamera,
//     isCallActive,
//     isIncomingCall,
//     isCalling,
//   } = useWebRTC(currentUser);
// 
//   const localVideoRef = useRef<typeof RTCView>(null);
// 
//   // Initier l'appel si on est l'appelant
//   useEffect(() => {
//     if (targetUserId && callState === 'idle') {
//       initiateCall(targetUserId, callType);
//     }
//   }, [targetUserId, callState, callType, initiateCall]);
// 
//   // Gérer les erreurs
//   useEffect(() => {
//     if (callError) {
//       Alert.alert('Erreur', callError, [
//         { 
//           text: 'OK', 
//           onPress: () => {
//             if (navigation.canGoBack()) {
//               navigation.goBack();
//             }
//           }
//         }
//       ]);
//     }
//   }, [callError, navigation]);
// 
//   // Nettoyer à la sortie
//   useEffect(() => {
//     return () => {
//       if (isCallActive) {
//         endCall();
//       }
//     };
//   }, [isCallActive, endCall]);
// 
//   const handleEndCall = (): void => {
//     endCall();
//     if (navigation.canGoBack()) {
//       navigation.goBack();
//     }
//   };
// 
//   const handleRejectCall = (): void => {
//     rejectCall();
//     if (navigation.canGoBack()) {
//       navigation.goBack();
//     }
//   };
// 
//   // Écran d'appel entrant
//   if (isIncomingCall && incomingCall) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <StatusBar barStyle="light-content" />
//         <View style={styles.incomingContainer}>
//           <View style={styles.callerInfo}>
//             <View style={styles.avatarPlaceholder}>
//               { incomingCall.callerProfilePicture ?
//                  <Image
//                   source={{uri:incomingCall.callerProfilePicture}
//                 }/>
//                  : 
//                  <Ionicons name="person" size={60} color="#fff" />
//               }
//             </View>
//             <Text style={styles.callerName}>
//               {incomingCall.callerName || 'Inconnu'}
//             </Text>
//             <Text style={styles.callTypeText}>
//               Appel {incomingCall.callType === 'video' ? 'vidéo' : 'audio'} entrant...
//             </Text>
//           </View>
//           
//           <View style={styles.incomingButtons}>
//             <TouchableOpacity
//               style={[styles.actionButton, styles.rejectButton]}
//               onPress={handleRejectCall}
//             >
//               <Ionicons name="close" size={35} color="#fff" />
//               <Text style={styles.buttonLabel}>Refuser</Text>
//             </TouchableOpacity>
//             
//             <TouchableOpacity
//               style={[styles.actionButton, styles.acceptButton]}
//               onPress={acceptCall}
//             >
//               <Ionicons 
//                 name={incomingCall.callType === 'video' ? 'videocam' : 'call'} 
//                 size={35} 
//                 color="#fff" 
//               />
//               <Text style={styles.buttonLabel}>Accepter</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </SafeAreaView>
//     );
//   }
// 
//   // Écran d'appel en cours
//   return ( 
//     <SafeAreaView style={styles.container}>
//       <StatusBar 
//         barStyle="light-content" 
//         hidden={callType === 'video' && Platform.OS === 'ios'} 
//       />
//       
//       {/* Vidéo distante (plein écran) */}
//       {remoteStream && callType === 'video' && (
//         <RTCView
//           style={styles.remoteVideo}
//           streamURL={remoteStream.toURL()}
//           objectFit="cover"
//         />
//       )}
// 
//       {/* Interface audio uniquement */}
//       {callType === 'audio' && (
//         <View style={styles.audioCallContainer}>
//           <View style={styles.avatarLarge}>
//             <Ionicons name="person" size={100} color="#fff" />
//           </View>
//           <Text style={styles.audioCallText}>
//             {currentUser?.username || 'Contact'}
//           </Text>
//           <Text style={styles.audioCallSubtext}>
//             {callState === 'connected' ? 'Appel en cours...' : 'Connexion...'}
//           </Text>
//         </View>
//       )}
// 
//       {/* Vidéo locale (picture-in-picture) */}
//       {localStream && callType === 'video' && (
//         <TouchableOpacity 
//           style={styles.localVideoContainer}
//           onPress={() => {
//             // Optionnel: échanger les vues
//             console.log('Local video pressed');
//           }}
//           activeOpacity={0.9}
//         >
//           <RTCView
//             ref={localVideoRef as any}
//             style={styles.localVideo}
//             streamURL={localStream.toURL()}
//             objectFit="cover"
//             mirror={true}
//           />
//         </TouchableOpacity>
//       )}
// 
//       {/* Indicateur de chargement */}
//       {isCalling && (
//         <View style={styles.loadingOverlay}>
//           <ActivityIndicator size="large" color="#fff" />
//           <Text style={styles.loadingText}>Appel en cours...</Text>
//         </View>
//       )}
// 
//       {/* Indicateur de connexion */}
//       {callState === 'connecting' && (
//         <View style={styles.loadingOverlay}>
//           <ActivityIndicator size="large" color="#fff" />
//           <Text style={styles.loadingText}>Connexion...</Text>
//         </View>
//       )}
// 
//       {/* Barre de contrôle */}
//       {isCallActive && (
//         <View style={styles.controls}>
//           <View style={styles.controlsRow}>
//             {/* Microphone */}
//             <TouchableOpacity
//               style={[styles.controlButton, isMuted && styles.controlButtonActive]}
//               onPress={toggleMic}
//             >
//               <Ionicons 
//                 name={isMuted ? "mic-off" : "mic"} 
//                 size={26} 
//                 color="#fff" 
//               />
//             </TouchableOpacity>
// 
//             {/* Caméra (uniquement pour les appels vidéo) */}
//             {callType === 'video' && (
//               <TouchableOpacity
//                 style={[styles.controlButton, !isCameraOn && styles.controlButtonActive]}
//                 onPress={toggleCamera}
//               >
//                 <Ionicons 
//                   name={isCameraOn ? "videocam" : "videocam-off"} 
//                   size={26} 
//                   color="#fff" 
//                 />
//               </TouchableOpacity>
//             )}
// 
//             {/* Fin d'appel */}
//             <TouchableOpacity
//               style={[styles.controlButton, styles.endCallButton]}
//               onPress={handleEndCall}
//             >
//               <Ionicons name="call" size={30} color="#fff" />
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// };
// 
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#1a1a1a',
//   },
//   remoteVideo: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//   },
//   localVideoContainer: {
//     position: 'absolute',
//     top: Platform.OS === 'ios' ? 60 : 40,
//     right: 20,
//     width: 120,
//     height: 160,
//     borderRadius: 12,
//     overflow: 'hidden',
//     borderWidth: 2,
//     borderColor: '#fff',
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     zIndex: 10,
//   },
//   localVideo: {
//     width: '100%',
//     height: '100%',
//   },
//   controls: {
//     position: 'absolute',
//     bottom: 40,
//     left: 0,
//     right: 0,
//     alignItems: 'center',
//     zIndex: 20,
//   },
//   controlsRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     gap: 25,
//   },
//   controlButton: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: 'rgba(0,0,0,0.6)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: 'rgba(255,255,255,0.2)',
//   },
//   controlButtonActive: {
//     backgroundColor: '#ff4444',
//     borderColor: '#ff4444',
//   },
//   endCallButton: {
//     backgroundColor: '#ff4444',
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//   },
//   incomingContainer: {
//     flex: 1,
//     justifyContent: 'space-between',
//     paddingVertical: 80,
//     paddingHorizontal: 30,
//   },
//   callerInfo: {
//     alignItems: 'center',
//   },
//   avatarPlaceholder: {
//     width: 120,
//     height: 120,
//     borderRadius: 60,
//     backgroundColor: '#666',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   callerName: {
//     fontSize: 32,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   callTypeText: {
//     fontSize: 18,
//     color: '#ccc',
//   },
//   incomingButtons: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     alignItems: 'center',
//   },
//   actionButton: {
//     width: 90,
//     height: 90,
//     borderRadius: 45,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   acceptButton: {
//     backgroundColor: '#4CAF50',
//   },
//   rejectButton: {
//     backgroundColor: '#f44336',
//   },
//   buttonLabel: {
//     color: '#fff',
//     marginTop: 8,
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   loadingOverlay: {
//     position: 'absolute',
//     top: 0,
//     left: 0,
//     right: 0,
//     bottom: 0,
//     backgroundColor: 'rgba(0,0,0,0.8)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 15,
//   },
//   loadingText: {
//     color: '#fff',
//     marginTop: 15,
//     fontSize: 16,
//   },
//   audioCallContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//   },
//   avatarLarge: {
//     width: 180,
//     height: 180,
//     borderRadius: 90,
//     backgroundColor: '#666',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 30,
//   },
//   audioCallText: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#fff',
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   audioCallSubtext: {
//     fontSize: 18,
//     color: '#ccc',
//   },
// });
// 
// export default VideoCallScreen;

// screens/VideoCallScreen.tsx
// import React, { useEffect, useRef,useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   SafeAreaView,
//   ActivityIndicator,
//   StatusBar,
//   Platform,
//   Image,
// } from 'react-native';
// import { RTCView } from 'react-native-webrtc';
// import {  useRouter } from 'expo-router';
// import { useRoute } from '@react-navigation/native';
// import { Ionicons } from '@expo/vector-icons';
// import { useSelector } from 'react-redux';
// import { RootState } from '../../../store/store';
// import { useWebRTC } from '../../../hooks/webrtc/useCall';
// import { useAuth } from '../../../hooks/useAuth';
// import StreamHolder from '../../../services/StreamHolder';
// 
// const VideoCallScreen: React.FC = () => {
//   const router = useRouter();
//   const route = useRoute();
//   const { user: currentUser } = useAuth();
//   
//   const params = route.params as any;
//   const {
//     callType = 'video',
//     isIncoming = 'false',
//     callerId,
//     callerName,
//   } = params || {};
//   // Etat Redux 
//    const reduxCallState = useSelector((state: RootState) => state.incomingCall.callState);
//     const isRemoteReady = useSelector((state: RootState) => state.stream.isRemoteReady);
//     
//   const hasInitiatedRef = useRef(false);
//   const [renderKey, setRenderKey] = useState(0);
//   //  // 👉 RÉCUPÉRER LES STREAMS DIRECTEMENT (pas via le hook)
//   // const streamHolder = StreamHolder.getInstance();
//   // const [localStream, setLocalStream] = useState(streamHolder.localStream);
//   // const [remoteStream, setRemoteStream] = useState(streamHolder.remoteStream);
// 
//   const {
//     // localStream,
//     // remoteStream,
//     // callState,
//     isMuted,
//     isCameraOn,
//     initiateCall,
//     acceptCall,
//     endCall,
//     toggleMic,
//     toggleCamera,
//     isCallActive,
//   } = useWebRTC(currentUser);
//  // 👉 S'ABONNER AUX CHANGEMENTS DU STREAMHOLDER
// //    useEffect(() => {
// //     const holder = StreamHolder.getInstance();
// //     
// //     const unsubscribe = holder.subscribe(() => {
// //       console.log('🔄 StreamHolder notifié');
// //       // 👉 METTRE À JOUR LES STATES LOCAUX
// //       setLocalStream(holder.localStream);
// //       setRemoteStream(holder.remoteStream);
// //       setRenderKey(prev => prev + 1);
// //     });
// // 
// //     return unsubscribe;
// //   }, []);
//   // 👉 UN SEUL STATE POUR FORCER LE RE-RENDER
//   const [, forceUpdate] = useState(0);
//   const holder = StreamHolder.getInstance()
// 
//   // 👉 S'abonner au StreamHolder et FORCER le re-render
//   useEffect(() => {
//     console.log('🔌 Abonnement au StreamHolder');
//     
//     const unsubscribe = holder.subscribe(() => {
//       console.log('🔄 StreamHolder changé → forceUpdate');
//       forceUpdate(prev => prev + 1); // ← Force le re-render
//     });
// 
//     // Premier render avec les valeurs actuelles
//     forceUpdate(prev => prev + 1);
// 
//     return () => {
//       console.log('🔌 Désabonnement du StreamHolder');
//       unsubscribe();
//     };
//   }, []);
//   const localStream = holder.localStream;
// const remoteStream = holder.remoteStream;
// 
// 
//   // Initier l'appel si appelant
//   // useEffect(() => {
//   //   if (isIncoming === 'false' && callerId && reduxCallState === 'idle') {
//   //     initiateCall(callerId, callType);
//   //   }
//   // }, [callerId, callType, isIncoming, reduxCallState, initiateCall]);
// 
//   // Accepter si appel entrant
//   // useEffect(() => {
//   //   if (isIncoming === 'true' && reduxCallState === 'incoming') {
//   //     acceptCall();
//   //   }
//   // }, [isIncoming, reduxCallState, acceptCall]);
// 
// useEffect(()=>{
//   console.log("Local stream :",localStream);
//     console.log("Local remote :",remoteStream);
//     
// })
// 
//   // Nettoyage
//   useEffect(() => {
//     
//     return () => {
//       if (isCallActive) {
//         endCall();
//           router.back();
//       }
//     };
//   }, [isCallActive, endCall]);
// 
//   const handleEndCall = () => {
//     endCall();
//     router.back();
//   };
// 
//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" hidden={callType === 'video'} />
// 
//       {/* Vidéo distante */}
//       {remoteStream && callType === 'video' && (
//         <RTCView
//           style={styles.remoteVideo}
//           streamURL={remoteStream.toURL()}
//           objectFit="cover"
//         />
//       )}
// 
//       {/* Audio uniquement */}
//       {callType === 'audio' && (
//         <View style={styles.audioContainer}>
//           <View style={styles.avatarLarge}>
//             <Ionicons name="person" size={80} color="#fff" />
//           </View>
//           <Text style={styles.audioName}>{callerName || 'Contact'}</Text>
//           <Text style={styles.audioStatus}>
//             {reduxCallState === 'connected' ? 'Appel en cours...' : 'Connexion...'}
//           </Text>
//         </View>
//       )}
// 
//       {/* Vidéo locale */}
//       {localStream && callType === 'video' && (
//         <View style={styles.localVideoContainer}>
//           <RTCView
//             style={styles.localVideo}
//             streamURL={localStream.toURL()}
//             objectFit="cover"
//             mirror={true}
//           />
//         </View>
//       )}
// 
//       {/* Chargement */}
//       {/* {(reduxCallState === 'calling' ) && (
//         <View style={styles.loadingOverlay}>
//           <ActivityIndicator size="large" color="#fff" />
//           <Text style={styles.loadingText}>
//             {reduxCallState === 'calling' ? 'Appel en cours...' : 'Connexion...'}
//           </Text>
//         </View>
//       )} */}
// 
//       {/* Contrôles */}
//       {isCallActive && (
//         <View style={styles.controls}>
//           <View style={styles.controlsRow}>
//             <TouchableOpacity
//               style={[styles.ctrlBtn, isMuted && styles.ctrlBtnActive]}
//               onPress={toggleMic}
//             >
//               <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={24} color="#fff" />
//             </TouchableOpacity>
// 
//             {callType === 'video' && (
//               <TouchableOpacity
//                 style={[styles.ctrlBtn, !isCameraOn && styles.ctrlBtnActive]}
//                 onPress={toggleCamera}
//               >
//                 <Ionicons name={isCameraOn ? 'videocam' : 'videocam-off'} size={24} color="#fff" />
//               </TouchableOpacity>
//             )}
// 
//             <TouchableOpacity style={styles.endBtn} onPress={handleEndCall}>
//               <Ionicons name="call" size={30} color="#fff" />
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// };
// 
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#1a1a1a' },
//   remoteVideo: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
//   localVideoContainer: {
//     position: 'absolute',
//     top: 60,
//     right: 16,
//     width: 120,
//     height: 160,
//     borderRadius: 12,
//     overflow: 'hidden',
//     borderWidth: 2,
//     borderColor: '#fff',
//     zIndex: 10,
//   },
//   localVideo: { width: '100%', height: '100%' },
//   controls: { position: 'absolute', bottom: 50, left: 0, right: 0, zIndex: 20 },
//   controlsRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 25 },
//   ctrlBtn: {
//     width: 55,
//     height: 55,
//     borderRadius: 28,
//     backgroundColor: 'rgba(255,255,255,0.15)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   ctrlBtnActive: { backgroundColor: '#ff4444' },
//   endBtn: {
//     width: 65,
//     height: 65,
//     borderRadius: 33,
//     backgroundColor: '#ff4444',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   audioContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
//   avatarLarge: {
//     width: 150,
//     height: 150,
//     borderRadius: 75,
//     backgroundColor: '#444',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 20,
//   },
//   audioName: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
//   audioStatus: { fontSize: 16, color: '#aaa' },
//   loadingOverlay: {
//     ...StyleSheet.absoluteFillObject,
//     backgroundColor: 'rgba(0,0,0,0.8)',
//     justifyContent: 'center',
//     alignItems: 'center',
//     zIndex: 15,
//   },
//   loadingText: { color: '#fff', marginTop: 15, fontSize: 16 },
// });
// 
// export default VideoCallScreen;

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, StatusBar,Image} from 'react-native';
import { RTCView } from 'react-native-webrtc';
import { useRouter } from 'expo-router';
import { useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store/store';
import { useWebRTC } from '../../../hooks/webrtc/useCall';
import { useAuth } from '../../../hooks/useAuth';
import StreamHolder from '../../../services/StreamHolder';

const VideoCallScreen: React.FC = () => {
  const router = useRouter();
  const route = useRoute();
  const { user: currentUser } = useAuth();
  
  const params = route.params as any;
  const { callType = 'video', isIncoming = 'false', callerId, callerName } = params || {};

  const reduxCallState = useSelector((state: RootState) => state.incomingCall.callState);
  const isCallAccepted = useSelector((state:RootState)=> state.incomingCall.isCallAccepted)
  const callData =  useSelector((state:RootState)=> state.incomingCall.callData)
  const myId = currentUser._id

  const {
    isMuted, isCameraOn,
    initiateCall, acceptCall, endCall,
    toggleMic, toggleCamera,
    isCallActive, callError,
  } = useWebRTC(currentUser);

  // 👉 FORCER LE RE-RENDER QUAND LES STREAMS CHANGENT
  const [, forceUpdate] = useState(0);
  const holder = StreamHolder.getInstance();

  useEffect(() => {
    console.log("User appellé :",callData?.calleeName)
    const unsubscribe = holder.subscribe(() => {
      console.log('🔄 StreamHolder → forceUpdate');
      forceUpdate(prev => prev + 1);
    });
    forceUpdate(prev => prev + 1);
    return unsubscribe;
  }, []);

  // 👉 LECTURE DIRECTE (pas via le hook)
  const localStream = holder.localStream;
  const remoteStream = holder.remoteStream;

  const hasInitiatedRef = useRef(false);

  useEffect(() => {
    if (isIncoming === 'false' && callerId && !hasInitiatedRef.current) {
      hasInitiatedRef.current = true;
      setTimeout(() => initiateCall(callerId, callType), 500);
    }
    if (isIncoming === 'true' && !hasInitiatedRef.current) {
      hasInitiatedRef.current = true;
      setTimeout(() => acceptCall(), 500);
    }
  }, []);

  useEffect(() => {
    if (callError || endCall) setTimeout(() => router.back(), 1000);
  }, [callError]);

  const handleEndCall = () => { endCall(); router.back(); };

  // Loading
  if (!remoteStream && reduxCallState !== 'connected') {
    return (
      
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Connexion...</Text>
          <TouchableOpacity style={styles.cancelButton} onPress={handleEndCall}>
            <Text style={styles.cancelText}>Annuler</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  // Appel actif
if (isCallAccepted && reduxCallState ==='connected') {
  return (
      
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" hidden={callType === 'video'} />

      {/* Remote video */}
      {remoteStream && callType === 'video' && (
       <View >
        <RTCView 
        style={styles.remoteVideo} 
        streamURL={remoteStream.toURL()} 
        objectFit="cover"
         mirror={true} />
       </View>
      )}

      {/* Audio mode */}
      { callType === 'audio' && (
        <View style={styles.audioContainer}>
          { callData?.callerProfilePicture ?(
             <View style={styles.avatarLarge}>
                <Image source={{ uri: myId === callerId ? callData.calleeProfilePicture:callData.callerProfilePicture  }} 
                />
                </View>
          ):(
             <View style={styles.avatarLarge}>
            <Ionicons name="person" size={80} color="#fff" />
          </View>
         ) }
         

          <Text style={styles.audioName}>{myId === callerId ? callData?.calleeName : callData?.callerName}</Text>
          <Text style={styles.audioStatus}>Appel en cours...</Text>
        </View>
      )}

      {/* Local video PIP */}
      {localStream &&  callType === 'video' && (
        <View style={styles.localVideoContainer}>
          <RTCView 
          style={styles.localVideo}
          streamURL={localStream.toURL()} 
          objectFit="cover" 
           />
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={[styles.ctrlBtn, isMuted && styles.ctrlBtnActive]} onPress={toggleMic}>
          <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={24} color="#fff" />
        </TouchableOpacity>
        {callType === 'video' && (
          <TouchableOpacity style={[styles.ctrlBtn, !isCameraOn && styles.ctrlBtnActive]} onPress={toggleCamera}>
            <Ionicons name={isCameraOn ? 'videocam' : 'videocam-off'} size={24} color="#fff" />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.endBtn} onPress={handleEndCall}>
          <Ionicons name="call" size={30} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
  
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a' },
  // remoteVideoContainer:{
  //   // To implement the style here
  // },
  remoteVideo: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  localVideoContainer: {
    position: 'absolute', top: 60, right: 16, width: 130, height: 180,
    borderRadius: 12, overflow: 'hidden', borderWidth: 2, borderColor: '#fff', zIndex: 10,
  },
  localVideo: { width: '100%', height: '100%' },
  controls: { position: 'absolute', bottom: 50, left: 0, right: 0 },
  controlsRow: { flexDirection: 'row', justifyContent: 'center', gap: 25 },
  ctrlBtn: {
    width: 55, height: 55, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center',
  },
  ctrlBtnActive: { backgroundColor: '#ff4444' },
  endBtn: {
    width: 65, height: 65, borderRadius: 33,
    backgroundColor: '#ff4444', justifyContent: 'center', alignItems: 'center',
  },
  audioContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  avatarLarge: {
    width: 150, height: 150, borderRadius: 75,
    backgroundColor: '#444', justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  audioName: { fontSize: 26, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  audioStatus: { fontSize: 16, color: '#aaa' },
  loadingOverlay: { flex: 1, backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#fff', marginTop: 15, fontSize: 16 },
  cancelButton: {
    marginTop: 40, backgroundColor: '#ff4444',
    paddingHorizontal: 30, paddingVertical: 12, borderRadius: 25,
  },
  cancelText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});

export default VideoCallScreen;