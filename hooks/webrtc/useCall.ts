// 
// import { useState, useEffect, useRef, useCallback,useMemo } from 'react';
// import {
//   mediaDevices,
//   RTCPeerConnection,
//   RTCSessionDescription,
//   RTCIceCandidate,
//   MediaStream,
//   RTCIceCandidateInit,
//   RTCSessionDescriptionInit,
// } from 'react-native-webrtc';
// import {
//   CallType,
//   CallState,
//   IncomingCallData,
//   CallError,
//   CurrentUser,
// } from '../../types';
// 
// import { useSocket } from '../useSocket';
// 
// // Configuration WebRTC
// const configuration: RTCConfiguration = {
//   iceServers: [
//           { urls: "stun:stun.l.google.com:19302" },
//           { urls: "stun:stun1.l.google.com:19302" },
//           { urls: "stun:stun2.l.google.com:19302" },
//           { urls: "stun:stun3.l.google.com:19302" },
//           { urls: "stun:stun4.l.google.com:19302" },
//           {
//             urls: "turn:openrelay.metered.ca:443?transport=tcp",
//             username: "openrelayproject",
//             credential: "openrelayproject",
//           },
//         ],
//         iceCandidatePoolSize: 3,
//         bundlePolicy: "max-bundle" as RTCBundlePolicy,
//         rtcpMuxPolicy: "require" as RTCRtcpMuxPolicy,
//         iceTransportPolicy: "all" as RTCIceTransportPolicy,
// };
// 
// export interface UseWebRTCReturn {
//   // États
//   localStream: MediaStream | null;
//   remoteStream: MediaStream | null;
//   callState: CallState;
//   incomingCall: IncomingCallData | null;
//   callError: string | null;
//   isMuted: boolean;
//   isCameraOn: boolean;
//   
//   // Actions
//   initiateCall: (targetUserId: string, callType?: CallType) => Promise<void>;
//   acceptCall: () => Promise<void>;
//   rejectCall: () => void;
//   endCall: () => void;
//   toggleMic: () => void;
//   toggleCamera: () => void;
//   getLocalStream: (videoEnabled?: boolean) => Promise<MediaStream>;
//   
//   // Utilitaires
//   isCallActive: boolean;
//   isIncomingCall: boolean;
//   isCalling: boolean;
// }
// 
// export const useWebRTC = (currentUser: CurrentUser | null): UseWebRTCReturn => {
//   const { socket, isConnected } = useSocket();
//   
//   // États
//   const [localStream, setLocalStream] = useState<MediaStream | null>(null);
//   const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
//   const [callState, setCallState] = useState<CallState>('idle');
//   const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null);
//   const [callError, setCallError] = useState<string | null>(null);
//   const [isMuted, setIsMuted] = useState<boolean>(false);
//   const [isCameraOn, setIsCameraOn] = useState<boolean>(true);
//   const stableUser = useMemo(() => {
//     if (!currentUser?._id) return null;
//     return {
//       _id: currentUser._id,
//       username: currentUser.username,
//       profilePicture: currentUser.profilePicture,
//     };
//   }, [currentUser?._id, currentUser?.username, currentUser?.profilePicture]);
// 
//   // Refs
//   const peerConnection = useRef<RTCPeerConnection | null>(null);
//   const remoteUserId = useRef<string | null>(null);
//   const currentCallId = useRef<string | null>(null);
//   const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
//     const userRef = useRef(stableUser);
// 
//       useEffect(() => {
//     if (stableUser && !userRef.current) {
//       userRef.current = stableUser;
//       console.log('📌 useWebRTC - userRef initialisé:', userRef.current);
//     }
//   }, [stableUser]);
//   // Obtenir le flux local (caméra + micro)
// const getLocalStream = useCallback(async (videoEnabled: boolean = true):   Promise<MediaStream> => {
//      try {
//       const stream = await mediaDevices.getUserMedia({
//         audio: true,
//         video: videoEnabled,
//       });
//       setLocalStream(stream);
//       setIsCameraOn(videoEnabled);
//       return stream;
//     } catch (err) {
//       console.error('❌ Erreur accès média:', err);
//       setCallError('Impossible d\'accéder à la caméra/micro. Vérifiez vos permissions.');
//       throw err;
//     }
//   }, []);
// 
//   // Créer une connexion peer-to-peer
//   const createPeerConnection = useCallback((): RTCPeerConnection => {
//     const pc = new RTCPeerConnection(configuration);
//     
//     (pc as any).onicecandidate = (event: RTCPeerConnectionIceEvent) => {
//       if (event.candidate && remoteUserId.current && socket) {
//         socket.emit('webrtc:ice-candidate', {
//           callId: currentCallId.current,
//           targetUserId: remoteUserId.current,
//           candidate: event.candidate,
//         });
//       }
//      };
// 
//     (pc as any).ontrack = (event: RTCTrackEvent) => {
//       if (event.streams && event.streams[0]) {
//         setRemoteStream(event.streams[0] as any);
//       }
//     };
// 
//     (pc as any).onconnectionstatechange = () => {
//       console.log('📡 État connexion WebRTC:', pc.connectionState);
//       if (pc.connectionState === 'connected') {
//         setCallState('connected');
//       } else if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
//         endCall();
//       }
//     };
// 
//     (pc as any).oniceconnectionstatechange = () => {
//       console.log('🧊 État ICE:', pc.iceConnectionState);
//     };
// 
//     return pc;
//   }, [socket]);
// 
//   // Ajouter les tracks locaux à la connexion
//   const addLocalTracks = useCallback(async (
//     pc: RTCPeerConnection,
//     videoEnabled: boolean = true
//   ): Promise<MediaStream> => {
//     const stream = localStream || await getLocalStream(videoEnabled);
//     
//     stream.getTracks().forEach((track ) => {
//       pc.addTrack(track, stream);
//     });
//     
//     return stream;
//   }, [localStream, getLocalStream]);
// 
//   // Initier un appel
//   const initiateCall = useCallback(async (
//     targetUserId: string,
//     callType: CallType = 'video'
//   ): Promise<void> => {
//     
//       if (!socket || !isConnected) {
//       setCallError('Non connecté au serveur');
//       return;
//      }
//     const user = userRef.current || stableUser;
//       if (!user || !user._id) {
//       console.error('❌ Utilisateur non authentifié');
//       setCallError('Utilisateur non authentifié');
//        return;
//        }
// 
//     try {
//       setCallState('calling');
//       setCallError(null);
//       remoteUserId.current = targetUserId;
// 
//       const pc = createPeerConnection();
//       peerConnection.current = pc;
// 
//       await addLocalTracks(pc, callType === 'video');
// 
//       const offer = await pc.createOffer();
//       await pc.setLocalDescription(offer);
//       if(socket && isConnected){
//      
//       socket.emit('call:initiate', {
//         targetUserId,
//         callType,
//         callerInfo: {
//         username: user?.username,
//           profilePicture: user?.profilePicture,
//         },
//       }); 
//           console.log(`📌 Emission de l'initialisation de l'appel `);
//                // Emission de l' Offre 
//       socket.emit('webrtc:offer',{
//             callId:currentCallId.current,
//             targetUserId,
//             offer
//           })
//           console.log(`📌Emission de l'offre : ${offer}`);
//           
//       }
//       
//     } catch (err) {
//       console.error('❌ Erreur initiation appel:', err);
//       setCallError('Erreur lors de l\'initiation de l\'appel');
//       setCallState('idle');
//     }
//   }, [socket, isConnected, stableUser, createPeerConnection, addLocalTracks]);
// 
//   // Accepter un appel entrant
//   const acceptCall = useCallback(async (): Promise<void> => {
//     if (!incomingCall || !socket) return;
// 
//     try {
//       setCallState('connecting');
//       remoteUserId.current = incomingCall.callerId;
//       currentCallId.current = incomingCall.callId;
// 
//       const pc = createPeerConnection();
//       peerConnection.current = pc;
// 
//       const videoEnabled = incomingCall.callType === 'video';
//       await addLocalTracks(pc, videoEnabled);
// 
//       socket.emit('call:accept', {
//         callId: incomingCall.callId,
//         callerId: incomingCall.callerId,
//       });
// 
//       setIncomingCall(null);
// 
//     } catch (err) {
//       console.error('❌ Erreur acceptation appel:', err);
//       setCallError('Erreur lors de l\'acceptation de l\'appel');
//       setCallState('idle');
//     }
//   }, [incomingCall, socket, createPeerConnection, addLocalTracks]);
// 
//   // Refuser un appel
//   const rejectCall = useCallback((): void => {
//     if (!incomingCall || !socket) return;
//     
//     socket.emit('call:reject', {
//       callId: incomingCall.callId,
//       callerId: incomingCall.callerId,
//       reason: 'rejected',
//     });
//     
//     setIncomingCall(null);
//     setCallState('idle');
//   }, [incomingCall, socket]);
// 
//   // Terminer un appel
//   const endCall = useCallback((): void => {
//     if (remoteUserId.current && socket && currentCallId.current) {
//       socket.emit('call:end', {
//         callId: currentCallId.current,
//         targetUserId: remoteUserId.current,
//       });
//     }
// 
//     if (peerConnection.current) {
//       peerConnection.current.close();
//       peerConnection.current = null;
//     }
// 
//     if (localStream) {
//       localStream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
//       setLocalStream(null);
//     }
// 
//     setRemoteStream(null);
//     setCallState('idle');
//     remoteUserId.current = null;
//     currentCallId.current = null;
//     pendingCandidates.current = [];
//   }, [socket, localStream]);
// 
//   // Basculer le microphone
//   const toggleMic = useCallback((): void => {
//     if (localStream) {
//       const audioTrack = localStream.getAudioTracks()[0];
//       if (audioTrack) {
//         audioTrack.enabled = !audioTrack.enabled;
//         setIsMuted(!audioTrack.enabled);
//         
//         if (socket && remoteUserId.current) {
//           socket.emit('call:toggle-mic', {
//             targetUserId: remoteUserId.current,
//             enabled: audioTrack.enabled,
//           });
//         }
//       }
//     }
//   }, [localStream, socket]);
// 
//   // Basculer la caméra
//   const toggleCamera = useCallback((): void => {
//     if (localStream) {
//       const videoTrack = localStream.getVideoTracks()[0];
//       if (videoTrack) {
//         videoTrack.enabled = !videoTrack.enabled;
//         setIsCameraOn(videoTrack.enabled);
//         
//         if (socket && remoteUserId.current) {
//           socket.emit('call:toggle-camera', {
//             targetUserId: remoteUserId.current,
//             enabled: videoTrack.enabled,
//           });
//         }
//       }
//     }
//   }, [localStream, socket]);
// 
//   // Gérer l'offre WebRTC entrante
//   const handleWebRTCOffer = useCallback(async (data: {
//     callId: string;
//     offer: RTCSessionDescriptionInit;
//     from: string;
//   }): Promise<void> => {
//     console.log('📥 Offre WebRTC reçue');
//     
//     if (!peerConnection.current) {
//       const pc = createPeerConnection();
//       peerConnection.current = pc;
//       await addLocalTracks(pc, incomingCall?.callType === 'video');
//     }
// 
//     try {
//       await peerConnection.current.setRemoteDescription(
//         new RTCSessionDescription(data.offer)
//       );
//       
//       const answer = await peerConnection.current.createAnswer();
//       await peerConnection.current.setLocalDescription(answer);
//       if(socket && isConnected){
//         socket.emit('webrtc:answer', {
//         callId: currentCallId.current,
//         targetUserId: data.from,
//         answer,
//       });
//       }
//      
//     } catch (err) {
//       console.error('❌ Erreur traitement offre:', err);
//     }
//   }, [socket, createPeerConnection, addLocalTracks, incomingCall]);
// 
//   // Gérer la réponse WebRTC
//   const handleWebRTCAnswer = useCallback(async (data: {
//     answer: RTCSessionDescriptionInit;
//   }): Promise<void> => {
//     console.log('📥 Réponse WebRTC reçue');
//     
//     if (peerConnection.current) {
//       try {
//         await peerConnection.current.setRemoteDescription(
//           new RTCSessionDescription(data.answer)
//         );
//       } catch (err) {
//         console.error('❌ Erreur traitement réponse:', err);
//       }
//     }
//   }, []);
// 
//   // Gérer le candidat ICE
//   const handleIceCandidate = useCallback(async (data: {
//     candidate;
//   }): Promise<void> => {
//     
//     if (peerConnection.current && data.candidate) {
//       try {
//         await peerConnection.current.addIceCandidate(
//           new RTCIceCandidate(data.candidate)
//         );
//       } catch (err) {
//         console.error('❌ Erreur ajout candidat ICE:', err);
//       }
//     }
//   }, []);
// 
//   // Écouteurs d'événements socket
//   useEffect(() => {
//     if (!socket) return;
// 
//     socket.on('call:ringing', (data: { callId: string }) => {
//       currentCallId.current = data.callId;
//     });
// 
//     socket.on('call:incoming', (data: IncomingCallData) => {
//       console.log('📞 Appel entrant de:', data.callerName);
//       setIncomingCall(data);
//       setCallState('incoming');
//     });
// 
//     socket.on('call:accepted', (data: { calleeId: string }) => {
//       console.log('✅ Appel accepté');
//       setCallState('connected');
//     });
// 
//     socket.on('call:rejected', (data: { calleeId: string; reason?: string }) => {
//       console.log('❌ Appel refusé');
//       setCallError('L\'utilisateur a refusé l\'appel');
//       endCall();
//     });
// 
//     socket.on('call:cancelled', (data: { callerId: string }) => {
//       console.log('🚫 Appel annulé');
//       setIncomingCall(null);
//       setCallState('idle');
//     });
// 
//     socket.on('call:ended', (data: { endedBy: string }) => {
//       console.log('📴 Appel terminé');
//       endCall();
//     });
// 
//     socket.on('call:error', (data: CallError) => {
//       console.error('❌ Erreur appel:', data.message);
//       setCallError(data.message);
//       setCallState('idle');
//     });
// 
//     socket.on('webrtc:offer', handleWebRTCOffer);
//     socket.on('webrtc:answer', handleWebRTCAnswer);
//     socket.on('webrtc:ice-candidate', handleIceCandidate);
// 
//     return () => {
//       socket.off('call:ringing');
//       socket.off('call:incoming');
//       socket.off('call:accepted');
//       socket.off('call:rejected');
//       socket.off('call:cancelled');
//       socket.off('call:ended');
//       socket.off('call:error');
//       socket.off('webrtc:offer');
//       socket.off('webrtc:answer');
//       socket.off('webrtc:ice-candidate');
//     };
//   }, [socket, handleWebRTCOffer, handleWebRTCAnswer, handleIceCandidate, endCall]);
// 
//   return {
//     // États
//     localStream,
//     remoteStream,
//     callState,
//     incomingCall,
//     callError,
//     isMuted,
//     isCameraOn,
//     
//     // Actions
//     initiateCall,
//     acceptCall,
//     rejectCall,
//     endCall,
//     toggleMic,
//     toggleCamera,
//     getLocalStream,
//     
//     // Utilitaires
//     isCallActive: callState === 'connected' || callState === 'calling' || callState === 'connecting',
//     isIncomingCall: callState === 'incoming',
//     isCalling: callState === 'calling',
//   };
// };

