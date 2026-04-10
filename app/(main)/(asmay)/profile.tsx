
// ProfileScreen
import React, { useState, useEffect, useCallback,useRef } from "react";
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
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import NetInfo  from "@react-native-community/netinfo";
import CoinDisplay from '@/components/CoinDisplay';
import {  debugStorage } from '../../../services/auth';
import Button from "../../../components/Button";
import Input from "../../../components/Input";
import { useRouter } from "expo-router";
import { uploadAPI } from "../../../services/upload";
import {useAuth } from '../../../hooks/useAuth'
import { userAPI} from "../../../services/api"; 
//  TanStack Query hooks
import { 
  useProfileQuery, 
  useUpdateProfile, 
  useUploadProfilePicture,
  useExchangeRateQuery,
  useRefreshCoins,
  useRemoveProfilePicture
} from '../../../hooks/queries/useProfileQuery';

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

// Configuration publicitaire
const adUnitId:any = __DEV__
  ? TestIds.ADAPTIVE_BANNER
  :process.env.ANDROID_BANNER_UNIT_ID;

export default function ProfileScreen() {
  // UNE SEULE SOURCE DE VÉRITÉ de donnée
  const { logout, updateUser, user: authUser, loading: authLoading } = useAuth(); 
  
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
  const [exchangeRate, setExchangeRate] = useState(0.0001); 
  const [loadingRate, setLoadingRate] = useState(false);
  const [networkConnected, setNetworkConnected] = useState<boolean>(false)
  //  //  TanStack Query
  // const { data: profile, isLoading: profileLoading, refetch: refetchProfile } = useProfileQuery();
  // const { data: exchangeRate = 0.0001, isLoading: rateLoading } = useExchangeRateQuery();
  // const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
  // const { mutate: uploadPhoto, isPending: isUploading } = useUploadProfilePicture();
  // const { mutate: refreshCoins, isPending: isRefreshingCoins } = useRefreshCoins();
  // const { mutate: removePhoto } = useRemoveProfilePicture();

  const bannerRef = useRef<BannerAd>(null);


  const router = useRouter();

  //  Mettre à jour editedData quand authUser change
  useEffect(() => {
    if (authUser) {
      console.log(" user chargé dépuis redux :",authUser);
      
      setEditedData({
        username: authUser.username,
        interests: authUser.interests?.join(", ") || "",
        bio: authUser.bio || "",
        coins: authUser.coins || 0,
        profilePicture: authUser.profilePicture || "",
        privacySettings: authUser.privacySettings || {
          isVisible: true,
          showCommonInterestsOnly: true,
          showOnRadar:true
        },
      });
    }
  }, [authUser]);

  useEffect(() => {
    loadExchangeRate();
  }, []);
useEffect(() => {
  const init = async () => {
    // await cleanupUserStorage(); // Nettoie l'ancien format
    await debugStorage();       // Vérifie le résultat
  };
  init();
}, []);
  useFocusEffect(
    useCallback(() => {
      refreshCoins();
    }, [])
  );


  const loadExchangeRate = async () => {
    setLoadingRate(true);
    try {
      const response = await userAPI.getExchangeRate();
      if (response.data.success && response.data.data) {
        setExchangeRate(response.data.data.rate);
        console.log('💰 Taux de change chargé:', response.data.rate);
      }
    } catch (error) {
      // console.error('❌ Erreur chargement taux:', error);
    } finally {
      setLoadingRate(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission requise", "Nous avons besoin de votre permission pour accéder à vos photos");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        await uploadImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Erreur", "Veuillez réessayer !");
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission requise", "Nous avons besoin de votre permission pour utiliser la caméra");
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

      await updateUser(updatedData); // ✅ Met à jour Redux ET AsyncStorage
      setIsEditing(false);
      
    } catch (error: any) {
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

        await updateUser(updatedData); // ✅ Met à jour Redux ET AsyncStorage
      }
    } catch (error: any) {
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
  };

  const removeProfilePicture = async () => {
    try {
      const updatedData = {
        profilePicture: "",
      };

      await updateUser(updatedData); // ✅ Met à jour Redux ET AsyncStorage

    } catch (error: any) {
      let errorMessage = "Impossible de supprimer la photo";

      if (error.response?.status === 401) {
        errorMessage = "Session expirée. Veuillez vous reconnecter.";
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
          await logout();
        },
      },
    ]);
  };

  const refreshCoins = async () => {
    setRefreshingCoins(true);
    try {
      const response = await userAPI.getProfile();
      if (response.data.success && response.data.data?.coins) {
        // ✅ Mettre à jour via updateUser pour synchroniser Redux
        await updateUser({ coins: response.data.data.coins });
      }
    } catch (error) {
      // console.error("❌ Erreur rafraîchissement coins:", error);
    } finally {
      setRefreshingCoins(false);
    }
  };

  // ✅ Afficher le chargement si authLoading est true
  if (authLoading || !authUser) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingTextVoid}>Chargement de votre profil...</Text>
        <ActivityIndicator size="large"/>
      </View>
    );
  }

  // ✅ Utiliser directement authUser (plus besoin de userData)
  const user = authUser;

  return (
    
    <ScrollView style={styles.container}>
           {/* Bannière publicitaire */}
                    <BannerAd 
                      ref={bannerRef} 
                      unitId={adUnitId} 
                      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} 
                    />
      <Text style={styles.title}>Mon Profil</Text>

      {/* Section Photo de profil */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Photo de profil</Text>

        <View style={styles.profilePictureContainer}>
          {user.profilePicture ? (
            <View>
              <Image
                source={{ uri: user.profilePicture }}
                style={styles.profileImage}
              />
              <Text style={styles.nameText}>{user.username}</Text>
            </View>
          ) : (
            <View style={styles.profilePlaceholder}>
              <Text style={styles.profilePlaceholderText}>
                {user.username?.charAt(0).toUpperCase() || "U"}
              </Text>
            </View>
          )}

          <View style={styles.profilePictureActions}>
            <Ionicons
              name={"image"} 
              size={24} 
              color={"white"} 
              onPress={pickImage}
              style={styles.smallButton}
            />
            <Ionicons
              name={"camera"} 
              size={24} 
              color={"white"} 
              onPress={takePhoto}
              style={styles.smallButton}
            />
            {user.profilePicture && (
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
        coins={user.coins || 0}
        exchangeRate={exchangeRate}
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
            <Text style={styles.value}>{user.username}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{user.email}</Text>
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
            <Text style={styles.value}>{user.bio || "Aucune bio"}</Text>
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
              {user.interests?.join(", ") || "Aucun centre d'intérêt"}
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
                  username: user.username,
                  interests: user.interests?.join(", ") || "",
                  bio: user.bio || "",
                  coins: user.coins || 0,
                  profilePicture: user.profilePicture || "",
                  privacySettings: user.privacySettings || {
                    isVisible: true,
                    showCommonInterestsOnly: true,
                    showOnRadar: true
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
    paddingTop:0,
  },
  pub:{
    top:20
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