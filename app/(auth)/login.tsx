
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

import { useAuth } from "../../hooks/useAuth";
import { authAPI } from "../../services/api";
import { storeToken, storeUserData ,saveUserData} from "../../services/auth";
import Input from "../../components/Input";
import Button from "../../components/Button";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import  NetInfo  from "@react-native-community/netinfo";
import Ionicons from "@expo/vector-icons/Ionicons";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [networkConnected,setNetworkConnected] = useState<boolean>(false)
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  }>();
  const [error, setError] = useState("");
  // const { login } = useAuth();
  const router = useRouter();

  // Récupérer la localisation au chargement
  useEffect(() => {
    getCurrentLocation();
  }, []);
   useEffect(() => {
      const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
        console.log(state)
        const isConnected = !!state.isConnected
      setNetworkConnected(isConnected)
       
      });
  
      return () => unsubscribeNetInfo();
    }, []);

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        console.log("📍 Permission de localisation refusée");
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      setLocation(newLocation);
      console.log("📍 Localisation récupérée pour login:", newLocation);
    } catch (error) {
      console.log("⚠️ Erreur localisation login:", error);
    } finally {
      setLocationLoading(false);
    }
  };

  //   const handleLogin = async () => {
  //     if (!email || !password) {
  //       // setError("Veuillez remplir tous les champs");
  //       Alert.alert("Error", "Veuillez remplir tous les champs");
  //       return;
  //     }
  //
  //     try {
  //       setIsLoading(true);
  //       setError("");
  //
  //       console.log("🔐 Tentative de login avec:", {
  //         email,
  //         password: "***",
  //         latitude: location?.latitude,
  //         longitude: location?.longitude,
  //       });
  //
  //       // Utiliser la fonction login du hook useAuth avec la localisation
  //       const success = await login(email, password, location);
  //
  //       if (success) {
  //         Alert.alert("Succès", "Connexion réussie !");
  //         router.replace("/(main)/radar");
  //       } else {
  //         setError("Email ou mot de passe incorrect");
  //         Alert.alert("Error", "Email or Password incorrect");
  //       }
  //     } catch (error: any) {
  //       console.error("❌ Erreur login:", error);
  //       Alert.alert("Error", "Server error ");
  //       // setError(error.message || "Erreur de connexion");
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erreur", "Veuillez remplir tous les champs");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      console.log("🔐 Tentative de login avec:", {
        email,
        password: "***",
        latitude: location?.latitude,
        longitude: location?.longitude,
      });

      // 🔥 CORRECTION : Utiliser directement authAPI.login
      const response = await authAPI.login({
        email,
        password,
        latitude: location?.latitude,
        longitude: location?.longitude,
      });

      console.log("✅ Réponse login:", response.data);

      if (response.data.success && response.data.token && response.data.user) {
        // 🔥 SAUVEGARDER les données utilisateur
        await saveUserData(response.data.user, response.data.token);

        // Alert.alert("Succès", "Connexion réussie !");
        router.replace("/(main)/radar");
      } else {
        throw new Error(response.data.message || "Échec de la connexion");
      }
    } catch (error: any) {
      // console.error("❌ Erreur login:", error);

      // 🔥 MEILLEUR MESSAGE D'ERREUR
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Erreur de connexion au serveur";

      Alert.alert("Erreur", errorMessage);
      // setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
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
      extraScrollHeight={0}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* <ScrollView contentContainerStyle={styles.container}> */}
      <Text style={styles.title}>Connexion</Text>

      {/* Affichage statut localisation */}
      <View style={styles.locationSection}>
        <Text style={styles.locationTitle}>Asmay</Text>
        {locationLoading ? (
          <Text style={styles.locationText}>
            📡 Recherche de votre Asmay...
          </Text>
        ) : location ? (
          <Text style={styles.locationSuccess}>
            ✅ Asmay disponible
            {/* : {location.latitude.toFixed(2)},{" "}
            {location.longitude.toFixed(2)} */}
          </Text>
        ) : (
          <View style={styles.locationError}>
            <Text style={styles.locationErrorText}>
               Asmay non disponible, si vous êtes à l'intérieur d'une construction (maison) veuillez sortir et réessayer
            </Text>
            <TouchableOpacity
              onPress={getCurrentLocation}
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <Input
        placeholder="Address email*"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
          setError("");
        }}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Input
        placeholder="Mot de passe*"
        value={password}
        onChangeText={(text) => {
          setPassword(text);
          setError("");
        }}
        secureTextEntry
      />

      <Button
        title={isLoading ? "Connexion..." : "Se connecter"}
        onPress={handleLogin}
        disabled={isLoading}
        loading={isLoading}
      />

      <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
        <Text style={styles.link}>Vous n'avez pas encore un compte ? S'inscrire</Text>
      </TouchableOpacity>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
    // minHeight: "100%",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  locationSection: {
    backgroundColor: "#f0ededff",
    padding: 15,
    borderTopLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: "#c0b8b8ff",
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
    color :"red",
    flex: 1,
  },
 centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#252a33ff",
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
    borderTopLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginLeft: 10,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  errorContainer: {
    backgroundColor: "#ffebee",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#f44336",
  },
  errorText: {
    color: "#d32f2f",
    textAlign: "center",
    fontSize: 14,
  },
  link: {
    color: "#007bff",
    textAlign: "center",
    marginTop: 20,
  },
});
