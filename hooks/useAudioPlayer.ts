// import { useState, useCallback, useRef } from 'react';
// import { Audio } from 'expo-av';
// 
// interface PlayingAudio {
//   messageId: string;
//   sound: Audio.Sound;
// }
// 
// export const useAudioPlayer = () => {
//   const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
//   const activeSoundRef = useRef<Audio.Sound | null>(null);
// 
//   const playAudio = useCallback(async (
//     messageId: string,
//     audioUrl: string,
//     onPlaybackStatusUpdate?: (status: any) => void
//   ) => {
//     try {
//       // Arrêter la lecture en cours
//       if (activeSoundRef.current) {
//         await activeSoundRef.current.stopAsync();
//         await activeSoundRef.current.unloadAsync();
//         activeSoundRef.current = null;
//       }
// 
//       // Charger le nouvel audio
//       const fullUrl = audioUrl.startsWith('http') 
//         ? audioUrl 
//         : `https://asmay-3666dae6847a.herokuapp.com${audioUrl}`;
// 
//       const { sound } = await Audio.Sound.createAsync(
//         { uri: fullUrl },
//         { shouldPlay: true },
//         onPlaybackStatusUpdate
//       );
// 
//       activeSoundRef.current = sound;
//       setCurrentlyPlayingId(messageId);
// 
//       return sound;
// 
//     } catch (error) {
//       console.error('❌ Erreur lecture audio:', error);
//       return null;
//     }
//   }, []);
// 
//   const stopAudio = useCallback(async () => {
//     if (activeSoundRef.current) {
//       await activeSoundRef.current.stopAsync();
//       await activeSoundRef.current.unloadAsync();
//       activeSoundRef.current = null;
//       setCurrentlyPlayingId(null);
//     }
//   }, []);
// 
//   const pauseAudio = useCallback(async () => {
//     if (activeSoundRef.current) {
//       await activeSoundRef.current.pauseAsync();
//     }
//   }, []);
// 
//   const resumeAudio = useCallback(async () => {
//     if (activeSoundRef.current) {
//       await activeSoundRef.current.playAsync();
//     }
//   }, []);
// 
//   const isPlaying = useCallback((messageId: string) => {
//     return currentlyPlayingId === messageId;
//   }, [currentlyPlayingId]);
// 
//   return {
//     currentlyPlayingId,
//     playAudio,
//     stopAudio,
//     pauseAudio,
//     resumeAudio,
//     isPlaying,
//   };
// };

import { useState, useCallback, useRef } from 'react';
import { Audio } from 'expo-av';

interface PlayingAudio {
  messageId: string;
  sound: Audio.Sound;
  position: number;
  duration: number;
}

export const useAudioPlayer = () => {
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const activeSoundRef = useRef<Audio.Sound | null>(null);
  const activeMessageIdRef = useRef<string | null>(null);

  // Arrêter la lecture en cours
  const stopCurrentAudio = useCallback(async () => {
    if (activeSoundRef.current) {
      try {
        const status = await activeSoundRef.current.getStatusAsync();
        if (status.isLoaded) {
          await activeSoundRef.current.stopAsync();
          await activeSoundRef.current.unloadAsync();
        }
      } catch (error) {
        console.error('❌ Erreur arrêt audio:', error);
      } finally {
        activeSoundRef.current = null;
        activeMessageIdRef.current = null;
        setCurrentlyPlayingId(null);
        setIsPlaying(false);
        setPosition(0);
      }
    }
  }, []);

  // Jouer un audio
  const playAudio = useCallback(async (
    messageId: string,
    audioUrl: string,
    onPlaybackStatusUpdate?: (status: any) => void
  ): Promise<Audio.Sound | null> => {
    try {
      // Arrêter la lecture en cours si différent
      if (activeMessageIdRef.current !== messageId) {
        await stopCurrentAudio();
      }

      // Construire l'URL complète
      const fullUrl = audioUrl.startsWith('http') 
        ? audioUrl 
        : `https://asmay-3666dae6847a.herokuapp.com${audioUrl}`;

      console.log(`🎵 Chargement audio: ${messageId}`);

      const { sound } = await Audio.Sound.createAsync(
        { uri: fullUrl },
        { 
          shouldPlay: true,
          progressUpdateIntervalMillis: 100,
        },
        (status) => {
          if (status.isLoaded) {
            setPosition(status.positionMillis);
            setDuration(status.durationMillis || 0);
            
            if (status.didJustFinish) {
              setIsPlaying(false);
              setPosition(0);
              setCurrentlyPlayingId(null);
              activeMessageIdRef.current = null;
            }
          }
          
          // Propager au callback externe si fourni
          onPlaybackStatusUpdate?.(status);
        }
      );

      activeSoundRef.current = sound;
      activeMessageIdRef.current = messageId;
      setCurrentlyPlayingId(messageId);
      setIsPlaying(true);

      return sound;

    } catch (error) {
      console.error('❌ Erreur lecture audio:', error);
      return null;
    }
  }, [stopCurrentAudio]);

  // Mettre en pause
  const pauseAudio = useCallback(async () => {
    if (activeSoundRef.current) {
      try {
        await activeSoundRef.current.pauseAsync();
        setIsPlaying(false);
      } catch (error) {
        console.error('❌ Erreur pause:', error);
      }
    }
  }, []);

  // Reprendre la lecture
  const resumeAudio = useCallback(async () => {
    if (activeSoundRef.current) {
      try {
        await activeSoundRef.current.playAsync();
        setIsPlaying(true);
      } catch (error) {
        console.error('❌ Erreur reprise:', error);
      }
    }
  }, []);

  // Aller à une position
  const seekTo = useCallback(async (positionMillis: number) => {
    if (activeSoundRef.current) {
      try {
        await activeSoundRef.current.setPositionAsync(positionMillis);
        setPosition(positionMillis);
      } catch (error) {
        console.error('❌ Erreur seek:', error);
      }
    }
  }, []);

  // Changer la vitesse
  const setSpeed = useCallback(async (speed: number) => {
    if (activeSoundRef.current) {
      try {
        await activeSoundRef.current.setRateAsync(speed, false);
      } catch (error) {
        console.error('❌ Erreur changement vitesse:', error);
      }
    }
  }, []);

  // Vérifier si un message est en cours de lecture
  const isMessagePlaying = useCallback((messageId: string) => {
    return currentlyPlayingId === messageId && isPlaying;
  }, [currentlyPlayingId, isPlaying]);

  return {
    // États
    currentlyPlayingId,
    isPlaying,
    position,
    duration,
    
    // Actions
    playAudio,
    pauseAudio,
    resumeAudio,
    stopAudio: stopCurrentAudio,
    seekTo,
    setSpeed,
    isMessagePlaying,
  };
};