import { useEffect, useCallback } from 'react';
import { Vibration, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { useSocket } from '../useSocket';
import { useAuth } from '../useAuth';
import {
  setIncomingCall,
  callCancelled,
  callEnded,
  resetIncomingCall,
  setCallState
} from '../../store/slices/incomingCallSlice';
import { RootState } from '../../store/store';


export const useIncomingCall = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { socket } = useSocket();
  const { user, isAuthenticated } = useAuth();

   const callState = useSelector((state: RootState) => state.incomingCall.callState);
  const isCallAccepted = useSelector((state: RootState) => state.incomingCall.isCallAccepted);
  const callData = useSelector((state: RootState) => state.incomingCall.callData);

  // 📳 Vibration
  const startVibration = useCallback(() => {
    if (Platform.OS !== 'web') {
      Vibration.vibrate([1000, 2000], true);
    }
  }, []);

  const stopVibration = useCallback(() => {
    if (Platform.OS !== 'web') {
      Vibration.cancel();
    }
  }, []);

  //  Gérer l'appel entrant
  const handleIncomingCall = useCallback((data: any) => {
    console.log('🔔 [GLOBAL] Appel entrant reçu:', data.callerName, data.callType);
    
    if (!user || !isAuthenticated) return;

    dispatch(setIncomingCall({
      callId: data.callId,
      callerId: data.callerId,
      callerName: data.callerName || 'Inconnu',
      callerProfilePicture: data.callerProfilePicture || null,
      calleeId:data.calleeId,
      calleeName:data.calleeName,
      calleeProfilePicture:data.calleeProfilePicture,
      callType: data.callType || 'audio',
      offer: data.offer || null,
      timestamp: data.timestamp || new Date().toISOString(),
    }));

    startVibration();
  }, [dispatch, user, isAuthenticated, startVibration]);
  // 📞 Gérer l'appel sortant
  const handleOutgoingCall = useCallback((data:any)=>{

  },[])
  // 🚫 Annulation d'appel
  const handleCallCancelled = useCallback((data: any) => {
    dispatch(callCancelled());
    stopVibration();
  }, [dispatch, stopVibration]);

  // 📴 Fin d'appel
  const handleCallEnded = useCallback((data: any) => {
    console.log('📴 [GLOBAL] Appel terminé');
    dispatch(callEnded());
    stopVibration();
  }, [dispatch, stopVibration]);

  //  Erreur d'appel
  const handleCallError = useCallback((data: any) => {
    console.error('❌ [GLOBAL] Erreur appel:', data);
    dispatch(resetIncomingCall());
    dispatch(setCallState('idle'));
    stopVibration();
  }, [dispatch, stopVibration]);

  // Arrêter la vibration si plus d'appel
  useEffect(() => {
    if (callState === 'idle' || callState === 'connected' || callState === 'ended') {
      stopVibration();
    }
  }, [callState, stopVibration]);

  // Écouteurs socket GLOBAUX
  useEffect(() => {
    if (!socket) return;

    console.log('🌍 [GLOBAL] Configuration des écouteurs d\'appel');

    socket.on('call:incoming', handleIncomingCall);
    socket.on('call:ringing',handleOutgoingCall)
    socket.on('call:cancelled', handleCallCancelled);
    socket.on('call:ended', handleCallEnded);
    socket.on('call:error', handleCallError);

    return () => {
      console.log('🧹 [GLOBAL] Nettoyage des écouteurs d\'appel');
      socket.off('call:incoming', handleIncomingCall);
      socket.off('call:cancelled', handleCallCancelled);
      socket.off('call:ended', handleCallEnded);
      socket.off('call:error', handleCallError);
      stopVibration();
    };
  }, [socket, handleIncomingCall, handleCallCancelled, handleCallEnded, handleCallError, stopVibration]);

  useEffect(() => {
    return () => stopVibration();
  }, [stopVibration]);
    // 👈 NAVIGUER VERS L'ÉCRAN D'APPEL QUAND ACCEPTÉ
  useEffect(() => {
    if (isCallAccepted && callData) {
      console.log('🧭 Navigation automatique vers écran d\'appel');
      
      router.push({
        pathname: '/(main)/(asmay)/call',
        params: {
          callId: callData.callId,
          callType: callData.callType || 'audio',
          isIncoming: 'true',
          callerId: callData.callerId,
          callerName: callData.callerName,
        },
      });
    }
  }, [isCallAccepted, callData?.callId]); // Réagir quand l'acceptation change



  return {
    callState,
  };
};