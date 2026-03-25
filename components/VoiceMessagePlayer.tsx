// // components/VoiceMessagePlayer.tsx
// import React, { useState, useEffect, useRef, useCallback } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Animated,
//   Modal,
//   FlatList,
//   Alert,
//   ActivityIndicator,
//   Platform,
// } from "react-native";
// import { Audio } from "expo-av";
// import { Ionicons } from "@expo/vector-icons";
// 
// interface VoiceMessagePlayerProps {
//   audioUrl: string;
//   duration: number;
//   isMyMessage: boolean;
//   messageId: string;
//   onPlayStart?: (messageId: string) => void;
//   onPlayStop?: (messageId: string) => void;
// }
// 
// export const VoiceMessagePlayer: React.FC<VoiceMessagePlayerProps> = ({
//   audioUrl,
//   duration,
//   isMyMessage,
//   messageId,
//   onPlayStart,
//   onPlayStop,
// }) => {
//   const [sound, setSound] = useState<Audio.Sound | null>(null);
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [isPaused, setIsPaused] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [position, setPosition] = useState(0);
//   const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
//   const [showSpeedMenu, setShowSpeedMenu] = useState(false);
//   const [waveformData, setWaveformData] = useState<number[]>([]);
//   const [error, setError] = useState<string | null>(null);
// 
//   // Animations
//   const progressAnim = useRef(new Animated.Value(0)).current;
//   const scaleAnim = useRef(new Animated.Value(1)).current;
//   const progressValue = useRef(0);
// 
//   // Vitesses disponibles
//   const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
// 
//   // Mettre à jour progressValue
//   useEffect(() => {
//     const listener = progressAnim.addListener(({ value }) => {
//       progressValue.current = value;
//     });
//     return () => progressAnim.removeListener(listener);
//   }, []);
// 
//   // Générer waveform
//   useEffect(() => {
//     const bars = [];
//     for (let i = 0; i < 40; i++) {
//       const height = Math.random() * 0.8 + 0.2;
//       bars.push(height);
//     }
//     setWaveformData(bars);
//   }, []);
// 
//   // Nettoyage
//   useEffect(() => {
//     return () => {
//       if (sound) {
//         sound.unloadAsync();
//       }
//     };
//   }, [sound]);
// 
//   const formatTime = (millis: number) => {
//     const totalSeconds = Math.floor(millis / 1000);
//     const minutes = Math.floor(totalSeconds / 60);
//     const seconds = totalSeconds % 60;
//     return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
//   };
// 
//   const getFullUrl = (url: string): string => {
//     if (url.startsWith('http')) return url;
//     return `https://asmay-3666dae6847a.herokuapp.com${url}`;
//   };
// 
//   const onPlaybackStatusUpdate = (status: any) => {
//     if (status.isLoaded) {
//       setPosition(status.positionMillis);
//       
//       Animated.timing(progressAnim, {
//         toValue: status.positionMillis / (duration * 1000),
//         duration: 100,
//         useNativeDriver: false,
//       }).start();
// 
//       if (status.didJustFinish) {
//         setIsPlaying(false);
//         setPosition(0);
//         progressAnim.setValue(0);
//         progressValue.current = 0;
//         onPlayStop?.(messageId);
//       }
//     }
//   };
// 
//   const loadSound = useCallback(async () => {
//     try {
//       setIsLoading(true);
//       setError(null);
//       
//       if (sound) {
//         await sound.unloadAsync();
//       }
// 
//       const fullUrl = getFullUrl(audioUrl);
//       console.log(`🎵 Chargement audio: ${messageId}`);
// 
//       // Configuration spécifique à la plateforme
//       const config: any = {
//         shouldPlay: true,
//         progressUpdateIntervalMillis: 100,
//       };
// 
//       // Pour Android, utiliser MediaPlayer
//       if (Platform.OS === 'android') {
//         config.androidImplementation = 'MediaPlayer';
//       }
// 
//       const { sound: newSound } = await Audio.Sound.createAsync(
//         { uri: fullUrl },
//         config,
//         onPlaybackStatusUpdate
//       );
// 
//       setSound(newSound);
//       await newSound.setRateAsync(playbackSpeed, false);
//       setIsPlaying(true);
//       onPlayStart?.(messageId);
// 
//     } catch (error) {
//       console.error("❌ Erreur chargement audio:", error);
//       setError("Format non supporté");
//       
//       // Tentative avec un autre format
//       if (Platform.OS === 'android') {
//         Alert.alert(
//           "Erreur de lecture",
//           "Le format audio n'est pas compatible avec votre appareil.",
//           [
//             {
//               text: "Réessayer",
//               onPress: () => {
//                 setError(null);
//                 loadSound();
//               }
//             },
//             { text: "Annuler", style: "cancel" }
//           ]
//         );
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   }, [audioUrl, duration, messageId, playbackSpeed, onPlayStart, onPlayStop]);
// 
//   const playSound = async () => {
//     try {
//       if (!sound) {
//         await loadSound();
//         return;
//       }
// 
//       await sound.playAsync();
//       setIsPlaying(true);
//       setIsPaused(false);
//       onPlayStart?.(messageId);
//       
//       Animated.sequence([
//         Animated.timing(scaleAnim, {
//           toValue: 1.2,
//           duration: 100,
//           useNativeDriver: true,
//         }),
//         Animated.timing(scaleAnim, {
//           toValue: 1,
//           duration: 100,
//           useNativeDriver: true,
//         }),
//       ]).start();
// 
//     } catch (error) {
//       console.error("❌ Erreur lecture:", error);
//       setError("Erreur de lecture");
//     }
//   };
// 
//   const pauseSound = async () => {
//     try {
//       if (sound) {
//         await sound.pauseAsync();
//         setIsPlaying(false);
//         setIsPaused(true);
//         onPlayStop?.(messageId);
//       }
//     } catch (error) {
//       console.error("❌ Erreur pause:", error);
//     }
//   };
// 
//   const resumeSound = async () => {
//     try {
//       if (sound) {
//         await sound.playAsync();
//         setIsPlaying(true);
//         setIsPaused(false);
//         onPlayStart?.(messageId);
//       }
//     } catch (error) {
//       console.error("❌ Erreur reprise:", error);
//     }
//   };
// 
//   const stopSound = async () => {
//     try {
//       if (sound) {
//         await sound.stopAsync();
//         await sound.setPositionAsync(0);
//         setIsPlaying(false);
//         setIsPaused(false);
//         setPosition(0);
//         progressAnim.setValue(0);
//         progressValue.current = 0;
//         onPlayStop?.(messageId);
//       }
//     } catch (error) {
//       console.error("❌ Erreur arrêt:", error);
//     }
//   };
// 
//   const seekTo = async (event: any) => {
//     try {
//       const { locationX } = event.nativeEvent;
//       const width = 200;
//       const ratio = Math.max(0, Math.min(1, locationX / width));
//       const newPosition = ratio * duration * 1000;
//       
//       if (sound) {
//         await sound.setPositionAsync(newPosition);
//         setPosition(newPosition);
//         progressAnim.setValue(ratio);
//         progressValue.current = ratio;
//       }
//     } catch (error) {
//       console.error("❌ Erreur seek:", error);
//     }
//   };
// 
//   const changeSpeed = async (speed: number) => {
//     try {
//       setPlaybackSpeed(speed);
//       if (sound) {
//         await sound.setRateAsync(speed, false);
//       }
//       setShowSpeedMenu(false);
//     } catch (error) {
//       console.error("❌ Erreur changement vitesse:", error);
//     }
//   };
// 
//   const renderWaveform = () => {
//     return (
//       <View style={styles.waveformContainer}>
//         {waveformData.map((height, index) => {
//           const isActive = (index / waveformData.length) <= progressValue.current;
//           return (
//             <View
//               key={index}
//               style={[
//                 styles.waveformBar,
//                 {
//                   height: height * 28,
//                   backgroundColor: isActive 
//                     ? (isMyMessage ? '#fff' : '#007bff')
//                     : (isMyMessage ? 'rgba(255,255,255,0.3)' : 'rgba(0,123,255,0.2)'),
//                 },
//               ]}
//             />
//           );
//         })}
//       </View>
//     );
//   };
// 
//   if (error) {
//     return (
//       <View style={[
//         styles.container,
//         isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer
//       ]}>
//         <Ionicons name="alert-circle" size={20} color="#ff4444" />
//         <Text style={styles.errorText}>Audio non supporté</Text>
//       </View>
//     );
//   }
// 
//   return (
//     <View style={[
//       styles.container,
//       isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer
//     ]}>
//       <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
//         <TouchableOpacity
//           onPress={() => {
//             if (isPlaying) pauseSound();
//             else if (isPaused) resumeSound();
//             else playSound();
//           }}
//           disabled={isLoading}
//           style={[
//             styles.playButton,
//             isMyMessage ? styles.myPlayButton : styles.theirPlayButton
//           ]}
//         >
//           {isLoading ? (
//             <ActivityIndicator size="small" color={isMyMessage ? "#fff" : "#007bff"} />
//           ) : (
//             <Ionicons
//               name={isPlaying ? "pause" : "play"}
//               size={20}
//               color={isMyMessage ? "#fff" : "#007bff"}
//             />
//           )}
//         </TouchableOpacity>
//       </Animated.View>
// 
//       <View style={styles.contentContainer}>
//         <TouchableOpacity
//           style={styles.waveformTouchable}
//           activeOpacity={0.7}
//           onPress={seekTo}
//         >
//           {renderWaveform()}
//         </TouchableOpacity>
// 
//         <View style={styles.bottomControls}>
//           <Text style={[
//             styles.timeText,
//             isMyMessage && styles.myTimeText
//           ]}>
//             {formatTime(position)} / {formatTime(duration * 1000)}
//           </Text>
// 
//           <View style={styles.extraControls}>
//             {(isPlaying || isPaused) && (
//               <TouchableOpacity onPress={stopSound} style={styles.extraButton}>
//                 <Ionicons
//                   name="stop"
//                   size={16}
//                   color={isMyMessage ? "#fff" : "#666"}
//                 />
//               </TouchableOpacity>
//             )}
// 
//             <TouchableOpacity
//               onPress={() => setShowSpeedMenu(true)}
//               style={styles.extraButton}
//             >
//               <Text style={[
//                 styles.speedText,
//                 isMyMessage && styles.myTimeText
//               ]}>
//                 {playbackSpeed}x
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
// 
//       <Modal
//         visible={showSpeedMenu}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setShowSpeedMenu(false)}
//       >
//         <TouchableOpacity
//           style={styles.modalOverlay}
//           activeOpacity={1}
//           onPress={() => setShowSpeedMenu(false)}
//         >
//           <View style={styles.speedMenu}>
//             <Text style={styles.speedMenuTitle}>Vitesse de lecture</Text>
//             <FlatList
//               data={speeds}
//               keyExtractor={(item) => item.toString()}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   style={[
//                     styles.speedOption,
//                     playbackSpeed === item && styles.speedOptionActive
//                   ]}
//                   onPress={() => changeSpeed(item)}
//                 >
//                   <Text style={[
//                     styles.speedOptionText,
//                     playbackSpeed === item && styles.speedOptionTextActive
//                   ]}>
//                     {item}x
//                   </Text>
//                   {playbackSpeed === item && (
//                     <Ionicons name="checkmark" size={20} color="#007bff" />
//                   )}
//                 </TouchableOpacity>
//               )}
//             />
//           </View>
//         </TouchableOpacity>
//       </Modal>
//     </View>
//   );
// };
// 
// const styles = StyleSheet.create({
//   container: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 8,
//     borderRadius: 20,
//     minWidth: 250,
//     maxWidth: 300,
//   },
//   myMessageContainer: {
//     backgroundColor: 'rgb(121, 96, 58)',
//     right:12
// },
//   theirMessageContainer: {
//     backgroundColor: '#e0e0b2',
//   },
//   playButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 8,
//   },
//   myPlayButton: {
//     backgroundColor: 'rgba(255,255,255,0.2)',
//   },
//   theirPlayButton: {
//     backgroundColor: 'rgba(0,123,255,0.1)',
//   },
//   contentContainer: {
//     flex: 1,
//   },
//   waveformTouchable: {
//     height: 40,
//     justifyContent: 'center',
//     marginBottom: 4,
//   },
//   waveformContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     height: 25,
//     width:"50%"
//   },
//   waveformBar: {
//     width: 2,
//     borderRadius: 0,
//     marginHorizontal: 1,
//   },
//   bottomControls: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   timeText: {
//     fontSize: 10,
//     color: '#666',
//   },
//   myTimeText: {
//     color: 'rgba(255,255,255,0.7)',
//   },
//   extraControls: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   extraButton: {
//     padding: 4,
//     marginLeft: 8,
//   },
//   speedText: {
//     fontSize: 11,
//     fontWeight: '600',
//     color: '#666',
//   },
//   errorText: {
//     marginLeft: 8,
//     fontSize: 12,
//     color: '#ff4444',
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   speedMenu: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 16,
//     width: 200,
//     elevation: 5,
//   },
//   speedMenuTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 12,
//     textAlign: 'center',
//     color: '#333',
//   },
//   speedOption: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     borderRadius: 8,
//   },
//   speedOptionActive: {
//     backgroundColor: '#e3f2fd',
//   },
//   speedOptionText: {
//     fontSize: 16,
//     color: '#333',
//   },
//   speedOptionTextActive: {
//     color: '#007bff',
//     fontWeight: 'bold',
//   },
// });

