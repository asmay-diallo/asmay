// 
// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
//   Platform,
//   StatusBar,
//   ImageBackground,
//   Image,
//   FlatList
// } from "react-native";
// import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
// import {
//   InterstitialAd,
//   BannerAd,
//   BannerAdSize,
//   AdEventType,
//   TestIds,
// } from "react-native-google-mobile-ads";
// import { useAudioPlayer } from "expo-audio";
// import Ionicons from "@expo/vector-icons/Ionicons";
// import * as Location from "expo-location";
// import NetInfo from "@react-native-community/netinfo";
// import { radarAPI, signalAPI } from "../../../services/api";
// import { getUserData } from "../../../services/auth";
// import ARRadarView from "../../../components/ARRadarView";
// import { useAuth } from "./../../../hooks/useAuth";
// import { useSocket } from "../../../hooks/useSocket";
// import { useRouter } from "expo-router";
// //  TanStack Query hooks
// import { useNearbyUsersQuery, useSendNearbySignal, useUpdateLocation} from "../../../hooks/queries/useNearbyUserQuery";
// 
// interface NearbyUser {
//   _id: string;
//   username: string;
//   interests: { 
//     common: string[];
//     count: number;
//   };
//   distance: number;
//   bearing: number;
//   profilePicture?: string;
//   toSessionId: string;
//   privacySettings: {
//     isVisible: boolean;
//     showCommonInterestsOnly: boolean;
//     showOnRadar: boolean;
//   };
// }
// 
// interface UserLocation {
//   lat: number;
//   lon: number;
//   accuracy: number;
//   timestamp: number;
// }
// 
// //--------------------- EN PRODUCTION -----------------//
// // const adUnitId = Platform.select({
// //   ios: 'ca-app-pub-xxxxxxxxxxxxxxxx/aaaaaaaaaa',
// //   android: 'ca-app-pub-xxxxxxxxxxxxxxxx/bbbbbbbbbb',
// // });
// 
// //------------------------ EN DEVELOPPEMENT -----------//
// const adUnitIdBan:any = __DEV__
//   ? TestIds.BANNER
//   : process.env.ANDROID_BANNER_UNIT_ID;
// 
// const adUnitIdInter:any = __DEV__
//   ? TestIds.INTERSTITIAL
//   :process.env.ANDROID_INTERSTITIAL_UNIT_ID;
// 
// const interstitial = InterstitialAd.createForAdRequest(adUnitIdInter, {
//   keywords: ["fashion", "clothing"],
// });
// 
// const RadarScreen: React.FC = () => {
//   const [permission, requestPermission] = useCameraPermissions();
//   const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
//   const [isVisible, setIsVisible] = useState(true);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isSendingSignal, setIsSendingSignal] = useState<string | null>(null);
//   const [currentLocation, setCurrentLocation] = useState<UserLocation | null>(null);
//   const { socket, isConnected, onlineUsers, sendSignal } = useSocket();
//   const [loaded, setLoaded] = useState(false);
//   const [isShowingAd, setIsShowingAd] = useState(false);
//   const [networkConnected, setNetworkConnected] = useState<boolean>(true);
//   const [hiddenUsers, setHiddenUsers] = useState<NearbyUser[]>([]);
//   const [isDisplayUsers, setIsDisplayUsers] = useState(false);
//   
//   const bannerRef = useRef<BannerAd>(null);
//   const { user } = useAuth();
//   const router = useRouter();
// 
//     //  TanStack Query
//   // const { data: nearbyUsers = [], isLoading, refetch } = useNearbyUsersQuery(
//   //   currentLocation?.lat || 0,
//   //   currentLocation?.lon || 0,
//   //   !!currentLocation && isVisible
//   // );
//   // const { mutate: sendSignalMutation, isPending: isSendingSignal } = useSendNearbySignal();
//   // const { mutate: updateLocation } = useUpdateLocation();
//   // 
// 
//   const player = useAudioPlayer(require("../../../assets/sound/sendSignal.mp3"));
//   const playerErrorSound = useAudioPlayer(require("../../../assets/sound/errorSound.mp3"));
// 
//   // Mettre à jour les utilisateurs cachés quand nearbyUsers change
//   useEffect(() => {
//     const hidden = nearbyUsers.filter(user => user.privacySettings?.showOnRadar === false);
//     setHiddenUsers(hidden);
//   }, [nearbyUsers]);
// 
//   useEffect(() => {
//     const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
//       console.log('Etat de connexion : ', state);
//       setNetworkConnected(!!state.isConnected);
//     });
// 
//     return () => unsubscribeNetInfo();
//   }, []);
// 
//   useEffect(() => {
//     if (permission && !permission.granted) {
//       requestPermission();
//     } else if (permission?.granted) {
//       startLocationTracking();
//       if (isConnected) {
//         console.log("✅ Prêt à recevoir des signaux en temps réel!");
//       }
//     }
//   }, [permission, isConnected]);
// 
//   // Gestionnaire d'annonces interstitielles
//   useEffect(() => {
//     const unsubscribeLoaded = interstitial.addAdEventListener(
//       AdEventType.LOADED,
//       () => {
//         console.log("✅ Interstitiel chargé et prêt.");
//         setLoaded(true);
//         setIsShowingAd(false);
//       }
//     );
// 
//     const unsubscribeError = interstitial.addAdEventListener(
//       AdEventType.ERROR,
//       (error) => {
//         console.log('❌ Erreur de chargement:', error);
//         setLoaded(false);
//         setIsShowingAd(false);
//       }
//     );
// 
//     const unsubscribeOpened = interstitial.addAdEventListener(
//       AdEventType.OPENED,
//       () => {
//         console.log("👁️ Interstitiel ouvert.");
//         setIsShowingAd(true);
//         if (Platform.OS === "ios") {
//           StatusBar.setHidden(true);
//         }
//       }
//     );
// 
//     const unsubscribeClosed = interstitial.addAdEventListener(
//       AdEventType.CLOSED,
//       () => {
//         console.log("👋 Interstitiel fermé.");
//         setIsShowingAd(false);
//         if (Platform.OS === "ios") {
//           StatusBar.setHidden(false);
//         }
//         interstitial.load();
//       }
//     );
// 
//     interstitial.load();
// 
//     return () => {
//       unsubscribeLoaded();
//       unsubscribeError();
//       unsubscribeOpened();
//       unsubscribeClosed();
//     };
//   }, []);
// 
//   const startLocationTracking = async () => {
//     try {
//       const { status } = await Location.requestForegroundPermissionsAsync();
//       if (status !== "granted") {
//         Alert.alert(
//           "Permission requise",
//           "La localisation est nécessaire pour le radar"
//         );
//         return;
//       }
// 
//       const location = await Location.getCurrentPositionAsync({
//         accuracy: Location.Accuracy.BestForNavigation,
// 
//       });
//        console.log("sfdkfj",location.coords.speed);
//        console.log("sfdkfj",location.coords.heading);
//        
//       const newLocation: UserLocation = {
//         lat: location.coords.latitude,
//         lon: location.coords.longitude,
//         accuracy: location.coords.accuracy || 0,
//         timestamp: location.timestamp,
//       };
// 
//       setCurrentLocation(newLocation);
//       fetchNearbyUsers(newLocation.lat, newLocation.lon);
// 
//       await Location.watchPositionAsync(
//         {
//           accuracy: Location.Accuracy.Highest,
//           timeInterval: 50000,
//           distanceInterval: 0,
//           mayShowUserSettingsDialog: true,
//         },
//         async (location) => {
//           const updatedLocation: UserLocation = {
//             lat: location.coords.latitude,
//             lon: location.coords.longitude,
//             accuracy: location.coords.accuracy || 0,
//             timestamp: location.timestamp,
//           };
// 
//           setCurrentLocation(updatedLocation);
// 
//           if (isVisible) {
//             fetchNearbyUsers(updatedLocation.lat, updatedLocation.lon);
//           }
//         }
//       );
//     } catch (error) {
//       console.error("Error starting location tracking:", error);
//     }
//   };
// 
//   const playSignalSound = () => {
//     player.seekTo(0);
//     player.play();
//   };
// 
//   const playErrorSound = () => {
//     playerErrorSound.seekTo(0);
//     playerErrorSound.play();
//   };
// 
//   const fetchNearbyUsers = async (lat: number, lon: number) => {
//     if (!isVisible) return;
// 
//     try {
//       setIsLoading(true);
//       const response = await radarAPI.getNearbyUsers(lat, lon);
//       
//       if (response.data.success && response.data.data) {
//         const usersFromAPI = response.data.data.users || [];
//         setNearbyUsers(usersFromAPI);
//         // console.log(`✅ ${usersFromAPI.length} utilisateurs chargés`);
//       }
//     } catch (error: any) {
//       // console.error("❌ Error fetching nearby users:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };
// 
//   const handleSendSignal = async (userId: string) => {
//     try {
//       const targetUser = nearbyUsers.find((user) => user._id === userId);
//       if (!targetUser) return;
// 
//       if (!networkConnected) {
//         Alert.alert(
//           "📡 Hors ligne",
//           "Veuillez activer votre connexion internet"
//         );
//         return;
//       }
// 
//       Alert.alert(
//         "Envoyer un signal",
//         `Voulez-vous envoyer un signal à ${targetUser.username} ?`,
//         [
//           { text: "Non", style: "cancel" },
//           {
//             text: "Oui",
//             onPress: async () => {
//               try {
//                 setIsSendingSignal(userId);
//                 
//                 if (socket && isConnected) {
//                  const result = await sendSignal(
//                     targetUser._id,
//                     `Salut ! Je suis ${user?.username}`
//                   );
//                   playSignalSound();
//                   Alert.alert("Bravo 🎉!",
//                     result.delivered ?
//                     `${targetUser.username} a réçu votre signal . Attendez sa réponse !`:
//                       `Signal est envoyé et enregistré, mais ${targetUser.username} n'est pas connecté !`,[
//                         {text:"Okay",
//                                onPress:()=>{
//                               interstitial.show()
//                                }
//                         }
//                       ]
//                   );
// 
//                 } else {
//                   await signalAPI.send(targetUser.toSessionId);
//                 }
// 
//                 // Retirer l'utilisateur de la liste
//                 setNearbyUsers(prev => prev.filter(u => u._id !== userId));
//               } catch (error: any) {
//                 playErrorSound();
//                 Alert.alert("Désolé", error.message);
//               } finally {
//                 setIsSendingSignal(null);
//               }
//             },
//           },
//         ]
//       );
//     } catch (error) {
//       console.error("Error in handleSendSignal:", error);
//       setIsSendingSignal(null);
//     }
//   };
// 
//   const refreshUsers = async () => {
//     if (!networkConnected) {
//       Alert.alert(
//         "📡 Hors ligne",
//         "Veuillez activer votre connexion internet"
//       );
//       return;
//     }
//     if (currentLocation) {
//       await fetchNearbyUsers(currentLocation.lat, currentLocation.lon);
//     }
//   };
// 
//   const navigateToProfile = () => {
//     if (!networkConnected) {
//       Alert.alert(
//         "📡 Hors ligne",
//         "Veuillez activer votre connexion internet"
//       );
//       return;
//     }
//     router.push("/(main)/(asmay)/profile");
//   };
// 
//   const toggleVisibility = async () => {
//     if (!networkConnected) {
//       Alert.alert(
//         "📡 Hors ligne",
//         "Veuillez activer votre connexion internet"
//       );
//       return;
//     }
//     setIsVisible(!isVisible);
//   };
// 
//   const renderHiddenUserItem = ({ item }: { item: NearbyUser }) => (
//     <TouchableOpacity style={styles.itemHiddenUser}>
//       <View style={styles.avatar}>
//         <Text style={styles.avatarText}>
//           {item.username?.charAt(0)?.toUpperCase() || "?"}
//         </Text>
//       </View>
//       <View style={styles.userInfo}>
//         <Text style={styles.username}>{item.username}</Text>
//       </View>
//     </TouchableOpacity>
//   );
// 
//   // Écran hors ligne
//   if (!networkConnected) {
//     return (
//       <View style={styles.centerContainer}>
//         <Ionicons name="cloud-offline" size={70} color="rgb(249, 244, 244)" />
//         <Text style={styles.loadingTitle}>Aucune connexion internet</Text>
//         <Text style={styles.loadingText}>Vérifiez votre connexion et réessayez</Text>
//       </View>
//     );
//   }
// 
//   // Écran permissions
//   if (!permission) {
//     return (
//       <View style={styles.centerContainer}>
//         <ActivityIndicator size="large" color="#007bff" />
//         <Text style={styles.loadingText}>Vérification des permissions...</Text>
//       </View>
//     );
//   }
// 
//   if (!permission.granted) {
//     return (
//       <View style={styles.centerContainer}>
//         <Text style={styles.errorText}>Permissions requises</Text>
//         <Text style={styles.errorSubtext}>
//           Cette application a besoin de l'accès à la caméra et à la localisation.
//         </Text>
//         <TouchableOpacity style={styles.retryButton} onPress={requestPermission}>
//           <Text style={styles.retryButtonText}>Autoriser</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }
// 
//   return (
//     <ImageBackground
//       source={require("../../../assets/images/asmay-home.png")}
//       resizeMode="cover"
//       style={styles.container}
//     >
//       {/* {isLoading && (
//         <View style={styles.loadingOverlay}>
//           <ActivityIndicator size="small" color="#fff" />
//         </View>
//       )} */}
// 
//       <View style={styles.cameraOverlay}>
//         <ARRadarView
//           users={nearbyUsers}
//           onUserPress={handleSendSignal}
//           isSendingSignal={isSendingSignal}
//           currentLocation={currentLocation || { lat: 0, lon: 0 }}
//         />
//       </View>
// 
//   
//       {/* Panneau utilisateurs cachés */}
//       {isDisplayUsers && hiddenUsers.length > 0 && (
//         <View style={styles.hiddenUsersContainer}>
//           <View style={styles.hiddenUsersHeader}>
//             <Ionicons name="people-circle" size={54} color="#d4d1d1ff" />
//             <Text style={styles.hiddenLength}>{hiddenUsers.length}</Text>
//             <Text style={styles.hiddenTitle}>
//               Utilisateur{hiddenUsers.length > 1 ? "s" : ""} caché{hiddenUsers.length > 1 ? "s" : ""}
//             </Text>
//             <TouchableOpacity onPress={() => setIsDisplayUsers(false)}>
//               <Ionicons name="close-circle-outline" size={34} color="#d4d1d1ff" />
//             </TouchableOpacity>
//           </View>
//           <View style={styles.hiddenUsersBody}>
//             <FlatList
//               data={hiddenUsers}
//               renderItem={renderHiddenUserItem}
//               keyExtractor={(item) => item._id}
//             />
//           </View>
//         </View>
//       )}
// 
//       {/* Contrôles */}
//       <View style={styles.controls}>
//         {/* <TouchableOpacity style={styles.controlButton} onPress={navigateToProfile}>
//           <Ionicons name="person" size={34} color="rgb(253, 251, 251)" />
//         </TouchableOpacity>
//          */}
//         <TouchableOpacity style={styles.controlButton} onPress={refreshUsers}>
//           <Ionicons name="refresh-outline" size={20} color="white" />
//         </TouchableOpacity>
// 
//         {/* <TouchableOpacity 
//           style={styles.controlButton} 
//           onPress={() => setIsDisplayUsers(!isDisplayUsers)}
//         >
//           <Text style={styles.hiddenLengthButton}>{hiddenUsers.length}</Text>
//         </TouchableOpacity> */}
//       </View>
// 
//       {/* Bannière publicitaire */}
//       <BannerAd 
//         ref={bannerRef} 
//         unitId={adUnitIdBan} 
//         size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} 
//       />
//     </ImageBackground>
//   );
// };
// 
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   hiddenUsersContainer: {
//     position: "absolute",
//     right: 0,
//     top: 60,
//     height: "70%",
//     width: "80%",
//     alignItems: "center",
//     backgroundColor: "#150f0f",
//     borderRadius: 10,
//     zIndex: 1000,
//     padding: 10,
//   },
//   hiddenUsersHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     width: "100%",
//     paddingBottom: 10,
//     borderBottomWidth: 1,
//     borderBottomColor: "#989595",
//   },
//   hiddenTitle: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   hiddenLength: {
//     backgroundColor: "#fbef08",
//     borderRadius: 10,
//     color: "#0f0303",
//     fontWeight: "bold",
//     fontSize: 14,
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//   },
//   hiddenLengthButton: {
//     color: "#fff",
//     fontSize: 18,
//     fontWeight: "bold",
//   },
//   hiddenUsersBody: {
//     flex: 1,
//     width: "100%",
//     marginTop: 10,
//   },
//   itemHiddenUser: {
//     flexDirection: "row",
//     marginBottom: 10,
//     backgroundColor: "#434344",
//     padding: 8,
//     borderRadius: 5,
//   },
//   avatar: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     backgroundColor: "#5220cf",
//     borderColor: "#d4c707",
//     borderWidth: 2,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   avatarText: {
//     color: "#fff",
//     fontSize: 20,
//     fontWeight: "bold",
//   },
//   userInfo: {
//     flex: 1,
//     paddingLeft: 10,
//     justifyContent: "center",
//   },
//   username: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
//   centerContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#030914ff",
//     padding: 20,
//   },
//   loadingTitle: {
//     marginTop: 16,
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#f1efefff",
//   },
//   loadingText: {
//     fontSize: 15,
//     color: "rgb(161, 160, 160)",
//     textAlign: "center",
//     marginTop: 10,
//   },
//   errorText: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#dc3545",
//     marginBottom: 10,
//     textAlign: "center",
//   },
//   errorSubtext: {
//     fontSize: 14,
//     color: "#666",
//     textAlign: "center",
//     marginBottom: 20,
//   },
//   retryButton: {
//     backgroundColor: "#007bff",
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 8,
//   },
//   retryButtonText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },
//   connectionIndicator: {
//     position: "absolute",
//     top: 45,
//     left: 16,
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: 15,
//     zIndex: 1000,
//   },
//   connected: {
//     backgroundColor: "rgba(76, 175, 80, 0.9)",
//   },
//   disconnected: {
//     backgroundColor: "rgba(146, 65, 18, 0.9)",
//   },
//   connectionText: {
//     color: "#fff",
//     fontSize: 10,
//     fontWeight: "bold",
//   },
//   loadingOverlay: {
//     position: "absolute",
//     top: 10,
//     right: 10,
//     zIndex: 1000,
//   },
//   cameraOverlay: {
//     flex: 1,
//   },
//   controls: {
//     position: "absolute",
//     top: 110,
//     right: 10,
//     gap: 10,
//   },
//   controlButton: {
//     backgroundColor: 'rgba(52, 199, 89, 0.15)',
//     padding: 8,
//     top:-67,
//     borderRadius: 25,
//     alignItems: "center",
//     justifyContent: "center",
//     borderWidth: 1,
//     borderColor: 'rgba(52, 199, 89, 0.3)',
//     width: 43,
//     height: 43,
//   },
// });
// 
// export default RadarScreen;

// app/(main)/(asmay)/index.tsx (RadarScreen modifié)
import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, ImageBackground,StyleSheet } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { InterstitialAd, BannerAd, BannerAdSize, AdEventType, TestIds } from "react-native-google-mobile-ads";
import { useAudioPlayer } from "expo-audio";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Location from "expo-location";
import NetInfo from "@react-native-community/netinfo";

