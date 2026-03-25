
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { authAPI } from "../../services/api";
import { saveUserData } from "../../services/auth";
import Input from "../../components/Input";
import Button from "../../components/Button";
import {  useRouter, useLocalSearchParams  } from "expo-router";
import * as Location from "expo-location";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import  NetInfo  from "@react-native-community/netinfo";
import Ionicons from "@expo/vector-icons/Ionicons";


interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  interests: string;
  longitude: number;
  latitude: number;
}

interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export default function RegisterScreen() {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    interests: "",
    longitude: 0,
    latitude: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [networkConnected,setNetworkConnected] = useState<boolean>(false)
  const [passwordLock1,setPasswordLock1] = useState(true)
  const [passwordLock2,setPasswordLock2] = useState(true)

  const router = useRouter();
   const { email: verifiedEmail, username: verifiedUsername, verified } = useLocalSearchParams();
  

  // Récupérer la localisation au chargement du composant
  useEffect(() => {
    // cleanOldAuthData();
    getCurrentLocation();
  }, []);
    useEffect(() => {
    if (verifiedEmail && verifiedUsername) {
      setFormData(prev => ({
        ...prev,
        email: verifiedEmail as string,
        username: verifiedUsername as string,
      }));
    }
  }, [verifiedEmail, verifiedUsername]);

 useEffect(() => {
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      console.log(state)
      const isConnected = !!state.isConnected
    setNetworkConnected(isConnected)
     
      // if (isNowConnected) {
      //   Alert.alert("🌐 Connexion rétablie")
      //   console.log(" Connexion rétablie - Traitement de la file...");
      //   processRewardQueue().then((successCount) => {
      //     if (successCount > 0) {
      //       console.log(`✅ ${successCount} récompense(s) synchronisées`);
      //     }
      //   });
      // }
    });

    return () => unsubscribeNetInfo();
  }, []);
  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      setLocationError(null);

      // Demander la permission
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLocationError("Permission de localisation refusée");
        return;
      }

      // Récupérer la position actuelle
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = location.coords;

      setFormData((prev) => ({
        ...prev,
        latitude,
        longitude,
      }));

      console.log("📍 Localisation récupérée:", latitude, longitude);
    } catch (error) {
      // console.error("Erreur localisation:", error);
      setLocationError("Votre Asmay non disponible à cause de la performance de votre appareil, si vous êtes à l'intérieur d'une construction (maison) veuillez sortir et réessayer");
    } finally {
      setLocationLoading(false);
    }
  };
