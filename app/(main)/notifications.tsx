import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  Image,
  RefreshControl,
  ActivityIndicator,
  Button,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useAuth } from "@/hooks/useAuth";
import { useSocket } from "@/hooks/useSocket";
import { signalAPI } from "@/services/api";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import {
  RewardedAd,
  RewardedAdEventType,
  TestIds,
  AdEventType,
} from "react-native-google-mobile-ads";

import { useAudioPlayer } from "expo-audio";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import {
  addRewardToQueue,
  processRewardQueue,
  getRewardQueue,
} from "@/services/rewardQueu";
import { userAPI } from "@/services/api";

const REWARD_QUEUE_KEY = "@asmay_pending_rewards";
const MAX_ATTEMPTS = 5;
const BASE_DELAY = 60000; // 1 minute

interface User {
  _id: string;
  username: string;
  profilePicture?: string;
  interests?: string[];
}

interface Signal {
  _id: string;
  fromUserId: User;
  toUserId: string;
  message?: string;
  status: "pending" | "accepted" | "ignored" | "expired";
  createdAt: string;
  expiresAt: string;
  chatId?: string;
  viewed?: boolean;
  commonInterests?: string[];
}

interface NotificationItem extends Signal {
  isNew?: boolean;
}
//--------------------- EN PRODUCTION -----------------//

// const adUnitId = Platform.select({
//   ios: 'ca-app-pub-xxxxxxxxxxxxxxxx/aaaaaaaaaa', //  Ad Unit ID pour iOS
//   android: 'ca-app-pub-xxxxxxxxxxxxxxxx/bbbbbbbbbb', // Ad Unit ID pour Android
// });

const adUnitId = __DEV__
  ? TestIds.REWARDED
  : "ca-app-pub-xxxxxxxxxxxxx/yyyyyyyyyyyyyy";

const rewarded = RewardedAd.createForAdRequest(adUnitId, {
  keywords: ["fashion", "clothing"],
});

