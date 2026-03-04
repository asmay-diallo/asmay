import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import NetInfo  from "@react-native-community/netinfo";
import CoinDisplay from '@/components/CoinDisplay';
import { getUserData } from "../../../services/auth";
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import { User } from "../../../types";
import { useRouter } from "expo-router";
import { uploadAPI } from "../../../services/upload";
import {useAuth } from '../../../hooks/useAuth'
import { userAPI, UserProfile } from "../../../services/api"; 

interface PrivacySettings {
  isVisible: boolean;
  showCommonInterestsOnly: boolean;
  showOnRadar:boolean
}

interface EditedData {
  username: string;
  interests: string;
  bio: string;
  coins: number;
  profilePicture: string;
  privacySettings: PrivacySettings;
}

export default function ProfileScreen() {
  const [userData, setUserData] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<EditedData>({
    username: "",
    interests: "",
    bio: "",
    coins: 0,
    profilePicture: "",
    privacySettings: {
      isVisible: true,
      showCommonInterestsOnly: true,
      showOnRadar:true
    },
  });
  const [isUploading, setIsUploading] = useState(false);
  const [refreshingCoins, setRefreshingCoins] = useState(false);
  const [exchangeRate, setExchangeRate] = useState(0.001); 
  const [loadingRate, setLoadingRate] = useState(false);
  const [networkConnected,setNetworkConnected] = useState<boolean>(false)

  const { logout, updateUser, user: authUser } = useAuth(); 
  const router = useRouter();

  useEffect(() => {
    loadExchangeRate()
    loadUserData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      refreshCoins();
   
    }, [])
  );

  useEffect(() => {
    if (authUser) {
      // Assurez-vous que authUser a le type UserProfile
      const typedAuthUser = authUser as User;
      setUserData(typedAuthUser);
      setEditedData({
        username: typedAuthUser.username,
        interests: typedAuthUser.interests?.join(", ") || "",
        bio: typedAuthUser.bio || "",
        coins: typedAuthUser.coins || 0,
        profilePicture: typedAuthUser.profilePicture || "",
        privacySettings: typedAuthUser.privacySettings || {
          isVisible: true,
          showCommonInterestsOnly: true,
          showOnRadar:true
        },
      });
    }
  }, [authUser]);

  const loadUserData = async () => {
     
    const data = await getUserData();
    if (data && data.user) {
      setUserData(data.user);
      setEditedData({
        username: data.user.username,
        interests: data.user.interests?.join(", ") || "",
        bio: data.user.bio || "",
        coins: data.user.coins || 0,
        profilePicture: data.user.profilePicture || "",
        privacySettings: data.user.privacySettings || {
          isVisible: true,
          showCommonInterestsOnly: true,
          showOnRadar:true
        },
      });
    }
  };
 // 1. Fonction pour charger le taux de change
  const loadExchangeRate = async () => {
    setLoadingRate(true);
    try {
      const response = await userAPI.getExchangeRate();
      if (response.data.success && response.data.data) {
        setExchangeRate(response.data.data.rate); // Met à jour l'état avec le taux du serveur
        console.log('💰 Taux de change chargé:', response.data.rate);
      }
    } catch (error) {
      // console.error('❌ Erreur chargement taux:', error);
      // Gardez la valeur par défaut en cas d'erreur
    } finally {
      setLoadingRate(false);
    }
  };
  const pickImage = async () => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission requise",
          "Nous avons besoin de votre permission pour accéder à vos photos"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      // console.error("Error picking image:", error);
      Alert.alert("Erreur", "Veuillez réessayer !");
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission requise",
          "Nous avons besoin de votre permission pour utiliser la caméra"
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (!result.canceled) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      // console.error("Error taking photo:", error);
      Alert.alert("Erreur", "Veuillez réessayer !");
    }
  };

  const handleSave = async () => {
    try {
      const interestsArray = editedData.interests
        .split(",")
        .map((i) => i.trim())
        .filter((i) => i);

      const updatedData = {
        username: editedData.username,
        interests: interestsArray,
        bio: editedData.bio,
        profilePicture: editedData.profilePicture,
        privacySettings: editedData.privacySettings,
      };

      // Utilisez updateUser qui appelle l'API et met à jour le contexte global
      await updateUser(updatedData);

      // Pas besoin de sauvegarder manuellement - updateUser s'en occupe
      // Le useEffect se chargera de mettre à jour userData via authUser

      setIsEditing(false);
      // Alert.alert("Succès", "Profil mis à jour avec succès");
    } catch (error: any) {
      // console.error("Error saving profile:", error);
      let errorMessage = "Impossible de sauvegarder le profil";

      if (error.response?.status === 401) {
        errorMessage = "Session expirée. Veuillez vous reconnecter.";
        await logout()
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Erreur", errorMessage);
    }
  };

  const uploadImage = async (uri: string) => {
    try {
      setIsUploading(true);

      const response = await uploadAPI.uploadProfilePicture(uri);

      if (response.success) {
        const updatedData = {
          profilePicture: response.data.fullUrl,
        };

        // Utilisez updateUser pour synchroniser avec le serveur
        await updateUser(updatedData);

        // Pas besoin de sauvegarder manuellement - updateUser s'en occupe

        // Alert.alert("Succès", "Photo de profil mise à jour");
      }
    } catch (error: any) {
      // console.error("Error uploading image:", error);
      let errorMessage = "Impossible de télécharger l'image";

      if (error.response?.status === 401) {
        errorMessage = "Session expirée. Veuillez vous reconnecter.";
       await logout()
      }

      Alert.alert("Erreur", errorMessage);
    } finally {
      setIsUploading(false);
    }
  };
  const handlePrivacySettingChange = (
    setting: keyof PrivacySettings,
    value: boolean
  ) => {
    setEditedData((prev) => ({
      ...prev,
      privacySettings: {
        ...prev.privacySettings,
        [setting]: value,
      },
    }));
    // console.log(`🔧 Privacy setting ${setting} changé à:`, value);
  };
  const removeProfilePicture = async () => {
    try {
      const updatedData = {
        profilePicture: "",
      };

      // Utilisez updateUser pour synchroniser avec le serveur
      await updateUser(updatedData);

      // Pas besoin de sauvegarder manuellement - updateUser s'en occupe

      // Alert.alert("Succès", "Photo de profil supprimée");
    } catch (error: any) {
      // console.error("Error removing profile picture:", error);
      let errorMessage = "Impossible de supprimer la photo";

      if (error.response?.status === 401) {
        errorMessage = "Session expirée. Veuillez vous reconnecter.";
        // router.navigate("/(auth)");
        await logout()
      }

      Alert.alert("Erreur", errorMessage);
    }
  };

  const handleLogout = () => {
    Alert.alert("Déconnexion", "Êtes-vous sûr de vouloir vous déconnecter ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Déconnecter",
        onPress: async () => {
          await logout;
        },
      },
    ]);
  };

  const refreshCoins = async () => {
    setRefreshingCoins(true);
    try {
      const response = await userAPI.getProfile();
      if (response.data.success && response.data.data?.coins) {
        setUserData((prev) =>
          prev ? { ...prev, coins: response.data.data!.coins } : null
        );
      }
    } catch (error) {
      // console.error("❌ Erreur rafraîchissement coins:", error);
    } finally {
      setRefreshingCoins(false);
    }
  };

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


  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingTextVoid}>Chargement de votre profil...</Text>
        <ActivityIndicator size="large"/>

      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Mon Profil</Text>

      {/* Section Photo de profil */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Photo de profil</Text>

        <View style={styles.profilePictureContainer}>
          {userData.profilePicture ? (
            <View>
              <Image
                source={{ uri: userData.profilePicture }}
                style={styles.profileImage}
              />
              <Text style={styles.nameText}>{userData.username}</Text>
            </View>
          ) : (
            <View style={styles.profilePlaceholder}>
              <Text style={styles.profilePlaceholderText}>
                {userData.username?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
          )}

          <View style={styles.profilePictureActions}>
            <Ionicons
             name={"image" } 
              size={24} 
              color={"white"} 
              onPress={pickImage}
              loading={isUploading}
              style={styles.smallButton}
            />
            <Ionicons
             name={"camera" } 
              size={24} 
              color={"white"} 
              onPress={takePhoto}
              variant="secondary"
              loading={isUploading}
              style={styles.smallButton}
            />
            {userData.profilePicture && (
              <Ionicons
               name={"trash"} 
               size={24} 
               color={"white"} 
                onPress={removeProfilePicture}
                style={styles.smallButton}
              />
            )}
          </View>
        </View>
      </View>

      <CoinDisplay 
        coins={userData?.coins || 0}
        exchangeRate={exchangeRate} //  C'est dynamique.
        currency="USD"
        showToggle={true}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations personnelles</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Nom d'utilisateur</Text>
          {isEditing ? (
            <Input
              value={editedData.username}
              onChangeText={(text) =>
                setEditedData((prev) => ({ ...prev, username: text }))
              }
              placeholder="Votre nom d'utilisateur"
            />
          ) : (
            <Text style={styles.value}>{userData.username}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{userData.email}</Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Bio</Text>
          {isEditing ? (
            <Input
              value={editedData.bio}
              onChangeText={(text) =>
                setEditedData((prev) => ({ ...prev, bio: text }))
              }
              placeholder="Décrivez-vous en quelques mots..."
              multiline
              numberOfLines={3}
            />
          ) : (
            <Text style={styles.value}>{userData.bio || "Aucune bio"}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Centres d'intérêt</Text>
          {isEditing ? (
            <Input
              value={editedData.interests}
              onChangeText={(text) =>
                setEditedData((prev) => ({ ...prev, interests: text }))
              }
              placeholder="Séparés par des virgules (ex: #Tech, #Voyage)"
              multiline
            />
          ) : (
            <Text style={styles.value}>
              {userData.interests?.join(", ") || "Aucun centre d'intérêt"}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Paramètres de confidentialité</Text>

        <View style={styles.switchField}>
          <Text style={styles.switchLabel}>Profil visible</Text>
          <Switch
            value={editedData.privacySettings.isVisible}
            onValueChange={(value) =>
              handlePrivacySettingChange("isVisible", value)
            }
            disabled={!isEditing}
          />
        </View>

        <View style={styles.switchField}>
          <Text style={styles.switchLabel}>
            Afficher seulement les intérêts communs
          </Text>
          <Switch
            value={editedData.privacySettings.showCommonInterestsOnly}
            onValueChange={(value) =>
              handlePrivacySettingChange("showCommonInterestsOnly", value)
            }
            disabled={!isEditing}
          />
        </View>

        <View style={styles.switchField}>
          <Text style={styles.switchLabel}>
          Être visible sur le Radar
          </Text>
          <Switch
            value={editedData.privacySettings.showOnRadar}
            onValueChange={(value) =>
              handlePrivacySettingChange("showOnRadar", value)
            }
            disabled={!isEditing}
          />
        </View>
      </View>

      <View style={styles.actions}>
        {isEditing ? (
          <>
            <Button
              title="Sauvegarder"
              onPress={handleSave}
              style={styles.saveButton}
            />
            <Button
              title="Annuler"
              onPress={() => {
                setEditedData({
                  username: userData.username,
                  interests: userData.interests?.join(", ") || "",
                  bio: userData.bio || "",
                  coins: userData.coins || 0,
                  profilePicture: userData.profilePicture || "",
                  privacySettings: userData.privacySettings || {
                    isVisible: true,
                    showCommonInterestsOnly: true,
                    showOnRadar:true
                  },
                });
                setIsEditing(false);
              }}
              variant="secondary"
              style={styles.cancelButton}
            />
          </>
        ) : (
          <Button
            title="Modifier le profil"
            onPress={() => setIsEditing(true)}
            style={styles.editButton}
          />
        )}

        <Button
          title="Déconnexion"
          onPress={handleLogout}
          variant="danger"
          style={styles.logoutButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#203447ff",
    padding: 20,
    paddingTop:40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#203447ff",
  },
  loadingTextVoid:{
    color:"#fff",
    fontSize:20,
    marginBottom:20
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    color: "#fcf6f6",
  },
  nameText: {
    height: 50,
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 30,
    marginBottom: 20,
    color: "rgb(233, 225, 225)",
  },
  section: {
    backgroundColor: "#203447ff",
    padding: 20,
    color: "white",
    borderRadius: 10,
    borderColor:"#bcda48",
    borderWidth:1,
    marginBottom: 20,
    // shadowColor: "#04a70c",
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 8,
    textAlign: "center",
  },
   centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#030914ff",
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#fcf9f9",
    textAlign: "center",
  },
  profilePictureContainer: {
    alignItems: "center",
    marginBottom: 15,
  },
  profileImage: {
    width: 140,
    height: 140,
    borderRadius: 80,
    marginBottom: 15,
  },
  profilePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  coinsContainer: {
    alignItems: "center",
    paddingVertical: 15,
  },
  coinsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
  },
  coinsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  refreshText: {
    fontSize: 14,
    color: "#007AFF",
  },
  coinsBalance: {
    alignItems: "center",
    marginBottom: 15,
  },
  coinsAmount: {
    fontSize: 56,
    fontWeight: "bold",
    color: "#FFD700",
  },
  coinsLabel: {
    fontSize: 18,
    color: "#666",
    marginTop: -5,
  },
  coinsDescription: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 20,
  },
  earnCoinsButton: {
    backgroundColor: "#28a745",
  },

  profilePlaceholderText: {
    color: "#fff",
    fontSize: 40,
    fontWeight: "bold",
  },
  profilePictureActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
  },
  smallButton: {
    paddingHorizontal: 11,
    paddingVertical: 8,
    minHeight: 40,
    fontSize: 40,
    // backgroundColor:"#fff"
  },
  field: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ccc9c9",
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: "#a48686",
  },
  switchField: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  switchLabel: {
    fontSize: 15,
    flex: 1,
    marginRight: 10,
    color:"#d8d6d6",
    fontWeight:"bold"
  },
  actions: {
    marginTop: 20,
    gap: 8,
    marginBottom: 40,
  },
  editButton: {
    backgroundColor: "#007bff",
  },
  saveButton: {
    backgroundColor: "#28a745",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
  },
  logoutButton: {
    backgroundColor: "#dc3545",
  },
});
