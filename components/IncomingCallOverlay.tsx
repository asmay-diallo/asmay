// components/IncomingCallOverlay.tsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'expo-router';
import { RootState } from '../store/store';
import {
  acceptCall,
  rejectCall,
} from '../store/slices/incomingCallSlice';
import { useWebRTC } from '../hooks/webrtc/useCall';

const { width } = Dimensions.get('window');

const IncomingCallOverlay: React.FC<{ currentUser: any }> = ({ currentUser }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const isIncomingCall = useSelector(
    (state: RootState) => state.incomingCall.isIncomingCall
  );
  const callData = useSelector(
    (state: RootState) => state.incomingCall.callData
  );

  const {
    acceptCall: webrtcAcceptCall,
    rejectCall: webrtcRejectCall,
  } = useWebRTC(currentUser);

  // Animations
  const slideAnim = useRef(new Animated.Value(-300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isIncomingCall && callData) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();

      return () => pulse.stop();
    } else {
      slideAnim.setValue(-300);
      fadeAnim.setValue(0);
    }
  }, [isIncomingCall, callData]);

  const handleAccept = async () => {
    dispatch(acceptCall());
    await webrtcAcceptCall();
    
    router.push({
      pathname: '/(main)/(asmay)/call',
      params: {
        callId: callData?.callId,
        callType: callData?.callType || 'audio',
        isIncoming: 'false',
        callerId: callData?.callerId,
        callerName: callData?.callerName,
      },
    });
  };

  const handleReject = () => {
    dispatch(rejectCall());
    webrtcRejectCall();
  };

  if (!isIncomingCall || !callData) return null;

  return (
    <Modal
      visible={isIncomingCall}
      transparent
      animationType="none"
      onRequestClose={handleReject}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View
          style={[
            styles.container,
            { transform: [{ translateY: slideAnim }] },
          ]}
        >
          <View style={styles.card}>
            <Text style={styles.incomingLabel}>APPEL ENTRANT</Text>

            <Animated.View style={[styles.avatarWrap, { transform: [{ scale: pulseAnim }] }]}>
              {callData.callerProfilePicture ? (
                <Image source={{ uri: callData.callerProfilePicture }} style={styles.avatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={50} color="#fff" />
                </View>
              )}
            </Animated.View>

            <Text style={styles.callerName}>{callData.callerName}</Text>

            <View style={styles.callTypeBadge}>
              <Ionicons
                name={callData.callType === 'video' ? 'videocam' : 'call'}
                size={18}
                color="#34C759"
              />
              <Text style={styles.callTypeText}>
                {callData.callType === 'video' ? 'Appel vidéo' : 'Appel audio'}
              </Text>
            </View>

            <View style={styles.buttons}>
              <TouchableOpacity style={styles.rejectBtn} onPress={handleReject}>
                <View style={styles.btnCircle}>
                  <Ionicons name="close" size={35} color="#fff" />
                </View>
                <Text style={styles.btnLabel}>Refuser</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.acceptBtn} onPress={handleAccept}>
                <View style={[styles.btnCircle, styles.acceptCircle]}>
                  <Ionicons
                    name={callData.callType === 'video' ? 'videocam' : 'call'}
                    size={35}
                    color="#fff"
                  />
                </View>
                <Text style={styles.btnLabel}>Accepter</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.85)',
  },
  container: {
    width,
    marginTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#1c1c1e',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#34C759',
    ...Platform.select({
      ios: {
        shadowColor: '#34C759',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: { elevation: 12 },
    }),
  },
  incomingLabel: {
    color: '#34C759',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 2,
    marginBottom: 20,
  },
  avatarWrap: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#34C759',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#2c2c2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callerName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  callTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52,199,89,0.15)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 30,
    gap: 6,
  },
  callTypeText: {
    color: '#34C759',
    fontSize: 14,
    fontWeight: '500',
  },
  buttons: {
    flexDirection: 'row',
    gap: 40,
  },
  rejectBtn: { alignItems: 'center' },
  acceptBtn: { alignItems: 'center' },
  btnCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#ff3b30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  acceptCircle: {
    backgroundColor: '#34C759',
  },
  btnLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
  },
});

export default IncomingCallOverlay;