// TanStack Query hooks
import { useNearbyUsersQuery, useUpdateLocation } from "../../../hooks/queries/useNearbyUserQuery";
import { signalAPI } from "@/services/api";
import { useAuth } from "../../../hooks/useAuth";
import { useSocket } from "../../../hooks/useSocket";
import ARRadarView from "../../../components/ARRadarView";

const adUnitIdBan: any = __DEV__ ? TestIds.BANNER : process.env.ANDROID_BANNER_UNIT_ID;
const adUnitIdInter: any = __DEV__ ? TestIds.INTERSTITIAL : process.env.ANDROID_INTERSTITIAL_UNIT_ID;
const interstitial = InterstitialAd.createForAdRequest(adUnitIdInter);

export default function RadarScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [networkConnected, setNetworkConnected] = useState(true);
  const [isSendingSignal, setIsSendingSignal] = useState<string | null>(null);
  const [isShowingAd, setIsShowingAd] = useState(false);
  const [loaded, setLoaded] = useState(false);
  
  const { user } = useAuth();
  const { socket, isConnected, sendSignal } = useSocket();
  const bannerRef = useRef<BannerAd>(null);
  
  //  TanStack Query
  const { data: nearbyUsers = [], isLoading, refetch } = useNearbyUsersQuery(
    currentLocation?.latitude || 0,
    currentLocation?.longitude || 0,
    !!currentLocation && isVisible
  );

  const { mutate: updateLocation } = useUpdateLocation();
  
  const player = useAudioPlayer(require("../../../assets/sound/sendSignal.mp3"));
  const playerErrorSound = useAudioPlayer(require("../../../assets/sound/errorSound.mp3"));

  // Initialisation de la localisation
  useEffect(() => {
    const initLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission requise", "La localisation est nécessaire pour le radar");
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.BestForNavigation });
      const newLocation = { 
        latitude: location.coords.latitude,
         longitude: location.coords.longitude 
        };
      setCurrentLocation(newLocation);
      updateLocation(newLocation);
      
      // Watch position changes
      Location.watchPositionAsync(
        { accuracy: Location.Accuracy.Highest, 
          timeInterval: 50000, 
          distanceInterval: 0 },
        async (loc) => {
          const updatedLocation = { 
            latitude: loc.coords.latitude,
             longitude: loc.coords.longitude };
          setCurrentLocation(updatedLocation);
          updateLocation(updatedLocation);
          if (isVisible) refetch();
        }
      );
    };
    
    if (permission?.granted) initLocation();
    else if (permission && !permission.granted) requestPermission();
  }, [permission]);
  
  // Connexion réseau
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => setNetworkConnected(!!state.isConnected));
    return () => unsubscribe();
  }, []);
  
  // Interstitial ad
  useEffect(() => {
    const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => setLoaded(true));
    const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      setIsShowingAd(false);
      interstitial.load();
    });
    interstitial.load();
    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
    };
  }, []);
  
  const playSignalSound = () => { player.seekTo(0); player.play(); };
  const playErrorSound = () => { playerErrorSound.seekTo(0); playerErrorSound.play(); };
  
 const handleSendSignal = async (userId: string) => {
    try {
      const targetUser = nearbyUsers.find((user) => user._id === userId);
      if (!targetUser) return;

      if (!networkConnected) {
        Alert.alert(
          "📡 Hors ligne",
          "Veuillez activer votre connexion internet"
        );
        return;
      }

      Alert.alert(
        "Envoyer un signal",
        `Voulez-vous envoyer un signal à ${targetUser.username} ?`,
        [
          { text: "Non", style: "cancel" },
          {
            text: "Oui",
            onPress: async () => {
              try {
                setIsSendingSignal(userId);
                
                if (socket && isConnected) {
                 const result = await sendSignal(
                    targetUser._id,
                    `Salut ! Je suis ${user?.username}`
                  );
                  playSignalSound();
                  Alert.alert("Bravo 🎉!",
                    result.delivered ?
                    `${targetUser.username} a réçu votre signal . Attendez sa réponse !`:
                      `Signal est envoyé et enregistré, mais ${targetUser.username} n'est pas connecté !`,[
                        {text:"Okay",
                               onPress:()=>{
                              interstitial.show()
                               }
                        }
                      ]
                  );

                } else {
                  await signalAPI.send(targetUser.toSessionId);
                }

                // Retirer l'utilisateur de la liste
                // setNearbyUsers(prev => prev.filter(u => u._id !== userId));
              } catch (error: any) {
                playErrorSound();
                Alert.alert("Désolé", error.message);
              } finally {
                setIsSendingSignal(null);
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error in handleSendSignal:", error);
      setIsSendingSignal(null);
    }
  };


  const refreshUsers = () => { refetch(); };
  
  if (!networkConnected) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="cloud-offline" size={70} color="#fff" />
        <Text style={styles.loadingTitle}>Aucune connexion internet</Text>
        <Text style={styles.loadingText}>Vérifiez votre connexion</Text>
      </View>
    );
  }
  
  if (!permission?.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Permissions requises</Text>
        <TouchableOpacity style={styles.retryButton} onPress={requestPermission}>
          <Text style={styles.retryButtonText}>Autoriser</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  return (
    <ImageBackground source={require("../../../assets/images/asmay-home.png")} resizeMode="cover" style={styles.container}>
      <ARRadarView
        users={nearbyUsers}
        onUserPress={handleSendSignal}
        isSendingSignal={isSendingSignal }
        currentLocation={currentLocation || { latitude: 0, longitude: 0 }}
        onRefresh={refreshUsers}
        refreshing={isLoading}
      />
      
      <View style={styles.controls}>
        <TouchableOpacity style={styles.controlButton} onPress={refreshUsers}>
          <Ionicons name="refresh-outline" size={20} color="white" />
        </TouchableOpacity>
      </View>
      
      <BannerAd ref={bannerRef} unitId={adUnitIdBan} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#030914ff", padding: 20 },
  loadingTitle: { marginTop: 16, fontSize: 20, fontWeight: "bold", color: "#fff" },
  loadingText: { fontSize: 15, color: "#fff", textAlign: "center", marginTop: 10 },
  errorText: { fontSize: 20, fontWeight: "bold", color: "#dc3545", marginBottom: 10 },
  retryButton: { backgroundColor: "#007bff", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryButtonText: { color: "#fff", fontWeight: "bold" },
  controls: { position: "absolute", top: 110, right: 10, gap: 10 },
  controlButton: { backgroundColor: 'rgba(52, 199, 89, 0.15)', padding: 8, top: -67, borderRadius: 25, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: 'rgba(52, 199, 89, 0.3)', width: 43, height: 43 },
});