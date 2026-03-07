// 
// import { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   Dimensions,
//   ActivityIndicator,
//   Image,
//   Alert,
// } from "react-native";
// import { useAuth } from "../hooks/useAuth";
// import { useSocket } from "../hooks/useSocket";
// import { ARUser } from "../types/index";
// 
// const { width, height } = Dimensions.get("window");
// 
// interface ARRadarViewProps {
//   users: ARUser[];
//   isSendingSignal: string | null;
//   onUserPress: (userId: string) => void;
//   currentLocation: { lat: number; lon: number };
// }
// 
// const ARRadarView: React.FC<ARRadarViewProps> = ({
//   users,
//   onUserPress,
//   currentLocation,
//   isSendingSignal,
// }) => {
// // States 
//  const [isVisibleUserOnRadar,setIsVisibleUserOnRadar] = useState(true)
// 
//   const showUserOptions = (user: ARUser) => {
//     onUserPress(user._id)
//     // Alert.alert(
//     //   "Signal",
//     //   `Voulez-vous envoyez un signal à ${user.username} distant de  ${user.distance}m - ${user.interest_count} intérêts communs`,
//     //   [
//     //     { text: 'Annuler', style: 'cancel' },
//     //     { text: 'Envoyer', onPress: () => onUserPress(user._id) },
//     //   ]
//     // );
//   };
// 
//   const calculateScreenPosition = (distance: number, bearing: number) => {
//     const maxDisplayDistance = 10000000;
//     const normalizedDistance = Math.min(distance, maxDisplayDistance);
//     const radarRadius = Math.min(width, height) / 2 - 50;
//     const scale = radarRadius / maxDisplayDistance;
// 
//     const angle = (bearing * Math.PI) / 180;
//     const x = normalizedDistance * scale * Math.sin(angle) + width / 2;
//     const y = height / 2 - normalizedDistance * scale * Math.cos(angle);
// 
//     return {
//       x: Math.max(35, Math.min(width - 35, x)),
//       y: Math.max(35, Math.min(height - 35, y)),
//     };
//   };
// 
//   const getDistanceStyle = (distance: number) => {
//     if (distance <= 100000) return styles.markerVeryClose;
//     if (distance <= 500000) return styles.markerClose;
//     if (distance <= 10000000) return styles.markerMedium;
//     return styles.markerFar;
//   };
// 
//   return (
//     <View style={styles.container}>
//       {/* Position actuelle */}
//       <View style={styles.currentPosition}>
//         <Text style={styles.currentPositionText}>Moi</Text>
//       </View>
// 
//       {/* Cercle radar */}
//       {/* <View style={styles.radarCircle} />
//       <View style={styles.radarCircleInner} /> */}
// 
//       {/* Marqueurs */}
//       {users.map((user) => {
//         const position = calculateScreenPosition(user.distance, user.bearing);
//         const isSending = isSendingSignal === user._id;
//         const isVisibleUser = user.privacySettings.showOnRadar
//         setIsVisibleUserOnRadar(isVisibleUser)
// 
//         // if(!isVisibleUserOnRadar ){
//         //   Alert.alert(" 📡Invisible Asmayien",`${user.username.toUpperCase()} est en ligne, mais son Asmay est fermé. Attendez qu'il soit activé sinon vous ne pouvez pas lui voir pour envoyer un signal sur Asmay`)
//         //   return ;
//         // }
// 
//         return (
//           <TouchableOpacity
//             key={user._id}
//             style={[
//               styles.marker,
//               { left: position.x - 25, top: position.y - 25 },
//               isSending && styles.markerSending,
//             ]}
//             onPress={() => showUserOptions(user)}
//             activeOpacity={0.7}
//             disabled={isSending}
//           >
//             <View style={styles.markerContent}>
//               {isSending ? (null
//               ) : (
//                 <>
//                   <View style={[styles.markerCircle, getDistanceStyle(user.distance)]}>
//                     {user.profilePicture ? (
//                       <Image source={{ uri: user.profilePicture }} style={styles.image} />
//                     ) : (
//                       <View style={styles.charAt}>
//                         <Text style={styles.chaAtText}>
//                           {user.username?.charAt(0).toUpperCase() || "U"}
//                         </Text>
//                       </View>
//                     )}
//                     
//                   
//                   </View>
//                  {user.distance < 1000  ?
//                     <Text style={styles.markerDistance}>
//                     {user.distance}m
//                     </Text>           
//                            :
//                         <Text style={styles.markerDistance}>
//                     {(user.distance/1000).toFixed(0)}km
//                     </Text>  
//                  } 
//                  
//                   <Text style={styles.markerName} numberOfLines={1}>
//                     {user.username}
//                   </Text>
//                 </>
//               )}
//             </View>
//           </TouchableOpacity>
//         );
//       })
//       }
//           
//       {/* Légende */}
//       <View style={styles.legend}>
//         <Text style={styles.legendText}>
//           {users.length} utilisateur{users.length > 1 ? "s" : ""} proche{users.length > 1 ? "s" : ""}
//         </Text>
//         
//         {isSendingSignal && (
//           <View style={styles.globalSendingIndicator}>
//             <ActivityIndicator size="small" color="#fff" />
//             <Text style={styles.globalSendingText}>Envoi de signal...</Text>
//           </View>
//         )}
// 
//      
//       </View>
//     </View>
//   );
// };
// 
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "transparent",
//     marginTop:10,
//   },
//   radarCircle: {
//     position: "absolute",
//     left: width / 2 - 90,
//     top: height / 2 - 190,
//     width: 150,
//     height: 150,
//     borderRadius: 100,
//     borderWidth: 2,
//     borderColor: "rgba(255, 255, 255, 0.3)",
//     backgroundColor: "transparent",
//   },
//   radarCircleInner: {
//     position: "absolute",
//     left: width / 2 - 66,
//     top: height / 2 - 164,
//     width: 100,
//     height: 100,
//     borderRadius: 50,
//     borderWidth: 1,
//     borderColor: "rgba(255, 255, 255, 0.2)",
//     backgroundColor: "transparent",
//   },
//   currentPosition: {
//     position: "absolute",
//     left: width / 2 - 36,
//     top: height / 2 - 40,
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor:"black",
//     justifyContent: "center",
//     alignItems: "center",
//     elevation:4,
//     zIndex: 1000,
//   },
//   currentPositionText: {
//     color: "#f1f7f7ff",
//     fontSize: 15,
//     fontWeight: "bold",
//   },
//   marker: {
//     position: "absolute",
//     width: 50,
//     height: 70,
//     zIndex: 100,
//     alignItems: "center",
//   },
//   markerSending: {
//     opacity: 0.7,
//     transform: [{ scale: 0.9 }],
//   },
//   markerContent: {
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   markerCircle: {
//     width: 60,
//     height: 60,
//     borderRadius: 40,
//     justifyContent: "center",
//     alignItems: "center",
//     borderWidth: 3,
//     borderColor: "#fff",
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.8,
//     shadowRadius: 3,
//     elevation: 5,
//   },
//   image: {
//     height: 58,
//     width: 58,
//     borderRadius: 30,
//   },
//   charAt: {
//     height: 58,
//     width: 58,
//     borderRadius: 30,
//     backgroundColor: "blue",
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   chaAtText: {
//     fontSize: 23,
//     color: "white",
//     fontWeight: "bold",
//   },
//   markerDistance: {
//     color: "#fff",
//     fontSize: 10,
//     marginTop: 2,
//     fontWeight: "bold",
//     textShadowColor: "rgba(0, 0, 0, 0.75)",
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 3,
//   },
//   markerName: {
//     color: "#fff",
//     fontSize: 10,
//     marginTop: 2,
//     fontWeight: "600",
//     textShadowColor: "rgba(0, 0, 0, 0.75)",
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 3,
//     maxWidth: 50,
//     textAlign: "center",
//   },
//   legend: {
//     position: "absolute",
//     bottom: 50,
//     left: 0,
//     right: 0,
//     alignItems: "center",
//   },
//   legendText: {
//     color: "#fff",
//     fontSize: 13,
//     fontWeight: "bold",
//     textShadowColor: "rgba(0, 0, 0, 0.75)",
//     textShadowOffset: { width: 1, height: 1 },
//     textShadowRadius: 3,
//     backgroundColor: "rgba(0, 0, 0, 0.5)",
//     paddingHorizontal: 15,
//     paddingVertical: 8,
//     borderRadius: 20,
//     marginBottom: 10,
//   },
//   globalSendingIndicator: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "rgba(255, 193, 7, 0.9)",
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 15,
//     marginTop: 5,
//   },
//   globalSendingText: {
//     color: "#000",
//     fontSize: 12,
//     fontWeight: "bold",
//     marginLeft: 8,
//   },
//   
//   markerVeryClose: {
//     backgroundColor: "rgba(255, 59, 48, 0.9)",
//     transform: [{ scale: 1.1 }],
//   },
//   markerClose: {
//     backgroundColor: "rgba(255, 149, 0, 0.9)",
//     transform: [{ scale: 1 }],
// 
//   },
//   markerMedium: {
//     backgroundColor: "rgba(52, 199, 89, 0.9)",
//     transform: [{ scale: 0.5 }],
// 
//   },
//   markerFar: {
//     backgroundColor: "rgba(0, 122, 255, 0.9)",
//     transform: [{ scale: 0.9 }],
//   },
// });
// 
// export default ARRadarView;

// import React, { useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Dimensions,
//   Animated,
//   Easing,
//   FlatList,
//   TouchableOpacity,
//   Image,
// } from 'react-native';
// 
// const { width } = Dimensions.get('window');
// 
// interface ARRadarViewProps {
//   users: Array<{
//     _id: string;
//     username: string;
//     distance: number;
//     profilePicture?: string | null;
//   }>;
//   onUserPress: (userId: string) => void;
//   isSendingSignal: string | null;
//   currentLocation: { lat: number; lon: number };
// }
// 
// const ARRadarView: React.FC<ARRadarViewProps> = ({
//   users,
//   onUserPress,
//   isSendingSignal,
//   currentLocation,
// }) => {
//   const radarRotation = useRef(new Animated.Value(0)).current;
// 
//   // Animation de rotation du radar
//   useEffect(() => {
//     Animated.loop(
//       Animated.timing(radarRotation, {
//         toValue: 1,
//         duration: 8000,
//         easing: Easing.linear,
//         useNativeDriver: true,
//       })
//     ).start();
//   }, []);
// 
//   const rotateRadar = radarRotation.interpolate({
//     inputRange: [0, 1],
//     outputRange: ['0deg', '360deg'],
//   });
// 
//   // Trier les utilisateurs par distance
//   const sortedUsers = [...users].sort((a, b) => a.distance - b.distance);
// 
//   return (
//     <View style={styles.container}>
//       {/* Radar animé (décoratif) */}
//       <View style={styles.radarContainer}>
//         {/* Cercles concentriques */}
//         <View style={[styles.radarCircle, styles.circle1]} />
//         <View style={[styles.radarCircle, styles.circle2]} />
//         <View style={[styles.radarCircle, styles.circle3]} />
//         
//         {/* Ligne de balayage animée */}
//         <Animated.View 
//           style={[
//             styles.radarSweep,
//             { transform: [{ rotate: rotateRadar }] }
//           ]} 
//         />
//         
//         {/* Point central "VOUS" */}
//         <View style={styles.centerDot}>
//           <View style={styles.centerPulse} />
//           <View style={styles.centerCore}>
//             <Text style={styles.centerText}>MOI</Text>
//           </View>
//         </View>
// 
//         {/* Points décoratifs (simulent des utilisateurs) */}
//         <View style={[styles.decorativeDot, { top: '30%', left: '40%' }]} />
//         <View style={[styles.decorativeDot, { top: '60%', left: '70%' }]} />
//         <View style={[styles.decorativeDot, { top: '70%', left: '30%' }]} />
//         <View style={[styles.decorativeDot, { top: '40%', left: '80%' }]} />
//       </View>
// 
//       {/* Liste des utilisateurs en dessous */}
//       <View style={styles.userListContainer}>
//         <Text style={styles.listTitle}>
//           👥 {users.length} personne{users.length > 1 ? 's' : ''} à proximité
//         </Text>
//         
//         <FlatList
//           data={sortedUsers}
//           keyExtractor={(item) => item._id}
//           showsVerticalScrollIndicator={false}
//           renderItem={({ item }) => {
//             const isSending = isSendingSignal === item._id;
//             
//             return (
//               <TouchableOpacity
//                 style={[
//                   styles.userCard,
//                   isSending && styles.userCardSending
//                 ]}
//                 onPress={() => onUserPress(item._id)}
//                 disabled={isSending}
//               >
//                 {/* Avatar */}
//                 <View style={styles.userAvatar}>
//                   {item.profilePicture ? (
//                     <Image 
//                       source={{ uri: item.profilePicture }} 
//                       style={styles.avatarImage}
//                     />
//                   ) : (
//                     <View style={styles.avatarPlaceholder}>
//                       <Text style={styles.avatarText}>
//                         {item.username.charAt(0).toUpperCase()}
//                       </Text>
//                     </View>
//                   )}
//                 </View>
// 
//                 {/* Infos */}
//                 <View style={styles.userInfo}>
//                   <Text style={styles.userName}>{item.username}</Text>
//                   <Text style={styles.userDistance}>
//                     {item.distance < 1000 
//                       ? `${Math.round(item.distance)} m` 
//                       : `${(item.distance / 1000).toFixed(1)} km`}
//                   </Text>
//                 </View>
// 
//                 {/* Badge distance */}
//                 <View style={[
//                   styles.distanceBadge,
//                   item.distance < 30 ? styles.distanceVeryClose :
//                   item.distance < 60 ? styles.distanceClose :
//                   styles.distanceFar
//                 ]}>
//                   <Text style={styles.distanceBadgeText}>
//                     {item.distance < 30 ? '🔥' :
//                      item.distance < 60 ? '👋' : '📍'}
//                   </Text>
//                 </View>
// 
//                 {/* Indicateur d'envoi */}
//                 {isSending && (
//                   <View style={styles.sendingIndicator}>
//                     <Text style={styles.sendingText}>⏳</Text>
//                   </View>
//                 )}
//               </TouchableOpacity>
//             );
//           }}
//           ListEmptyComponent={
//             <View style={styles.emptyContainer}>
//               <Text style={styles.emptyEmoji}>🔍</Text>
//               <Text style={styles.emptyTitle}>Personne à proximité</Text>
//               <Text style={styles.emptyText}>
//                 Les utilisateurs apparaîtront ici quand ils seront dans votre zone
//               </Text>
//             </View>
//           }
//         />
//       </View>
// 
//       {/* Légende de distance */}
//       <View style={styles.legend}>
//         <View style={styles.legendItem}>
//           <View style={[styles.legendDot, { backgroundColor: '#FF3B30' }]} />
//           <Text style={styles.legendText}>Très proche (0-30m)</Text>
//         </View>
//         <View style={styles.legendItem}>
//           <View style={[styles.legendDot, { backgroundColor: '#FF9500' }]} />
//           <Text style={styles.legendText}>Proche (30-60m)</Text>
//         </View>
//         <View style={styles.legendItem}>
//           <View style={[styles.legendDot, { backgroundColor: '#007AFF' }]} />
//           <Text style={styles.legendText}>Loin (60-100m+)</Text>
//         </View>
//       </View>
//     </View>
//   );
// };
// 
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: 'transparent',
//   },
//   radarContainer: {
//     height: 300,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginTop: 20,
//     position: 'relative',
//   },
//   radarCircle: {
//     position: 'absolute',
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.3)',
//     borderRadius: 999,
//   },
//   circle1: {
//     width: 120,
//     height: 120,
//   },
//   circle2: {
//     width: 180,
//     height: 180,
//   },
//   circle3: {
//     width: 240,
//     height: 240,
//   },
//   radarSweep: {
//     position: 'absolute',
//     width: 240,
//     height: 240,
//     borderRadius: 120,
//     borderWidth: 2,
//     borderColor: 'rgba(0, 255, 255, 0.4)',
//     borderTopColor: 'transparent',
//     borderRightColor: 'transparent',
//   },
//   centerDot: {
//     position: 'absolute',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   centerPulse: {
//     width: 60,
//     height: 60,
//     borderRadius: 30,
//     backgroundColor: 'rgba(0, 122, 255, 0.2)',
//     position: 'absolute',
//   },
//   centerCore: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#007AFF',
//     borderWidth: 2,
//     borderColor: '#fff',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   centerText: {
//     color: '#fff',
//     fontSize: 10,
//     fontWeight: 'bold',
//   },
//   decorativeDot: {
//     position: 'absolute',
//     width: 8,
//     height: 8,
//     borderRadius: 4,
//     backgroundColor: 'rgba(255, 255, 255, 0.5)',
//   },
//   userListContainer: {
//     flex: 1,
//     paddingHorizontal: 16,
//     paddingTop: 10,
//   },
//   listTitle: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 12,
//     textAlign: 'center',
//   },
//   userCard: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255, 255, 255, 0.1)',
//     borderRadius: 12,
//     padding: 10,
//     marginBottom: 8,
//     borderWidth: 1,
//     borderColor: 'rgba(255, 255, 255, 0.2)',
//   },
//   userCardSending: {
//     opacity: 0.5,
//     backgroundColor: 'rgba(255, 215, 0, 0.2)',
//   },
//   userAvatar: {
//     marginRight: 12,
//   },
//   avatarImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     borderWidth: 2,
//     borderColor: '#fff',
//   },
//   avatarPlaceholder: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: '#007AFF',
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderWidth: 2,
//     borderColor: '#fff',
//   },
//   avatarText: {
//     color: '#fff',
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   userInfo: {
//     flex: 1,
//   },
//   userName: {
//     color: '#fff',
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 4,
//   },
//   userDistance: {
//     color: 'rgba(255, 255, 255, 0.7)',
//     fontSize: 12,
//   },
//   distanceBadge: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 8,
//   },
//   distanceVeryClose: {
//     backgroundColor: '#FF3B30',
//   },
//   distanceClose: {
//     backgroundColor: '#FF9500',
//   },
//   distanceFar: {
//     backgroundColor: '#007AFF',
//   },
//   distanceBadgeText: {
//     fontSize: 18,
//   },
//   sendingIndicator: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: 'rgba(0, 0, 0, 0.5)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   sendingText: {
//     fontSize: 20,
//   },
//   emptyContainer: {
//     alignItems: 'center',
//     paddingVertical: 40,
//   },
//   emptyEmoji: {
//     fontSize: 50,
//     marginBottom: 16,
//   },
//   emptyTitle: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginBottom: 8,
//   },
//   emptyText: {
//     color: 'rgba(255, 255, 255, 0.5)',
//     fontSize: 14,
//     textAlign: 'center',
//     paddingHorizontal: 32,
//   },
//   legend: {
//     flexDirection: 'row',
//     justifyContent: 'space-around',
//     paddingHorizontal: 16,
//     paddingBottom: 10,
//     backgroundColor: 'rgba(0, 0, 0, 0.3)',
//   },
//   legendItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   legendDot: {
//     width: 10,
//     height: 10,
//     borderRadius: 5,
//     marginRight: 4,
//   },
//   legendText: {
//     color: '#fff',
//     fontSize: 10,
//   },
// });
// 
// export default ARRadarView;

import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

// Types
export interface ARUser {
  _id: string;
  username: string;
  profilePicture?: string | null;
  distance: number;
  bearing: number;
  interests?: {
    common: string[];
    count: number;
  };
  precision?: {
    level: number;
    text: string;
    icon: string;
  };
  lastActive?: Date;
}

export interface UserListViewProps {
  users: ARUser[];
  isSendingSignal: string | null;
  onUserPress: (userId: string) => void;
  currentLocation: { lat: number; lon: number };
  onRefresh?: () => void;
  refreshing?: boolean;
  ListHeaderComponent?: React.ReactElement;
}

const ARRadarView: React.FC<UserListViewProps> = ({
  users,
  onUserPress,
  isSendingSignal,
  currentLocation,
  onRefresh,
  refreshing = false,
  ListHeaderComponent,
}) => {
  
  /**
   * Obtient la couleur en fonction de la distance
   */
  const getDistanceColor = (distance: number): string => {
    if (distance <= 25) return '#FF3B30'; // Rouge - très proche
    if (distance <= 50) return '#FF9500'; // Orange - proche
    if (distance <= 100) return '#34C759'; // Vert - moyen
    if (distance <= 500) return '#007AFF'; // Bleu - loin
    return '#8E8E93'; // Gris - très loin
  };

  /**
   * Obtient l'icône de précision
   */
  const getPrecisionIcon = (precision?: ARUser['precision']): string => {
    if (!precision) return '📍';
    
    if (precision.level >= 7) return '🏠'; // Rue
    if (precision.level >= 5) return '🏘️'; // Quartier
    if (precision.level >= 4) return '🏙️'; // Ville
    if (precision.level >= 2) return '🌍'; // Pays
    return '🌎'; // Continent/Monde
  };

  /**
   * Obtient la flèche directionnelle en fonction du bearing
   */
  const getDirectionArrow = (bearing: number): string => {
    // Normaliser le bearing entre 0 et 360
    const normalizedBearing = ((bearing % 360) + 360) % 360;
    
    if (normalizedBearing >= 337.5 || normalizedBearing < 22.5) return '⬆️'; // Nord
    if (normalizedBearing >= 22.5 && normalizedBearing < 67.5) return '↗️'; // Nord-Est
    if (normalizedBearing >= 67.5 && normalizedBearing < 112.5) return '➡️'; // Est
    if (normalizedBearing >= 112.5 && normalizedBearing < 157.5) return '↘️'; // Sud-Est
    if (normalizedBearing >= 157.5 && normalizedBearing < 202.5) return '⬇️'; // Sud
    if (normalizedBearing >= 202.5 && normalizedBearing < 247.5) return '↙️'; // Sud-Ouest
    if (normalizedBearing >= 247.5 && normalizedBearing < 292.5) return '⬅️'; // Ouest
    if (normalizedBearing >= 292.5 && normalizedBearing < 337.5) return '↖️'; // Nord-Ouest
    
    return '⬆️'; // Par défaut
  };

  /**
   * Formate la distance
   */
  const formatDistance = (distance: number): string => {
    if (distance < 1000) {
      return `${Math.round(distance)} m`;
    } else {
      return `${(distance / 1000).toFixed(0)} km`;
    }
  };

  /**
   * Calcule le temps écoulé depuis la dernière activité
   */
  const getLastActiveText = (lastActive?: Date): string => {
    if (!lastActive) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - new Date(lastActive).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'En ligne';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `Il y a ${diffDays} j`;
  };

  /**
   * Rendu d'un élément utilisateur
   */
  const renderUserItem = ({ item: user }: { item: ARUser }) => {
    const isSending = isSendingSignal === user._id;
     console.log("User Proche : " ,user)
    return (
      <TouchableOpacity
        style={styles.userCard}
        onPress={() => onUserPress(user._id)}
        disabled={isSending}
        activeOpacity={0.7}
        testID={`user-card-${user._id}`}
      >
        {/* Photo de profil */}
        <View style={styles.avatarContainer}>
          {user.profilePicture ? (
            <Image 
              source={{ uri: user.profilePicture }} 
              style={styles.avatar}
              defaultSource={require('../assets/images/asmay-splash-screen.png')}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {user.username?.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
          )}
          
          {/* Indicateur de signal en cours */}
          {isSending && (
            <View style={styles.sendingBadge}>
              <ActivityIndicator size="small" color="#fff" />
            </View>
          )}
        </View>

        {/* Informations utilisateur */}
        <View style={styles.userInfo}>
          {/* Nom et distance */}
          <View style={styles.nameRow}>
            <Text style={styles.username} numberOfLines={1}>
              {user.username}
            </Text>
            <Text style={styles.distance}>
              {formatDistance(user.distance)}
            </Text>
          </View>

          {/* Localisation */}
          <View style={styles.locationRow}>
            <Text style={styles.locationIcon}>
              {getPrecisionIcon(user.precision)}
            </Text>
            <Text style={styles.locationText} numberOfLines={1}>
              {user.precision?.text || 'À proximité'}
            </Text>
          </View>

          {/* Intérêts communs */}
          {user.interests && user.interests.count > 0 && (
            <View style={styles.interestsContainer}>
              {/* <Text style={styles.interestsIcon}>🎯</Text> */}
              <Text style={styles.interestsText}>
                {user.interests.count} intérêt{user.interests.count > 1 ? 's' : ''} commun{user.interests.count > 1 ? 's' : ''}
              </Text>
              
              {/* Aperçu des intérêts */}
              {user.interests.common && user.interests.common.length > 0 && (
                <View style={styles.interestsPreview}>
                  {user.interests.common.slice(0, 2).map((interest: string, idx: number) => (
                    <Text key={`${user._id}-interest-${idx}`} style={styles.interestTag}>
                      {interest}
                    </Text>
                  ))}
                  {user.interests.common.length > 2 && (
                    <Text style={styles.moreInterests}>
                      +{user.interests.common.length - 2}
                    </Text>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Dernière activité */}
          {user.lastActive && (
            <Text style={styles.lastActive}>
              {getLastActiveText(user.lastActive)}
            </Text>
          )}
        </View>

        {/* Direction */}
        <View style={styles.directionContainer}>
          <Text style={styles.directionArrow}>
            {getDirectionArrow(user.bearing)}
          </Text>
          <Text style={styles.bearing}>{Math.round(user.bearing)}°</Text>
        </View>
      </TouchableOpacity>
    );
  };

  /**
   * Rendu de la liste vide
   */
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🔍</Text>
      <Text style={styles.emptyTitle}>Aucun utilisateur trouvé</Text>
      <Text style={styles.emptyText}>
        Élargissez votre recherche ou réessayez plus tard
      </Text>
    </View>
  );

  /**
   * Rendu du séparateur entre les items
   */
  const renderSeparator = () => <View style={styles.separator} />;

  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item._id}
      renderItem={renderUserItem}
      contentContainerStyle={styles.listContainer}
      showsVerticalScrollIndicator={false}
      ListEmptyComponent={renderEmpty}
      ListHeaderComponent={ListHeaderComponent}
      ItemSeparatorComponent={renderSeparator}
      onRefresh={onRefresh}
      refreshing={refreshing}
      initialNumToRender={10}
      maxToRenderPerBatch={10}
      windowSize={5}
      removeClippedSubviews={true}
    />
  );
};

// Styles
const styles = StyleSheet.create({
  listContainer: {
    paddingTop: 66,
    paddingBottom: 32,
    flexGrow: 1,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(8, 8, 8, 0.08)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 252, 252, 0.1)',
    width: width - 32,
    alignSelf: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  sendingBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: '#fff',
  },
  userInfo: {
    flex: 1,
    marginRight: 8,
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  username: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  distance: {
    fontSize: 14,
    fontWeight: '600',
    color:"#fdcb8e"
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  locationText: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
    flex: 1,
  },
  interestsContainer: {
    marginBottom: 4,
  },
  interestsIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  interestsText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  interestsPreview: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  interestTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 2,
    color: '#fff',
    fontSize: 10,
  },
  moreInterests: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
    marginLeft: 2,
  },
  lastActive: {
    color: 'rgba(251, 253, 250, 0.93)',
    fontSize: 10,
    marginTop: 2,
  },
  directionContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 50,
  },
  directionArrow: {
    fontSize: 24,
  },
  bearing: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 10,
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  separator: {
    height: 8,
  },
});

export default ARRadarView;