// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TouchableOpacity,
//   ActivityIndicator,
//   Alert,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useRouter, useLocalSearchParams } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
// import { MaterialCommunityIcons } from "@expo/vector-icons";
// 
// export default function ProductDetailScreen() {
//   const router = useRouter();
//   const { product: productJson } = useLocalSearchParams<{ product: string }>();
//   const product = productJson ? JSON.parse(productJson) : null;
// 
//   const [isPurchasing, setIsPurchasing] = useState(false);
//   const [quantity, setQuantity] = useState(1);
// 
//   if (!product) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.center}>
//           <Text style={styles.errorText}>Produit non trouvé</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }
// 
//   const handlePurchase = async () => {
//     setIsPurchasing(true);
//     try {
//       // TODO: Appeler votre API
//       await new Promise((resolve) => setTimeout(resolve, 2000));
// 
//       router.push({
//         pathname: "/(main)/(yamsa)/install",
//         params: {
//           iccid: `89321${Date.now()}`,
//           productName: product.name,
//           lpaString: "LPA:1$smdp.example.com$XXXXXXXXXXXX",
//         },
//       });
//     } catch (error: any) {
//       Alert.alert("Erreur", error.message || "Échec de la commande");
//     } finally {
//       setIsPurchasing(false);
//     }
//   };
// 
//   const formatData = (v: number, u: string) =>
//     u === "GB" ? `${v} Go` : u === "MB" && v >= 1000 ? `${(v / 1000).toFixed(1)} Go` : `${v} ${u}`;
// 
//   const total = product.price.value * quantity;
// 
//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
//         {/* Hero */}
//         <View style={styles.hero}>
//           <View style={styles.heroIcon}>
//             <MaterialCommunityIcons name="sim-outline" size={48} color="#f87305ff" />
//           </View>
//           <Text style={styles.productName}>{product.name}</Text>
//           <View style={styles.footprintRow}>
//             <Text style={styles.footprintText}>🌍 {product.footprint}</Text>
//           </View>
//         </View>
// 
//         {/* Caractéristiques */}
//         <View style={styles.card}>
//           <Text style={styles.sectionTitle}>Caractéristiques</Text>
//           {[
//             { icon: "cellular-outline", color: "#f87305ff", label: "Volume", value: formatData(product.data.value, product.data.unit) },
//             { icon: "time-outline", color: "#00CC88", label: "Durée", value: `${product.duration.value} jours` },
//             { icon: "globe-outline", color: "#FF9800", label: "Couverture", value: product.footprint },
//             { icon: "wifi-outline", color: "#9C27B0", label: "Réseau", value: "4G / 5G" },
//           ].map((f, i) => (
//             <View key={i}>
//               {i > 0 && <View style={styles.divider} />}
//               <View style={styles.featureRow}>
//                 <View style={[styles.featureIcon, { backgroundColor: f.color + "15" }]}>
//                   <Ionicons name={f.icon as any} size={22} color={f.color} />
//                 </View>
//                 <View style={styles.featureInfo}>
//                   <Text style={styles.featureLabel}>{f.label}</Text>
//                   <Text style={styles.featureValue}>{f.value}</Text>
//                 </View>
//               </View>
//             </View>
//           ))}
//         </View>
// 
//         {/* Quantité */}
//         <View style={styles.card}>
//           <Text style={styles.sectionTitle}>Quantité</Text>
//           <View style={styles.quantityRow}>
//             <TouchableOpacity
//               style={[styles.qtyBtn, quantity <= 1 && styles.qtyBtnDisabled]}
//               onPress={() => setQuantity(Math.max(1, quantity - 1))}
//               disabled={quantity <= 1}
//             >
//               <Ionicons name="remove" size={22} color={quantity <= 1 ? "#D1D5DB" : "#f87305ff"} />
//             </TouchableOpacity>
//             <Text style={styles.qtyValue}>{quantity}</Text>
//             <TouchableOpacity
//               style={[styles.qtyBtn, quantity >= 10 && styles.qtyBtnDisabled]}
//               onPress={() => setQuantity(Math.min(10, quantity + 1))}
//               disabled={quantity >= 10}
//             >
//               <Ionicons name="add" size={22} color={quantity >= 10 ? "#D1D5DB" : "#f87305ff"} />
//             </TouchableOpacity>
//           </View>
//         </View>
// 
//         {/* Résumé */}
//         <View style={styles.card}>
//           <Text style={styles.sectionTitle}>Résumé</Text>
//           <View style={styles.summaryRow}>
//             <Text style={styles.summaryLabel}>{product.name} x{quantity}</Text>
//             <Text style={styles.summaryValue}>{(product.price.value * quantity).toFixed(2)} €</Text>
//           </View>
//           <View style={styles.divider} />
//           <View style={styles.summaryRow}>
//             <Text style={styles.summaryTotalLabel}>Total</Text>
//             <Text style={styles.summaryTotalValue}>{total.toFixed(2)} €</Text>
//           </View>
//         </View>
// 
//         {/* Inclus */}
//         <View style={styles.card}>
//           <Text style={styles.sectionTitle}>✅ Inclus</Text>
//           {["Installation automatique", "Support 24/7", "Activation instantanée", "Sans frais cachés"].map((text, i) => (
//             <View key={i} style={styles.includeItem}>
//               <Ionicons name="checkmark-circle" size={18} color="#00CC88" />
//               <Text style={styles.includeText}>{text}</Text>
//             </View>
//           ))}
//         </View>
//       </ScrollView>
// 
//       {/* Bottom bar */}
//       <View style={styles.bottomBar}>
//         <View style={styles.bottomPrice}>
//           <Text style={styles.bottomPriceLabel}>Total</Text>
//           <Text style={styles.bottomPriceValue}>{total.toFixed(2)} €</Text>
//         </View>
//         <TouchableOpacity
//           style={[styles.purchaseButton, isPurchasing && styles.purchaseButtonDisabled]}
//           onPress={handlePurchase}
//           disabled={isPurchasing}
//         >
//           {isPurchasing ? (
//             <ActivityIndicator color="#FFFFFF" size="small" />
//           ) : (
//             <>
//               <Text style={styles.purchaseButtonText}>Acheter</Text>
//               <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
//             </>
//           )}
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }
// 
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#F5F7FA" },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   errorText: { fontSize: 16, color: "#FF4444" },
//   scrollContent: { paddingBottom: 120 },
//   hero: { alignItems: "center", paddingVertical: 24, paddingHorizontal: 20 },
//   heroIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#FFF3E0", justifyContent: "center", alignItems: "center", marginBottom: 12 },
//   productName: { fontSize: 22, fontWeight: "700", color: "#1A1D26", textAlign: "center" },
//   footprintRow: { marginTop: 6, backgroundColor: "#F0F2F5", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
//   footprintText: { fontSize: 13, fontWeight: "600", color: "#374151" },
//   card: { backgroundColor: "#FFFFFF", marginHorizontal: 16, borderRadius: 16, padding: 18, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
//   sectionTitle: { fontSize: 15, fontWeight: "600", color: "#1A1D26", marginBottom: 14 },
//   featureRow: { flexDirection: "row", alignItems: "center" },
//   featureIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 12 },
//   featureInfo: { flex: 1 },
//   featureLabel: { fontSize: 12, color: "#9CA3AF" },
//   featureValue: { fontSize: 15, fontWeight: "600", color: "#1A1D26" },
//   divider: { height: 1, backgroundColor: "#F0F2F5", marginVertical: 10 },
//   quantityRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 20 },
//   qtyBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F5F7FA", justifyContent: "center", alignItems: "center" },
//   qtyBtnDisabled: { opacity: 0.5 },
//   qtyValue: { fontSize: 22, fontWeight: "700", color: "#1A1D26", minWidth: 36, textAlign: "center" },
//   summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
//   summaryLabel: { fontSize: 14, color: "#6B7280" },
//   summaryValue: { fontSize: 14, fontWeight: "600", color: "#1A1D26" },
//   summaryTotalLabel: { fontSize: 16, fontWeight: "700", color: "#1A1D26" },
//   summaryTotalValue: { fontSize: 20, fontWeight: "700", color: "#f87305ff" },
//   includeItem: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
//   includeText: { fontSize: 13, color: "#374151", flex: 1 },
//   bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: 1, borderTopColor: "#F0F2F5", shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 10 },
//   bottomPrice: { flex: 1 },
//   bottomPriceLabel: { fontSize: 11, color: "#9CA3AF" },
//   bottomPriceValue: { fontSize: 20, fontWeight: "700", color: "#1A1D26" },
//   purchaseButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#f87305ff", paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, gap: 6 },
//   purchaseButtonDisabled: { opacity: 0.7 },
//   purchaseButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
// });
// import React, { useState } from "react";
// import {
//   View, Text, StyleSheet, ScrollView, TouchableOpacity,
//   ActivityIndicator, Alert,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useRouter, useLocalSearchParams } from "expo-router";
// import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
// import { esimAPI, ESIMOrderResult } from "../../../services/api";
// 
// // ==================== MOCK ====================
// const USE_MOCK = true;
// const MOCK_DELAY = 1500;
// 
// const MOCK_ORDER_RESULT: ESIMOrderResult = {
//   success: true,
//   message: "eSIM prête à être installée",
//   order: { id: "mock-order-123", status: "COMPLETED" },
//   esim: {
//     id: "mock-esim-123",
//     iccid: `89321${Date.now()}`,
//     lpaString: "LPA:1$smdp.example.com$MOCK-ORDER-123",
//     qrCodeUrl: "https://example.com/qr/mock-order",
//   },
// };
// 
// export default function ProductDetailScreen() {
//   const router = useRouter();
//   const { product: productJson } = useLocalSearchParams<{ product: string }>();
//   const product = productJson ? JSON.parse(productJson) : null;
//   const [isPurchasing, setIsPurchasing] = useState(false);
//   const [quantity, setQuantity] = useState(1);
//   const [error, setError] = useState<string | null>(null);
// 
//   if (!product) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.center}><Text style={styles.errorText}>Produit non trouvé</Text></View>
//       </SafeAreaView>
//     );
//   }
// 
//   const handlePurchase = async () => {
//     setIsPurchasing(true);
//     setError(null);
// 
//     if (USE_MOCK) {
//       // ✅ MODE MOCK
//       await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
//       const result = { ...MOCK_ORDER_RESULT, esim: { ...MOCK_ORDER_RESULT.esim, iccid: `89321${Date.now()}` } };
//       router.push({
//         pathname: "/(main)/(yamsa)/install",
//         params: { iccid: result.esim.iccid, productName: product.name, lpaString: result.esim.lpaString },
//       });
//       setIsPurchasing(false);
//       return;
//     }
// 
//     // ✅ MODE API RÉELLE
//     try {
//       const result = await esimAPI.createOrder(product.id);
//       router.push({
//         pathname: "/(main)/(yamsa)/install",
//         params: { iccid: result.esim.iccid, productName: product.name, lpaString: result.esim.lpaString },
//       });
//     } catch (err: any) {
//       const errorMsg = err.response?.data?.error || err.message || "Échec de la commande";
//       setError(errorMsg);
//       Alert.alert("Erreur de commande", errorMsg);
//     } finally {
//       setIsPurchasing(false);
//     }
//   };
// 
//   const formatData = (v: number, u: string) =>
//     u === "GB" ? `${v} Go` : u === "MB" && v >= 1000 ? `${(v / 1000).toFixed(1)} Go` : `${v} ${u}`;
// 
//   const total = product.price.value * quantity;
// 
//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
//         <View style={styles.hero}>
//           <View style={styles.heroIcon}><MaterialCommunityIcons name="sim-outline" size={48} color="#f87305ff" /></View>
//           <Text style={styles.productName}>{product.name}</Text>
//           <View style={styles.footprintRow}><Text style={styles.footprintText}>🌍 {product.footprint}</Text></View>
//         </View>
// 
//         <View style={styles.card}>
//           <Text style={styles.sectionTitle}>Caractéristiques</Text>
//           {[
//             { icon: "cellular-outline", color: "#f87305ff", label: "Volume", value: formatData(product.data.value, product.data.unit) },
//             { icon: "time-outline", color: "#00CC88", label: "Durée", value: `${product.duration.value} jours` },
//             { icon: "globe-outline", color: "#FF9800", label: "Couverture", value: product.footprint },
//             { icon: "wifi-outline", color: "#9C27B0", label: "Réseau", value: "4G / 5G" },
//           ].map((f, i) => (
//             <View key={i}>
//               {i > 0 && <View style={styles.divider} />}
//               <View style={styles.featureRow}>
//                 <View style={[styles.featureIcon, { backgroundColor: f.color + "15" }]}><Ionicons name={f.icon as any} size={22} color={f.color} /></View>
//                 <View style={styles.featureInfo}><Text style={styles.featureLabel}>{f.label}</Text><Text style={styles.featureValue}>{f.value}</Text></View>
//               </View>
//             </View>
//           ))}
//         </View>
// 
//         <View style={styles.card}>
//           <Text style={styles.sectionTitle}>Quantité</Text>
//           <View style={styles.quantityRow}>
//             <TouchableOpacity style={[styles.qtyBtn, quantity <= 1 && styles.qtyBtnDisabled]} onPress={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}>
//               <Ionicons name="remove" size={22} color={quantity <= 1 ? "#D1D5DB" : "#f87305ff"} />
//             </TouchableOpacity>
//             <Text style={styles.qtyValue}>{quantity}</Text>
//             <TouchableOpacity style={[styles.qtyBtn, quantity >= 10 && styles.qtyBtnDisabled]} onPress={() => setQuantity(Math.min(10, quantity + 1))} disabled={quantity >= 10}>
//               <Ionicons name="add" size={22} color={quantity >= 10 ? "#D1D5DB" : "#f87305ff"} />
//             </TouchableOpacity>
//           </View>
//         </View>
// 
//         <View style={styles.card}>
//           <Text style={styles.sectionTitle}>Résumé</Text>
//           <View style={styles.summaryRow}><Text style={styles.summaryLabel}>{product.name} x{quantity}</Text><Text style={styles.summaryValue}>{(product.price.value * quantity).toFixed(2)} €</Text></View>
//           <View style={styles.divider} />
//           <View style={styles.summaryRow}><Text style={styles.summaryTotalLabel}>Total</Text><Text style={styles.summaryTotalValue}>{total.toFixed(2)} €</Text></View>
//         </View>
// 
//         <View style={styles.card}>
//           <Text style={styles.sectionTitle}>✅ Inclus</Text>
//           {["Installation automatique", "Support 24/7", "Activation instantanée", "Sans frais cachés"].map((text, i) => (
//             <View key={i} style={styles.includeItem}><Ionicons name="checkmark-circle" size={18} color="#00CC88" /><Text style={styles.includeText}>{text}</Text></View>
//           ))}
//         </View>
// 
//         {error && (
//           <View style={styles.errorCard}><Ionicons name="warning-outline" size={20} color="#FF4444" /><Text style={styles.errorCardText}>{error}</Text></View>
//         )}
//       </ScrollView>
// 
//       <View style={styles.bottomBar}>
//         <View style={styles.bottomPrice}><Text style={styles.bottomPriceLabel}>Total</Text><Text style={styles.bottomPriceValue}>{total.toFixed(2)} €</Text></View>
//         <TouchableOpacity style={[styles.purchaseButton, isPurchasing && styles.purchaseButtonDisabled]} onPress={handlePurchase} disabled={isPurchasing} activeOpacity={0.8}>
//           {isPurchasing ? <ActivityIndicator color="#FFFFFF" size="small" /> : <><Text style={styles.purchaseButtonText}>Acheter</Text><Ionicons name="arrow-forward" size={18} color="#FFFFFF" /></>}
//         </TouchableOpacity>
//       </View>
//     </SafeAreaView>
//   );
// }
// 
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#F5F7FA" },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   errorText: { fontSize: 16, color: "#FF4444" },
//   scrollContent: { paddingBottom: 120 },
//   hero: { alignItems: "center", paddingVertical: 24, paddingHorizontal: 20 },
//   heroIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#FFF3E0", justifyContent: "center", alignItems: "center", marginBottom: 12 },
//   productName: { fontSize: 22, fontWeight: "700", color: "#1A1D26", textAlign: "center" },
//   footprintRow: { marginTop: 6, backgroundColor: "#F0F2F5", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
//   footprintText: { fontSize: 13, fontWeight: "600", color: "#374151" },
//   card: { backgroundColor: "#FFFFFF", marginHorizontal: 16, borderRadius: 16, padding: 18, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
//   sectionTitle: { fontSize: 15, fontWeight: "600", color: "#1A1D26", marginBottom: 14 },
//   featureRow: { flexDirection: "row", alignItems: "center" },
//   featureIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 12 },
//   featureInfo: { flex: 1 },
//   featureLabel: { fontSize: 12, color: "#9CA3AF" },
//   featureValue: { fontSize: 15, fontWeight: "600", color: "#1A1D26" },
//   divider: { height: 1, backgroundColor: "#F0F2F5", marginVertical: 10 },
//   quantityRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 20 },
//   qtyBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F5F7FA", justifyContent: "center", alignItems: "center" },
//   qtyBtnDisabled: { opacity: 0.5 },
//   qtyValue: { fontSize: 22, fontWeight: "700", color: "#1A1D26", minWidth: 36, textAlign: "center" },
//   summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
//   summaryLabel: { fontSize: 14, color: "#6B7280" },
//   summaryValue: { fontSize: 14, fontWeight: "600", color: "#1A1D26" },
//   summaryTotalLabel: { fontSize: 16, fontWeight: "700", color: "#1A1D26" },
//   summaryTotalValue: { fontSize: 20, fontWeight: "700", color: "#f87305ff" },
//   includeItem: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
//   includeText: { fontSize: 13, color: "#374151", flex: 1 },
//   errorCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFEBEE", marginHorizontal: 16, borderRadius: 12, padding: 14, marginBottom: 10, gap: 10 },
//   errorCardText: { flex: 1, fontSize: 14, color: "#FF4444" },
//   bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: 1, borderTopColor: "#F0F2F5", shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 10 },
//   bottomPrice: { flex: 1 },
//   bottomPriceLabel: { fontSize: 11, color: "#9CA3AF" },
//   bottomPriceValue: { fontSize: 20, fontWeight: "700", color: "#1A1D26" },
//   purchaseButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#f87305ff", paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, gap: 6 },
//   purchaseButtonDisabled: { opacity: 0.7 },
//   purchaseButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
// });

