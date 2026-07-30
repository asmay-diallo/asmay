// import React, { useState, useCallback } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   RefreshControl,
//   ActivityIndicator,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useRouter } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
// import { esimAPI } from "../../../services/api"
// 
// interface MyESIM {
//   id: string;
//   iccid: string;
//   productName: string;
//   status: string;
//   dataLimit: { value: number; unit: string };
//   dataUsed: { value: number; unit: string };
//   footprint: string;
//   expiresAt?: string;
//   createdAt: string;
// }
// 
// // Données mock
// const MOCK_ESIMS: MyESIM[] = [
//   {
//     id: "1",
//     iccid: "8932145678901234567",
//     productName: "Europe Explorer 5Go",
//     status: "INSTALLED",
//     dataLimit: { value: 5, unit: "GB" },
//     dataUsed: { value: 2.3, unit: "GB" },
//     footprint: "EUROPE",
//     expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
//     createdAt: new Date().toISOString(),
//   },
//   {
//     id: "2",
//     iccid: "8932145678901234568",
//     productName: "USA Premium 20Go",
//     status: "RELEASED",
//     dataLimit: { value: 20, unit: "GB" },
//     dataUsed: { value: 0, unit: "GB" },
//     footprint: "US",
//     createdAt: new Date().toISOString(),
//   },
//   {
//     id: "3",
//     iccid: "8932145678905234568",
//     productName: "USA Premium 60Go",
//     status: "UNAVAILABLE",
//     dataLimit: { value: 20, unit: "GB" },
//     dataUsed: { value: 0, unit: "GB" },
//     footprint: "US",
//     createdAt: new Date().toISOString(),
//   },
//   {
//     id: "4",
//     iccid: "8932145678900234568",
//     productName: "USA Premium 60Go",
//     status: "PENDING",
//     dataLimit: { value: 20, unit: "GB" },
//     dataUsed: { value: 0, unit: "GB" },
//     footprint: "US",
//     createdAt: new Date().toISOString(),
//   },
// ];
// 
// const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
//   PENDING: { label: "En attente", color: "#FFAA00", icon: "time-outline" },
//   RELEASED: { label: "Prête à télécharger ", color: "#0066FF", icon: "download-outline" },
//   DOWNLOADED: { label: "Téléchargée", color: "#0066FF", icon: "cloud-done-outline" },
//   INSTALLED: { label: "Active", color: "#00CC88", icon: "checkmark-circle" },
//   UNAVAILABLE: { label: "Épuisée", color: "#FF4444", icon: "alert-circle-outline" },
//   EXPIRED: { label: "Expirée", color: "#FF4444", icon: "close-circle-outline" },
//   FAILED: { label: "Échec", color: "#FF4444", icon: "warning-outline" },
// };
// 
// export default function MyESIMsScreen() {
//   const router = useRouter();
// 
//   const [esims, setESims] = useState<MyESIM[]>(MOCK_ESIMS);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isRefreshing, setIsRefreshing] = useState(false);
// 
//   const loadESIMs = useCallback(async () => {
//     setIsLoading(true);
//     try {
//       // TODO: Appeler votre API
//       // const response = await simAPI.getProducts();
//       // setESims(response.esims);
//       setESims(MOCK_ESIMS);
//     } catch (error) {
//       console.error("Erreur chargement eSIM:", error);
//     } finally {
//       setIsLoading(false);
//       setIsRefreshing(false);
//     }
//   }, []);
// 
//   const handleRefresh = () => {
//     setIsRefreshing(true);
//     loadESIMs();
//   };
// 
//   const formatData = (data: { value: number; unit: string }): string => {
//     if (data.unit === "GB" || (data.unit === "MB" && data.value >= 1000)) {
//       return `${(data.value / (data.unit === "MB" ? 1000 : 1)).toFixed(1)} Go`;
//     }
//     return `${data.value} ${data.unit}`;
//   };
// 
//   const getDaysLeft = (expiresAt?: string): string => {
//     if (!expiresAt) return "";
//     const days = Math.ceil(
//       (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
//     );
//     if (days <= 0) return "Expiré";
//     if (days === 1) return "1 jour restant";
//     return `${days} jours restants`;
//   };
// 
//   const getUsagePercent = (esim: MyESIM): number => {
//     if (esim.dataLimit.value <= 0) return 0;
//     return (esim.dataUsed.value / esim.dataLimit.value) * 100;
//   };
// 
//   const renderESIMCard = ({ item }: { item: MyESIM }) => {
//     const statusInfo = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;
//     const usagePercent = getUsagePercent(item);
//     const daysLeft = getDaysLeft(item.expiresAt);
// 
//     return (
//       <TouchableOpacity
//         style={styles.esimCard}
//         // onPress={() => router.push({ pathname: "/(main)/(yamsa)/details", params: { product: JSON.stringify(item) } })}
//         activeOpacity={0.7}
//       >
//         {/* En-tête */}
//         <View style={styles.cardHeader}>
//           <View style={styles.cardHeaderLeft}>
//             <View style={[styles.simIconContainer, { backgroundColor: statusInfo.color + "15" }]}>
//               <Ionicons name="cellular" size={28} color={statusInfo.color} />
//             </View>
//             <View style={styles.cardHeaderInfo}>
//               <Text style={styles.productName} numberOfLines={1}>
//                 {item.productName}
//               </Text>
//               <Text style={styles.footprint}>🌍 {item.footprint}</Text>
//             </View>
//           </View>
//           <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + "20" }]}>
//             <Ionicons name={statusInfo.icon as any} size={14} color={statusInfo.color} />
//             <Text style={[styles.statusText, { color: statusInfo.color }]}>
//               {statusInfo.label}
//             </Text>
//           </View>
//         </View>
// 
//         {/* ICCID */}
//         <Text style={styles.iccid} numberOfLines={1}>
//           ICCID: {item.iccid}
//         </Text>
// 
//         {/* Données */}
//         {item.status === "INSTALLED" && (
//           <>
//             <View style={styles.dataRow}>
//               <View style={styles.dataItem}>
//                 <Text style={styles.dataLabel}>Utilisé</Text>
//                 <Text style={styles.dataValue}>{formatData(item.dataUsed)}</Text>
//               </View>
//               <View style={styles.dataItem}>
//                 <Text style={styles.dataLabel}>Total</Text>
//                 <Text style={styles.dataValue}>{formatData(item.dataLimit)}</Text>
//               </View>
//               <View style={styles.dataItem}>
//                 <Text style={styles.dataLabel}>Reste</Text>
//                 <Text style={styles.dataValueRemaining}>
//                   {formatData({
//                     value: item.dataLimit.value - item.dataUsed.value,
//                     unit: item.dataLimit.unit,
//                   })}
//                 </Text>
//               </View>
//             </View>
// 
//             {/* Barre de progression */}
//             <View style={styles.progressBar}>
//               <View
//                 style={[
//                   styles.progressFill,
//                   { width: `${Math.min(usagePercent, 100)}%` },
//                   usagePercent > 80 && styles.progressFillWarning,
//                   usagePercent > 95 && styles.progressFillDanger,
//                 ]}
//               />
//             </View>
// 
//             {/* Expiration */}
//             {daysLeft && (
//               <View style={styles.expiryRow}>
//                 <Ionicons
//                   name="time-outline"
//                   size={14}
//                   color={daysLeft.includes("Expiré") ? "#FF4444" : "#6B7280"}
//                 />
//                 <Text
//                   style={[
//                     styles.expiryText,
//                     daysLeft.includes("Expiré") && styles.expiryTextDanger,
//                   ]}
//                 >
//                   {daysLeft}
//                 </Text>
//               </View>
//             )}
//           </>
//         )}
// 
//         {/* Action rapide */}
//         {item.status === "RELEASED" && (
//           <TouchableOpacity
//             style={styles.installButton}
//             onPress={() =>
//               router.push({
//                 pathname: "/(main)/(yamsa)/install",
//                 params: {
//                   iccid: item.iccid,
//                   productName: item.productName,
//                   lpaString: "mock_lpa_string",
//                 },
//               })
//             }
//           >
//             <Ionicons name="download-outline" size={18} color="#FFFFFF" />
//             <Text style={styles.installButtonText}>Installer maintenant</Text>
//           </TouchableOpacity>
//         )}
//         {item.status === "DOWNLOADED" && (
//           <TouchableOpacity
//             style={styles.installButton}
//             onPress={() =>
//               router.push({
//                 pathname: "/(main)/(yamsa)/install",
//                 params: {
//                   iccid: item.iccid,
//                   productName: item.productName,
//                   lpaString: "mock_lpa_string",
//                 },
//               })
//             }
//           >
//             <Ionicons name="download-outline" size={18} color="#FFFFFF" />
//             <Text style={styles.installButtonText}>Installer maintenant</Text>
//           </TouchableOpacity>
//         )}
// 
//         {item.status === "UNAVAILABLE" && (
//           <TouchableOpacity
//             style={styles.topupButton}
//             onPress={() => router.push("/(main)/(yamsa)/simA")}
//           >
//             <Ionicons name="add-circle-outline" size={18} color="#0066FF" />
//             <Text style={styles.topupButtonText}>Recharger</Text>
//           </TouchableOpacity>
//         )}
//       </TouchableOpacity>
//     );
//   };
// 
//   const renderHeader = () => (
//     <View style={styles.header}>
//       <View style={styles.headerTop}>
//         <Text style={styles.headerTitle}>📱 Mes Forfaits</Text>
//         <TouchableOpacity
//           style={styles.shopButton}
//           onPress={() => router.push("/(main)/(yamsa)/simA")}
//         >
//           <Ionicons name="cart-outline" size={22} color="#FFFFFF" />
//         </TouchableOpacity>
//       </View>
//       <Text style={styles.headerSubtitle}>
//         {esims.length} forfait{esims.length !== 1 ? "s" : ""} actif{esims.length !== 1 ? "s" : ""}
//       </Text>
//     </View>
//   );
// 
//   const renderEmpty = () => (
//     <View style={styles.emptyContainer}>
//       <Ionicons name="cellular" size={80} color="#D1D5DB" />
//       <Text style={styles.emptyTitle}>Aucune eSIM</Text>
//       <Text style={styles.emptyText}>
//         Vous n'avez pas encore de forfait eSIM.{"\n"}
//         Parcourez notre boutique pour trouver le forfait parfait !
//       </Text>
//       <TouchableOpacity
//         style={styles.browseButton}
//         onPress={() => router.push("/(main)/(yamsa)")}
//       >
//         <Ionicons name="cart-outline" size={20} color="#FFFFFF" />
//         <Text style={styles.browseButtonText}>Parcourir la boutique</Text>
//       </TouchableOpacity>
//     </View>
//   );
// 
//   if (isLoading && esims.length === 0) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#0066FF" />
//           <Text style={styles.loadingText}>Chargement de vos eSIM...</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }
// 
//   return (
//     <SafeAreaView style={styles.container}>
//       <FlatList
//         data={esims}
//         keyExtractor={(item) => item.iccid}
//         renderItem={renderESIMCard}
//         ListHeaderComponent={renderHeader}
//         ListEmptyComponent={renderEmpty}
//         contentContainerStyle={esims.length === 0 ? styles.emptyList : styles.listContent}
//         showsVerticalScrollIndicator={false}
//         refreshControl={
//           <RefreshControl
//             refreshing={isRefreshing}
//             onRefresh={handleRefresh}
//             colors={["#0066FF"]}
//             tintColor="#0066FF"
//           />
//         }
//       />
//     </SafeAreaView>
//   );
// }
// 
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f3f2f1",
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   loadingText: {
//     marginTop: 12,
//     fontSize: 16,
//     color: "#6B7280",
//   },
//   listContent: {
//     paddingBottom: 20,
//   },
//   emptyList: {
//     flexGrow: 1,
//   },
//   // Header
//   header: {
//     paddingHorizontal: 20,
//     paddingTop: 16,
//     paddingBottom: 12,
//   },
//   headerTop: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: "700",
//     color: "#1A1D26",
//   },
//   shopButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: "#f87305ff",
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     color: "white",
//     fontWeight:"bold",
//     marginTop: 4,
//     backgroundColor:"#1d73bd",
//     justifyContent:"center",
//     textAlign:"center",
//     width:"50%",
//     margin:"auto",
//     borderRadius:7,
//     paddingVertical:4
//   },
//   // Carte eSIM
//   esimCard: {
//     backgroundColor: "#FFFFFF",
//     marginHorizontal: 16,
//     borderRadius: 16,
//     padding: 16,
//     marginBottom: 12,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.06,
//     shadowRadius: 8,
//     elevation: 2,
//     borderWidth: 1,
//     borderColor: "#F0F2F5",
//   },
//   cardHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "flex-start",
//     marginBottom: 8,
//   },
//   cardHeaderLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//     flex: 1,
//     marginRight: 12,
//   },
//   simIconContainer: {
//     width: 48,
//     height: 48,
//     borderRadius: 12,
//     justifyContent: "center",
//     alignItems: "center",
//     marginRight: 12,
//   },
//   cardHeaderInfo: {
//     flex: 1,
//   },
//   productName: {
//     fontSize: 16,
//     fontWeight: "600",
//     color: "#1A1D26",
//   },
//   footprint: {
//     fontSize: 12,
//     color: "#6B7280",
//     marginTop: 2,
//   },
//   statusBadge: {
//     flexDirection: "row",
//     alignItems: "center",
//     paddingHorizontal: 10,
//     paddingVertical: 5,
//     borderRadius: 12,
//     gap: 4,
//   },
//   statusText: {
//     fontSize: 12,
//     fontWeight: "600",
//   },
//   iccid: {
//     fontSize: 12,
//     color: "#9CA3AF",
//     fontFamily: "monospace",
//     marginBottom: 12,
//   },
//   // Données
//   dataRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 12,
//   },
//   dataItem: {
//     alignItems: "center",
//     flex: 1,
//   },
//   dataLabel: {
//     fontSize: 12,
//     color: "#9CA3AF",
//     marginBottom: 4,
//   },
//   dataValue: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#1A1D26",
//   },
//   dataValueRemaining: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: "#00CC88",
//   },
//   progressBar: {
//     height: 6,
//     backgroundColor: "#F0F2F5",
//     borderRadius: 3,
//     overflow: "hidden",
//     marginBottom: 8,
//   },
//   progressFill: {
//     height: "100%",
//     backgroundColor: "#00CC88",
//     borderRadius: 3,
//   },
//   progressFillWarning: {
//     backgroundColor: "#FF9800",
//   },
//   progressFillDanger: {
//     backgroundColor: "#FF4444",
//   },
//   expiryRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     gap: 4,
//   },
//   expiryText: {
//     fontSize: 12,
//     color: "#6B7280",
//   },
//   expiryTextDanger: {
//     color: "#FF4444",
//     fontWeight: "600",
//   },
//   // Boutons d'action
//   installButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#0066FF",
//     paddingVertical: 12,
//     borderRadius: 10,
//     gap: 8,
//     marginTop: 8,
//   },
//   installButtonText: {
//     color: "#FFFFFF",
//     fontSize: 15,
//     fontWeight: "600",
//   },
//   topupButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     justifyContent: "center",
//     backgroundColor: "#EBF0FF",
//     paddingVertical: 12,
//     borderRadius: 10,
//     gap: 8,
//     marginTop: 8,
//   },
//   topupButtonText: {
//     color: "#0066FF",
//     fontSize: 15,
//     fontWeight: "600",
//   },
//   // Vide
//   emptyContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     paddingHorizontal: 40,
//   },
//   emptyTitle: {
//     fontSize: 20,
//     fontWeight: "700",
//     color: "#1A1D26",
//     marginTop: 16,
//   },
//   emptyText: {
//     fontSize: 15,
//     color: "#6B7280",
//     textAlign: "center",
//     marginTop: 8,
//     lineHeight: 22,
//   },
//   browseButton: {
//     flexDirection: "row",
//     alignItems: "center",
//     backgroundColor: "#f87305ff",
//     paddingHorizontal: 24,
//     paddingVertical: 14,
//     borderRadius: 12,
//     marginTop: 24,
//     gap: 8,
//   },
//   browseButtonText: {
//     color: "#FFFFFF",
//     fontSize: 16,
//     fontWeight: "600",
//   },
// });

import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { esimAPI, MyESIM, MyESIMsResponse } from "../../../services/api";

// ==================== MOCK DATA ====================
const MOCK_ESIMS: MyESIM[] = [
  {
    id: "mock-1",
    iccid: "8932145678901234567",
    productId: "prod-1",
    productName: "Europe Explorer 5Go",
    status: "INSTALLED",
    dataLimit: { value: 5, unit: "GB" },
    dataUsed: { value: 3.2, unit: "GB" },
    duration: { value: 30, unit: "DAYS" },
    footprint: "EUROPE",
    country: "France",
    activatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
    deviceInfo: { platform: "ios", model: "iPhone 15 Pro" },
  },
  {
    id: "mock-2",
    iccid: "8932145678901234568",
    productId: "prod-2",
    productName: "USA Premium 20Go",
    status: "RELEASED",
    lpaString: "LPA:1$smdp.example.com$MOCK123456",
    qrCodeUrl: "https://example.com/qr/mock",
    dataLimit: { value: 20, unit: "GB" },
    dataUsed: { value: 0, unit: "GB" },
    duration: { value: 15, unit: "DAYS" },
    footprint: "US",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mock-3",
    iccid: "8932145678905234568",
    productId: "prod-3",
    productName: "Asia Connect 60Go",
    status: "UNAVAILABLE",
    dataLimit: { value: 60, unit: "GB" },
    dataUsed: { value: 60, unit: "GB" },
    duration: { value: 30, unit: "DAYS" },
    footprint: "GLOBAL",
    activatedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    expiresAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "mock-4",
    iccid: "8932145678900234568",
    productId: "prod-4",
    productName: "UK Express 1Go",
    status: "PENDING",
    dataLimit: { value: 1, unit: "GB" },
    dataUsed: { value: 0, unit: "GB" },
    duration: { value: 7, unit: "DAYS" },
    footprint: "GB",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const MOCK_ESIM_STATUS: Record<string, { status: string }> = {
  "8932145678901234567": { status: "INSTALLED" },
  "8932145678901234568": { status: "RELEASED" },
  "8932145678905234568": { status: "UNAVAILABLE" },
  "8932145678900234568": { status: "PENDING" },
};

// Configuration mock
const USE_MOCK = true; // Passer à false quand l'API est prête
const MOCK_DELAY = 800; // Délai simulé en ms

// ==================== STATUS CONFIG ====================
const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  PENDING: { label: "En attente", color: "#FFAA00", icon: "time-outline" },
  RELEASED: { label: "Prête à télécharger", color: "#0066FF", icon: "download-outline" },
  DOWNLOADED: { label: "Téléchargée", color: "#0066FF", icon: "cloud-done-outline" },
  INSTALLED: { label: "Active", color: "#00CC88", icon: "checkmark-circle" },
  UNAVAILABLE: { label: "Épuisée", color: "#FF4444", icon: "alert-circle-outline" },
  EXPIRED: { label: "Expirée", color: "#FF4444", icon: "close-circle-outline" },
  FAILED: { label: "Échec", color: "#FF4444", icon: "warning-outline" },
};

export default function MyESIMsScreen() {
  const router = useRouter();
  const [esims, setESims] = useState<MyESIM[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    loadESIMs();
  }, []);

  const loadESIMs = useCallback(async () => {
    setIsLoading(esims.length === 0);
    setError(null);

    if (USE_MOCK) {
      // ✅ MODE MOCK
      await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
      setESims(MOCK_ESIMS);
      setUsingMock(true);
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    // ✅ MODE API RÉELLE
    try {
      const response = await esimAPI.getMyESIMs();
      setESims(response.esims);
      setUsingMock(false);
    } catch (err: any) {
      console.warn("⚠️ API indisponible, utilisation des données mock");
      await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
      setESims(MOCK_ESIMS);
      setUsingMock(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadESIMs();
  };

  const handleCheckStatus = async (iccid: string) => {
    if (USE_MOCK || usingMock) {
      // ✅ MOCK
      const mockStatus = MOCK_ESIM_STATUS[iccid];
      if (mockStatus) {
        setESims((prev) =>
          prev.map((esim) =>
            esim.iccid === iccid
              ? { ...esim, status: mockStatus.status as MyESIM["status"] }
              : esim
          )
        );
      }
      return;
    }

    // ✅ API RÉELLE
    try {
      const statusResponse = await esimAPI.getESIMStatus(iccid);
      setESims((prev) =>
        prev.map((esim) =>
          esim.iccid === iccid
            ? { ...esim, status: statusResponse.status as MyESIM["status"] }
            : esim
        )
      );
    } catch (err: any) {
      console.error("Erreur vérification statut:", err);
    }
  };

  const formatData = (data: { value: number; unit: string }): string => {
    if (data.unit === "GB" || (data.unit === "MB" && data.value >= 1000)) {
      return `${(data.value / (data.unit === "MB" ? 1000 : 1)).toFixed(1)} Go`;
    }
    return `${data.value} ${data.unit}`;
  };

  const getDaysLeft = (expiresAt?: string): string => {
    if (!expiresAt) return "";
    const days = Math.ceil(
      (new Date(expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    if (days <= 0) return "Expiré";
    if (days === 1) return "1 jour restant";
    return `${days} jours restants`;
  };

  const getUsagePercent = (esim: MyESIM): number => {
    if (esim.dataLimit.value <= 0) return 0;
    return (esim.dataUsed.value / esim.dataLimit.value) * 100;
  };

  const renderESIMCard = ({ item }: { item: MyESIM }) => {
    const statusInfo = STATUS_CONFIG[item.status] || STATUS_CONFIG.PENDING;
    const usagePercent = getUsagePercent(item);
    const daysLeft = getDaysLeft(item.expiresAt);

    return (
      <TouchableOpacity
        style={styles.esimCard}
        // onPress={() => {
        //   handleCheckStatus(item.iccid);
        //   router.push({
        //     pathname: "/(main)/(yamsa)/[iccid]",
        //     params: { iccid: item.iccid },
        //   });
        // }}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={[styles.simIconContainer, { backgroundColor: statusInfo.color + "15" }]}>
              <Ionicons name="cellular" size={28} color={statusInfo.color} />
            </View>
            <View style={styles.cardHeaderInfo}>
              <Text style={styles.productName} numberOfLines={1}>{item.productName}</Text>
              <Text style={styles.footprint}>🌍 {item.footprint}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + "20" }]}>
            <Ionicons name={statusInfo.icon as any} size={14} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
        </View>

        <Text style={styles.iccid} numberOfLines={1}>ICCID: {item.iccid}</Text>

        {item.status === "INSTALLED" && (
          <>
            <View style={styles.dataRow}>
              <View style={styles.dataItem}>
                <Text style={styles.dataLabel}>Utilisé</Text>
                <Text style={styles.dataValue}>{formatData(item.dataUsed)}</Text>
              </View>
              <View style={styles.dataItem}>
                <Text style={styles.dataLabel}>Total</Text>
                <Text style={styles.dataValue}>{formatData(item.dataLimit)}</Text>
              </View>
              <View style={styles.dataItem}>
                <Text style={styles.dataLabel}>Reste</Text>
                <Text style={styles.dataValueRemaining}>
                  {formatData({ value: item.dataLimit.value - item.dataUsed.value, unit: item.dataLimit.unit })}
                </Text>
              </View>
            </View>

            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${Math.min(usagePercent, 100)}%` }, usagePercent > 80 && styles.progressFillWarning, usagePercent > 95 && styles.progressFillDanger]} />
            </View>

            {daysLeft && (
              <View style={styles.expiryRow}>
                <Ionicons name="time-outline" size={14} color={daysLeft.includes("Expiré") ? "#FF4444" : "#6B7280"} />
                <Text style={[styles.expiryText, daysLeft.includes("Expiré") && styles.expiryTextDanger]}>{daysLeft}</Text>
              </View>
            )}
          </>
        )}

        {(item.status === "RELEASED" || item.status === "DOWNLOADED") && (
          <TouchableOpacity
            style={styles.installButton}
            onPress={() => router.push({ pathname: "/(main)/(yamsa)/install", params: { iccid: item.iccid, productName: item.productName, lpaString: item.lpaString || "LPA:1$smdp.example.com$MOCK" } })}
          >
            <Ionicons name="download-outline" size={18} color="#FFFFFF" />
            <Text style={styles.installButtonText}>Installer maintenant</Text>
          </TouchableOpacity>
        )}

        {item.status === "UNAVAILABLE" && (
          <TouchableOpacity style={styles.topupButton} onPress={() => router.push("/(main)/(yamsa)/simA")}>
            <Ionicons name="add-circle-outline" size={18} color="#0066FF" />
            <Text style={styles.topupButtonText}>Recharger</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.headerTitle}>📱 Mes Forfaits</Text>
        <TouchableOpacity style={styles.shopButton} onPress={() => router.push("/(main)/(yamsa)/simA")}>
          <Ionicons name="cart-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
      {usingMock && (
        <View style={styles.mockBadge}>
          <Text style={styles.mockBadgeText}>🟡 Mode démo - Données simulées</Text>
        </View>
      )}
      <Text style={styles.headerSubtitle}>{esims.length} forfait{esims.length !== 1 ? "s" : ""} actif{esims.length !== 1 ? "s" : ""}</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cellular" size={80} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>Aucune eSIM</Text>
      <Text style={styles.emptyText}>Vous n'avez pas encore de forfait eSIM.{"\n"}Parcourez notre boutique pour trouver le forfait parfait !</Text>
      <TouchableOpacity style={styles.browseButton} onPress={() => router.push("/(main)/(yamsa)/simA")}>
        <Ionicons name="cart-outline" size={20} color="#FFFFFF" />
        <Text style={styles.browseButtonText}>Parcourir la boutique</Text>
      </TouchableOpacity>
    </View>
  );

  if (error && esims.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF4444" />
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadESIMs}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading && esims.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066FF" />
          <Text style={styles.loadingText}>Chargement de vos eSIM...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={esims}
        keyExtractor={(item) => item.iccid}
        renderItem={renderESIMCard}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={esims.length === 0 ? styles.emptyList : styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={["#0066FF"]} tintColor="#0066FF" />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#bdbbb0" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  errorMessage: { fontSize: 16, color: "#FF4444", textAlign: "center", marginTop: 12 },
  retryButton: { marginTop: 20, backgroundColor: "#0066FF", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 16, color: "#6B7280" },
  listContent: { paddingBottom: 20 },
  emptyList: { flexGrow: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { fontSize: 28, fontWeight: "700", color: "#1A1D26" },
  shopButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#f87305ff", justifyContent: "center", alignItems: "center" },
  mockBadge: { backgroundColor: "#FFF3E0", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: "center", marginTop: 8 },
  mockBadgeText: { fontSize: 12, fontWeight: "600", color: "#FF9800" },
  headerSubtitle: { fontSize: 14, color: "white", fontWeight: "bold", marginTop: 4, backgroundColor: "#1d73bd", justifyContent: "center", textAlign: "center", width: "50%", margin: "auto", borderRadius: 7, paddingVertical: 4 },
  esimCard: { backgroundColor: "#FFFFFF", marginHorizontal: 16, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2, borderWidth: 1, borderColor: "#F0F2F5" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  cardHeaderLeft: { flexDirection: "row", alignItems: "center", flex: 1, marginRight: 12 },
  simIconContainer: { width: 48, height: 48, borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 12 },
  cardHeaderInfo: { flex: 1 },
  productName: { fontSize: 16, fontWeight: "600", color: "#1A1D26" },
  footprint: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  statusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, gap: 4 },
  statusText: { fontSize: 12, fontWeight: "600" },
  iccid: { fontSize: 12, color: "#9CA3AF", fontFamily: "monospace", marginBottom: 12 },
  dataRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  dataItem: { alignItems: "center", flex: 1 },
  dataLabel: { fontSize: 12, color: "#9CA3AF", marginBottom: 4 },
  dataValue: { fontSize: 18, fontWeight: "700", color: "#1A1D26" },
  dataValueRemaining: { fontSize: 18, fontWeight: "700", color: "#00CC88" },
  progressBar: { height: 6, backgroundColor: "#F0F2F5", borderRadius: 3, overflow: "hidden", marginBottom: 8 },
  progressFill: { height: "100%", backgroundColor: "#00CC88", borderRadius: 3 },
  progressFillWarning: { backgroundColor: "#FF9800" },
  progressFillDanger: { backgroundColor: "#FF4444" },
  expiryRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 4 },
  expiryText: { fontSize: 12, color: "#6B7280" },
  expiryTextDanger: { color: "#FF4444", fontWeight: "600" },
  installButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#0066FF", paddingVertical: 12, borderRadius: 10, gap: 8, marginTop: 8 },
  installButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },
  topupButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#EBF0FF", paddingVertical: 12, borderRadius: 10, gap: 8, marginTop: 8 },
  topupButtonText: { color: "#0066FF", fontSize: 15, fontWeight: "600" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 40 },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: "#1A1D26", marginTop: 16 },
  emptyText: { fontSize: 15, color: "#6B7280", textAlign: "center", marginTop: 8, lineHeight: 22 },
  browseButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#f87305ff", paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, marginTop: 24, gap: 8 },
  browseButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});