// hooks/webrtc/useCall.ts
// import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// import {
//   mediaDevices,
//   RTCPeerConnection,
//   RTCSessionDescription,
//   RTCIceCandidate,
//   MediaStream,
// } from 'react-native-webrtc';
// import { Alert } from 'react-native';
// import { CallType, CallState, IncomingCallData, CurrentUser } from '../../types';
// import { useSocket } from '../useSocket';
// import { useDispatch, useSelector } from 'react-redux';
// import { RootState } from '../../store/store';
// import {
//   acceptCall as acceptCallAction,
//   rejectCall as rejectCallAction,
//   callEnded as callEndedAction,
//   setCallState as setCallStateAction,
// } from '../../store/slices/incomingCallSlice';
// import {
//   setLocalStream,
//   setRemoteStream,
//   resetStreams,
// } from '../../store/slices/streamSlice';
// ;
// import StreamHolder from '../../services/StreamHolder';
// 
// const configuration: RTCConfiguration = {
//   iceServers: [
//     { urls: "stun:stun.l.google.com:19302" },
//     { urls: "stun:stun1.l.google.com:19302" },
//     { urls: "stun:stun2.l.google.com:19302" },
//     { urls: "stun:stun3.l.google.com:19302" },
//     { urls: "stun:stun4.l.google.com:19302" },
//     {
//       urls: "turn:openrelay.metered.ca:443?transport=tcp",
//       username: "openrelayproject",
//       credential: "openrelayproject",
//     },
//   ],
//   iceCandidatePoolSize: 3,
//   bundlePolicy: "max-bundle" as RTCBundlePolicy,
//   rtcpMuxPolicy: "require" as RTCRtcpMuxPolicy,
//   iceTransportPolicy: "all" as RTCIceTransportPolicy,
// };
// 
// export interface UseWebRTCReturn {
//   localStream: MediaStream | null;
//   remoteStream: MediaStream | null;
//   callState: CallState;
//   incomingCall: IncomingCallData | null;
//   callError: string | null;
//   isMuted: boolean;
//   isCameraOn: boolean;
//   initiateCall: (targetUserId: string, callType?: CallType) => Promise<void>;
//   acceptCall: () => Promise<void>;
//   rejectCall: () => void;
//   endCall: () => void;
//   toggleMic: () => void;
//   toggleCamera: () => void;
//   getLocalStream: (videoEnabled?: boolean) => Promise<MediaStream>;
//   isCallActive: boolean;
//   isIncomingCall: boolean;
//   isCalling: boolean;
// }
// 
// export const useWebRTC = (currentUser: CurrentUser | null): UseWebRTCReturn => {
//   const { socket, isConnected } = useSocket();
//   const dispatch = useDispatch();
//   
//   // États Redux
//   const reduxCallData = useSelector((state: RootState) => state.incomingCall.callData);
//   const reduxCallState = useSelector((state: RootState) => state.incomingCall.callState);
//   
//   // États locaux
//   const [localStream, setLocalStream] = useState<MediaStream | null>(null);
//   const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
//   const [callState, setCallState] = useState<CallState>('idle');
//   const [incomingCall, setIncomingCall] = useState<IncomingCallData | null>(null);
//   const [callError, setCallError] = useState<string | null>(null);
//   const [isMuted, setIsMuted] = useState<boolean>(false);
//   const [isCameraOn, setIsCameraOn] = useState<boolean>(true);
// 
//   // Refs
//   const peerConnection = useRef<RTCPeerConnection | null>(null);
//   const remoteUserId = useRef<string | null>(null);
//   const currentCallId = useRef<string | null>(null);
//   const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
//   const isAcceptingRef = useRef(false);
// const currentCallIdAcceptedRef = useRef<string | null>(null);
// 
// 
//   const stableUser = useMemo(() => {
//     if (!currentUser?._id) return null;
//     return {
//       _id: currentUser._id,
//       username: currentUser.username,
//       profilePicture: currentUser.profilePicture,
//     };
//   }, [currentUser?._id, currentUser?.username, currentUser?.profilePicture]);
// 
//   const userRef = useRef(stableUser);
//   useEffect(() => {
//     if (stableUser && !userRef.current) {
//       userRef.current = stableUser;
//     }
//   }, [stableUser]);
// 
//   // ========== FLUX LOCAL ==========
//   const getLocalStream = useCallback(async (videoEnabled: boolean = true): Promise<MediaStream> => {
//     try {
//       if (localStream) {
//         localStream.getTracks().forEach(track => track.stop());
//       }
// 
//       const stream = await mediaDevices.getUserMedia({
//         audio: true,
//         video: videoEnabled ? {
//           width: { ideal: 640 },
//           height: { ideal: 480 },
//           frameRate: { ideal: 30 },
//           facingMode: 'user'
//         } : false,
//       });
// 
//       setLocalStream(stream);
//       setIsCameraOn(videoEnabled);
//       return stream;
//     } catch (err) {
//       console.error('❌ Erreur accès média:', err);
//       setCallError('Impossible d\'accéder à la caméra/micro');
//       throw err;
//     }
//   }, []);
// 
//   // ========== CONNEXION PEER ==========
//   const createPeerConnection = useCallback((): RTCPeerConnection => {
//     if (peerConnection.current) {
//       peerConnection.current.close();
//     }
// 
//     const pc = new RTCPeerConnection(configuration);
// 
//     (pc as any).onicecandidate = (event: RTCPeerConnectionIceEvent) => {
//       if (event.candidate && remoteUserId.current && socket && isConnected) {
//         socket.emit('webrtc:ice-candidate', {
//           callId: currentCallId.current,
//           targetUserId: remoteUserId.current,
//           candidate: event.candidate,
//         });
//       }
//     };
// 
//     (pc as any).ontrack = (event: RTCTrackEvent) => {
//       console.log('📹 Track distant reçu:', event.track.kind);
//       if (event.streams && event.streams[0]) {
//         setRemoteStream(event.streams[0] as any);
//         setCallState('connected');
//         dispatch(setCallStateAction('connected'));
//       }
//     };
// 
//     (pc as any).onconnectionstatechange = () => {
//       console.log('📡 État connexion:', pc.connectionState);
//       if (pc.connectionState === 'connected') {
//         setCallState('connected');
//         dispatch(setCallStateAction('connected'));
//       } else if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
//         endCall();
//       }
//     };
// 
//     (pc as any).oniceconnectionstatechange = () => {
//       console.log('🧊 État ICE:', pc.iceConnectionState);
//     };
// 
//     peerConnection.current = pc;
//     return pc;
//   }, [socket, isConnected, dispatch]);
// 
//   // ========== AJOUTER TRACKS ==========
//   const addLocalTracks = useCallback(async (
//     pc: RTCPeerConnection,
//     videoEnabled: boolean = true
//   ): Promise<MediaStream> => {
//     const stream = await getLocalStream(videoEnabled);
//     stream.getTracks().forEach((track) => {
//       pc.addTrack(track, stream);
//     });
//     return stream;
//   }, [getLocalStream]);
// 
//   // ========== INITIER APPEL ==========
//   const initiateCall = useCallback(async (
//     targetUserId: string,
//     callType: CallType = 'video'
//   ): Promise<void> => {
//     const user = userRef.current || stableUser;
// 
//     if (!socket || !isConnected) {
//       setCallError('Non connecté au serveur');
//       return;
//     }
// 
//     if (!user || !user._id) {
//       setCallError('Utilisateur non authentifié');
//       return;
//     }
//     //   if (callState === 'incoming') {
//     //   console.log('⚠️ Appel entrant, on ne crée pas d\'offer');
//     //   return; // 👈 NE PAS CRÉER D'OFFER POUR UN APPEL ENTRANT
//     // }
// 
//     try {
//       dispatch(setCallStateAction('connecting'));
//       // setCallState('calling');
//       setCallError(null);
//       remoteUserId.current = targetUserId;
// 
//       const pc = createPeerConnection();
//       await addLocalTracks(pc, callType === 'video');
// 
//       const offer = await pc.createOffer({
//         offerToReceiveAudio: true,
//         offerToReceiveVideo: callType === 'video',
//       });
//       await pc.setLocalDescription(offer);
// 
//       socket.emit('call:initiate', {
//         targetUserId,
//         callType,
//         callerInfo: {
//           username: user.username,
//           profilePicture: user.profilePicture,
//         },
//         offer: offer,
//       });
//       console.log("Initiation d'appel ici ")
// 
// 
//     } catch (err) {
//       console.error('❌ Erreur initiation appel:', err);
//       setCallError('Erreur lors de l\'initiation de l\'appel');
//       setCallState('idle');
//     }
//   }, [socket, isConnected, stableUser, createPeerConnection, addLocalTracks]);
// 
//   // ========== ACCEPTER APPEL ==========
//   const acceptCall = useCallback(async (): Promise<void> => {
//     const callData = reduxCallData;
//     if (!callData || !socket) return;
// 
//     try {
//       dispatch(setCallStateAction('connecting'));
//       // setCallState('connecting');
//       
//       remoteUserId.current = callData.callerId;
//       currentCallId.current = callData.callId;
// 
//       const pc = createPeerConnection();
//       const videoEnabled = callData.callType === 'video';
//       await addLocalTracks(pc, videoEnabled);
// 
//       if (callData.offer) {
//         await pc.setRemoteDescription(new RTCSessionDescription(callData.offer));
// 
//         while (pendingCandidates.current.length > 0) {
//           const candidate = pendingCandidates.current.shift();
//           if (candidate) {
//             try {
//               await pc.addIceCandidate(new RTCIceCandidate(candidate));
//             } catch (err) {
//               console.warn('⚠️ Erreur candidat en attente:', err);
//             }
//           }
//         }
// 
//         const answer = await pc.createAnswer();
//         await pc.setLocalDescription(answer);
// 
//         socket.emit('call:accept', {
//           callId: callData.callId,
//           callerId: callData.callerId,
//           answer: answer,
//         });
// 
//          //  1. METTRE À JOUR REDUX (l'appel est accepté)
//         dispatch(acceptCallAction());
//       
//         
//       }
//      dispatch(acceptCallAction())
// 
//     } catch (err) {
//       console.error('❌ Erreur acceptation:', err);
//       setCallError('Erreur lors de l\'acceptation');
//       // setCallState('idle');
//       dispatch(setCallStateAction('idle'));
//     }
//   }, [acceptCallAction, reduxCallData, socket, dispatch, createPeerConnection, addLocalTracks]);
// 
//   // ========== REFUSER APPEL ==========
//   const rejectCall = useCallback((): void => {
//     const callData = reduxCallData;
//     if (!callData || !socket) return;
// 
//     socket.emit('call:reject', {
//       callId: callData.callId,
//       callerId: callData.callerId,
//       reason: 'rejected',
//     });
// 
//     dispatch(rejectCallAction());
//   }, [rejectCallAction, reduxCallData, socket, dispatch]);
// 
//   // ========== TERMINER APPEL ==========
//   const endCall = useCallback((): void => {
//     if (remoteUserId.current && socket && isConnected) {
//       socket.emit('call:end', {
//         callId: currentCallId.current,
//         targetUserId: remoteUserId.current,
//       });
//     }
// 
//     if (peerConnection.current) {
//       peerConnection.current.close();
//       peerConnection.current = null;
//     }
// 
//     if (localStream) {
//       localStream.getTracks().forEach(track => track.stop());
//       setLocalStream(null);
//     }
// 
//     setRemoteStream(null);
//     dispatch(callEndedAction());
//     dispatch(setCallStateAction('idle'));
//     
//     remoteUserId.current = null;
//     currentCallId.current = null;
//     pendingCandidates.current = [];
//   }, [socket, isConnected, localStream, dispatch]);
// 
//   // ========== TOGGLE MICRO/CAMÉRA ==========
//   const toggleMic = useCallback((): void => {
//     if (localStream) {
//       const audioTrack = localStream.getAudioTracks()[0];
//       if (audioTrack) {
//         audioTrack.enabled = !audioTrack.enabled;
//         setIsMuted(!audioTrack.enabled);
//       }
// 
//     }
//   }, [localStream]);
// 
//   const toggleCamera = useCallback((): void => {
//     if (localStream) {
//       const videoTrack = localStream.getVideoTracks()[0];
//       if (videoTrack) {
//         videoTrack.enabled = !videoTrack.enabled;
//         setIsCameraOn(videoTrack.enabled);
//       }
//       
//     }
//   }, [localStream]);
// 
//   // ========== HANDLERS WEBRTC ==========
//   const handleWebRTCOffer = useCallback(async (data: any): Promise<void> => {
//     try {
//       if (peerConnection.current) {
//         await peerConnection.current.setRemoteDescription(
//           new RTCSessionDescription(data.offer)
//         );
//         while (pendingCandidates.current.length > 0) {
//           const candidate = pendingCandidates.current.shift();
//           if (candidate && peerConnection.current) {
//             await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
//           }
//         }
//       }
//     } catch (err) {
//       console.error('❌ Erreur traitement offre:', err);
//     }
//   }, []);
// 
//   const handleWebRTCAnswer = useCallback(async (data: any): Promise<void> => {
//     try {
//       if (peerConnection.current) {
//         await peerConnection.current.setRemoteDescription(
//           new RTCSessionDescription(data.answer)
//         );
//         while (pendingCandidates.current.length > 0) {
//           const candidate = pendingCandidates.current.shift();
//           if (candidate && peerConnection.current) {
//             await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
//           }
//         }
//         // setCallState('connected');
//         dispatch(acceptCallAction());
//       }
//     } catch (err) {
//       console.error('❌ Erreur traitement réponse:', err);
//     }
//   }, [dispatch]);
// 
//   const handleIceCandidate = useCallback(async (data: any): Promise<void> => {
//     if (peerConnection.current && data.candidate) {
//       try {
//         if (!peerConnection.current.remoteDescription) {
//           pendingCandidates.current.push(data.candidate);
//           return;
//         }
//         await peerConnection.current.addIceCandidate(
//           new RTCIceCandidate(data.candidate)
//         );
//       } catch (err) {
//         console.error('❌ Erreur ICE:', err);
//       }
//     }
//   }, []);
// 
// 
//   // ========== ÉCOUTEURS SOCKET (WebRTC uniquement) ==========
//   useEffect(() => {
//     if (!socket) return;
// 
//     socket.on('call:ringing', (data: any) => {
//       console.log('📳 Sonnerie en cours');
//       currentCallId.current = data.callId;
//     });
// 
//     socket.on('call:accepted', (data: any) => {
//       console.log('✅ Appel accepté');
//       if (data.answer && peerConnection.current) {
//         handleWebRTCAnswer({ answer: data.answer });
//       }
//       // setCallState('connected');
//       dispatch(acceptCallAction());
//     });
// 
//     socket.on('call:rejected', (data: any) => {
//       console.log('❌ Appel refusé');
//       dispatch(rejectCallAction())
//       endCall();
//     });
//     socket.on('call:ended',(data:any) =>{
//       console.log('❌ Appel terminé');
//       dispatch(callEndedAction())
//     })
// 
//     socket.on('webrtc:offer', handleWebRTCOffer);
//     socket.on('webrtc:answer', handleWebRTCAnswer);
//     socket.on('webrtc:ice-candidate', handleIceCandidate);
// 
//     return () => {
//       socket.off('call:ringing');
//       socket.off('call:accepted');
//       socket.off('call:rejected');
//       socket.off('call:ended');
//       socket.off('webrtc:offer', handleWebRTCOffer);
//       socket.off('webrtc:answer', handleWebRTCAnswer);
//       socket.off('webrtc:ice-candidate', handleIceCandidate);
//     };
//   }, [socket, handleWebRTCOffer, handleWebRTCAnswer, handleIceCandidate, endCall, dispatch]);
// 
//   // // // ========== SYNC AVEC REDUX ==========
//   // useEffect(() => {
//   //   if (reduxCallState === 'incoming' && reduxCallData) {
//   //     // setIncomingCall(reduxCallData as any);
//   //   }
//   // }, [reduxCallState, reduxCallData]);
// 
//   return {
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
//     getLocalStream,
//     isCallActive: reduxCallState === 'connected' || reduxCallState === 'calling' ,
//     isIncomingCall: reduxCallState === 'incoming',
//     isCalling: reduxCallState === 'calling',
//   };
// };