import React, { useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function ProductDetailScreen() {
  const router = useRouter();
  const { product: productJson } = useLocalSearchParams<{ product: string }>();
  const product = productJson ? JSON.parse(productJson) : null;
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}><Text style={styles.errorText}>Produit non trouvé</Text></View>
      </SafeAreaView>
    );
  }

  // ✅ Rediriger vers l'écran de paiement
  const handleGoToPayment = () => {
    router.push({
      pathname: "/(main)/(yamsa)/payment",
      params: {
        product: JSON.stringify(product),
        quantity: String(quantity),
      },
    });
  };

  const formatData = (v: number, u: string) =>
    u === "GB" ? `${v} Go` : u === "MB" && v >= 1000 ? `${(v / 1000).toFixed(1)} Go` : `${v} ${u}`;

  const total = product.price.value * quantity;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons name="sim-outline" size={48} color="#f87305ff" />
          </View>
          <Text style={styles.productName}>{product.name}</Text>
          <View style={styles.footprintRow}>
            <Text style={styles.footprintText}>🌍 {product.footprint}</Text>
          </View>
        </View>

        {/* Caractéristiques */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Caractéristiques</Text>
          {[
            { icon: "cellular-outline", color: "#f87305ff", label: "Volume", value: formatData(product.data.value, product.data.unit) },
            { icon: "time-outline", color: "#00CC88", label: "Durée", value: `${product.duration.value} jours` },
            { icon: "globe-outline", color: "#FF9800", label: "Couverture", value: product.footprint },
            { icon: "wifi-outline", color: "#9C27B0", label: "Réseau", value: "4G / 5G" },
          ].map((f, i) => (
            <View key={i}>
              {i > 0 && <View style={styles.divider} />}
              <View style={styles.featureRow}>
                <View style={[styles.featureIcon, { backgroundColor: f.color + "15" }]}>
                  <Ionicons name={f.icon as any} size={22} color={f.color} />
                </View>
                <View style={styles.featureInfo}>
                  <Text style={styles.featureLabel}>{f.label}</Text>
                  <Text style={styles.featureValue}>{f.value}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Quantité */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Quantité</Text>
          <View style={styles.quantityRow}>
            <TouchableOpacity
              style={[styles.qtyBtn, quantity <= 1 && styles.qtyBtnDisabled]}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              <Ionicons name="remove" size={22} color={quantity <= 1 ? "#D1D5DB" : "#f87305ff"} />
            </TouchableOpacity>
            <Text style={styles.qtyValue}>{quantity}</Text>
            <TouchableOpacity
              style={[styles.qtyBtn, quantity >= 10 && styles.qtyBtnDisabled]}
              onPress={() => setQuantity(Math.min(10, quantity + 1))}
              disabled={quantity >= 10}
            >
              <Ionicons name="add" size={22} color={quantity >= 10 ? "#D1D5DB" : "#f87305ff"} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Résumé */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Résumé</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>{product.name} x{quantity}</Text>
            <Text style={styles.summaryValue}>{(product.price.value * quantity).toFixed(2)} €</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>{total.toFixed(2)} €</Text>
          </View>
        </View>

        {/* Inclus */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>✅ Inclus</Text>
          {["Installation automatique", "Support 24/7", "Activation instantanée", "Sans frais cachés"].map((text, i) => (
            <View key={i} style={styles.includeItem}>
              <Ionicons name="checkmark-circle" size={18} color="#00CC88" />
              <Text style={styles.includeText}>{text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* ✅ Bouton Payer → Redirige vers payment.tsx */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomPrice}>
          <Text style={styles.bottomPriceLabel}>Total</Text>
          <Text style={styles.bottomPriceValue}>{total.toFixed(2)} €</Text>
        </View>
        <TouchableOpacity
          style={styles.purchaseButton}
          onPress={handleGoToPayment}
          activeOpacity={0.8}
        >
          <Ionicons name="wallet-outline" size={20} color="#FFFFFF" />
          <Text style={styles.purchaseButtonText}>Acheter</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#bdbbb0" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: "#FF4444" },
  scrollContent: { paddingBottom: 120 },
  hero: { alignItems: "center", paddingVertical: 24, paddingHorizontal: 20 },
  heroIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#FFF3E0", justifyContent: "center", alignItems: "center", marginBottom: 12 },
  productName: { fontSize: 22, fontWeight: "700", color: "#1A1D26", textAlign: "center" },
  footprintRow: { marginTop: 6, backgroundColor: "#F0F2F5", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8 },
  footprintText: { fontSize: 13, fontWeight: "600", color: "#374151" },
  card: { backgroundColor: "#FFFFFF", marginHorizontal: 16, borderRadius: 16, padding: 18, marginBottom: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  sectionTitle: { fontSize: 15, fontWeight: "600", color: "#1A1D26", marginBottom: 14 },
  featureRow: { flexDirection: "row", alignItems: "center" },
  featureIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 12 },
  featureInfo: { flex: 1 },
  featureLabel: { fontSize: 12, color: "#9CA3AF" },
  featureValue: { fontSize: 15, fontWeight: "600", color: "#1A1D26" },
  divider: { height: 1, backgroundColor: "#F0F2F5", marginVertical: 10 },
  quantityRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 20 },
  qtyBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F5F7FA", justifyContent: "center", alignItems: "center" },
  qtyBtnDisabled: { opacity: 0.5 },
  qtyValue: { fontSize: 22, fontWeight: "700", color: "#1A1D26", minWidth: 36, textAlign: "center" },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  summaryLabel: { fontSize: 14, color: "#6B7280" },
  summaryValue: { fontSize: 14, fontWeight: "600", color: "#1A1D26" },
  summaryTotalLabel: { fontSize: 16, fontWeight: "700", color: "#1A1D26" },
  summaryTotalValue: { fontSize: 20, fontWeight: "700", color: "#f87305ff" },
  includeItem: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 },
  includeText: { fontSize: 13, color: "#374151", flex: 1 },
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#FFFFFF", flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14, borderTopWidth: 1, borderTopColor: "#F0F2F5", shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 10 },
  bottomPrice: { flex: 1 },
  bottomPriceLabel: { fontSize: 11, color: "#9CA3AF" },
  bottomPriceValue: { fontSize: 20, fontWeight: "700", color: "#1A1D26" },
  purchaseButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#f87305ff", paddingHorizontal: 24, paddingVertical: 14, borderRadius: 12, gap: 8 },
  purchaseButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
});