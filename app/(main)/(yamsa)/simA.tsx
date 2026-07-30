// import React, { useState } from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   TextInput,
//   ActivityIndicator,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useRouter } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
// 
// interface ESIMProduct {
//   id: string;
//   name: string;
//   data: { value: number; unit: string };
//   duration: { value: number; unit: string };
//   footprint: string;
//   price: { value: number; currency: string };
// }
// 
// const MOCK_PRODUCTS: ESIMProduct[] = [
//   { id: "1", name: "Europe Explorer 5Go", data: { value: 5, unit: "GB" }, duration: { value: 30, unit: "DAYS" }, footprint: "EUROPE", price: { value: 19.99, currency: "EUR" } },
//   { id: "2", name: "Global Traveler 10Go", data: { value: 10, unit: "GB" }, duration: { value: 30, unit: "DAYS" }, footprint: "GLOBAL", price: { value: 34.99, currency: "EUR" } },
//   { id: "3", name: "USA Premium 20Go", data: { value: 20, unit: "GB" }, duration: { value: 15, unit: "DAYS" }, footprint: "US", price: { value: 29.99, currency: "EUR" } },
//   { id: "4", name: "France Local 50Go", data: { value: 50, unit: "GB" }, duration: { value: 30, unit: "DAYS" }, footprint: "FR", price: { value: 24.99, currency: "EUR" } },
//   { id: "5", name: "Asia Connect 3Go", data: { value: 3, unit: "GB" }, duration: { value: 7, unit: "DAYS" }, footprint: "GLOBAL", price: { value: 9.99, currency: "EUR" } },
// ];
// 
// const FOOTPRINTS = [
//   { label: "🌍 Tous", value: "" },
//   { label: "🇪🇺 Europe", value: "EUROPE" },
//   { label: "🌎 Global", value: "GLOBAL" },
//   { label: "🇺🇸 USA", value: "US" },
//   { label: "🇫🇷 France", value: "FR" },
// ];
// 
// export default function ShopScreen() {
//   const router = useRouter();
//   const [search, setSearch] = useState("");
//   const [selectedFootprint, setSelectedFootprint] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
// 
//   const filteredProducts = MOCK_PRODUCTS.filter((p) => {
//     if (selectedFootprint && p.footprint !== selectedFootprint) return false;
//     if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
//     return true;
//   });
// 
//   const formatData = (v: number, u: string) =>
//     u === "GB" ? `${v} Go` : u === "MB" && v >= 1000 ? `${(v / 1000).toFixed(1)} Go` : `${v} ${u}`;
// 
//   const renderProduct = ({ item }: { item: ESIMProduct }) => (
//     <TouchableOpacity
//       style={styles.card}
//       onPress={() => router.push({ pathname: "/(main)/(yamsa)/details", params: { product: JSON.stringify(item) } })}
//       activeOpacity={0.7}
//     >
//       <View style={styles.cardHeader}>
//         <View style={styles.footprintBadge}>
//           <Text style={styles.footprintText}>{item.footprint}</Text>
//         </View>
//       </View>
//       <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
//       <View style={styles.cardFeatures}>
//         <View style={styles.featureItem}>
//           <Ionicons name="cellular-outline" size={16} color="#6B7280" />
//           <Text style={styles.featureText}>{formatData(item.data.value, item.data.unit)}</Text>
//         </View>
//         <View style={styles.featureItem}>
//           <Ionicons name="time-outline" size={16} color="#6B7280" />
//           <Text style={styles.featureText}>{item.duration.value} jours</Text>
//         </View>
//       </View>
//       <View style={styles.cardFooter}>
//         <Text style={styles.price}>{item.price.value.toFixed(2)} {item.price.currency}</Text>
//         <View style={styles.buyButton}>
//           <Text style={styles.buyButtonText}>Acheter</Text>
//           <Ionicons name="arrow-forward" size={14} color="#FFFFFF" />
//         </View>
//       </View>
//     </TouchableOpacity>
//   );
// 
//   return (
//     <SafeAreaView style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <View style={styles.headerTop}>
//           <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
//             <Ionicons name="arrow-back" size={24} color="#1A1D26" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>🛒 Boutique Forfaits Asmay</Text>
//           <View style={{ width: 44 }} />
//         </View>
// 
//         {/* Recherche */}
//         <View style={styles.searchContainer}>
//           <Ionicons name="search" size={20} color="#9CA3AF" />
//           <TextInput
//             style={styles.searchInput}
//             placeholder="Rechercher un forfait..."
//             placeholderTextColor="#9CA3AF"
//             value={search}
//             onChangeText={setSearch}
//           />
//           {search.length > 0 && (
//             <TouchableOpacity onPress={() => setSearch("")}>
//               <Ionicons name="close-circle" size={20} color="#9CA3AF" />
//             </TouchableOpacity>
//           )}
//         </View>
// 
//         {/* Filtres */}
//         <FlatList
//           horizontal
//           data={FOOTPRINTS}
//           keyExtractor={(item) => item.value}
//           showsHorizontalScrollIndicator={false}
//           contentContainerStyle={styles.filterList}
//           renderItem={({ item }) => (
//             <TouchableOpacity
//               style={[styles.filterChip, selectedFootprint === item.value && styles.filterChipActive]}
//               onPress={() => setSelectedFootprint(item.value)}
//             >
//               <Text style={[styles.filterChipText, selectedFootprint === item.value && styles.filterChipTextActive]}>
//                 {item.label}
//               </Text>
//             </TouchableOpacity>
//           )}
//         />
//       </View>
// 
//       {/* Liste */}
//       <FlatList
//         data={filteredProducts}
//         keyExtractor={(item) => item.id}
//         renderItem={renderProduct}
//         contentContainerStyle={styles.listContent}
//         showsVerticalScrollIndicator={false}
//         ListEmptyComponent={
//           <View style={styles.emptyContainer}>
//             <Ionicons name="search-outline" size={48} color="#D1D5DB" />
//             <Text style={styles.emptyText}>Aucun forfait trouvé</Text>
//           </View>
//         }
//       />
//     </SafeAreaView>
//   );
// }
// 
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor:"#bdbbb0" },
//   header: { backgroundColor: "#FFFFFF", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#F0F2F5" },
//   headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
//   backButton: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
//   headerTitle: { fontSize: 20, fontWeight: "700", color: "#1A1D26" },
//   searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F5F7FA", borderRadius: 12, paddingHorizontal: 12, marginBottom: 12 },
//   searchInput: { flex: 1, paddingVertical: 10, marginLeft: 8, fontSize: 15, color: "#1A1D26" },
//   filterList: { paddingBottom: 4, gap: 8 },
//   filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, backgroundColor: "#F5F7FA", marginRight: 8 },
//   filterChipActive: { backgroundColor: "#f87305ff" },
//   filterChipText: { fontSize: 13, color: "#6B7280", fontWeight: "500" },
//   filterChipTextActive: { color: "#FFFFFF" },
//   listContent: { padding: 16, paddingBottom: 30 },
//   card: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
//   cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
//   footprintBadge: { backgroundColor: "#F0F2F5", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
//   footprintText: { fontSize: 12, fontWeight: "600", color: "#374151" },
//   cardName: { fontSize: 17, fontWeight: "600", color: "#1A1D26", marginBottom: 10 },
//   cardFeatures: { flexDirection: "row", gap: 16, marginBottom: 14 },
//   featureItem: { flexDirection: "row", alignItems: "center", gap: 5 },
//   featureText: { fontSize: 13, color: "#6B7280" },
//   cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#F0F2F5", paddingTop: 12 },
//   price: { fontSize: 20, fontWeight: "700", color: "#1A1D26" },
//   buyButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#f87305ff", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, gap: 4 },
//   buyButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
//   emptyContainer: { alignItems: "center", paddingVertical: 60 },
//   emptyText: { fontSize: 16, color: "#9CA3AF", marginTop: 12 },
// });