// components/VoiceMessagePlayer.tsx
// import React, { useState, useEffect, useRef, useCallback } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Animated,
//   Modal,
//   FlatList,
//   Alert,
//   ActivityIndicator,
//   Platform,
// } from "react-native";
// import { Audio } from "expo-av";
// import { Ionicons } from "@expo/vector-icons";
// 
// interface VoiceMessagePlayerProps {
//   audioUrl: string;
//   duration: number;
//   isMyMessage: boolean;
//   messageId: string;
//   onPlayStart?: (messageId: string) => void;
//   onPlayStop?: (messageId: string) => void;
// }
// 
// type PlayerState = 'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'error';
// 
// export const VoiceMessagePlayer: React.FC<VoiceMessagePlayerProps> = ({
//   audioUrl,
//   duration,
//   isMyMessage,
//   messageId,
//   onPlayStart,
//   onPlayStop,
// }) => {
//   // Référence au son
//   const soundRef = useRef<Audio.Sound | null>(null);
//   
//   // États
//   const [playerState, setPlayerState] = useState<PlayerState>('idle');
//   const [position, setPosition] = useState(0);
//   const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
//   const [showSpeedMenu, setShowSpeedMenu] = useState(false);
//   const [waveformData, setWaveformData] = useState<number[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   const [isMounted, setIsMounted] = useState(true);
// 
//   // Animations
//   const progressAnim = useRef(new Animated.Value(0)).current;
//   const scaleAnim = useRef(new Animated.Value(1)).current;
//   const progressValue = useRef(0);
// 
//   // Vitesses disponibles
//   const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
// 
//   // ==================== GESTION DU MONTAGE ====================
//   useEffect(() => {
//     setIsMounted(true);
//     
//     // Générer waveform au montage
//     const bars = [];
//     for (let i = 0; i < 40; i++) {
//       const height = Math.random() * 0.8 + 0.2;
//       bars.push(height);
//     }
//     setWaveformData(bars);
// 
//     // Nettoyage au démontage
//     return () => {
//       setIsMounted(false);
//       unloadSound();
//     };
//   }, []);
// 
//   // ==================== RÉINITIALISATION QUAND LES PROPS CHANGENT ====================
//   useEffect(() => {
//     // Quand l'URL audio change (nouveau message), réinitialiser
//     return () => {
//       if (soundRef.current) {
//         unloadSound();
//       }
//       setPlayerState('idle');
//       setPosition(0);
//       progressAnim.setValue(0);
//       progressValue.current = 0;
//     };
//   }, [audioUrl, messageId]);
// 
//   // ==================== MISE À JOUR DE L'ANIMATION ====================
//   useEffect(() => {
//     const listener = progressAnim.addListener(({ value }) => {
//       if (isMounted) {
//         progressValue.current = value;
//       }
//     });
//     return () => progressAnim.removeListener(listener);
//   }, [isMounted]);
// 
//   // ==================== FONCTIONS UTILITAIRES ====================
//   const formatTime = (millis: number) => {
//     const totalSeconds = Math.floor(millis / 1000);
//     const minutes = Math.floor(totalSeconds / 60);
//     const seconds = totalSeconds % 60;
//     return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
//   };
// 
//   const getFullUrl = (url: string): string => {
//     if (url.startsWith('http')) return url;
//     return `https://asmay-3666dae6847a.herokuapp.com${url}`;
//   };
// 
//   const unloadSound = async () => {
//     try {
//       if (soundRef.current) {
//         await soundRef.current.unloadAsync();
//         soundRef.current = null;
//       }
//     } catch (error) {
//       console.error("❌ Erreur déchargement:", error);
//     }
//   };
// 
//   // ==================== GESTIONNAIRE DE STATUT ====================
//   const onPlaybackStatusUpdate = useCallback((status: any) => {
//     if (!isMounted) return;
// 
//     if (!status.isLoaded) {
//       if (status.error) {
//         console.error("❌ Erreur playback:", status.error);
//         setPlayerState('error');
//         setError(status.error);
//       }
//       return;
//     }
// 
//     setPosition(status.positionMillis);
//     
//     Animated.timing(progressAnim, {
//       toValue: status.positionMillis / (duration * 1000),
//       duration: 100,
//       useNativeDriver: false,
//     }).start();
// 
//     if (status.didJustFinish) {
//       setPlayerState('idle');
//       setPosition(0);
//       progressAnim.setValue(0);
//       progressValue.current = 0;
//       onPlayStop?.(messageId);
//     }
//   }, [duration, messageId, onPlayStop, isMounted]);
// 
//   // ==================== CHARGEMENT ====================
//   const loadSound = useCallback(async () => {
//     try {
//       setPlayerState('loading');
//       setError(null);
//       
//       // Décharger l'ancien son
//       await unloadSound();
// 
//       const fullUrl = getFullUrl(audioUrl);
//       console.log(`🎵 Chargement audio: ${messageId}`);
// 
//       // Configuration spécifique à la plateforme
//       const config: any = {
//         shouldPlay: false,
//         progressUpdateIntervalMillis: 100,
//       };
// 
//       if (Platform.OS === 'android') {
//         config.androidImplementation = 'MediaPlayer';
//       }
// 
//       const { sound: newSound } = await Audio.Sound.createAsync(
//         { uri: fullUrl },
//         config,
//         onPlaybackStatusUpdate
//       );
// 
//       if (!isMounted) {
//         await newSound.unloadAsync();
//         return false;
//       }
// 
//       soundRef.current = newSound;
//       await newSound.setRateAsync(playbackSpeed, false);
//       
//       setPlayerState('ready');
//       return true;
// 
//     } catch (error) {
//       console.error("❌ Erreur chargement audio:", error);
//       if (isMounted) {
//         setPlayerState('error');
//         setError("Format audio non supporté");
//       }
//       return false;
//     }
//   }, [audioUrl, messageId, playbackSpeed, onPlaybackStatusUpdate, isMounted]);
// 
//   // ==================== CHARGEMENT AUTOMATIQUE AU MONTAGE ====================
//   useEffect(() => {
//     // Précharger le son au montage du composant
//     const preload = async () => {
//       await loadSound();
//     };
//     preload();
// 
//     return () => {
//       unloadSound();
//     };
//   }, []); // Ne charger qu'une fois au montage
// 
//   // ==================== CONTRÔLES ====================
//   const playSound = useCallback(async () => {
//     try {
//       // Si pas de son ou erreur, recharger
//       if (!soundRef.current || playerState === 'error') {
//         const loaded = await loadSound();
//         if (!loaded) return;
//       }
// 
//       // Vérifier que le son existe avant de jouer
//       if (!soundRef.current || !isMounted) {
//         setPlayerState('error');
//         setError("Impossible de charger l'audio");
//         return;
//       }
// 
//       await soundRef.current.playAsync();
//       setPlayerState('playing');
//       onPlayStart?.(messageId);
//       
//       // Animation du bouton
//       Animated.sequence([
//         Animated.timing(scaleAnim, {
//           toValue: 1.2,
//           duration: 100,
//           useNativeDriver: true,
//         }),
//         Animated.timing(scaleAnim, {
//           toValue: 1,
//           duration: 100,
//           useNativeDriver: true,
//         }),
//       ]).start();
// 
//     } catch (error) {
//       console.error("❌ Erreur lecture:", error);
//       if (isMounted) {
//         setPlayerState('error');
//         setError("Erreur de lecture");
//       }
//     }
//   }, [loadSound, messageId, onPlayStart, playerState, isMounted]);
// 
//   const pauseSound = useCallback(async () => {
//     try {
//       if (!soundRef.current || !isMounted) {
//         return;
//       }
// 
//       await soundRef.current.pauseAsync();
//       setPlayerState('paused');
//       onPlayStop?.(messageId);
// 
//     } catch (error) {
//       console.error("❌ Erreur pause:", error);
//       if (isMounted) {
//         await unloadSound();
//         setPlayerState('idle');
//       }
//     }
//   }, [messageId, onPlayStop, isMounted]);
// 
//   const resumeSound = useCallback(async () => {
//     try {
//       if (!soundRef.current || !isMounted) {
//         await playSound();
//         return;
//       }
// 
//       await soundRef.current.playAsync();
//       setPlayerState('playing');
//       onPlayStart?.(messageId);
// 
//     } catch (error) {
//       console.error("❌ Erreur reprise:", error);
//       if (isMounted) {
//         setPlayerState('error');
//       }
//     }
//   }, [playSound, messageId, onPlayStart, isMounted]);
// 
//   const stopSound = useCallback(async () => {
//     try {
//       if (soundRef.current && isMounted) {
//         await soundRef.current.stopAsync();
//         await soundRef.current.setPositionAsync(0);
//         setPosition(0);
//         progressAnim.setValue(0);
//         progressValue.current = 0;
//       }
//       setPlayerState('idle');
//       onPlayStop?.(messageId);
//     } catch (error) {
//       console.error("❌ Erreur arrêt:", error);
//       if (isMounted) {
//         await unloadSound();
//         setPlayerState('idle');
//       }
//     }
//   }, [messageId, onPlayStop, isMounted]);
// 
//   const seekTo = useCallback(async (event: any) => {
//     try {
//       if (!soundRef.current || !isMounted) return;
// 
//       const { locationX } = event.nativeEvent;
//       const width = 200;
//       const ratio = Math.max(0, Math.min(1, locationX / width));
//       const newPosition = ratio * duration * 1000;
//       
//       await soundRef.current.setPositionAsync(newPosition);
//       setPosition(newPosition);
//       progressAnim.setValue(ratio);
//       progressValue.current = ratio;
// 
//     } catch (error) {
//       console.error("❌ Erreur seek:", error);
//     }
//   }, [duration, isMounted]);
// 
//   const changeSpeed = useCallback(async (speed: number) => {
//     try {
//       setPlaybackSpeed(speed);
//       if (soundRef.current && isMounted) {
//         await soundRef.current.setRateAsync(speed, false);
//       }
//       setShowSpeedMenu(false);
//     } catch (error) {
//       console.error("❌ Erreur changement vitesse:", error);
//     }
//   }, [isMounted]);
// 
//   // ==================== RENDU WAVEFORM ====================
//   const renderWaveform = () => {
//     return (
//       <View style={styles.waveformContainer}>
//         {waveformData.map((height, index) => {
//           const isActive = (index / waveformData.length) <= progressValue.current;
//           return (
//             <View
//               key={index}
//               style={[
//                 styles.waveformBar,
//                 {
//                   height: height * 28,
//                   backgroundColor: isActive 
//                     ? (isMyMessage ? '#fff' : '#007bff')
//                     : (isMyMessage ? 'rgba(255,255,255,0.3)' : 'rgba(0,123,255,0.2)'),
//                 },
//               ]}
//             />
//           );
//         })}
//       </View>
//     );
//   };
// 
//   // ==================== RENDU PRINCIPAL ====================
//   const isLoading = playerState === 'loading';
//   const isPlaying = playerState === 'playing';
//   const isPaused = playerState === 'paused';
//   const isReady = playerState === 'ready';
//   const hasError = playerState === 'error';
// 
//   // Si en cours de chargement initial, afficher un placeholder
//   if (isLoading && !soundRef.current) {
//     return (
//       <View style={[
//         styles.container,
//         isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer
//       ]}>
//         <View style={[styles.playButton, isMyMessage ? styles.myPlayButton : styles.theirPlayButton]}>
//           <ActivityIndicator size="small" color={isMyMessage ? "#fff" : "#007bff"} />
//         </View>
//         <View style={styles.contentContainer}>
//           <View style={styles.waveformPlaceholder}>
//             <ActivityIndicator size="small" color={isMyMessage ? "#fff" : "#007bff"} />
//           </View>
//         </View>
//       </View>
//     );
//   }
// 
//   if (hasError) {
//     return (
//       <View style={[
//         styles.container,
//         isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer
//       ]}>
//         <Ionicons name="alert-circle" size={20} color="#ff4444" />
//         <Text style={styles.errorText} numberOfLines={1}>
//           {error || "Audio non supporté"}
//         </Text>
//         <TouchableOpacity onPress={() => {
//           setPlayerState('idle');
//           loadSound();
//         }} style={styles.retryButton}>
//           <Ionicons name="refresh" size={16} color={isMyMessage ? "#fff" : "#007bff"} />
//         </TouchableOpacity>
//       </View>
//     );
//   }
// 
//   return (
//     <View style={[
//       styles.container,
//       isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer
//     ]}>
//       {/* Bouton de contrôle */}
//       <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
//         <TouchableOpacity
//           onPress={() => {
//             if (isPlaying) pauseSound();
//             else if (isPaused) resumeSound();
//             else playSound();
//           }}
//           disabled={isLoading}
//           style={[
//             styles.playButton,
//             isMyMessage ? styles.myPlayButton : styles.theirPlayButton
//           ]}
//         >
//           {isLoading ? (
//             <ActivityIndicator size="small" color={isMyMessage ? "#fff" : "#007bff"} />
//           ) : (
//             <Ionicons
//               name={isPlaying ? "pause" : "play"}
//               size={20}
//               color={isMyMessage ? "#fff" : "#007bff"}
//             />
//           )}
//         </TouchableOpacity>
//       </Animated.View>
// 
//       {/* Zone de progression */}
//       <View style={styles.contentContainer}>
//         <TouchableOpacity
//           style={styles.waveformTouchable}
//           activeOpacity={0.7}
//           onPress={seekTo}
//           disabled={!soundRef.current}
//         >
//           {renderWaveform()}
//         </TouchableOpacity>
// 
//         {/* Contrôles inférieurs */}
//         <View style={styles.bottomControls}>
//           <Text style={[
//             styles.timeText,
//             isMyMessage && styles.myTimeText
//           ]}>
//             {formatTime(position)} / {formatTime(duration * 1000)}
//           </Text>
// 
//           <View style={styles.extraControls}>
//             {(isPlaying || isPaused) && (
//               <TouchableOpacity onPress={stopSound} style={styles.extraButton}>
//                 <Ionicons
//                   name="stop"
//                   size={16}
//                   color={isMyMessage ? "#fff" : "#666"}
//                 />
//               </TouchableOpacity>
//             )}
// 
//             <TouchableOpacity
//               onPress={() => setShowSpeedMenu(true)}
//               style={styles.extraButton}
//             >
//               <Text style={[
//                 styles.speedText,
//                 isMyMessage && styles.myTimeText
//               ]}>
//                 {playbackSpeed}x
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
// 
//       {/* Menu de vitesse */}
//       <Modal
//         visible={showSpeedMenu}
//         transparent
//         animationType="fade"
//         onRequestClose={() => setShowSpeedMenu(false)}
//       >
//         <TouchableOpacity
//           style={styles.modalOverlay}
//           activeOpacity={1}
//           onPress={() => setShowSpeedMenu(false)}
//         >
//           <View style={styles.speedMenu}>
//             <Text style={styles.speedMenuTitle}>Vitesse de lecture</Text>
//             <FlatList
//               data={speeds}
//               keyExtractor={(item) => item.toString()}
//               renderItem={({ item }) => (
//                 <TouchableOpacity
//                   style={[
//                     styles.speedOption,
//                     playbackSpeed === item && styles.speedOptionActive
//                   ]}
//                   onPress={() => changeSpeed(item)}
//                 >
//                   <Text style={[
//                     styles.speedOptionText,
//                     playbackSpeed === item && styles.speedOptionTextActive
//                   ]}>
//                     {item}x
//                   </Text>
//                   {playbackSpeed === item && (
//                     <Ionicons name="checkmark" size={20} color="#007bff" />
//                   )}
//                 </TouchableOpacity>
//               )}
//             />
//           </View>
//         </TouchableOpacity>
//       </Modal>
//     </View>
//   );
// };
// 
// const styles = StyleSheet.create({
//   container: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     padding: 8,
//     borderRadius: 20,
//     minWidth: 220,
//     maxWidth: 250,
//   },
//   myMessageContainer: {
//     backgroundColor: '#3a5879ff',
// 
//   },
//   theirMessageContainer: {
//     backgroundColor: '#d1cec7',
// 
//   },
//   playButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 8,
//   },
//   myPlayButton: {
//     backgroundColor: 'rgba(255,255,255,0.2)',
//   },
//   theirPlayButton: {
//     backgroundColor: 'rgba(242, 244, 246, 0.1)',
//   },
//   contentContainer: {
//     flex: 1,
//     
//   },
//   waveformTouchable: {
//     height: 25,
//     
//     justifyContent: 'center',
//     marginBottom: 4,
//   },
//   waveformContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     height: 20,
//     
//   },
//   waveformBar: {
//     width: 2,
//     borderRadius: 2,
//     marginHorizontal: 1,
//     
//   },
//   waveformPlaceholder: {
//     height: 30,
//     justifyContent: 'center',
//     alignItems: 'center',
//     
//   },
//   bottomControls: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//   },
//   timeText: {
//     fontSize: 10,
//     color: '#666',
//   },
//   myTimeText: {
//     color: 'rgba(255,255,255,0.7)',
//   },
//   extraControls: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   extraButton: {
//     padding: 4,
//     marginLeft: 8,
//   },
//   speedText: {
//     fontSize: 11,
//     fontWeight: '600',
//     color: '#666',
//   },
//   errorText: {
//     flex: 1,
//     marginLeft: 8,
//     fontSize: 12,
//     color: '#ff4444',
//   },
//   retryButton: {
//     padding: 4,
//     marginLeft: 4,
//   },
//   modalOverlay: {
//     flex: 1,
//     backgroundColor: 'rgba(0,0,0,0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   speedMenu: {
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 16,
//     width: 200,
//     elevation: 5,
//   },
//   speedMenuTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 12,
//     textAlign: 'center',
//     color: '#333',
//   },
//   speedOption: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     paddingVertical: 10,
//     paddingHorizontal: 12,
//     borderRadius: 8,
//   },
//   speedOptionActive: {
//     backgroundColor: '#e3f2fd',
//   },
//   speedOptionText: {
//     fontSize: 16,
//     color: '#333',
//   },
//   speedOptionTextActive: {
//     color: '#007bff',
//     fontWeight: 'bold',
//   },
// });