const NotificationsScreen: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [processingSignal, setProcessingSignal] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const pendingRewardRef = useRef<{ amount: number; type: string } | null>(
    null
  );
  const [networkConnected, setNetworkConnected] = useState<boolean>(false);

  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const router = useRouter();

  // 🔥 CORRECTION : Charger les notifications à chaque focus
  useFocusEffect(
    useCallback(() => {
      // console.log("🔄 Focus sur l'écran - Chargement des notifications");
      loadNotifications();
    }, [])
  );
  const player = useAudioPlayer(require("../../assets/sound/clapSound.mp3"));
  const playSignalSound = () => {
    player.seekTo(0); // Remet le son au début
    player.play(); // Joue le son
  };
  const playerErrorSound = useAudioPlayer(require("../../assets/sound/errorSound.mp3"));
  const playErrorSound = () => {
    playerErrorSound.seekTo(0); // Remet le son au début
    playerErrorSound.play(); // Joue le son
  };

  //   // 🔍 Surveillance de la connexion réseau
  useEffect(() => {
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      console.log("L'atat de connexion :",state);
      
      const isNowConnected = !!state.isConnected;
      setNetworkConnected(isNowConnected);

      if (isNowConnected) {
        console.log(" Connexion rétablie - Traitement de la file...");
        processRewardQueue().then((successCount) => {
          if (successCount > 0) {
            console.log(`✅ ${successCount} récompense(s) synchronisées`);
          }
        });
      }
    });

    return () => unsubscribeNetInfo();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (networkConnected) {
        processRewardQueue().then((successCount) => {
          if (successCount > 0) {
            // Optionnel: Rafraîchir le profil si des coins ont été ajoutés
          }
        });
      }
    }, [networkConnected])
  );
  
  useEffect(() => {
    loadNotifications();
    setupSocketListeners();

    return () => {
      if (socket) {
        socket.off("new_signal");
        socket.off("signal_accepted");
        socket.off("signal_updated");
      }
    };
  }, [socket, user?._id]);

  //   useEffect(() => {
  //
  //
  //     const unsubscribeLoaded = rewarded.addAdEventListener(
  //       RewardedAdEventType.LOADED,
  //       () => {
  //         console.log("✅ Annonce chargée et prête.");
  //         setLoaded(true);
  //       }
  //     );
  //
  //     const unsubscribeEarned = rewarded.addAdEventListener(
  //       RewardedAdEventType.EARNED_REWARD,
  //       (reward) => {
  //         console.log("🎉 Récompense gagnée :", reward);
  //
  //         pendingRewardRef.current = reward;
  //       }
  //     );
  //
  //     // 🔥 NOUVEAU : Gérer la fermeture de l'annonce
  //     const unsubscribeClosed = rewarded.addAdEventListener(
  //       AdEventType.CLOSED,
  //       () => {
  //         console.log("👋 Annonce fermée. Rechargement...");
  //         if (pendingRewardRef.current) {
  //           const reward = pendingRewardRef.current;
  //           Alert.alert(
  //             "Félicitations 👋 !",
  //             `Vous avez gagné ${reward.amount} ${reward.type}. Continuez à regarder les annonces pour gagner plus de coins`,
  //             [{ text: "OK", onPress: () => console.log("Alerte fermée") }]
  //           );
  //           pendingRewardRef.current = null; // Réinitialise
  //         }
  //         setLoaded(false); // 1. Réinitialise l'état immédiatement
  //         rewarded.load(); // 2. Lance le chargement de la prochaine annonce
  //       }
  //     );
  //
  //     // 🔥 NOUVEAU : Gérer les erreurs de chargement
  //     const unsubscribeError = rewarded.addAdEventListener(
  //       AdEventType.ERROR,
  //       (error) => {
  //         // console.error("❌ Erreur de chargement :", error);
  //         setLoaded(false); // Assure que l'état est false en cas d'erreur
  //       }
  //     );
  //
  //     // Démarrer le premier chargement
  //     rewarded.load();
  //
  //     // Nettoyage
  //     return () => {
  //       unsubscribeLoaded();
  //       unsubscribeEarned();
  //       unsubscribeClosed(); // 🔥 N'oubliez pas de nettoyer
  //       unsubscribeError(); // 🔥 N'oubliez pas de nettoyer
  //     };
  //   }, []);

  useEffect(() => {
    const unsubscribeLoaded = rewarded.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        console.log("✅ Annonce chargée et prête.");
        setLoaded(true);
      }
    );

    const unsubscribeEarned = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      async (reward) => {
        console.log("🎉 Récompense gagnée :", reward);
        pendingRewardRef.current = reward;

        // 1. Ajouter à la file d'attente IMMÉDIATEMENT
        const rewardId = await addRewardToQueue("WATCH_REWARDED_AD");

        if (!rewardId) {
          console.error("❌ Impossible d'ajouter à la file d'attente");
          return;
        }

        // 2. Tenter une synchronisation IMMÉDIATE (si en ligne)
        try {
          const response = await userAPI.addReward({
            rewardType: "WATCH_REWARDED_AD",
            rewardId: rewardId,
          });

          if (response.success) {
            // Si succès : supprimer de la file locale
            const queue = await getRewardQueue();
            const updatedQueue = queue.filter((r) => r.id !== rewardId);
            await AsyncStorage.setItem(
              REWARD_QUEUE_KEY,
              JSON.stringify(updatedQueue)
            );

            console.log("✅ Récompense synchronisée en temps réel");
            console.log(`💰 Nouveau solde: ${response.data?.coins} coins`);
          }
        } catch (error: any) {
          // Normal si hors ligne - restera dans la file pour retry automatique
          console.log(
            "📴 Récompense conservée localement pour synchronisation ultérieure"
          );
          if (error.response?.status === 409) {
            console.log("ℹ️ Récompense déjà créditée côté serveur");
          }
        }
      }
    );

    const unsubscribeClosed = rewarded.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        console.log("👋 Annonce fermée. Rechargement...");
        if (pendingRewardRef.current) {
          const reward = pendingRewardRef.current;
          Alert.alert(
            "Félicitations 👋 !",
            `Vous avez gagné ${reward.amount} ${reward.type}. Continuez à regarder les annonces pour gagner plus de coins`,
            [{ text: "OK", onPress: () => console.log("Alerte fermée") }]
          );
          pendingRewardRef.current = null;
        }
        setLoaded(false);
        rewarded.load();
      }
    );

    const unsubscribeError = rewarded.addAdEventListener(
      AdEventType.ERROR,
      (error) => {
        console.error("❌ Erreur de chargement :", error);
        setLoaded(false);
      }
    );

    rewarded.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, []);

  const setupSocketListeners = (): void => {
    if (socket) {
      socket.on("new_signal", (signalData: Signal) => {
        console.log("📨 Nouveau signal reçu en temps réel!", signalData);

        if (signalData.toUserId === user?._id) {
          const newNotification: NotificationItem = {
            ...signalData,
            isNew: true,
          };

          setNotifications((prev) => {
            if (prev.some((notif) => notif._id === signalData._id)) {
              return prev;
            }
            return [newNotification, ...prev];
          });
        }
      });

      socket.on("signal_accepted", (data: any) => {
        console.log("✅ Votre signal a été accepté!", data);
        //  Recharger pour voir les changements
        loadNotifications();
      });

      // 🔥 NOUVEAU : Écouter les mises à jour de statut
      socket.on("signal_updated", (updatedSignal: Signal) => {
        console.log("🔄 Signal mis à jour:", updatedSignal);
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === updatedSignal._id
              ? { ...updatedSignal, isNew: false }
              : notif
          )
        );
      });
    }
  };

  const loadNotifications = async (): Promise<void> => {
    //  if (!networkConnected) {
    //      Alert.alert("📡 Hors ligne vous n'êtes pas connectés ","Veuillez activer donnée mobile ou vous connecter à Wi-Fi pour bien utiliser Asmay")
    //   return 
    //  }
    //  else{
    //    Alert.alert("🌐 Connexion rétablie","Vous êtes connectés à l'internet donnée mobile est activé")
       // On peut tout faire maintenant return everything we want with network connection 
      
    try {
      // setLoading(true);
      const response = await signalAPI.getReceivedSignals();

      console.log("📡 Réponse API notifications:", response.data);

      if (response.data && response.data.success) {
        const signals: Signal[] = response.data.data || [];

        const notificationItems: NotificationItem[] = signals.map((signal) => ({
          ...signal,
          isNew: !signal.viewed && signal.status === "pending",
        }));

        setNotifications(notificationItems);

        console.log("✅ Notifications chargées:", notificationItems.length);

      } else {
        throw new Error("Format de réponse invalide");
      }
    } catch (error: any) {
      // console.error("❌ Erreur chargement notifications:", error);
    
      if (error.response?.status === 401) {
        Alert.alert("Session expirée", "Veuillez vous reconnecter");
        return;
      }
    
      // Alert.alert("Erreur", "Veuillez réessayer !");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  //

  const handleAcceptSignal = async (signalId: string): Promise<void> => {
    try {
      setProcessingSignal(signalId);
      console.log("🔄 Acceptation du signal:", signalId);

      const response = await signalAPI.respond(signalId, "accepted");
      console.log("✅ Réponse acceptation COMPLÈTE:", response.data);
      playSignalSound();
      // Extraction correcte du chatId selon la structure réelle
      const responseData = response.data.data;
      let chatId = responseData?.chatId;

      console.log("💬 ChatId extrait:", chatId);
      console.log("📊 Structure complète de data:", responseData);

      if (response.data.success) {
        // Mise à jour avec la bonne structure
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === signalId
              ? {
                  ...notif,
                  status: "accepted" as const,
                  chatId: chatId,
                  isNew: false,
                }
              : notif
          )
        );
        showRewardedAd();
        // Recharger pour synchronisation
        setTimeout(async () => {
          await loadNotifications(); // Recharger les données fraîches

          // 🔥 CORRECTION : Navigation conditionnelle après rechargement
          // if (chatId) {
          //   console.log("🚀 Navigation immédiate vers le chat:", chatId);
          //   router.navigate({
          //     pathname: "/(main)/message",
          //     // params: { id: chatId },
          //   });
          // } else {
          //   console.warn(
          //     "⚠️ ChatId non trouvé, vérification dans les données rechargées..."
          //   );
          //   // Le chatId sera disponible après le rechargement
          // }
        }, 100);
      } else {
        throw new Error(
          response.data.message || "Erreur lors de l'acceptation"
        );
      }
    } catch (error: any) {
      // console.error("❌ Erreur acceptation signal:", error);
      const errorMessage =
        error.response?.data?.message || "Impossible d'accepter le signal";
        playErrorSound()
      Alert.alert("Désolé ⚠️!", errorMessage);

      loadNotifications();
    } finally {
      setProcessingSignal(null);
    }
  };
  const handleDeleteSignal = async (signalId: string): Promise<void> => {
    Alert.alert("Supprimer", "Supprimer cet signal ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Supprimer",
        style: "destructive",
        onPress: async (): Promise<void> => {
          try {
            // 🔥 TEMPORAIRE: Suppression locale en attendant l'API
            // setNotifications(prev => prev.filter(notif => notif._id !== signalId));

            // 🔥 TODO: Décommenter quand l'API deleteSignal sera disponible
            await signalAPI.delete(signalId);
            showRewardedAd();
            loadNotifications();
            // Alert.alert('Supprimé', 'Notification⚠️ supprimée');
          } catch (error) {
            // console.error('Erreur suppression:', error);
            Alert.alert("Erreur", "Impossible de supprimer");
          }
        },
      },
    ]);
  };

  const handleDeclineSignal = async (signalId: string): Promise<void> => {
    try {
      setProcessingSignal(signalId);
      console.log("🔄 Refus du signal:", signalId);

      const response = await signalAPI.respond(signalId, "ignored");
      console.log("✅ Réponse refus COMPLÈTE:", response.data);

      // Extraction correcte du chatId selon la structure réelle
      const responseData = response.data.data;

      console.log("📊 Structure complète de data:", responseData);

      if (response.data.success) {
        // 🔥 CORRECTION : Mise à jour avec la bonne structure
        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === signalId
              ? {
                  ...notif,
                  status: "ignored" as const,
                  isNew: false,
                }
              : notif
          )
        );
        showRewardedAd();
        // Recharger pour synchronisation
        setTimeout(async () => {
          await loadNotifications(); // Recharger les données fraîches
        }, 100);

        // Navigation vers le chat si chatId disponible
      } else {
        throw new Error(response.data.message || "Erreur lors de refus");
      }
    } catch (error: any) {
      // console.error("❌ Erreur acceptation signal:", error);
      const errorMessage =
        error.response?.data?.message || "Impossible de refuser le signal";
      // Alert.alert("Erreur", errorMessage);

      loadNotifications();
    } finally {
      setProcessingSignal(null);
    }
  };

  const markAsSeen = (signalId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif._id === signalId ? { ...notif, isNew: false } : notif
      )
    );
  };

  const navigateToChat = (chatId: string | undefined):void => {
    if (chatId) {
      console.log("💬 Navigation vers chat:", chatId);
      router.navigate({
        pathname: "/(main)/message",
        // params: { id: chatId },
      });
    }
  };

  const navigateToRadar = (): void => {
    router.navigate("/(main)/radar" as any);
  };
 
  const showRewardedAd = () => {
    if (loaded) {
      console.log("Tentative d'affichage de l'annonce...");
      rewarded.show();
    } else {
      console.warn("L'annonce n'est pas encore chargée !");
      if (!networkConnected) {
        Alert.alert(
          "Hors ligne",
          "Connectez-vous à Internet pour voir des annonces"
        );
      }
    }
  };

  const handleRefresh = ()=> {
   
    setRefreshing(true);
    loadNotifications();
  };

  const getStatusColor = (status: Signal["status"]): string => {
    switch (status) {
      case "pending":
        return "#FFA500";
      case "accepted":
        return "#4CAF50";
      case "ignored":
        return "#F44336";
      case "expired":
        return "#666";
      default:
        return "#666";
    }
  };

  const getStatusText = (status: Signal["status"]): string => {
    switch (status) {
      case "pending":
        return "En attente";
      case "accepted":
        return "Accepté";
      case "ignored":
        return "Refusé";
      case "expired":
        return "Expiré";
      default:
        return "Inconnu";
    }
  };

  const renderNotificationItem = ({ item }: { item: NotificationItem }) => {
    const isPending = item.status === "pending";
    const isProcessing = processingSignal === item._id;
    const hasChat = !!item.chatId;

    console.log("📋 Rendu notification:", {
      id: item._id,
      status: item.status,
      chatId: item.chatId,
      hasChat,
      isPending,
    });
    return (
      <View
        style={[
          styles.notificationCard,
          item.isNew && styles.newNotification,
          !isPending && styles.processedNotification,
        ]}
      >
        <View style={styles.notificationHeader}>
          <TouchableOpacity
            style={styles.userInfo}
            onPress={() => markAsSeen(item._id)}
           >
            {item.fromUserId.profilePicture ? (
              <Image
                source={{ uri: item.fromUserId.profilePicture }}
                style={styles.image}
              />
            ) : (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {item.fromUserId.username?.charAt(0)?.toUpperCase() || "?"}
                </Text>
              </View>
            )}

            <View style={styles.userDetails}>
              <Text style={styles.username}>
                {item.fromUserId.username || "Utilisateur inconnu"}
              </Text>
              <Text style={styles.timestamp}>
                {new Date(item.createdAt).toLocaleDateString("fr-FR", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.statusContainer}>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {getStatusText(item.status)}
              </Text>
            </View>
            {item.isNew && <View style={styles.newIndicator} />}
          </View>
        </View>
        {item.message && <Text style={styles.messageText}>{item.message}</Text>}
        {item.commonInterests && item.commonInterests.length > 0 && (
          <View style={styles.interestsContainer}>
            <Text style={styles.interestsTitle}>Intérêts communs:</Text>
            <View style={styles.interestsList}>
              {item.commonInterests.map((interest, index) => (
                <View key={index} style={styles.interestTag}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <View style={styles.actionsContainer}>
          {isPending ? (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleAcceptSignal(item._id)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.actionButtonText}>✓ Accepter</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.declineButton]}
                onPress={() => handleDeclineSignal(item._id)}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.actionButtonText}>✗ Refuser</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              {item.status === "accepted" && item.chatId && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.chatButton]}
                  onPress={() => navigateToChat(item.chatId)}
                >
                  <Text style={styles.actionButtonText}>💬 Ouvrir le chat</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => handleDeleteSignal(item._id)}
              >
                <Text style={styles.actionButtonText}>🗑️ Supprimer</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {item.status === "pending" && item.expiresAt && (
          <Text style={styles.expiryText}>
            ⏰ Expire {new Date(item.expiresAt).toLocaleDateString("fr-FR")}
          </Text>
        )}
      </View>
    );
  };

  const renderEmptyState = (): React.JSX.Element => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateEmoji}>🔔</Text>
      <Text style={styles.emptyStateTitle}>Aucun signal pour l'instant</Text>
      <Text style={styles.emptyStateText}>
        Les signaux que vous recevez apparaîtront ici
      </Text>
      <Ionicons 
                  name="clipboard-outline"
                   size={80}
                   color={"#9e9b9bff"}
                    style={styles.iconEmpty}
                   />
      <TouchableOpacity style={styles.exploreButton} onPress={navigateToRadar}>
        <Text style={styles.exploreButtonText}>Explorer Asmay</Text>
      </TouchableOpacity>
    </View>
  );
  //
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text style={styles.loadingText}>Chargement des notifications...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* {!networkConnected && (
        <View style={styles.offlineIndicator}>
          <Text style={styles.offlineText}>
            📡 Hors ligne - 
          </Text>
        </View>
      )} */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Signaux</Text>
       <View style={styles.refraiche}>
        <TouchableOpacity onPress={loadNotifications}>
            <Ionicons 
                  name="refresh-outline"
                   size={25}
                   color={"#9e9b9bff"}
                    style={styles.reText}
                   />
        </TouchableOpacity>
      </View>
        <View style={styles.headerStats}>
          <Text style={styles.statsText}>
            {notifications.filter((n) => n.status === "pending").length} en
            attente
          </Text>
          <View
            style={[
              styles.connectionIndicator,
              isConnected ? styles.connected : styles.disconnected,
            ]}
          >
            <Text style={styles.connectionText}>
              {isConnected ? "🟢" : "🔴"}
            </Text>
          </View>
        </View>
      </View>

      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#007bff"]}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
        extraData={notifications} // 🔥 CORRECTION : Forcer le re-render quand notifications change
      />
   
      <Button
        title="Voir PUB"
        onPress={() => {
          if (loaded) {
            console.log("Tentative d'affichage de l'annonce...");
            rewarded.show();
          } else {
            console.warn("L'annonce n'est pas encore chargée !");
            Alert.alert(
              "Annonce en cours de chargement",
              "Veuillez patienter quelques instants."
            );
            // Optionnel : on peut recharger manuellement si ça prend trop de temps
            // rewarded.load();
          }
        }}
        disabled={!loaded} // Continue à désactiver visuellement le bouton
        color={loaded ? "#007AFF" : "#CCCCCC"} // Couleur visuelle pour l'état
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#203447ff",
    paddingTop:40
  },
  reButton: {
    width: "25%",
    height: 45,
    textAlign: "center",
    bottom: 0,
    padding: 12,
    borderRadius: 20,
    backgroundColor: "#0981f1ff",
  },
  offlineIndicator: {
    backgroundColor: "#FF9800",
    padding: 10,
    alignItems: "center",
  },
  offlineText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  reText: {
    color: "#fff",
    fontWeight: "bold",
  },
  refraiche: {
    position:"absolute",
    bottom: 0,
    height: 60,
    alignItems: "center",
    justifyContent: "center",

    width: "100%",
    // backgroundColor:"#f1efebff"
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  header: {
    backgroundColor: "#203447ff",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#39434eff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#f3f1f1ff",
  },
  image: {
    height: 58,
    width: 58,
    borderRadius: 30,
    marginRight: 10,
  },
  messageText: {},
  headerStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statsText: {
    fontSize: 14,
    color: "#ece9e9ff",
  },
  deleteButton: {
    backgroundColor: "#bd5454ff",
  },
  connectionIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  connected: {
    backgroundColor: "#4CAF50",
  },
  disconnected: {
    backgroundColor: "#F44336",
  },
  connectionText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  notificationCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  newNotification: {
    borderLeftWidth: 4,
    borderLeftColor: "#007bff",
  },
  processedNotification: {
    opacity: 0.8,
  },
  notificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  timestamp: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  statusContainer: {
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  newIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#007bff",
    marginTop: 4,
  },
  interestsContainer: {
    marginBottom: 12,
    paddingLeft: 52,
  },
  interestsTitle: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    fontWeight: "500",
  },
  interestsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  interestTag: {
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  interestText: {
    fontSize: 10,
    color: "#1976d2",
    fontWeight: "500",
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 100,
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: "#4CAF50",
  },
  declineButton: {
    backgroundColor: "#F44336",
  },
  chatButton: {
    backgroundColor: "#007bff",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  expiryText: {
    fontSize: 11,
    color: "#FF9800",
    marginTop: 8,
    fontStyle: "italic",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fffefeff",
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#c9c4c4ff",
    textAlign: "center",
    lineHeight: 22,
  },
  exploreButton: {
    backgroundColor: "#157255ff",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth:2,
    borderColor:"#ee9207ff",
    marginTop: 16,
    elevation:8,
    top:50
  },
  iconEmpty:{
    top:30
  }
  ,
  exploreButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default NotificationsScreen;