import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ActivityIndicator, RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { esimAPI, ESIMProduct } from "../../../services/api";

// ==================== MOCK DATA ====================
const MOCK_PRODUCTS: ESIMProduct[] = [
  { id: "mock-1", name: "Europe Explorer 5Go", data: { value: 5, unit: "GB" }, duration: { value: 30, unit: "DAYS" }, footprint: "EUROPE", price: { value: 19.99, currency: "EUR" } },
  { id: "mock-2", name: "Global Traveler 10Go", data: { value: 10, unit: "GB" }, duration: { value: 30, unit: "DAYS" }, footprint: "GLOBAL", price: { value: 34.99, currency: "EUR" } },
  { id: "mock-3", name: "USA Premium 20Go", data: { value: 20, unit: "GB" }, duration: { value: 15, unit: "DAYS" }, footprint: "US", price: { value: 29.99, currency: "EUR" } },
  { id: "mock-4", name: "France Local 50Go", data: { value: 50, unit: "GB" }, duration: { value: 30, unit: "DAYS" }, footprint: "FR", price: { value: 24.99, currency: "EUR" } },
  { id: "mock-5", name: "Asia Connect 3Go", data: { value: 3, unit: "GB" }, duration: { value: 7, unit: "DAYS" }, footprint: "GLOBAL", price: { value: 9.99, currency: "EUR" } },
  { id: "mock-6", name: "UK Express 1Go", data: { value: 1, unit: "GB" }, duration: { value: 7, unit: "DAYS" }, footprint: "GB", price: { value: 4.99, currency: "EUR" } },
  { id: "mock-7", name: "Mali Premium 100Go", data: { value: 100, unit: "GB" }, duration: { value: 30, unit: "DAYS" }, footprint: "GLOBAL", price: { value: 49.99, currency: "EUR" } },
];