// hooks/webrtc/useCall.ts - VERSION ADAPTÉE AVEC REDUX STREAMS

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  mediaDevices,
  RTCPeerConnection,
  RTCSessionDescription,
  RTCIceCandidate,
  MediaStream,
} from 'react-native-webrtc';
import { Alert } from 'react-native';
import { CallType, CallState, IncomingCallData, CurrentUser } from '../../types';
import { useSocket } from '../useSocket';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import {
  acceptCall as acceptCallAction,
  rejectCall as rejectCallAction,
  callEnded as callEndedAction,
  setCallState as setCallStateAction,
  setIncomingCall
} from '../../store/slices/incomingCallSlice';
import {
  setLocalStream as setLocalStreamAction,
  setRemoteStream as setRemoteStreamAction,
  resetStreams,
} from '../../store/slices/streamSlice';
import StreamHolder from '../../services/StreamHolder';
import { AnyAction } from '@reduxjs/toolkit';

const configuration: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
    {
      urls: "turn:openrelay.metered.ca:443?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
  iceCandidatePoolSize: 3,
  bundlePolicy: "max-bundle" as RTCBundlePolicy,
  rtcpMuxPolicy: "require" as RTCRtcpMuxPolicy,
  iceTransportPolicy: "all" as RTCIceTransportPolicy,
};