// components/VoiceMessagePlayer.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  FlatList,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";

interface VoiceMessagePlayerProps {
  audioUrl: string;
  duration: number;
  isMyMessage: boolean;
  messageId: string;
  onPlayStart?: (messageId: string) => void;
  onPlayStop?: (messageId: string) => void;
}

type PlayerState = 'idle' | 'loading' | 'ready' | 'playing' | 'paused' | 'error';

export const VoiceMessagePlayer: React.FC<VoiceMessagePlayerProps> = ({
  audioUrl,
  duration,
  isMyMessage,
  messageId,
  onPlayStart,
  onPlayStop,
}) => {
  // Référence au son
  const soundRef = useRef<Audio.Sound | null>(null);
  
  // États
  const [playerState, setPlayerState] = useState<PlayerState>('idle');
  const [position, setPosition] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Animations
  const progressAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressValue = useRef(0);

  // Vitesses disponibles
  const speeds = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

  // Mettre à jour progressValue
  useEffect(() => {
    const listener = progressAnim.addListener(({ value }) => {
      progressValue.current = value;
    });
    return () => progressAnim.removeListener(listener);
  }, []);

  // Générer waveform
  useEffect(() => {
    const bars = [];
    for (let i = 0; i < 40; i++) {
      const height = Math.random() * 0.8 + 0.2;
      bars.push(height);
    }
    setWaveformData(bars);
  }, []);

  // Nettoyage à la destruction
  useEffect(() => {
    return () => {
      unloadSound();
    };
  }, []);

  // ==================== FONCTIONS UTILITAIRES ====================
  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const getFullUrl = (url: string): string => {
    if (url.startsWith('http')) return url;
    return `https://asmay-3666dae6847a.herokuapp.com${url}`;
  };

  const unloadSound = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    } catch (error) {
      console.error("❌ Erreur déchargement:", error);
    }
  };

  // ==================== GESTIONNAIRE DE STATUT ====================
  const onPlaybackStatusUpdate = useCallback((status: any) => {
    if (!status.isLoaded) {
      if (status.error) {
        console.error("❌ Erreur playback:", status.error);
        setPlayerState('error');
        setError(status.error);
      }
      return;
    }

    setPosition(status.positionMillis);
    
    Animated.timing(progressAnim, {
      toValue: status.positionMillis / (duration * 1000),
      duration: 100,
      useNativeDriver: false,
    }).start();

    if (status.didJustFinish) {
      setPlayerState('idle');
      setPosition(0);
      progressAnim.setValue(0);
      progressValue.current = 0;
      onPlayStop?.(messageId);
    }
  }, [duration, messageId, onPlayStop]);

  // ==================== CHARGEMENT ====================
  const loadSound = useCallback(async () => {
    try {
      setPlayerState('loading');
      setError(null);
      
      // Décharger l'ancien son
      await unloadSound();
// 
      const fullUrl = getFullUrl(audioUrl);
      console.log(`🎵 Chargement audio: ${messageId}`);

      // Configuration spécifique à la plateforme
      const config: any = {
        shouldPlay: false,
        progressUpdateIntervalMillis: 100,
      };

      if (Platform.OS === 'android') {
        config.androidImplementation = 'MediaPlayer';
      }
     console.log("✅ Audio URL :" , audioUrl);
     
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: fullUrl },
        config,
        onPlaybackStatusUpdate
      );

      soundRef.current = newSound;
      await newSound.setRateAsync(playbackSpeed, false);
      
      setPlayerState('ready');
      return true;

    } catch (error) {
      console.error("❌ Erreur chargement audio:", error);
      setPlayerState('error');
      setError("Format audio non supporté");
      return false;
    }
  }, [audioUrl, messageId, playbackSpeed, onPlaybackStatusUpdate]);

  // ==================== CONTRÔLES ====================
  const playSound = useCallback(async () => {
    try {
      // Si pas de son ou erreur, recharger
      if (!soundRef.current || playerState === 'error') {
        const loaded = await loadSound();
        if (!loaded) return;
      }

      // Vérifier que le son existe avant de jouer
      if (!soundRef.current) {
        setPlayerState('error');
        setError("Impossible de charger l'audio");
        return;
      }

      await soundRef.current.playAsync();
      setPlayerState('playing');
      onPlayStart?.(messageId);
      
      // Animation du bouton
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

    } catch (error) {
      console.error("❌ Erreur lecture:", error);
      setPlayerState('error');
      setError("Erreur de lecture");
    }
  }, [loadSound, messageId, onPlayStart, playerState]);

  const pauseSound = useCallback(async () => {
    try {
      if (!soundRef.current) {
        console.log("⚠️ Tentative de pause sans son");
        return;
      }

      await soundRef.current.pauseAsync();
      setPlayerState('paused');
      onPlayStop?.(messageId);

    } catch (error) {
      console.error("❌ Erreur pause:", error);
      // Réinitialiser en cas d'erreur
      await unloadSound();
      setPlayerState('idle');
    }
  }, [messageId, onPlayStop]);

  const resumeSound = useCallback(async () => {
    try {
      if (!soundRef.current) {
        await playSound();
        return;
      }

      await soundRef.current.playAsync();
      setPlayerState('playing');
      onPlayStart?.(messageId);

    } catch (error) {
      console.error("❌ Erreur reprise:", error);
      setPlayerState('error');
    }
  }, [playSound, messageId, onPlayStart]);

  const stopSound = useCallback(async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.setPositionAsync(0);
        setPosition(0);
        progressAnim.setValue(0);
        progressValue.current = 0;
      }
      setPlayerState('idle');
      onPlayStop?.(messageId);
    } catch (error) {
      console.error("❌ Erreur arrêt:", error);
      await unloadSound();
      setPlayerState('idle');
    }
  }, [messageId, onPlayStop]);

  const seekTo = useCallback(async (event: any) => {
    try {
      if (!soundRef.current) return;

      const { locationX } = event.nativeEvent;
      const width = 200;
      const ratio = Math.max(0, Math.min(1, locationX / width));
      const newPosition = ratio * duration * 1000;
      
      await soundRef.current.setPositionAsync(newPosition);
      setPosition(newPosition);
      progressAnim.setValue(ratio);
      progressValue.current = ratio;

    } catch (error) {
      console.error("❌ Erreur seek:", error);
    }
  }, [duration]);

  const changeSpeed = useCallback(async (speed: number) => {
    try {
      setPlaybackSpeed(speed);
      if (soundRef.current) {
        await soundRef.current.setRateAsync(speed, false);
      }
      setShowSpeedMenu(false);
    } catch (error) {
      console.error("❌ Erreur changement vitesse:", error);
    }
  }, []);

  // ==================== RENDU WAVEFORM ====================
  const renderWaveform = () => {
    return (
      <View style={styles.waveformContainer}>
        {waveformData.map((height, index) => {
          const isActive = (index / waveformData.length) <= progressValue.current;
          return (
            <View
              key={index}
              style={[
                styles.waveformBar,
                {
                  height: height * 28,
                  backgroundColor: isActive 
                    ? (isMyMessage ? '#fff' : '#007bff')
                    : (isMyMessage ? 'rgba(255,255,255,0.3)' : 'rgba(0,123,255,0.2)'),
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  // ==================== RENDU PRINCIPAL ====================
  const isLoading = playerState === 'loading';
  const isPlaying = playerState === 'playing';
  const isPaused = playerState === 'paused';
  const isReady = playerState === 'ready';
  const hasError = playerState === 'error';

  if (hasError) {
    return (
      <View style={[
        styles.container,
        isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer
      ]}>
        <Ionicons name="alert-circle" size={20} color="#ff4444" />
        <Text style={styles.errorText} numberOfLines={1}>
          {error || "Audio non supporté"}
        </Text>
        <TouchableOpacity onPress={() => setPlayerState('idle')} style={styles.retryButton}>
          <Ionicons name="refresh" size={16} color={isMyMessage ? "#fff" : "#007bff"} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer
    ]}>
      {/* Bouton de contrôle */}
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={() => {
            if (isPlaying) pauseSound();
            else if (isPaused) resumeSound();
            else playSound();
          }}
          disabled={isLoading}
          style={[
            styles.playButton,
            isMyMessage ? styles.myPlayButton : styles.theirPlayButton
          ]}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={isMyMessage ? "#fff" : "#007bff"} />
          ) : (
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={20}
              color={isMyMessage ? "#fff" : "#007bff"}
            />
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Zone de progression */}
      <View style={styles.contentContainer}>
        <TouchableOpacity
          style={styles.waveformTouchable}
          activeOpacity={0.7}
          onPress={seekTo}
          disabled={!soundRef.current}
        >
          {renderWaveform()}
        </TouchableOpacity>

        {/* Contrôles inférieurs */}
        <View style={styles.bottomControls}>
          <Text style={[
            styles.timeText,
            isMyMessage && styles.myTimeText
          ]}>
            {formatTime(position)} / {formatTime(duration * 1000)}
          </Text>

          <View style={styles.extraControls}>
            {(isPlaying || isPaused) && (
              <TouchableOpacity onPress={stopSound} style={styles.extraButton}>
                <Ionicons
                  name="stop"
                  size={16}
                  color={isMyMessage ? "#fff" : "#666"}
                />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => setShowSpeedMenu(true)}
              style={styles.extraButton}
            >
              <Text style={[
                styles.speedText,
                isMyMessage && styles.myTimeText
              ]}>
                {playbackSpeed}x
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View> 

      {/* Menu de vitesse */}
      <Modal
        visible={showSpeedMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSpeedMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSpeedMenu(false)}
        >
          <View style={styles.speedMenu}>
            <Text style={styles.speedMenuTitle}>Vitesse de lecture</Text>
            <FlatList
              data={speeds}
              keyExtractor={(item) => item.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.speedOption,
                    playbackSpeed === item && styles.speedOptionActive
                  ]}
                  onPress={() => changeSpeed(item)}
                >
                  <Text style={[
                    styles.speedOptionText,
                    playbackSpeed === item && styles.speedOptionTextActive
                  ]}>
                    {item}x
                  </Text>
                  {playbackSpeed === item && (
                    <Ionicons name="checkmark" size={20} color="#007bff" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 20,
    minWidth: 200,
    maxWidth: 300,
    paddingHorizontal:2
  },
  myMessageContainer: {
    backgroundColor: '#3a5879ff',
  },
  theirMessageContainer: {
    backgroundColor: '#f0f0f0',
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  myPlayButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  theirPlayButton: {
    backgroundColor: 'rgba(0,123,255,0.1)',
  },
  contentContainer: {
    flex: 1,
  },
  waveformTouchable: {
    height: 20,
    justifyContent: 'center',
    marginBottom: 4,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 10,
  },
  waveformBar: {
    width: 2,
    borderRadius: 2,
    marginHorizontal: 1,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 10,
    color: '#666',
  },
  myTimeText: {
    color: 'rgba(255,255,255,0.7)',
  },
  extraControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  extraButton: {
    padding: 4,
    marginLeft: 8,
  },
  speedText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  errorText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    color: '#ff4444',
  },
  retryButton: {
    padding: 4,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  speedMenu: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: 200,
    elevation: 5,
  },
  speedMenuTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#333',
  },
  speedOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  speedOptionActive: {
    backgroundColor: '#e3f2fd',
  },
  speedOptionText: {
    fontSize: 16,
    color: '#333',
  },
  speedOptionTextActive: {
    color: '#007bff',
    fontWeight: 'bold',
  },
});