//   const handleRegister = async () => {
//     const {
//       username,
//       email,
//       password,
//       confirmPassword,
//       interests,
//       longitude,
//       latitude,
//     } = formData;
// 
//     // 🔍 DEBUG - Vérifiez toutes les données
//     console.log("🔍 [DEBUG] Données du formulaire:", {
//       username,
//       email,
//       password: password ? `PRÉSENT (${password.length} chars)` : "MANQUANT",
//       confirmPassword: confirmPassword
//         ? `PRÉSENT (${confirmPassword.length} chars)`
//         : "MANQUANT",
//       latitude,
//       longitude,
//       interests,
//     });
// 
//     if (!username || !email || !password || !confirmPassword) {
//       console.log("❌ [DEBUG] Champs manquants:", {
//         username: !!username,
//         email: !!email,
//         password: !!password,
//         confirmPassword: !!confirmPassword,
//       });
//       Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
//       return;
//     }
// 
//     if (password !== confirmPassword) {
//       Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
//       return;
//     }
// 
//     if (password.length < 6) {
//       Alert.alert(
//         "Erreur",
//         "Le mot de passe doit contenir au moins 6 caractères"
//       );
//       return;
//     }
// 
//     if (!latitude || !longitude || latitude === 0 || longitude === 0) {
//       Alert.alert(
//         "Localisation requise",
//         "Veuillez autoriser la localisation pour créer votre compte.",
//         [{ text: "OK", onPress: getCurrentLocation }]
//       );
//       return;
//     }
// 
//     setIsLoading(true);
//     try {
//       const interestsArray = interests
//         .split(",")
//         .map((i) => i.trim())
//         .filter((i) => i);
// 
//       // 🔍 DEBUG - Données envoyées à l'API
//       const requestData = {
//         username,
//         email,
//         password,
//         interests: interestsArray,
//         latitude,
//         longitude,
//       };
// 
//       console.log("🚀 [DEBUG] Données envoyées à authAPI.register:", {
//         ...requestData,
//         password: "***", // Masqué pour la sécurité
//       });
//        console.log("🔴 [CRITIQUE] AVANT d'appeler authAPI.register");
//     console.log("🔴 [CRITIQUE] authAPI existe?", !!authAPI);
//     console.log("🔴 [CRITIQUE] authAPI.register existe?", authAPI?.register);
//     console.log("🔴 [CRITIQUE] Données:", { ...requestData, password: "***" });
//     
// 
//       const response = await authAPI.register(requestData);
// 
//       console.log("✅ [DEBUG] Réponse du backend:", response);
// 
//       if (response.data.success) {
//         const token = response.data.token || response.data.data?.token;
//         const user = response.data.user || response.data.data?.user;
// 
//         if (token && user) {
//           await storeToken(token);
//           await storeUserData(user);
// 
//           login(user);
//           
//           // Alert.alert("Succès", "Compte créé avec succès !");
//           router.navigate("/(main)/radar");
//         } else {
//           Alert.alert("Erreur", "Structure de réponse invalide");
//         }
//       } else {
//         Alert.alert(
//           "Erreur",
//           response.data.message || "Erreur lors de la création du compte"
//         );
//       }
//     } catch (error: any) {
//       // console.error("❌ [DEBUG] Erreur complète:", error);
//       // console.error("❌ [DEBUG] Erreur response:", error.response?.data);a
//       Alert.alert(
//         "Erreur",
//         error.response.data.message ||
//           error.message.error ||
//           "Erreur lors de la création du compte",
//         );
//         console.log(error.response.data.message)
//     } finally {
//       setIsLoading(false);
//     }
//   };


  const handleRequestVerification = async () => {
    if (!formData.username || !formData.email) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    // Validation rapide de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Erreur', 'Email invalide');
      return;
    }

    try {
      setIsLoading(true);
      const response = await authAPI.sendVerification(formData.email, formData.username);
      
      if (response.data.success) {
        router.push({
          pathname: "/(auth)/verify",
          params: { 
            email: formData.email, 
            username: formData.username 
          }
        });
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

const handleRegister = async () => {
    // Si l'email n'est pas vérifié, on passe par la vérification
    if (verified !== 'true') {
      handleRequestVerification();
      return;
    }
    // sinon on passe à l'inscription
    const {
      username,
      email,
      password,
      confirmPassword,
      interests,
      longitude,
      latitude,
    } = formData;

    // Validation
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
      return;
    }

    if (password.length < 9) {
      Alert.alert(
        "Erreur",
        "Le mot de passe doit contenir au moins 9 caractères"
      );
      return;
    }

    if (!latitude || !longitude || latitude === 0 || longitude === 0) {
      Alert.alert(
        "Localisation requise",
        "Veuillez autoriser la localisation pour créer votre compte.",
        [{ text: "OK", onPress: getCurrentLocation }]
      );
      return;
    }

    setIsLoading(true);
    
    try {
      // 1. Préparer les données
      const interestsArray = interests
        .split(",")
        .map((i) => i.trim())
        .filter((i) => i);

      const requestData = {
        username,
        email,
        password,
        interests: interestsArray,
        latitude,
        longitude,
      };

      console.log("🚀 Tentative d'enregistrement...");

      // 2. Appel API register
      const response = await authAPI.register(requestData);

      console.log("✅ Réponse du register:", {
        success: response.data.success,
        hasToken: !!(response.data.token || response.data.data?.token),
        hasUser: !!(response.data.user || response.data.data?.user),
      });

      if (response.data.success) {
        // 3. Extraire token et user
        const token = response.data.token || response.data.data?.token;
        const user = response.data.user || response.data.data?.user;

        if (token && user) {
          console.log("💾 Sauvegarde des données locales...");
          
          // 4. Sauvegarder LOCALEMENT (dans AsyncStorege)
          await saveUserData(user, token);
          
          console.log("✅ Données sauvegardées, redirection...");
          
          // 5. Petite pause pour être sûr
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Redirigez vers la page d'accueil 
          router.navigate("/(main)/(asmay)"); 
         
          Alert.alert(
            `Bienvenue ${user.username} sur ASMAY ✨`, 
            `Nous somme un monde de réalité augmentée . Découvrez le futur avec notre technologie moderne ! Plongez dans une nouvelle dimension où le réel rencontre le virtuel !`,
            [{ text: "OK" }]
          );
        } else {
          Alert.alert("Erreur", "Données manquantes dans la réponse");
        }
      } else {
        Alert.alert(
          "Erreur",
          response.data.message || "Erreur lors de la création du compte"
        );
      }
    } catch (error: any) {
      console.error("❌ Erreur d'enregistrement:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      // Afficher un message d'erreur clair
      let errorMessage = "Erreur lors de la création du compte";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message?.includes("401")) {
        errorMessage = "Email déjà utilisé ou informations invalides";
      }
      
      Alert.alert("Erreur", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const displayPassword1 = () =>{
   const changedPasswordState = !passwordLock1
   setPasswordLock1(changedPasswordState)
  }
  const displayPassword2 = () =>{
   const changedPasswordState = !passwordLock2
   setPasswordLock2(changedPasswordState)
  }

if (!networkConnected) {
    return (
        <View style={styles.centerContainer}>
         <Ionicons
           name="cloud-offline"
           size={70}
           color={"rgb(249, 244, 244)"}
          />
          <Text style={styles.loadingTitle}> Aucune connexion internet</Text>
          <Text style={styles.loadingText}>Vous n'êtes pas connectés à l'internet.</Text>
          <Text style={styles.loadingText}>Vérifiez votre connexion et réessayer</Text>
        </View>
      );
}

  return (
    <KeyboardAwareScrollView
      enableOnAndroid={true}
      extraHeight={120}
      extraScrollHeight={20}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* <ScrollView contentContainerStyle={styles.container}> */}
      <Text style={styles.title}>Créer un compte</Text>

      {/* Affichage statut localisation */}
      <View style={styles.locationSection}>
        <Text style={styles.locationTitle}>Asmay</Text>
        {locationLoading ? (
          <Text style={styles.locationText}>
            📡 Recherche de votre Asmay...
          </Text>
        ) : locationError ? (
          <View style={styles.locationError}>
            <Text style={styles.locationErrorText}>{locationError}</Text>
            <TouchableOpacity
              onPress={getCurrentLocation}
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        ) : formData.latitude !== 0 ? (
          <Text style={styles.locationSuccess}>
            ✅ Asmay disponible
            {/* : {formData.latitude.toFixed(2)},{" "} */}
            {/* {formData.longitude.toFixed(2)} */}
          </Text>
        ) : (
          <Text style={styles.locationText}>En attente de localisation...</Text>
        )}
      </View>
      { verified ==="true" ? (
        <>
      <Input
        placeholder="Nom d'utilisateur*"
        value={formData.username}
        onChangeText={(text) => updateFormData("username", text)}
      />
      <Input
        placeholder="Address email*"
        value={formData.email}
        onChangeText={(text) => updateFormData("email", text)}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Input
        placeholder="Mot de passe*"
        value={formData.password}
        onChangeText={(text) => updateFormData("password", text)}
        secureTextEntry={passwordLock1}
      />
         <TouchableOpacity style={styles.passwordLock1} onPress={displayPassword1}>
              <Ionicons name={passwordLock1 ? "eye-off" : "eye"} size={26} color={"rgb(64, 61, 59)"} />
            </TouchableOpacity>
      <Input
        placeholder="Confirmer mot de passe*"
        value={formData.confirmPassword}
        onChangeText={(text) => updateFormData("confirmPassword", text)}
        secureTextEntry={passwordLock2}
      />
        <TouchableOpacity style={styles.passwordLock2} onPress={displayPassword2}>
              <Ionicons name={passwordLock2 ? "eye-off" : "eye"} size={26} color={"rgb(64, 61, 59)"} />
            </TouchableOpacity>
      <Input
        placeholder="Centres d'intérest ( separés par des virgules )"
        value={formData.interests}
        onChangeText={(text) => updateFormData("interests", text)}
        multiline
      />
      <Text style={styles.hint}>Ex: Lecture, Football, Musique,Voyage</Text>
      <Button
        title={isLoading ? "Création..." : "Créer mon compte"}
        onPress={handleRegister}
        disabled={isLoading || locationLoading || formData.latitude === 0}
        loading={isLoading}
      />
      </> ) :(
         <> 
                <Input
          placeholder="Nom d'utilisateur*"
          value={formData.username}
          onChangeText={(text) => updateFormData("username", text)}
        />
        <Input
          placeholder="Address email*"
          value={formData.email}
          onChangeText={(text) => updateFormData("email", text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <Button
          title={isLoading ? "Envoi..." : "Continuer"}
          onPress={handleRequestVerification}
          disabled={isLoading || !formData.username || !formData.email}
          loading={isLoading}
        />
          </> )
      }
      
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.link}>Vous avez déja un compte ? Se connecter</Text>
      </TouchableOpacity>
      {/* </ScrollView> */}
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
    minHeight: "100%",
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  locationSection: {
    backgroundColor: "#f1eeeeff",
    padding: 15,
    borderTopLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#aaa7a7ff",
  },
  locationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  locationText: {
    fontSize: 14,
    color: "#666",
  },
  locationSuccess: {
    fontSize: 14,
    color: "green",
    fontWeight: "500",
  },
  locationError: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationErrorText: {
    fontSize: 14,
    color: "red",
    flex: 1,
  },
  passwordLock1:{
      position:"fixed",
    bottom:58,
    right:-268,
    marginBottom:-26,
    // marginTop:0
  },
  passwordLock2:{ 
     position:"fixed",
    bottom:58,
    right:-268,
    marginBottom:-26,
  },
  centerContainer: {
    flex: 1,
    height:"100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#030914ff",
    // top:-80
  },
   loadingTitle: {
    marginTop: 16,
    marginBottom:16,
    fontSize: 20,
    fontWeight:"bold",
    color: "#f1efefff",
  },
  loadingText: {
    // marginBottom:16,
    fontSize: 15,
    color: "rgb(186, 184, 184)",
  },
  wifiBar:{
    position:"absolute",
    bottom:250,
    color:"#fff",
    fontSize:72,

  },
  retryButton: {
    backgroundColor: "#007bff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopLeftRadius: 10,
    borderBottomRightRadius: 10,
    marginLeft: 10,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  hint: {
    fontSize: 12,
    color: "#666",
    marginBottom: 20,
    marginLeft: 5,
  },
  link: {
    color: "#007bff",
    textAlign: "center",
    marginTop: 20,
    fontWeight:"bold",
    fontFamily:"sans-serif"
  },
});