export interface UseWebRTCReturn {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callState: CallState;
  incomingCall: IncomingCallData | null;
  callError: string | null;
  isMuted: boolean;
  isCameraOn: boolean;
  initiateCall: (targetUserId: string, callType?: CallType) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  toggleMic: () => void;
  toggleCamera: () => void;
  getLocalStream: (videoEnabled?: boolean) => Promise<MediaStream>;
  isCallActive: boolean;
  isIncomingCall: boolean;
  isCalling: boolean;
}

export const useWebRTC = (currentUser: CurrentUser | null): UseWebRTCReturn => {
  const { socket, isConnected } = useSocket();
  const dispatch = useDispatch();
  
  // États Redux
  const reduxCallData = useSelector((state: RootState) => state.incomingCall.callData);
  const reduxCallState = useSelector((state: RootState) => state.incomingCall.callState);
  
  // 👉 Forcer le re-render quand les streams changent dans Redux
  const streamLastUpdated = useSelector((state: RootState) => state.stream.lastUpdated);
  
  // États locaux (PAS les streams)
  const [callError, setCallError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(true);

  // 👉 StreamHolder pour garder les vrais objets MediaStream
  const streamHolder = useRef(StreamHolder.getInstance()).current;

  // Refs
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const remoteUserId = useRef<string | null>(null);
  const currentCallId = useRef<string | null>(null);
  const pendingCandidates = useRef<RTCIceCandidateInit[]>([]);
  const isAcceptingRef = useRef(false);

  const stableUser = useMemo(() => {
    if (!currentUser?._id) return null;
    return {
      _id: currentUser._id,
      username: currentUser.username,
      profilePicture: currentUser.profilePicture,
    };
  }, [currentUser?._id, currentUser?.username, currentUser?.profilePicture]);

  const userRef = useRef(stableUser);
  useEffect(() => {
    if (stableUser && !userRef.current) {
      userRef.current = stableUser;
    }
  }, [stableUser]);

  // ========== FLUX LOCAL ==========
  const getLocalStream = useCallback(async (videoEnabled: boolean = true): Promise<MediaStream> => {
    try {
      // Nettoyer l'ancien
      streamHolder.setLocal(null);
      dispatch(resetStreams());

      const stream = await mediaDevices.getUserMedia({
        audio: true,
        video: videoEnabled ? {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 },
          facingMode: 'user'
        } : false,
      });

      console.log('✅ getUserMedia OK - tracks:', stream.getTracks().map(t => t.kind));

      // 👉 GARDER le vrai stream dans le holder
      streamHolder.setLocal(stream);

      // 👉 DISPATCHER dans Redux
      dispatch(setLocalStreamAction({
        streamId: stream.id,
        tracks: stream.getTracks().map(t => `${t.kind}:${t.id}`),
      }));

      setIsCameraOn(videoEnabled);
      return stream;
    } catch (err: any) {
      console.error('❌ Erreur accès média:', err.message);
      setCallError('Impossible d\'accéder à la caméra/micro');
      throw err;
    }
  }, [dispatch]);

  // ========== CONNEXION PEER ==========
  const createPeerConnection = useCallback((): RTCPeerConnection => {
    if (peerConnection.current) {
      try { peerConnection.current.close(); } catch (e) {}
      peerConnection.current = null;
    }

    const pc = new RTCPeerConnection(configuration);

    (pc as any).onicecandidate = (event: RTCPeerConnectionIceEvent) => {
      if (event.candidate && remoteUserId.current && socket && isConnected) {
        socket.emit('webrtc:ice-candidate', {
          callId: currentCallId.current,
          targetUserId: remoteUserId.current,
          candidate: event.candidate,
        });
      }
    };

    //  RÉCEPTION DU FLUX DISTANT - DISPATCHER DANS REDUX
    (pc as any).ontrack = (event: RTCTrackEvent) => {
      console.log('📹 ontrack - kind:', event.track?.kind);
      
      if (event.streams && event.streams[0]) {
        const remoteMediaStream = event.streams[0] as any as MediaStream;
        
        console.log('📹 Remote stream reçu - tracks:', 
          remoteMediaStream.getTracks().map((t: any) => t.kind));

        // GARDER le vrai stream
        streamHolder.setRemote(remoteMediaStream);

        //  DISPATCHER dans Redux
        dispatch(setRemoteStreamAction({
          streamId: remoteMediaStream.id,
          tracks: remoteMediaStream.getTracks().map((t: any) => `${t.kind}:${t.id}`),
        }));

        dispatch(setCallStateAction('connected'));
      }
    };

    (pc as any).onconnectionstatechange = () => {
      console.log('📡 État connexion:', pc.connectionState);
      if (pc.connectionState === 'connected') {
        dispatch(setCallStateAction('connected'));
      } else if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
        console.log('⚠️ Connexion perdue');
        endCall();
      }
    };

    (pc as any).oniceconnectionstatechange = () => {
      console.log('🧊 État ICE:', pc.iceConnectionState);
    };

    peerConnection.current = pc;
    return pc;
  }, [socket, isConnected, dispatch]);

  // ========== AJOUTER TRACKS ==========
  const addLocalTracks = useCallback(async (
    pc: RTCPeerConnection,
    videoEnabled: boolean = true
  ): Promise<MediaStream> => {
    const stream = await getLocalStream(videoEnabled);
    
    if (pc.connectionState === 'closed') {
      throw new Error('PeerConnection fermée');
    }

    stream.getTracks().forEach((track) => {
      if (pc.connectionState !== 'closed') {
        pc.addTrack(track, stream);
        console.log('➕ Track ajouté:', track.kind);
      }
    });
    
    return stream;
  }, [getLocalStream]);

  // ========== INITIER APPEL ==========
  const initiateCall = useCallback(async (
    targetUserId: string,
    callType: CallType = 'video'
  ): Promise<void> => {
    const user = userRef.current || stableUser;

    if (!socket || !isConnected) {
      setCallError('Non connecté au serveur');
      return;
    }

    if (!user || !user._id) {
      setCallError('Utilisateur non authentifié');
      return;
    }

    try {
      dispatch(setCallStateAction('calling'));
      setCallError(null);
      remoteUserId.current = targetUserId;

      const pc = createPeerConnection();
      await addLocalTracks(pc, callType === 'video');

      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: callType === 'video',
      });
      await pc.setLocalDescription(offer);

      socket.emit('call:initiate', {
        targetUserId,
        callType,
        callerInfo: {
          username: user.username,
          profilePicture: user.profilePicture,
        },
        offer: offer,
      });
      
      console.log("📤 Initiation d'appel envoyée");

    } catch (err: any) {
      console.error('❌ Erreur initiation appel:', err.message);
      setCallError('Erreur lors de l\'initiation de l\'appel');
      dispatch(setCallStateAction('idle'));
    }
  }, [socket, isConnected, stableUser, dispatch, createPeerConnection, addLocalTracks]);

  // ========== ACCEPTER APPEL ==========
  const acceptCall = useCallback(async (): Promise<void> => {
    if (isAcceptingRef.current) {
      console.log('⚠️ Acceptation déjà en cours');
      return;
    }

    const callData = reduxCallData;
    if (!callData || !socket) return;

    isAcceptingRef.current = true;

    try {
      dispatch(setCallStateAction('connecting'));
      
      remoteUserId.current = callData.callerId;
      currentCallId.current = callData.callId;

      const pc = createPeerConnection();
      const videoEnabled = callData.callType === 'video';
      await addLocalTracks(pc, videoEnabled);

      if (callData.offer) {
        await pc.setRemoteDescription(new RTCSessionDescription(callData.offer));

        // Traiter les candidats en attente
        while (pendingCandidates.current.length > 0) {
          const candidate = pendingCandidates.current.shift();
          if (candidate && pc.connectionState !== 'closed') {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
              console.warn('⚠️ Erreur candidat en attente:', err);
            }
          }
        }

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit('call:accept', {
          callId: callData.callId,
          callerId: callData.callerId,
          answer: answer,
        });

        dispatch(acceptCallAction());
        console.log('✅ Appel accepté');
      }

    } catch (err: any) {
      console.error('❌ Erreur acceptation:', err.message);
      setCallError('Erreur lors de l\'acceptation');
      dispatch(setCallStateAction('idle'));
      
      // Nettoyer en cas d'erreur
      streamHolder.setLocal(null);
      dispatch(resetStreams());
    } finally {
      setTimeout(() => {
        isAcceptingRef.current = false;
      }, 2000);
    }
  }, [reduxCallData, socket, dispatch, createPeerConnection, addLocalTracks]);

  // ========== REFUSER APPEL ==========
  const rejectCall = useCallback((): void => {
    const callData = reduxCallData;
    if (!callData || !socket) return;

    socket.emit('call:reject', {
      callId: callData.callId,
      callerId: callData.callerId,
      reason: 'rejected',
    });

    dispatch(rejectCallAction());
  }, [reduxCallData, socket, dispatch]);

  // ========== TERMINER APPEL ==========
  const endCall = useCallback((): void => {
    console.log('📴 Fin d\'appel');

    if (remoteUserId.current && socket && isConnected) {
      socket.emit('call:end', {
        callId: currentCallId.current,
        targetUserId: remoteUserId.current,
      });
    }

    if (peerConnection.current) {
      try { peerConnection.current.close(); } catch (e) {}
      peerConnection.current = null;
    }

    // 👉 NETTOYER STREAMHOLDER ET REDUX
    streamHolder.cleanup();
    dispatch(resetStreams());

    dispatch(callEndedAction());
    dispatch(setCallStateAction('idle'));
    
    remoteUserId.current = null;
    currentCallId.current = null;
    pendingCandidates.current = [];
  }, [socket, isConnected, dispatch]);

  // ========== TOGGLE MICRO/CAMÉRA ==========
  const toggleMic = useCallback((): void => {
    const local = streamHolder.localStream;
    if (local) {
      const audioTrack = local.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, []);

  const toggleCamera = useCallback((): void => {
    const local = streamHolder.localStream;
    if (local) {
      const videoTrack = local.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCameraOn(videoTrack.enabled);
      }
    }
  }, []);

  // ========== HANDLERS WEBRTC ==========
  const handleWebRTCOffer = useCallback(async (data: any): Promise<void> => {
    try {
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(data.offer)
        );
        while (pendingCandidates.current.length > 0) {
          const candidate = pendingCandidates.current.shift();
          if (candidate && peerConnection.current) {
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
          }
        }
      }
    } catch (err) {
      console.error('❌ Erreur traitement offre:', err);
    }
  }, []);

  const handleWebRTCAnswer = useCallback(async (data: any): Promise<void> => {
    try {
      if (peerConnection.current) {
        await peerConnection.current.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );
        while (pendingCandidates.current.length > 0) {
          const candidate = pendingCandidates.current.shift();
          if (candidate && peerConnection.current) {
            await peerConnection.current.addIceCandidate(new RTCIceCandidate(candidate));
          }
        }
        dispatch(setCallStateAction('connected'));
      }
    } catch (err) {
      console.error('❌ Erreur traitement réponse:', err);
    }
  }, [dispatch]);

  const handleIceCandidate = useCallback(async (data: any): Promise<void> => {
    if (peerConnection.current && data.candidate) {
      try {
        if (!peerConnection.current.remoteDescription) {
          pendingCandidates.current.push(data.candidate);
          return;
        }
        await peerConnection.current.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );
      } catch (err) {
        console.error('❌ Erreur ICE:', err);
      }
    }
  }, []);

  // ========== ÉCOUTEURS SOCKET ==========
  useEffect(() => {
    if (!socket) return;

    socket.on('call:ringing', (data: any) => {
      console.log('📳 Sonnerie en cours');
      currentCallId.current = data.callId;
    });
    // socket.on('call:incoming',(data:any)=>{
    //    console.log('✅ Appel entrant par l appelant');
    //    
    //        dispatch(setIncomingCall({
    //          callId: data.callId,
    //          callerId: data.callerId,
    //          callerName: data.callerName || 'Inconnu',
    //          callerProfilePicture: data.callerProfilePicture || null,
    //          callType: data.callType || 'audio',
    //          offer: data.offer || null,
    //          timestamp: data.timestamp || new Date().toISOString(),
    //        }));
    //   if (data.offer && peerConnection.current) {
    //     handleWebRTCOffer({ offer: data.offer });
    //   }
    //   // dispatch(acceptCallAction())
    // });
    socket.on('call:accepted', (data: any) => {
      console.log('✅ Appel accepté par le destinataire');
      if (data.answer && peerConnection.current) {
        handleWebRTCAnswer({ answer: data.answer });
      }
      dispatch(acceptCallAction())
    });
    socket.on('call:rejected', (data: any) => {
      console.log('❌ Appel refusé');
      dispatch(rejectCallAction());
      endCall();
    });
    socket.on('call:error',(data:any)=>{
      Alert.alert(`${data.code}`,`${data.message}`)
    })
    socket.on('call:ended', (data: any) => {
      console.log('📴 Appel terminé par l\'autre');
      endCall();
    });

    socket.on('webrtc:offer', handleWebRTCOffer);
    socket.on('webrtc:answer', handleWebRTCAnswer);
    socket.on('webrtc:ice-candidate', handleIceCandidate);

    return () => {
      socket.off('call:ringing');
      socket.off('call:accepted');
      socket.off('call:incoming');
      socket.off('call:rejected');
      socket.off('call:ended');
      socket.off('webrtc:offer', handleWebRTCOffer);
      socket.off('webrtc:answer', handleWebRTCAnswer);
      socket.off('webrtc:ice-candidate', handleIceCandidate);
    };
  }, [socket, handleWebRTCOffer, handleWebRTCAnswer, handleIceCandidate, endCall, dispatch]);

  return {
    // 👉 LES STREAMS VIENNENT DU STREAMHOLDER (toujours à jour)
    localStream: streamHolder.localStream,
    remoteStream: streamHolder.remoteStream,
    callState: reduxCallState,
    incomingCall: reduxCallData as any,
    callError,
    isMuted,
    isCameraOn,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMic,
    toggleCamera,
    getLocalStream,
    isCallActive: reduxCallState === 'connected' || reduxCallState === 'calling' || reduxCallState === 'connecting',
    isIncomingCall: reduxCallState === 'incoming',
    isCalling: reduxCallState === 'calling',
  };
};