const USE_MOCK = true;
const MOCK_DELAY = 600;

// ==================== FILTRES ====================
const FOOTPRINTS = [
  { label: "🌍 Tous", value: "" },
  { label: "🇪🇺 Europe", value: "EUROPE" },
  { label: "🌎 Global", value: "GLOBAL" },
  { label: "🇺🇸 USA", value: "US" },
  { label: "🇫🇷 France", value: "FR" },
  { label: "🇬🇧 UK", value: "GB" },
];

export default function ShopScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<ESIMProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<ESIMProduct[]>([]);
  const [search, setSearch] = useState("");
  const [selectedFootprint, setSelectedFootprint] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => { loadProducts(); }, []);
  useEffect(() => { filterProducts(); }, [products, search, selectedFootprint]);

  const loadProducts = useCallback(async (footprint?: string) => {
    setIsLoading(products.length === 0);
    setError(null);

    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
      let filtered = [...MOCK_PRODUCTS];
      if (footprint) filtered = filtered.filter((p) => p.footprint === footprint);
      setProducts(filtered);
      setUsingMock(true);
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      const response = await esimAPI.getProducts(footprint || undefined);
      setProducts(response.products);
      setUsingMock(false);
    } catch (err: any) {
      console.warn("⚠️ API indisponible, utilisation des données mock");
      await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY));
      let filtered = [...MOCK_PRODUCTS];
      if (footprint) filtered = filtered.filter((p) => p.footprint === footprint);
      setProducts(filtered);
      setUsingMock(true);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleRefresh = () => { setIsRefreshing(true); loadProducts(selectedFootprint || undefined); };

  const handleFootprintFilter = (value: string) => {
    setSelectedFootprint(value);
    loadProducts(value || undefined);
  };

  const filterProducts = () => {
    let filtered = [...products];
    if (selectedFootprint) filtered = filtered.filter((p) => p.footprint === selectedFootprint);
    if (search.trim()) {
      const query = search.toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(query) || p.footprint.toLowerCase().includes(query));
    }
    setFilteredProducts(filtered);
  };

  const formatData = (v: number, u: string) =>
    u === "GB" ? `${v} Go` : u === "MB" && v >= 1000 ? `${(v / 1000).toFixed(1)} Go` : `${v} ${u}`;

  const renderProduct = ({ item }: { item: ESIMProduct }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push({ pathname: "/(main)/(yamsa)/details", params: { product: JSON.stringify(item) } })}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.footprintBadge}><Text style={styles.footprintText}>{item.footprint}</Text></View>
        {item.data.value >= 50 && <View style={styles.popularBadge}><Text style={styles.popularText}>🔥 Populaire</Text></View>}
      </View>
      <Text style={styles.cardName} numberOfLines={2}>{item.name}</Text>
      <View style={styles.cardFeatures}>
        <View style={styles.featureItem}><Ionicons name="cellular-outline" size={16} color="#6B7280" /><Text style={styles.featureText}>{formatData(item.data.value, item.data.unit)}</Text></View>
        <View style={styles.featureItem}><Ionicons name="time-outline" size={16} color="#6B7280" /><Text style={styles.featureText}>{item.duration.value} jours</Text></View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.price}>{item.price.value.toFixed(2)} {item.price.currency}</Text>
        <View style={styles.buyButton}><Text style={styles.buyButtonText}>Acheter</Text><Ionicons name="arrow-forward" size={14} color="#FFFFFF" /></View>
      </View>
    </TouchableOpacity>
  );

  if (isLoading && products.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#f87305ff" /><Text style={styles.loadingText}>Chargement des forfaits...</Text></View>
      </SafeAreaView>
    );
  }

  if (error && products.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="cloud-offline-outline" size={64} color="#FF4444" />
          <Text style={{ color: "#FF4444", fontSize: 16, marginTop: 12, textAlign: "center" }}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadProducts()}><Text style={styles.retryText}>Réessayer</Text></TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}><Ionicons name="arrow-back" size={24} color="#1A1D26" /></TouchableOpacity>
          <Text style={styles.headerTitle}>🛒 Boutique Forfaits Asmay</Text>
          <View style={{ width: 44 }} />
        </View>
        {usingMock && (
          <View style={styles.mockBadge}><Text style={styles.mockBadgeText}>🟡 Mode démo - Prix simulés</Text></View>
        )}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput style={styles.searchInput} placeholder="Rechercher un forfait..." placeholderTextColor="#9CA3AF" value={search} onChangeText={setSearch} />
          {search.length > 0 && <TouchableOpacity onPress={() => setSearch("")}><Ionicons name="close-circle" size={20} color="#9CA3AF" /></TouchableOpacity>}
        </View>
        <FlatList horizontal data={FOOTPRINTS} keyExtractor={(item) => item.value} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.filterChip, selectedFootprint === item.value && styles.filterChipActive]} onPress={() => handleFootprintFilter(item.value)}>
              <Text style={[styles.filterChipText, selectedFootprint === item.value && styles.filterChipTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          )}
        />
        <Text style={styles.resultCount}>{filteredProducts.length} forfait{filteredProducts.length !== 1 ? "s" : ""} trouvé{filteredProducts.length !== 1 ? "s" : ""}</Text>
      </View>
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={["#f87305ff"]} tintColor="#f87305ff" />}
        ListEmptyComponent={<View style={styles.emptyContainer}><Ionicons name="search-outline" size={48} color="#D1D5DB" /><Text style={styles.emptyText}>Aucun forfait trouvé</Text></View>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#bdbbb0" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  loadingText: { marginTop: 12, fontSize: 16, color: "#6B7280" },
  retryButton: { marginTop: 20, backgroundColor: "#f87305ff", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  retryText: { color: "#FFFFFF", fontSize: 16, fontWeight: "600" },
  header: { backgroundColor: "#FFFFFF", paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: "#F0F2F5" },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  backButton: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#1A1D26" },
  mockBadge: { backgroundColor: "#FFF3E0", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: "center", marginBottom: 8 },
  mockBadgeText: { fontSize: 12, fontWeight: "600", color: "#FF9800" },
  searchContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F5F7FA", borderRadius: 12, paddingHorizontal: 12, marginBottom: 12 },
  searchInput: { flex: 1, paddingVertical: 10, marginLeft: 8, fontSize: 15, color: "#1A1D26" },
  filterList: { paddingBottom: 4, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, backgroundColor: "#F5F7FA", marginRight: 8 },
  filterChipActive: { backgroundColor: "#f87305ff" },
  filterChipText: { fontSize: 13, color: "#6B7280", fontWeight: "500" },
  filterChipTextActive: { color: "#FFFFFF" },
  resultCount: { fontSize: 13, color: "#9CA3AF", paddingHorizontal: 4, paddingBottom: 4 },
  listContent: { padding: 16, paddingBottom: 30 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  footprintBadge: { backgroundColor: "#F0F2F5", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  footprintText: { fontSize: 12, fontWeight: "600", color: "#374151" },
  popularBadge: { backgroundColor: "#FFF3E0", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  popularText: { fontSize: 12, fontWeight: "600", color: "#FF9800" },
  cardName: { fontSize: 17, fontWeight: "600", color: "#1A1D26", marginBottom: 10 },
  cardFeatures: { flexDirection: "row", gap: 16, marginBottom: 14 },
  featureItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  featureText: { fontSize: 13, color: "#6B7280" },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#F0F2F5", paddingTop: 12 },
  price: { fontSize: 20, fontWeight: "700", color: "#1A1D26" },
  buyButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#f87305ff", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, gap: 4 },
  buyButtonText: { color: "#FFFFFF", fontSize: 14, fontWeight: "600" },
  emptyContainer: { alignItems: "center", paddingVertical: 60 },
  emptyText: { fontSize: 16, color: "#9CA3AF", marginTop: 12 },
});