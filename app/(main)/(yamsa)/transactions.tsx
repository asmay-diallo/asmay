import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { usePayment } from "../../../hooks/usePayment";
import { Transaction } from "../../../types/payment";

const MOCK_TRANSACTIONS: Transaction[] = [
  {
    _id: "mock-1",
    user: "user-1",
    type: "purchase_esim",
    amount: 13119,
    currency: "XOF",
    method: "orange_money",
    status: "completed",
    phoneNumber: "22376123456",
    productName: "Europe Explorer 5Go",
    esimIccid: "8932145678901234567",
    reference: "ASM-MOCK001",
    paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "mock-2",
    user: "user-1",
    type: "purchase_esim",
    amount: 22941,
    currency: "XOF",
    method: "wave",
    status: "pending",
    phoneNumber: "22370123456",
    productName: "USA Premium 20Go",
    esimIccid: "8932145678901234560",
    lpaString:"ldkfjiqojfijfslzijfilfjdl",
    reference: "ASM-MOCK002",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "mock-3",
    user: "user-1",
    type: "purchase_esim",
    amount: 6559,
    currency: "XOF",
    method: "moov_money",
    status: "failed",
    phoneNumber: "22390123456",
    productName: "Asia Connect 3Go",
    reference: "ASM-MOCK003",
    errorMessage: "Paiement refusé",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const USE_MOCK = true;

const METHOD_LABELS: Record<string, { label: string; color: string }> = {
  orange_money: { label: "Orange Money", color: "#FF6600" },
  wave: { label: "Wave", color: "#00B4D8" },
  moov_money: { label: "Moov Money", color: "#E60000" },
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: "En attente", color: "#FFAA00", icon: "time-outline" },
  completed: { label: "Réussi", color: "#00CC88", icon: "checkmark-circle" },
  failed: { label: "Échoué", color: "#FF4444", icon: "close-circle" },
  refunded: { label: "Remboursé", color: "#9E9E9E", icon: "refresh-outline" },
};

export default function TransactionsScreen() {
  const router = useRouter();
  const { transactions: apiTransactions, loadTransactions } = usePayment();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(transactions.length === 0);
    try {
      if (USE_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 600));
        setTransactions(MOCK_TRANSACTIONS);
      } else {
        await loadTransactions();
        setTransactions(apiTransactions);
      }
    } catch (error) {
      console.error("Erreur chargement transactions:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData();
  };

  const formatAmount = (amount: number, currency: string): string => {
    if (currency === 'XOF') return `${amount.toLocaleString()} FCFA`;
    return `${amount.toFixed(2)} ${currency}`;
  };

  const formatDate = (dateStr: string): string => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const methodInfo = METHOD_LABELS[item.method] || { label: item.method, color: "#6B7280" };
    const statusInfo = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;

    return (
      <View style={styles.transactionCard}>
        <View style={styles.transactionHeader}>
          <View style={[styles.methodBadge, { backgroundColor: methodInfo.color + "15" }]}>
            <Text style={[styles.methodText, { color: methodInfo.color }]}>{methodInfo.label}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.color + "15" }]}>
            <Ionicons name={statusInfo.icon as any} size={12} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </View>
        </View>

        <Text style={styles.productName}>{item.productName || "Forfait eSIM"}</Text>
        <Text style={styles.reference}>Réf: {item.reference}</Text>

        {item.esimIccid && (
          <Text style={styles.iccid} numberOfLines={1}>ICCID: {item.esimIccid}</Text>
        )}

        <View style={styles.transactionFooter}>
          <Text style={styles.amount}>{formatAmount(item.amount, item.currency)}</Text>
          <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
        </View>

        {item.errorMessage && (
          <View style={styles.errorRow}>
            <Ionicons name="warning-outline" size={14} color="#FF4444" />
            <Text style={styles.errorText}>{item.errorMessage}</Text>
          </View>
        )}
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#f87305ff" />
          <Text style={styles.loadingText}>Chargement des transactions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1A1D26" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💳 Mes Transactions</Text>
        <View style={{ width: 44 }} />
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item._id}
        renderItem={renderTransaction}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={["#f87305ff"]} tintColor="#f87305ff" />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>Aucune transaction</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#bdbbb0" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, fontSize: 16, color: "#6B7280" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, backgroundColor: "#FFFFFF" },
  backButton: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#1A1D26" },
  listContent: { padding: 16, paddingBottom: 30 },
  transactionCard: { backgroundColor: "#FFFFFF", borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  transactionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  methodBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  methodText: { fontSize: 12, fontWeight: "700" },
  statusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  statusText: { fontSize: 11, fontWeight: "600" },
  productName: { fontSize: 15, fontWeight: "600", color: "#1A1D26", marginBottom: 4 },
  reference: { fontSize: 11, color: "#9CA3AF", fontFamily: "monospace", marginBottom: 4 },
  iccid: { fontSize: 11, color: "#9CA3AF", fontFamily: "monospace" },
  transactionFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10, borderTopWidth: 1, borderTopColor: "#F0F2F5", paddingTop: 10 },
  amount: { fontSize: 18, fontWeight: "700", color: "#1A1D26" },
  date: { fontSize: 12, color: "#6B7280" },
  errorRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 8, backgroundColor: "#FFEBEE", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  errorText: { fontSize: 12, color: "#FF4444", flex: 1 },
  emptyContainer: { alignItems: "center", paddingVertical: 60 },
  emptyText: { fontSize: 16, color: "#9CA3AF", marginTop: 12 },
});