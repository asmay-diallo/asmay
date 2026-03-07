// //---------------------------------------
// 
// // npm install react-native-config
// // expo install expo-firebase-analytics
// 
// import React, { useState, useEffect, useRef } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
//   ScrollView,
//   Platform,
//   StatusBar,
//   Button,
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
// import  NetInfo  from "@react-native-community/netinfo";
// import { radarAPI, signalAPI } from "../../../services/api";
// import { getUserData } from "../../../services/auth";
// import ARRadarView from "../../../components/ARRadarView";
// import { useAuth } from "./../../../hooks/useAuth";
// import { useSocket } from "../../../hooks/useSocket";
// import { useRouter } from "expo-router";
// import { translations } from "@stream-io/video-react-native-sdk";
// 
// interface NearbyUser {
//   _id: string;
//   username: string;
//   interests:{ 
//    common: [string],
//    count:number
//   };
//   distance: number;
//   bearing: number;
//   profilePicture?: string;
//   toSessionId: string;
//   privacySettings:{
//     isVisible: boolean;
//   showCommonInterestsOnly: boolean;
//   showOnRadar:boolean
//   }
//   
// }
// 
// interface UserLocation {
//   lat: number;
//   lon: number;
//   accuracy: number;
//   timestamp: number;
// }
// 
// interface PrivacySettings {
//   isVisible: boolean;
//   showCommonInterestsOnly: boolean;
// }
// 
// const DISTANCE_OPTIONS = [
//   { value: 1000, label: "1km", emoji: "🚶" },
//   { value: 2000, label: "2km", emoji: "🚴" },
//   { value: 5000, label: "5km", emoji: "🚗" },
//   { value: 10000, label: "10km", emoji: "🚘" },
// ];
// //--------------------- EN PRODUCTION -----------------//
// 
// // const adUnitId = Platform.select({
// //   ios: 'ca-app-pub-xxxxxxxxxxxxxxxx/aaaaaaaaaa', //  Ad Unit ID pour iOS
// //   android: 'ca-app-pub-xxxxxxxxxxxxxxxx/bbbbbbbbbb', // Ad Unit ID pour Android
// // });
// 
// //------------------------ EN DEVELOPPEMENT -----------//
// 
// // Banner Ad ------------------------
// const adUnitIdBan = __DEV__
//   ? TestIds.BANNER
//   : "ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy";
// 
//   // Interstitial Ad ----------------------
// const adUnitIdInter = __DEV__
//   ? TestIds.INTERSTITIAL
//   : "ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy";
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
//   const [currentLocation, setCurrentLocation] = useState<UserLocation | null>(
//     null
//   );
//   const [selectedDistance, setSelectedDistance] = useState(5000); // 5km par défaut
//   const { socket, isConnected, onlineUsers, sendSignal } = useSocket();
//   const [loaded, setLoaded] = useState(false);
//   const [isShowingAd, setIsShowingAd] = useState(false);
//   const [networkConnected,setNetworkConnected] = useState<boolean>(false)
//   const [hiddenUsers,setHiddenUsers] = useState<NearbyUser[]>([])
//   const [isDisplayUsers , setIsDisplayUsers] = useState(false)
//   const [showUserProfile, setShowUserProfile] = useState<NearbyUser|null>(null)
//   const [isShowUserProfile,setIsShowUserProfile] = useState(false)
//   const bannerRef = useRef<BannerAd>(null);
//   
//   const { user } = useAuth();
//   const router = useRouter();
// 
// // 
//   const player = useAudioPlayer(require("../../../assets/sound/sendSignal.mp3"));
//    useEffect(() => {
//   loadHiddenUsers()
// 
//       const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
//         console.log('Etat de connexion : ',state);
//         
//         const isNowConnected = !!state.isConnected;
//         setNetworkConnected(isNowConnected);
//   
//         if (isNowConnected) {
//           
//           // console.log("🌐 Connexion rétablie - Traitement de la file...");
//           // processRewardQueue().then((successCount) => {
//           //   if (successCount > 0) {
//           //     console.log(`✅ ${successCount} récompense(s) synchronisées`);
//             }
//           });
//         
//       
//   
//       return () => unsubscribeNetInfo();
//     }, []);
// 
//   useEffect(() => {
//     if (permission && !permission.granted) {
//       requestPermission();
//     } else if (permission?.granted) {
//       startLocationTracking();
//       if (isConnected) {
//         console.log(" Prêt à recevoir des signaux en temps réel!");
//       }
//     }
//   }, [permission, isConnected]);
// 
//   // Dans votre useEffect pour l'interstitiel
//   useEffect(() => {
//     const unsubscribeLoaded = interstitial.addAdEventListener(
//       AdEventType.LOADED,
//       () => {
//         console.log("✅ Interstitiel chargé et prêt.");
//         setLoaded(true);
//         setIsShowingAd(false); // Réinitialise après rechargement
//       }
//     );
// 
//     const unsubscribeError = interstitial.addAdEventListener(
//       AdEventType.ERROR,
//       (error) => {
//         // console.error('❌ Erreur de chargement:', error);
//         setLoaded(false);
//         setIsShowingAd(false);
//       }
//     );
// 
//     const unsubscribeOpened = interstitial.addAdEventListener(
//       AdEventType.OPENED,
//       () => {
//         console.log("👁️ Interstitiel ouvert.");
//         setIsShowingAd(true); // L'annonce est EN TRAIN de s'afficher
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
//         setIsShowingAd(false); // Terminé d'afficher
//         if (Platform.OS === "ios") {
//           StatusBar.setHidden(false);
//         }
//         // 🔥 ATTENTION : NE PAS appeler setLoaded(false) ici
//         // 🔥 On recharge MAIS on garde loaded=true jusqu'au prochain LOADED
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
//       });
// 
//       console.log("📍 COORDONNÉES GPS:", {
//         latitude: location.coords.latitude,
//         longitude: location.coords.longitude,
//         accuracy: location.coords.accuracy,
//       });
// 
//       const newLocation: UserLocation = {
//         lat: location.coords.latitude,
//         lon: location.coords.longitude,
//         accuracy: location.coords.accuracy || 0,
//         timestamp: location.timestamp,
//       };
// 
//       setCurrentLocation(newLocation);
// 
//       fetchNearbyUsers(newLocation.lat, newLocation.lon);
// 
//       await Location.watchPositionAsync(
//         {
//           accuracy: Location.Accuracy.Highest,
//           timeInterval: 1000,
//           distanceInterval: 0.2,
//           mayShowUserSettingsDialog: true,
//           
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
//       // console.error("Error starting location tracking:", error);
//     }
//   };
// 
//   console.log(`La précision est : ${currentLocation?.accuracy}`);
// 
//   const playSignalSound = () => {
//     player.seekTo(0); // Remet le son au début
//     player.play(); // Joue le son
//   };
//   
//     const playerErrorSound = useAudioPlayer(require("../../../assets/sound/errorSound.mp3"));
//     const playErrorSound = () => {
//       playerErrorSound.seekTo(0); // Remet le son au début
//       playerErrorSound.play(); // Joue le son
//     };
//   const fetchNearbyUsers = async (lat: number, lon: number) => {
//     
//          if (!isVisible) return;
//     
//     const currentLat = lat || currentLocation?.lat;
//     const currentLon = lon || currentLocation?.lon;
// 
//     if (!currentLat || !currentLon) {
//       // console.log("❌ Position non disponible pour la recherche");
//       return;
//     }
// 
//     try {
//       setIsLoading(true);
//       // console.log(`📍 Recherche dans un rayon de ${selectedDistance / 1000}km`);
// 
//       const response = await radarAPI.getNearbyUsers(
//         lat,
//         lon,
//         selectedDistance
//       );
//       // console.log("📡 Réponse API:", response.data);
// 
//       if (response.data.success && response.data.data) {
//         const usersFromAPI = response.data.data.users || [];
// 
//         setNearbyUsers(usersFromAPI);
//         console.log(`✅ ${usersFromAPI.length} utilisateurs chargés`);
//       } else {
//         console.warn("❌ API returned success: false", response.data.message);
//       }
//     } catch (error: any) {
//       // console.error("❌ Error fetching nearby users:", error);
// 
//       if (error.response?.status === 404) {
//         console.log("🔧 Endpoint non trouvé, utilisation des données simulées");
//         // loadSimulatedUsers();
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };
// 
//   const handleSendSignal = async (userId: string) => {
//     try {
//       const targetUser = nearbyUsers.find((user) => user._id === userId);
//       if (!targetUser) {
//         Alert.alert("Erreur", "Utilisateur non trouvé");
//         return;
//       }
//          if (!networkConnected) {  
//             Alert.alert(" 📡 Hors ligne vous n'êtes pas connectés", "Veuillez activer donnée mobile ou vous connecter à Wi-Fi pour bien utiliser Asmay" )
//             return
//           }
//       Alert.alert(
//         "Envoyer un signal",
//         `Voulez-vous envoyer un signal à ${targetUser.username.toUpperCase()} avec ${targetUser.interests.count} l'interêt${targetUser.interests.count > 1 ? "s" :"" } commun${targetUser.interests.count > 1 ? "s" :"" } et distant de ${targetUser.distance < 1000 ? targetUser.distance: targetUser.distance/1000 }${targetUser.distance < 1000 ? "m":"km"} ?`,
//         [
//           { text: "Non", style: "cancel" },
//           {
//             text: "Oui",
//             onPress: async () => {
//               try {
//                 setIsSendingSignal(userId);
// 
//                 // console.log("📤 Envoi signal à:", targetUser._id);
// 
//                 if (socket && isConnected) {
//                   try {
//                     const result = await sendSignal(
//                       targetUser._id,
//                       `Salut ! Je suis ${user?.username} - Distance: ${targetUser.distance}m`
//                     );
// 
//                     playSignalSound();
//                     console.log("✅ Signal envoyé via Socket:", result);
//                     Alert.alert(
//                       "Bravo 🎉 !",
//                       result.delivered
//                         ? `✅ ${targetUser.username} a réçu votre signal ! Attendez sa réponse !`
//                         : `Signal enregistré pour ${targetUser.username}, mais hors ligne`
//                     );
//                     // showInterstitialAd();
//                     // Retirer l'utilisateur de la liste après envoi réussi
//                     setNearbyUsers((prev) =>
//                       prev.filter((user) => user._id !== userId)
//                     );
//                   } catch (socketError) {
//                     // Fallback vers l'API REST
//                     await sendSignalViaAPI(targetUser);
//                   }
//                 } else {
//                   // Socket non disponible, utiliser directement l'API
//                   console.log("🔌 Socket non disponible, utilisation API REST");
//                   await sendSignalViaAPI(targetUser);
//                 }
//               } catch (error: any) {
//                 Alert.alert(
//                   "Erreur",
//                   error.message || "Impossible d'envoyer le signal"
//                 );
//               } finally {
//                 setIsSendingSignal(null);
//               }
//             },
//           },
//         ]
//       );
//     } catch (error) {
//       // console.error("Error in handleSendSignal:", error);
//       Alert.alert("Erreur", "Une erreur est survenue");
//       setIsSendingSignal(null);
//     }
//   };
//   const sendSignalViaAPI = async (targetUser: NearbyUser) => {
//     try {
//       // Utiliser votre API existante
//       const response = await signalAPI.send(targetUser.toSessionId);
// 
//       if (response.data.success) {
//         console.log(
//           " Signal envoyé via API REST - ChatId:",
//           response.data.data.chatId
//         );
// 
//         // Retirer l'utilisateur de la liste
//         setNearbyUsers((prev) =>
//           prev.filter((user) => user._id !== targetUser._id)
//         );
// 
//         return response.data.data.chatId; // ← Retourner le chatId si besoin
//       } else {
//         // throw new Error(response.data.message || "Erreur API");
//         console.log("");
//       }
//     } catch (apiError: any) {
//       // Afficher un message d'erreur plus précis
//       playErrorSound()
//       Alert.alert("Désolé ⚠️ !", `${apiError.response?.data?.message}`);
//       // console.log(errorMessage)
//       // throw new Error(errorMessage);
//     }
//   };
//   const showInterstitialAd = () => {
//     if (loaded) {
//       console.log("Tentative d'affichage...");
//       interstitial.show();
//     } else if (!loaded) {
//       console.warn("Pas encore chargé.");
//     } else if (isShowingAd) {
//       console.warn("Déjà en train d'afficher.");
//     }
//   };
// 
//   const refreshUsers = async () => {
//       if (!networkConnected) {
//             Alert.alert(" 📡 Hors ligne vous n'êtes pas connectés", "Veuillez activer donnée mobile ou vous connecter à Wi-Fi pour bien utiliser Asmay" )
//             return
//           }
//     if (currentLocation) {
//       await fetchNearbyUsers(currentLocation.lat, currentLocation.lon);
//     }
//   };
// 
// const navigateToProfile = () => {
//    if (!networkConnected) {  
//             Alert.alert(" 📡 Hors ligne vous n'êtes pas connectés", "Veuillez activer donnée mobile ou vous connecter à Wi-Fi pour bien utiliser Asmay" )
//             return
//           }
//     router.navigate({
//       pathname: "/(main)/(asmay)/profile",
//     });
//     showInterstitialAd();
//   };
// const toggleVisibility = async () => {
//        if (!networkConnected) {
//             Alert.alert(" 📡 Hors ligne vous n'êtes pas connectés", "Veuillez activer donnée mobile ou vous connecter à Wi-Fi pour bien utiliser Asmay" )
//             return
//           }
//     const newVisibility = !isVisible;
//     setIsVisible(newVisibility);
//     if (newVisibility && currentLocation) {
//       await fetchNearbyUsers(currentLocation.lat, currentLocation.lon);
//     }
//   };
// const displayHiddenUser =()=>{ 
//   
//        const displayUsers = !isDisplayUsers
//        setIsDisplayUsers(displayUsers)
//   console.log('Hidden users are :',hiddenUsers)
//  
// }
// const cancelHiddenUsers = () =>{
//   const cancelHidden = !isDisplayUsers
//   setIsDisplayUsers(cancelHidden)
// }
// const displayHiddenUserProfile = (userId:string) =>{
//   const userProfile = hiddenUsers.find((user)=>user._id===userId)
// 
//   if(userProfile)
//      setShowUserProfile(userProfile) 
//     setIsShowUserProfile(true)
// }
// const loadHiddenUsers = () => {
//  // Vrais Users ------- logique plus tard
// 
//  const hiddeUser = nearbyUsers.filter((user)=>user.privacySettings.showOnRadar===false)
//     
//     setHiddenUsers(hiddeUser);
//     console.log( "les users cachés ",hiddenUsers );
//   };
// const renderItemHiddenUser = ({ item }: { item: NearbyUser }) =>{
//    
//     return (
//        <TouchableOpacity style={styles.itemHiddenUser} onPress={()=>displayHiddenUserProfile(item._id)}>
//               <View style={styles.avatar}>
//                     <Text style={styles.avatarText}>
//                       {item.username?.charAt(0)?.toUpperCase() || "?"}
//                     </Text>
//               </View>
//               <View style={styles.userInfo}>
//                             <Text style={styles.username}>{item.username}</Text>
//                               {item.interests.common?.slice(0, 2).map((interest, idx) => (
//                                 <Text key={idx} style={styles.interestTag}>
//                                  Interêt : {interest}
//                                 </Text>
//                               ))}
//                        </View>
//               <View style={styles.icons}>
//                          <Ionicons name="key" color="#ffa963" size={33} />
//                        </View>
// 
//         </TouchableOpacity>
//     )
//   }
// const renderEmptyHiddenUser=()=>{
//   return (
//      <View  style={styles.hiddenUsersEmptyContainer}>
//        <Text style={styles.hiddenUsersEmptyTitle}>
//           Aucun utilisateur proche se cache autour de vous pour l'instant
//         </Text>
//        <Text style={styles.hiddenUsersEmptyBody}>
//           Les utilisateurs invisibles qui ont fermés leurs radar ASMAY apparaîtront ici avec des informations insuffisantes pour leurs connaitre ou leurs contacter.
//         </Text>
//        </View>
//   )
//   }
// 
//  if (!networkConnected) {
//      return (
//         <View style={styles.centerContainer}>
//             <Ionicons
//            name="cloud-offline"
//            size={70}
//            color={"rgb(249, 244, 244)"}
//           />
//           <Text style={styles.loadingTitle}> Aucune connexion internet</Text>
//           <Text style={styles.loadingText}>Vous n'êtes pas connectés à l'internet.</Text>
//           <Text style={styles.loadingText}>Vérifiez votre connexion et réessayer</Text>
//         </View>
//       );
//  }
// 
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
//           Cette application a besoin de l'accès à la caméra et à la localisation
//           pour fonctionner.
//         </Text>
//         <TouchableOpacity
//           style={styles.retryButton}
//           onPress={requestPermission}
//         >
//           <Text style={styles.retryButtonText}>Autoriser la caméra</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }
//   if (isLoading) {
//     
//   }
// 
//   return (
//     <ImageBackground
//       source={require("../../../assets/images/asmay-home.png")}
//       resizeMode="cover"
//       style={styles.container}
//       
//     >
//  
//       {/* <View style={styles.container}> */}
//       {isLoading && (
//         <View style={styles.loadingOverlay}>
//           <ActivityIndicator size="small" color="#fff"   />
//         </View>
//       )}
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
//       <View
//         style={[
//           styles.connectionIndicator,
//           isConnected ? styles.connected : styles.disconnected,
//         ]}
//       >
//         <Text style={styles.connectionText}>
//           {isConnected ? "🔴 En ligne" : "⚫ Hors ligne"}
//         </Text>
//       </View>
//       {/* // Afficher les utilisateurs cachés */}
//       { isDisplayUsers &&
//       <View style={styles.hiddenUsersContainer}>
//           <View style={styles.hiddenUsersHeader}>
//             <Ionicons      
//                 name={"people-circle"} 
//                 size={54} 
//                color={"#d4d1d1ff"} 
//               
//             />
//              <Text style={styles.hiddenLength}>
//                 {hiddenUsers.length}
//           
//       </Text>
//               <Text style={styles.hiddenTitle}>
//           Utilisateur{hiddenUsers.length >  1 ? "s" :"" } caché{hiddenUsers.length > 1 ? "s" :"" }
//       </Text>
//               <TouchableOpacity onPress={cancelHiddenUsers}>
//              <Ionicons      
//                 name={"close-circle-outline"} 
//                 size={34} 
//                color={"#d4d1d1ff"} 
//               on={()=>{
//               console.log(" Trial trial !!!");
//               
//               }}
//             />
//             </TouchableOpacity> 
//           </View>
//           {/* <View style={styles.hiddenUsersBody} >
//              <FlatList
//                     data={hiddenUsers}
//                     renderItem={renderItemHiddenUser}
//                     keyExtractor={(item) => item._id}
//                     // contentContainerStyle={}
//                     ListEmptyComponent={renderEmptyHiddenUser}
//                     showsVerticalScrollIndicator={true}
//                     automaticallyAdjustContentInsets={true}
//                     canCancelContentTouches={true}
// 
//                     extraData={hiddenUsers} 
//                   />
//       </View> */}
//      
//       </View>
//       }
//       {/* // Afficher le profil de l'utilisateur caché qui est cliqué */}
//       {/* {  isShowUserProfile && showUserProfile ?
//          (<TouchableOpacity style={styles.userProfile} onPress={()=>setIsShowUserProfile(false)}>
//            <Ionicons      
//                 name={"person-outline"} 
//                 size={66} 
//                color={"#d4d1d1ff"} 
//               
//             />
//           <Text style={styles.userProfileName}>{showUserProfile.username}</Text>
//           <Text style={styles.userProfileText}>Cet utilisateur {showUserProfile.username.toLocaleUpperCase()} est invisible sur le Radar d'Asmay. Il a fermé son Radar pour que vous ne pouvez plus lui envoyer des signaux, des textos, des messages vocaux et lui faire connaître</Text>
//            <Ionicons      
//                 name={"key"} 
//                 size={45} 
//                color={"rgb(210, 202, 177)"} 
//               
//             />
//         </TouchableOpacity>):null
//         } */}
//       {/* Contrôles */}
//       <View style={styles.controls}>
// {/*         
//         <TouchableOpacity style={styles.controlButton}  onPress={()=>router.replace("/(main)/(yamsa)")}>
//               <Ionicons      
//                 name={"repeat"} 
//                 size={34} 
//                color={"rgb(253, 251, 251)"} 
//               
//             />
//         </TouchableOpacity>
//       
//         <TouchableOpacity style={styles.controlButton}  onPress={displayHiddenUser}>
//              <Text style={styles.hiddenLengthButton}>{hiddenUsers.length}</Text>
//         </TouchableOpacity> */}
//       
//         <TouchableOpacity style={styles.controlButton}  onPress={navigateToProfile}>
//              <Ionicons      
//                 name={"person"} 
//                 size={34} 
//                color={"rgb(253, 251, 251)"} 
//               
//             />
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.controlButton} onPress={refreshUsers}>
//                <Ionicons 
//                 name={"refresh-outline"} 
//                 size={34} 
//                color={"white"} 
//                />
//         </TouchableOpacity>
//         {/* <TouchableOpacity style={styles.controlButton} onPress={toggleVisibility}>
//                <Ionicons 
//                 name={isVisible ? "eye-outline":"eye"} 
//                 size={34} 
//                color={"white"} 
//                />
//         </TouchableOpacity> */}
//        
//       </View>
//       {/* 
//       {/* Informations de statut */}
//       {/* <View style={styles.statusBar}>
//     
// 
//         {/* {currentLocation && (
//           <Text>
//             {currentLocation.accuracy <= 20 ? (
//               <Text style={styles.statusText}>
//                 🟢 Précision Excellente: {Math.round(currentLocation.accuracy)}m
//               </Text>
//             ) : currentLocation.accuracy <= 50 ? (
//               <Text style={styles.statusText}>
//                 🟡 Précision Moyenne: {Math.round(currentLocation.accuracy)}m
//               </Text>
//             ) : (
//               <Text style={styles.statusText}>
//                 🔴 Précision Faible: {Math.round(currentLocation.accuracy)}m
//               </Text>
//             )}
//           </Text>
//         )} */}
//       
//       {/* </View> */} */
//         <BannerAd ref={bannerRef} unitId={adUnitIdBan} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} />
//     </ImageBackground>
//   );
// };
// 
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   menuButton:{
//   position:"absolute",
//   top:-70,
//   right:8
//   },
// hiddenUsersContainer:{
//   flex: 1,
//   position:"absolute",
//   right:0,
//   top:60,
//   height:"70%",
//   width:"80%",
//     // justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#150f0f",
//     borderRadius:10,
//     zIndex:1000,
// },
// hiddenUsersHeader:{
//   height:"15%",
//    flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     borderBottomWidth:1,
//     borderBottomColor:"#989595",
// },
// hiddenTitle:{
//   color:"#fff",
//   width:"60%",
// fontSize:17,
// fontWeight:"bold",
// left:20,
// bottom:-6
// },
// hiddenLength:{
//   position:"absolute",
//   height:20,
//   width:30,
//   left:35,
//   bottom:45,
//   textAlign:"center",
//   backgroundColor:"#fbef08",
//   borderRadius:10,
//   color:"#0f0303",
//   fontWeight:"bold",
//   fontSize:16
// },
// hiddenLengthButton:{
// color:"#fff",
// fontSize:25,
// fontWeight:"bold"
// 
// },
// hiddenUsersBody:{
//   // backgroundColor:"#5e5858",
//   width:"90%",
//   height:"80%",
//   borderRadius:10,
//   padding:10,
//   marginTop:10
//  
// },
// itemHiddenUser:{
// flexDirection:"row",
// marginBottom: 15,
// backgroundColor:"#434344",
// padding:6,
// borderRadius:5
// },
// avatar:{
//   width:"22%",
//   height:50,
//   borderRadius:30,
//   backgroundColor:"#5220cf",
//   borderColor:"#d4c707",
//   borderWidth:2,
//   textAlign:"center",
//   alignItems:"center",
//   justifyContent:"center",
// },
//   avatarText:{
//     color:"#fff",
//   fontSize:25,
//   fontWeight:"bold"
// 
//   },
//   userInfo:{
//     width:"60%",
//     paddingLeft:6
//   },
//   username:{
//     color:"#fff",
//     marginBottom:5,
//     fontSize:18,
//     fontWeight:"bold",
//   },
//   interestTag:{
//     color:"#f0ce0f",
//     fontSize:12,
//     
//   },
//   icons:{
//   width:"18%",
//   justifyContent:"center"
//   },
// userProfile:{
// height:"60%",
// width:"100%",
// backgroundColor:"#2f424e",
// position:"absolute",
// justifyContent:"center",
// alignItems:"center",
// zIndex:3000,
// borderRadius:20
// 
// },
// userProfileName:{
//   color:"#fff",
//   fontSize:30,
//   fontWeight:"bold",
// },
// userProfileText:{
//   height:"40%",
//   width:"60%",
//   color:"#ecd3d3",
//   textAlign:"center",
//   fontSize:17,
//   fontWeight:"bold",
//   marginTop:20
// },
// centerContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#030914ff",
//   },
//   loadingTitle: {
//     marginTop: 16,
//     marginBottom:16,
//     fontSize: 20,
//     fontWeight:"bold",
//     color: "#f1efefff",
//   },
//   hiddenUsersEmptyContainer:{
//     justifyContent:"center",
//     alignItems:"center",
//     textAlign:"center",
//     height:300
//   },
//   hiddenUsersEmptyTitle:{
//     height:"25%",
//     color:"#fff",
//     fontSize:18,
//     fontWeight:"bold",
//     alignContent:"center",
//     textAlign:"center"
//   },
//   hiddenUsersEmptyBody:{
//     color:"#bbb8b8",
//      alignContent:"center",
//      textAlign:"center",
//     fontSize:12,
//   },
//   loadingText: {
//     fontSize: 15,
//     color: "rgb(161, 160, 160)",
//   },
// 
//   profilePicture: {
//     height: 50,
//     width: 50,
//   },
//   imageProfile: {
//     top: -100,
//     position: "absolute",
//   },
// 
//   errorText: {
//     fontSize: 20,
//     fontWeight: "bold",
//     color: "#dc3545",
//     marginBottom: 10,
//     textAlign: "center",
//   },
//   image: {
//     height: 60,
//     width: 100,
//     position: "absolute",
//     top: -144,
//     right: -25,
//     elevation: 5,
//   },
//   errorSubtext: {
//     fontSize: 14,
//     color: "#666",
//     textAlign: "center",
//     lineHeight: 20,
//     marginBottom: 20,
//   },
//   retryButton: {
//     backgroundColor: "#007bff",
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 8,
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
//   retryButtonText: {
//     color: "#fff",
//     fontWeight: "bold",
//   },
//   loadingOverlay: {
//     position: "absolute",
//     top: -60,
//     left: 300,
//     right: 0,
//     bottom: 590,
//     backgroundColor: "transparent",
//     justifyContent: "center",
//     alignItems: "center",
//     zIndex: 1000,
//   },
//   loadingOverlayText: {
//     color: "#fff",
//     marginTop: 10,
//     fontSize: 16,
//   },
//   // camera: {
//   //   flex: 1,
//   //   paddingTop: 120,
//   //   // paddingBottom: 80,
//   // },
//   cameraOverlay: {
//     flex: 1,
//     padding: 20,
//     paddingBottom: 0,
// 
//     backgroundColor: "transparent",
//   },
// 
//   // ✅ NOUVEAUX STYLES POUR LE SÉLECTEUR DE DISTANCE
//   // distanceSelector: {
//   //   position: "absolute",
//   //   top: 3,
//   //   left: 10,
//   //   right: 10,
//   //   backgroundColor: "rgba(0, 0, 0, 0.7)",
//   //   borderRadius: 12,
//   //   borderColor: "#b45a11ff",
//   //   borderWidth: 2,
//   //   padding: 10,
//   //   zIndex: 100,
//   // },
//   // distanceTitle: {
//   //   color: "#fff",
//   //   fontSize: 10,
//   //   fontWeight: "600",
//   //   marginBottom: 8,
//   //   textAlign: "center",
//   // },
//   // distanceScrollView: {
//   //   flexGrow: 0,
//   // },
//   // distanceButtons: {
//   //   flexDirection: "row",
//   //   gap: 8,
//   // },
//   // distanceButton: {
//   //   backgroundColor: "rgba(255, 255, 255, 0.1)",
//   //   paddingHorizontal: 8,
//   //   paddingVertical: 6,
//   //   borderRadius: 20,
//   //   alignItems: "center",
//   //   minWidth: 60,
//   //   borderWidth: 2,
//   //   borderColor: "rgba(241, 119, 20, 0.3)",
//   // },
//   // distanceButtonActive: {
//   //   backgroundColor: "#007bff",
//   //   borderColor: "#007bff",
//   // },
//   // distanceEmoji: {
//   //   fontSize: 16,
//   //   marginBottom: 2,
//   // },
//   // distanceEmojiActive: {
//   //   // Même style pour l'emoji actif
//   // },
//   // distanceLabel: {
//   //   color: "#fff",
//   //   fontSize: 8,
//   //   fontWeight: "500",
//   // },
//   // distanceLabelActive: {
//   //   color: "#fff",
//   //   fontWeight: "bold",
//   // },
//   // distanceIndicator: {
//   //   color: "#fff",
//   //   fontSize: 12,
//   //   backgroundColor: "rgba(0, 123, 255, 0.8)",
//   //   paddingHorizontal: 10,
//   //   paddingVertical: 4,
//   //   borderRadius: 12,
//   //   marginBottom: 3,
//   //   fontWeight: "600",
//   // },
// 
//   // Styles existants
//   controls: {
//     position: "absolute",
//     top: 110,
//     right: 10,
//     flexDirection: "column",
//     gap: 10,
//   },
//   controlButton: {
//     backgroundColor: "rgba(0, 0, 0, 0.6)",
//     padding: 3,
//     borderRadius: 50,
//     alignItems: "center",
//     minWidth: 30,
//     borderWidth: 2,
//     borderColor: "#b4b0b0ff",
//   },
//   controlButtonActive: {
//     backgroundColor: "rgba(91, 92, 90, 0.92)",
//   },
//   controlButtonText: {
//     fontSize: 38,
//     color: "#fff",
//     top: -100,
//     left: 8,
//   },
//   controlButtonLabel: {
//     fontSize: 10,
//     color: "#fff",
//     marginTop: 0,
//     fontWeight: "bold",
//   },
//   statusBar: {
//     position: "absolute",
//     bottom: 7,
//     left: 0,
//     right: 0,
//     alignItems: "center",
//   },
//   statusText: {
//     color: "#fff",
//     fontSize: 12,
//     padding: 4,
//     borderRadius: 12,
//     marginBottom: 2,
//   },
//   sendingSignalText: {
//     backgroundColor: "rgba(255, 193, 7, 0.8)",
//     color: "#000",
//   },
// });
// 
// export default RadarScreen;



//---------------------------------------
// npm install react-native-config
// expo install expo-firebase-analytics

import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  StatusBar,
  ImageBackground,
  Image,
  FlatList
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import {
  InterstitialAd,
  BannerAd,
  BannerAdSize,
  AdEventType,
  TestIds,
} from "react-native-google-mobile-ads";
import { useAudioPlayer } from "expo-audio";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as Location from "expo-location";
import NetInfo from "@react-native-community/netinfo";
import { radarAPI, signalAPI } from "../../../services/api";
import { getUserData } from "../../../services/auth";
import ARRadarView from "../../../components/ARRadarView";
import { useAuth } from "./../../../hooks/useAuth";
import { useSocket } from "../../../hooks/useSocket";
import { useRouter } from "expo-router";

interface NearbyUser {
  _id: string;
  username: string;
  interests: { 
    common: string[];
    count: number;
  };
  distance: number;
  bearing: number;
  profilePicture?: string;
  toSessionId: string;
  privacySettings: {
    isVisible: boolean;
    showCommonInterestsOnly: boolean;
    showOnRadar: boolean;
  };
}

interface UserLocation {
  lat: number;
  lon: number;
  accuracy: number;
  timestamp: number;
}

//--------------------- EN PRODUCTION -----------------//
// const adUnitId = Platform.select({
//   ios: 'ca-app-pub-xxxxxxxxxxxxxxxx/aaaaaaaaaa',
//   android: 'ca-app-pub-xxxxxxxxxxxxxxxx/bbbbbbbbbb',
// });

//------------------------ EN DEVELOPPEMENT -----------//
const adUnitIdBan = __DEV__
  ? TestIds.BANNER
  : "ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy";

const adUnitIdInter = __DEV__
  ? TestIds.INTERSTITIAL
  : "ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy";

const interstitial = InterstitialAd.createForAdRequest(adUnitIdInter, {
  keywords: ["fashion", "clothing"],
});

const RadarScreen: React.FC = () => {
  const [permission, requestPermission] = useCameraPermissions();
  const [nearbyUsers, setNearbyUsers] = useState<NearbyUser[]>([]);
  const [isVisible, setIsVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingSignal, setIsSendingSignal] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<UserLocation | null>(null);
  const { socket, isConnected, onlineUsers, sendSignal } = useSocket();
  const [loaded, setLoaded] = useState(false);
  const [isShowingAd, setIsShowingAd] = useState(false);
  const [networkConnected, setNetworkConnected] = useState<boolean>(false);
  const [hiddenUsers, setHiddenUsers] = useState<NearbyUser[]>([]);
  const [isDisplayUsers, setIsDisplayUsers] = useState(false);
  
  const bannerRef = useRef<BannerAd>(null);
  const { user } = useAuth();
  const router = useRouter();

  const player = useAudioPlayer(require("../../../assets/sound/sendSignal.mp3"));
  const playerErrorSound = useAudioPlayer(require("../../../assets/sound/errorSound.mp3"));

  // Mettre à jour les utilisateurs cachés quand nearbyUsers change
  useEffect(() => {
    const hidden = nearbyUsers.filter(user => user.privacySettings?.showOnRadar === false);
    setHiddenUsers(hidden);
  }, [nearbyUsers]);

  useEffect(() => {
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      console.log('Etat de connexion : ', state);
      setNetworkConnected(!!state.isConnected);
    });

    return () => unsubscribeNetInfo();
  }, []);

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    } else if (permission?.granted) {
      startLocationTracking();
      if (isConnected) {
        console.log("✅ Prêt à recevoir des signaux en temps réel!");
      }
    }
  }, [permission, isConnected]);

  // Gestionnaire d'annonces interstitielles
  useEffect(() => {
    const unsubscribeLoaded = interstitial.addAdEventListener(
      AdEventType.LOADED,
      () => {
        console.log("✅ Interstitiel chargé et prêt.");
        setLoaded(true);
        setIsShowingAd(false);
      }
    );

    const unsubscribeError = interstitial.addAdEventListener(
      AdEventType.ERROR,
      (error) => {
        console.log('❌ Erreur de chargement:', error);
        setLoaded(false);
        setIsShowingAd(false);
      }
    );

    const unsubscribeOpened = interstitial.addAdEventListener(
      AdEventType.OPENED,
      () => {
        console.log("👁️ Interstitiel ouvert.");
        setIsShowingAd(true);
        if (Platform.OS === "ios") {
          StatusBar.setHidden(true);
        }
      }
    );

    const unsubscribeClosed = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        console.log("👋 Interstitiel fermé.");
        setIsShowingAd(false);
        if (Platform.OS === "ios") {
          StatusBar.setHidden(false);
        }
        interstitial.load();
      }
    );

    interstitial.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeError();
      unsubscribeOpened();
      unsubscribeClosed();
    };
  }, []);

  const startLocationTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission requise",
          "La localisation est nécessaire pour le radar"
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });

      const newLocation: UserLocation = {
        lat: location.coords.latitude,
        lon: location.coords.longitude,
        accuracy: location.coords.accuracy || 0,
        timestamp: location.timestamp,
      };

      setCurrentLocation(newLocation);
      fetchNearbyUsers(newLocation.lat, newLocation.lon);

      await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          timeInterval: 1000,
          distanceInterval: 0.2,
          mayShowUserSettingsDialog: true,
        },
        async (location) => {
          const updatedLocation: UserLocation = {
            lat: location.coords.latitude,
            lon: location.coords.longitude,
            accuracy: location.coords.accuracy || 0,
            timestamp: location.timestamp,
          };

          setCurrentLocation(updatedLocation);

          if (isVisible) {
            fetchNearbyUsers(updatedLocation.lat, updatedLocation.lon);
          }
        }
      );
    } catch (error) {
      console.error("Error starting location tracking:", error);
    }
  };

  const playSignalSound = () => {
    player.seekTo(0);
    player.play();
  };

  const playErrorSound = () => {
    playerErrorSound.seekTo(0);
    playerErrorSound.play();
  };

  const fetchNearbyUsers = async (lat: number, lon: number) => {
    if (!isVisible) return;

    try {
      setIsLoading(true);
      const response = await radarAPI.getNearbyUsers(lat, lon);
      
      if (response.data.success && response.data.data) {
        const usersFromAPI = response.data.data.users || [];
        setNearbyUsers(usersFromAPI);
        console.log(`✅ ${usersFromAPI.length} utilisateurs chargés`);
      }
    } catch (error: any) {
      console.error("❌ Error fetching nearby users:", error);
    } finally {
      setIsLoading(false);
    }
  };

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
                  await sendSignal(
                    targetUser._id,
                    `Salut ! Je suis ${user?.username}`
                  );
                  playSignalSound();
                  Alert.alert("✅ Signal envoyé !");
                } else {
                  await signalAPI.send(targetUser.toSessionId);
                }

                // Retirer l'utilisateur de la liste
                setNearbyUsers(prev => prev.filter(u => u._id !== userId));
              } catch (error: any) {
                playErrorSound();
                Alert.alert("Erreur", error.message);
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

  const refreshUsers = async () => {
    if (!networkConnected) {
      Alert.alert(
        "📡 Hors ligne",
        "Veuillez activer votre connexion internet"
      );
      return;
    }
    if (currentLocation) {
      await fetchNearbyUsers(currentLocation.lat, currentLocation.lon);
    }
  };

  const navigateToProfile = () => {
    if (!networkConnected) {
      Alert.alert(
        "📡 Hors ligne",
        "Veuillez activer votre connexion internet"
      );
      return;
    }
    router.push("/(main)/(asmay)/profile");
  };

  const toggleVisibility = async () => {
    if (!networkConnected) {
      Alert.alert(
        "📡 Hors ligne",
        "Veuillez activer votre connexion internet"
      );
      return;
    }
    setIsVisible(!isVisible);
  };

  const renderHiddenUserItem = ({ item }: { item: NearbyUser }) => (
    <TouchableOpacity style={styles.itemHiddenUser}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.username?.charAt(0)?.toUpperCase() || "?"}
        </Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.username}>{item.username}</Text>
      </View>
    </TouchableOpacity>
  );

  // Écran hors ligne
  if (!networkConnected) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="cloud-offline" size={70} color="rgb(249, 244, 244)" />
        <Text style={styles.loadingTitle}>Aucune connexion internet</Text>
        <Text style={styles.loadingText}>Vérifiez votre connexion et réessayez</Text>
      </View>
    );
  }

  // Écran permissions
  if (!permission) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Vérification des permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Permissions requises</Text>
        <Text style={styles.errorSubtext}>
          Cette application a besoin de l'accès à la caméra et à la localisation.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={requestPermission}>
          <Text style={styles.retryButtonText}>Autoriser</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("../../../assets/images/asmay-home.png")}
      resizeMode="cover"
      style={styles.container}
    >
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#fff" />
        </View>
      )}

      <View style={styles.cameraOverlay}>
        <ARRadarView
          users={nearbyUsers}
          onUserPress={handleSendSignal}
          isSendingSignal={isSendingSignal}
          currentLocation={currentLocation || { lat: 0, lon: 0 }}
        />
      </View>

      {/* <View
        style={[
          styles.connectionIndicator,
          isConnected ? styles.connected : styles.disconnected,
        ]}
      >
        <Text style={styles.connectionText}>
          {isConnected ? "🟢 En ligne" : "⚫ Hors ligne"}
        </Text>
      </View> */}

      {/* Panneau utilisateurs cachés */}
      {isDisplayUsers && hiddenUsers.length > 0 && (
        <View style={styles.hiddenUsersContainer}>
          <View style={styles.hiddenUsersHeader}>
            <Ionicons name="people-circle" size={54} color="#d4d1d1ff" />
            <Text style={styles.hiddenLength}>{hiddenUsers.length}</Text>
            <Text style={styles.hiddenTitle}>
              Utilisateur{hiddenUsers.length > 1 ? "s" : ""} caché{hiddenUsers.length > 1 ? "s" : ""}
            </Text>
            <TouchableOpacity onPress={() => setIsDisplayUsers(false)}>
              <Ionicons name="close-circle-outline" size={34} color="#d4d1d1ff" />
            </TouchableOpacity>
          </View>
          <View style={styles.hiddenUsersBody}>
            <FlatList
              data={hiddenUsers}
              renderItem={renderHiddenUserItem}
              keyExtractor={(item) => item._id}
            />
          </View>
        </View>
      )}

      {/* Contrôles */}
      <View style={styles.controls}>
        {/* <TouchableOpacity style={styles.controlButton} onPress={navigateToProfile}>
          <Ionicons name="person" size={34} color="rgb(253, 251, 251)" />
        </TouchableOpacity>
         */}
        <TouchableOpacity style={styles.controlButton} onPress={refreshUsers}>
          <Ionicons name="refresh-outline" size={34} color="white" />
        </TouchableOpacity>

        {/* <TouchableOpacity 
          style={styles.controlButton} 
          onPress={() => setIsDisplayUsers(!isDisplayUsers)}
        >
          <Text style={styles.hiddenLengthButton}>{hiddenUsers.length}</Text>
        </TouchableOpacity> */}
      </View>

      {/* Bannière publicitaire */}
      <BannerAd 
        ref={bannerRef} 
        unitId={adUnitIdBan} 
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} 
      />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hiddenUsersContainer: {
    position: "absolute",
    right: 0,
    top: 60,
    height: "70%",
    width: "80%",
    alignItems: "center",
    backgroundColor: "#150f0f",
    borderRadius: 10,
    zIndex: 1000,
    padding: 10,
  },
  hiddenUsersHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#989595",
  },
  hiddenTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  hiddenLength: {
    backgroundColor: "#fbef08",
    borderRadius: 10,
    color: "#0f0303",
    fontWeight: "bold",
    fontSize: 14,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  hiddenLengthButton: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  hiddenUsersBody: {
    flex: 1,
    width: "100%",
    marginTop: 10,
  },
  itemHiddenUser: {
    flexDirection: "row",
    marginBottom: 10,
    backgroundColor: "#434344",
    padding: 8,
    borderRadius: 5,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#5220cf",
    borderColor: "#d4c707",
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  userInfo: {
    flex: 1,
    paddingLeft: 10,
    justifyContent: "center",
  },
  username: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#030914ff",
    padding: 20,
  },
  loadingTitle: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: "bold",
    color: "#f1efefff",
  },
  loadingText: {
    fontSize: 15,
    color: "rgb(161, 160, 160)",
    textAlign: "center",
    marginTop: 10,
  },
  errorText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#dc3545",
    marginBottom: 10,
    textAlign: "center",
  },
  errorSubtext: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  connectionIndicator: {
    position: "absolute",
    top: 45,
    left: 16,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 15,
    zIndex: 1000,
  },
  connected: {
    backgroundColor: "rgba(76, 175, 80, 0.9)",
  },
  disconnected: {
    backgroundColor: "rgba(146, 65, 18, 0.9)",
  },
  connectionText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  loadingOverlay: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1000,
  },
  cameraOverlay: {
    flex: 1,
  },
  controls: {
    position: "absolute",
    top: 110,
    right: 10,
    gap: 10,
  },
  controlButton: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: 8,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#b4b0b0ff",
    width: 50,
    height: 50,
  },
});

export default RadarScreen;