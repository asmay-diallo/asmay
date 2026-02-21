import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import {
  StreamCall,
  CallContent,
  Call,
  useCallStateHooks,
  ParticipantView,
} from '@stream-io/video-react-native-sdk';
import { useStreamVideo } from '@/contexts/StreamVideoContext';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function VideoCallScreen() {
  const { callId, chatId } = useLocalSearchParams();
  const { streamClient } = useStreamVideo();
  const router = useRouter();
  
  const [call, setCall] = useState <Call |null>(null);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    if (streamClient && callId && !call) {
      joinCall();
    }

    return () => {
      if (call) {
        call.leave();
      }
    };
  }, [streamClient, callId]);

  const joinCall = async () => {
    if (!streamClient) return;
    
    try {
      setIsJoining(true);
      const newCall = streamClient.call('default', callId as string);
      await newCall.join({ create: true });
      setCall(newCall);
    } catch (error) {
      console.error('❌ Erreur rejoindre appel :', error);
      Alert.alert('Erreur', 'Impossible de rejoindre l\'appel');
      router.back();
    } finally {
      setIsJoining(false);
    }
  };

  const leaveCall = async () => {
    if (call) {
      try {
        await call.leave();
      } catch (error) {
        console.error('Erreur en quittant:', error);
      } finally {
        setCall(null);
        router.back();
      }
    }
  };

  if (!call) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {isJoining ? 'Connexion à l\'appel...' : 'Préparation de l\'appel...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <StreamCall call={call}>
      <SafeAreaView style={styles.container}>
        <CallContent
          onHangupCallHandler={leaveCall}
          // Personnalisez les contrôles si besoin
        />
      </SafeAreaView>
    </StreamCall>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
  },
});