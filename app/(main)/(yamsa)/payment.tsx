// import React, { useState, useEffect } from "react";
// import {
//   View, Text, StyleSheet, ScrollView, TouchableOpacity,
//   ActivityIndicator, Alert, TextInput,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useRouter, useLocalSearchParams } from "expo-router";
// import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
// import { usePayment } from "../../../hooks/usePayment";
// import { PaymentMethod } from "../../../types/payment";
// import { formatPhoneForDisplay, isValidMalienPhone, formatMalienPhone, detectOperator } from "../../../services/payment";
// 
// const PAYMENT_METHODS = [
//   { id: 'orange_money' as PaymentMethod, label: 'Orange Money', icon: 'phone-portrait-outline', color: '#FF6600', description: 'Paiement mobile Orange Mali', phonePrefix: '+223', enabled: true, fee: 0, minAmount: 500, maxAmount: 500000 },
//   { id: 'wave' as PaymentMethod, label: 'Wave', icon: 'phone-portrait-outline', color: '#00B4D8', description: 'Paiement mobile Wave Mali', phonePrefix: '+223', enabled: true, fee: 0, minAmount: 500, maxAmount: 500000 },
//   { id: 'moov_money' as PaymentMethod, label: 'Moov Money', icon: 'phone-portrait-outline', color: '#E60000', description: 'Paiement mobile Moov Africa Mali', phonePrefix: '+223', enabled: true, fee: 0, minAmount: 500, maxAmount: 500000 },
// ];
// 
// const EUR_TO_XOF = 655.96;
// 
// export default function PaymentScreen() {
//   const router = useRouter();
//   const params = useLocalSearchParams<{ product: string; quantity: string }>();
//   const product = params.product ? JSON.parse(params.product) : null;
//   const quantity = parseInt(params.quantity || "1", 10);
// 
//   const { isProcessing, paymentError, initiatePayment, confirmPayment, clearError } = usePayment();
// 
//   const [step, setStep] = useState<'method' | 'phone' | 'otp' | 'success'>('method');
//   const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('orange_money');
//   const [phoneNumber, setPhoneNumber] = useState("");
//   const [otpCode, setOtpCode] = useState("");
//   const [transactionId, setTransactionId] = useState<string | null>(null);
//   const [esimData, setESIMData] = useState<{ iccid: string; lpaString: string } | null>(null);
// 
//   useEffect(() => {
//     if (phoneNumber.length >= 8 && isValidMalienPhone(phoneNumber)) {
//       const operator = detectOperator(phoneNumber);
//       if (operator) setSelectedMethod(operator);
//     }
//   }, [phoneNumber]);
// 
//   if (!product) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.center}><Text style={styles.errorText}>Produit non trouvé</Text></View>
//       </SafeAreaView>
//     );
//   }
// 
//   const totalEUR = product.price.value * quantity;
//   const totalXOF = Math.round(totalEUR * EUR_TO_XOF);
// 
//   // ==================== ÉTAPE 1 : MÉTHODE ====================
//   const handleContinue = () => setStep('phone');
// 
//   // ==================== ÉTAPE 2 : PAIEMENT ====================
//   const handlePay = async () => {
//     if (!isValidMalienPhone(phoneNumber)) {
//       Alert.alert("Numéro invalide", "Format: +223 XX XX XX XX");
//       return;
//     }
// 
//     const result = await initiatePayment(
//       selectedMethod,
//       formatMalienPhone(phoneNumber),
//       product.id,
//       product.name,
//       totalXOF,
//       'XOF',
//     );
// 
//     if (result?.success && result.status === 'pending') {
//       setTransactionId(result.transactionId);
//       setStep('otp');
//     } else if (result?.success && result.esimIccid) {
//       setESIMData({ iccid: result.esimIccid, lpaString: result.lpaString || '' });
//       setStep('success');
//     }
//   };
// 
//   // ==================== ÉTAPE 3 : OTP ====================
//   const handleConfirmOTP = async () => {
//     if (!transactionId || !otpCode.trim()) {
//       Alert.alert("Code requis", "Entrez le code reçu par SMS");
//       return;
//     }
// 
//     const result = await confirmPayment(transactionId, otpCode);
// 
//     if (result?.success && result.esimIccid) {
//       setESIMData({ iccid: result.esimIccid, lpaString: result.lpaString || '' });
//       setStep('success');
//     } else {
//       Alert.alert("Erreur", "Code OTP invalide");
//       setOtpCode("");
//     }
//   };
// 
//   // ==================== ÉTAPE 4 : SUCCÈS ====================
//   const handleGoToInstall = () => {
//     if (esimData) {
//       router.replace({
//         pathname: "/(main)/(yamsa)/install",
//         params: {
//           iccid: esimData.iccid,
//           productName: product.name,
//           lpaString: esimData.lpaString,
//         },
//       });
//     } else {
//       router.replace("/(main)/(yamsa)");
//     }
//   };
// 
//   const formatData = (v: number, u: string) =>
//     u === "GB" ? `${v} Go` : u === "MB" && v >= 1000 ? `${(v / 1000).toFixed(1)} Go` : `${v} ${u}`;
// 
//   const selectedConfig = PAYMENT_METHODS.find(m => m.id === selectedMethod)!;
// 
//   // ==================== RENDER ====================
// 
//   if (step === 'success') {
//     return (
//       <SafeAreaView style={styles.container}>
//         <View style={styles.successContainer}>
//           <Ionicons name="checkmark-circle" size={100} color="#00CC88" />
//           <Text style={styles.successTitle}>Paiement réussi !</Text>
//           <Text style={styles.successAmount}>{totalXOF.toLocaleString()} FCFA</Text>
//           <Text style={styles.successDesc}>Versé sur compte UBA</Text>
//           <Text style={styles.successDesc}>Votre forfait est prêt à activer !</Text>
//           <TouchableOpacity style={styles.successButton} onPress={handleGoToInstall} activeOpacity={0.8}>
//             <Ionicons name="download-outline" size={22} color="#FFFFFF" />
//             <Text style={styles.successButtonText}>Activer mon forfait</Text>
//           </TouchableOpacity>
//         </View>
//       </SafeAreaView>
//     );
//   }
// 
//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
//         {/* Header */}
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => step === 'method' ? router.back() : step === 'phone' ? setStep('method') : setStep('phone')} style={styles.backButton}>
//             <Ionicons name="arrow-back" size={24} color="#1A1D26" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>
//             {step === 'method' ? '💳 Paiement' : step === 'phone' ? '📱 Numéro' : '🔐 Confirmation'}
//           </Text>
//           <View style={{ width: 44 }} />
//         </View>
// 
//         {/* Résumé commande (toujours visible) */}
//         <View style={styles.summaryCard}>
//           <View style={styles.productRow}>
//             <MaterialCommunityIcons name="sim-outline" size={24} color="#f87305ff" />
//             <View style={styles.productInfo}>
//               <Text style={styles.productName}>{product.name}</Text>
//               <Text style={styles.productDetail}>
//                 {formatData(product.data.value, product.data.unit)} • {product.duration.value} jours • x{quantity}
//               </Text>
//             </View>
//           </View>
//           <View style={styles.divider} />
//           <View style={styles.priceRow}>
//             <Text style={styles.totalLabel}>Total</Text>
//             <View style={styles.priceRight}>
//               <Text style={styles.totalValue}>{totalXOF.toLocaleString()} FCFA</Text>
//               <Text style={styles.totalEUR}>≈ {totalEUR.toFixed(2)} €</Text>
//             </View>
//           </View>
//         </View>
// 
//         {/* ÉTAPE 1 : Choix méthode */}
//         {step === 'method' && (
//           <View style={styles.methodsCard}>
//             <Text style={styles.sectionTitle}>Choisissez votre moyen de paiement</Text>
//             <Text style={styles.sectionSubtitle}>Paiement sécurisé </Text>
//             {PAYMENT_METHODS.filter(m => m.enabled).map(method => (
//               <TouchableOpacity
//                 key={method.id}
//                 style={[styles.methodItem, selectedMethod === method.id && styles.methodItemSelected]}
//                 onPress={() => setSelectedMethod(method.id)}
//                 activeOpacity={0.7}
//               >
//                 <View style={[styles.methodIcon, { backgroundColor: method.color + "15" }]}>
//                   <Ionicons name={method.icon as any} size={24} color={method.color} />
//                 </View>
//                 <View style={styles.methodInfo}>
//                   <Text style={styles.methodLabel}>{method.label}</Text>
//                   <Text style={styles.methodDesc}>{method.description}</Text>
//                 </View>
//                 <View style={[styles.radio, selectedMethod === method.id && styles.radioSelected]}>
//                   {selectedMethod === method.id && <View style={styles.radioDot} />}
//                 </View>
//               </TouchableOpacity>
//             ))}
//           </View>
//         )}
// 
//         {/* ÉTAPE 2 : Numéro téléphone */}
//         {step === 'phone' && (
//           <View style={styles.phoneCard}>
//             <View style={[styles.methodBadge, { backgroundColor: selectedConfig.color + "15" }]}>
//               <Text style={[styles.methodBadgeText, { color: selectedConfig.color }]}>{selectedConfig.label}</Text>
//             </View>
//             <Text style={styles.phoneLabel}>Votre numéro {selectedConfig.label}</Text>
//             <View style={styles.phoneInputContainer}>
//               <Text style={styles.phonePrefix}>+223</Text>
//               <TextInput
//                 style={styles.phoneInput}
//                 placeholder="XX XX XX XX"
//                 placeholderTextColor="#9CA3AF"
//                 keyboardType="phone-pad"
//                 value={phoneNumber}
//                 onChangeText={setPhoneNumber}
//                 maxLength={10}
//               />
//             </View>
//             {phoneNumber.length > 0 && isValidMalienPhone(phoneNumber) && (
//               <View style={styles.phoneValid}>
//                 <Ionicons name="checkmark-circle" size={18} color="#00CC88" />
//                 <Text style={styles.phoneValidText}>{formatPhoneForDisplay(phoneNumber)}</Text>
//               </View>
//             )}
//             <View style={styles.amountSummary}>
//               <Text style={styles.amountLabel}>Montant à payer</Text>
//               <Text style={styles.amountValue}>{totalXOF.toLocaleString()} FCFA</Text>
//               <Text style={styles.amountEUR}>≈ {totalEUR.toFixed(2)} €</Text>
//             </View>
//           </View>
//         )}
// 
//         {/* ÉTAPE 3 : OTP */}
//         {step === 'otp' && (
//           <View style={styles.otpCard}>
//             <View style={styles.otpIconContainer}>
//               <Ionicons name="lock-closed-outline" size={48} color="#f87305ff" />
//             </View>
//             <Text style={styles.otpTitle}>Code de confirmation</Text>
//             <Text style={styles.otpDesc}>
//               Un code a été envoyé au{"\n"}
//               <Text style={styles.otpPhone}>{formatPhoneForDisplay(phoneNumber)}</Text>
//             </Text>
//             <TextInput
//               style={styles.otpInput}
//               placeholder="XXXXXX"
//               placeholderTextColor="#9CA3AF"
//               keyboardType="number-pad"
//               value={otpCode}
//               onChangeText={setOtpCode}
//               maxLength={6}
//             />
//             <TouchableOpacity
//               style={[styles.otpButton, (!otpCode.trim() || isProcessing) && styles.buttonDisabled]}
//               onPress={handleConfirmOTP}
//               disabled={!otpCode.trim() || isProcessing}
//               activeOpacity={0.8}
//             >
//               {isProcessing ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={styles.otpButtonText}>Confirmer</Text>}
//             </TouchableOpacity>
//             <TouchableOpacity style={styles.resendButton} onPress={handlePay}>
//               <Text style={styles.resendText}>Renvoyer le code</Text>
//             </TouchableOpacity>
//           </View>
//         )}
// 
//         {/* Erreur */}
//         {paymentError && (
//           <View style={styles.errorCard}>
//             <Ionicons name="warning-outline" size={20} color="#FF4444" />
//             <Text style={styles.errorCardText}>{paymentError}</Text>
//           </View>
//         )}
//       </ScrollView>
// 
//       {/* Bouton en bas */}
//       {step !== 'otp' && (
//         <View style={styles.bottomBar}>
//           <TouchableOpacity
//             style={[styles.payButton, (isProcessing || (step === 'phone' && !isValidMalienPhone(phoneNumber))) && styles.buttonDisabled]}
//             onPress={step === 'method' ? handleContinue : handlePay}
//             disabled={isProcessing || (step === 'phone' && !isValidMalienPhone(phoneNumber))}
//             activeOpacity={0.8}
//           >
//             {isProcessing ? (
//               <ActivityIndicator color="#FFFFFF" size="small" />
//             ) : (
//               <>
//                 <Ionicons name={step === 'method' ? "arrow-forward" : "lock-closed-outline"} size={20} color="#FFFFFF" />
//                 <Text style={styles.payButtonText}>
//                   {step === 'method' ? 'Continuer' : `Payer ${totalXOF.toLocaleString()} FCFA`}
//                 </Text>
//               </>
//             )}
//           </TouchableOpacity>
//         </View>
//       )}
//     </SafeAreaView>
//   );
// }
// 
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#F5F7FA" },
//   center: { flex: 1, justifyContent: "center", alignItems: "center" },
//   errorText: { fontSize: 16, color: "#FF4444" },
//   scrollContent: { paddingBottom: 120 },
//   // Header
//   header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, backgroundColor: "#FFFFFF" },
//   backButton: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
//   headerTitle: { fontSize: 20, fontWeight: "700", color: "#1A1D26" },
//   // Summary
//   summaryCard: { backgroundColor: "#FFFFFF", marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 16 },
//   productRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
//   productInfo: { flex: 1 },
//   productName: { fontSize: 15, fontWeight: "600", color: "#1A1D26" },
//   productDetail: { fontSize: 12, color: "#6B7280", marginTop: 2 },
//   divider: { height: 1, backgroundColor: "#F0F2F5", marginVertical: 8 },
//   priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
//   totalLabel: { fontSize: 15, fontWeight: "600", color: "#1A1D26" },
//   priceRight: { alignItems: "flex-end" },
//   totalValue: { fontSize: 22, fontWeight: "700", color: "#f87305ff" },
//   totalEUR: { fontSize: 13, color: "#6B7280", marginTop: 2 },
//   // Methods
//   methodsCard: { backgroundColor: "#FFFFFF", marginHorizontal: 16, marginTop: 12, borderRadius: 16, padding: 20 },
//   sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1A1D26", marginBottom: 4 },
//   sectionSubtitle: { fontSize: 12, color: "#6B7280", marginBottom: 16 },
//   methodItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12, marginBottom: 8, borderWidth: 2, borderColor: "#F0F2F5", gap: 12 },
//   methodItemSelected: { borderColor: "#f87305ff", backgroundColor: "#FFF8F0" },
//   methodIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center" },
//   methodInfo: { flex: 1 },
//   methodLabel: { fontSize: 15, fontWeight: "600", color: "#1A1D26" },
//   methodDesc: { fontSize: 12, color: "#6B7280", marginTop: 2 },
//   radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: "#D1D5DB", justifyContent: "center", alignItems: "center" },
//   radioSelected: { borderColor: "#f87305ff" },
//   radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#f87305ff" },
//   // Phone
//   phoneCard: { backgroundColor: "#FFFFFF", marginHorizontal: 16, marginTop: 12, borderRadius: 16, padding: 24 },
//   methodBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, alignSelf: "flex-start", marginBottom: 16 },
//   methodBadgeText: { fontSize: 14, fontWeight: "700" },
//   phoneLabel: { fontSize: 15, fontWeight: "600", color: "#1A1D26", marginBottom: 16 },
//   phoneInputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F5F7FA", borderRadius: 14, paddingHorizontal: 16, borderWidth: 2, borderColor: "#E1E5EB" },
//   phonePrefix: { fontSize: 18, fontWeight: "700", color: "#1A1D26", marginRight: 10 },
//   phoneInput: { flex: 1, paddingVertical: 16, fontSize: 18, fontWeight: "600", color: "#1A1D26", letterSpacing: 2 },
//   phoneValid: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12, backgroundColor: "#E8F5E9", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
//   phoneValidText: { fontSize: 15, fontWeight: "600", color: "#00CC88" },
//   amountSummary: { marginTop: 24, backgroundColor: "#FFF8F0", borderRadius: 14, padding: 20, alignItems: "center", borderWidth: 1, borderColor: "#f87305ff20" },
//   amountLabel: { fontSize: 14, color: "#6B7280", marginBottom: 4 },
//   amountValue: { fontSize: 28, fontWeight: "800", color: "#f87305ff" },
//   amountEUR: { fontSize: 14, color: "#6B7280", marginTop: 4 },
//   // OTP
//   otpCard: { backgroundColor: "#FFFFFF", marginHorizontal: 16, marginTop: 12, borderRadius: 16, padding: 32, alignItems: "center" },
//   otpIconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#FFF3E0", justifyContent: "center", alignItems: "center", marginBottom: 20 },
//   otpTitle: { fontSize: 20, fontWeight: "700", color: "#1A1D26" },
//   otpDesc: { fontSize: 15, color: "#6B7280", textAlign: "center", marginTop: 8, lineHeight: 22 },
//   otpPhone: { fontWeight: "700", color: "#f87305ff" },
//   otpInput: { backgroundColor: "#F5F7FA", borderRadius: 14, paddingHorizontal: 20, paddingVertical: 16, fontSize: 28, fontWeight: "800", color: "#1A1D26", textAlign: "center", letterSpacing: 10, width: "100%", borderWidth: 2, borderColor: "#E1E5EB", marginTop: 20 },
//   otpButton: { marginTop: 24, backgroundColor: "#f87305ff", paddingHorizontal: 40, paddingVertical: 14, borderRadius: 12, width: "100%", alignItems: "center" },
//   otpButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
//   resendButton: { marginTop: 16, paddingVertical: 10 },
//   resendText: { color: "#f87305ff", fontSize: 14, fontWeight: "600", textDecorationLine: "underline" },
//   // Error
//   errorCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFEBEE", marginHorizontal: 16, marginTop: 12, borderRadius: 12, padding: 14, gap: 10 },
//   errorCardText: { flex: 1, fontSize: 14, color: "#FF4444" },
//   // Bottom
//   bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#FFFFFF", paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: "#F0F2F5" },
//   payButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#f87305ff", paddingVertical: 16, borderRadius: 14, gap: 8 },
//   buttonDisabled: { opacity: 0.5 },
//   payButtonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" },
//   // Success
//   successContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32, backgroundColor: "#FFFFFF" },
//   successTitle: { fontSize: 28, fontWeight: "800", color: "#00CC88", marginTop: 20, marginBottom: 8 },
//   successAmount: { fontSize: 36, fontWeight: "800", color: "#1A1D26", marginBottom: 4 },
//   successDesc: { fontSize: 16, color: "#6B7280", textAlign: "center", marginBottom: 4 },
//   successButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#00CC88", paddingHorizontal: 32, paddingVertical: 16, borderRadius: 14, gap: 8, marginTop: 32 },
//   successButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
// });
import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { usePayment } from "../../../hooks/usePayment";
import { PaymentMethod } from "../../../types/payment";
import {
  PAYMENT_METHODS,
  formatPhoneForDisplay,
  isValidMalienPhone,
  detectOperator,
} from "../../../services/payment";
import { Transaction } from "../../../types/payment";

const EUR_TO_XOF = 655.96;

const MOCK_TRANSACTIONS =
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
     lpaString:"asmhhdunfsjfdj",
    esimIccid: "8932145678901234567",
    reference: "ASM-MOCK001",
    paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date().toISOString(),
  }
  // {
  //   _id: "mock-2",
  //   user: "user-1",
  //   type: "purchase_esim",
  //   amount: 22941,
  //   currency: "XOF",
  //   method: "wave",
  //   status: "pending",
  //    esimIccid: "8932145628901234567",
  //    lpaString:"asmhhdunfsjfdj",
  //   phoneNumber: "22370123456",
  //   productName: "USA Premium 20Go",
  //   reference: "ASM-MOCK002",
  //   createdAt: new Date().toISOString(),
  //   updatedAt: new Date().toISOString(),
  // },
  // {
  //   _id: "mock-3",
  //   user: "user-1",
  //   type: "purchase_esim",
  //   amount: 6559,
  //   currency: "XOF",
  //   method: "moov_money",
  //   status: "failed",
  //   phoneNumber: "22390123456",
  //    esimIccid: "8932145678901234507",
  //   productName: "Asia Connect 3Go",
  //   reference: "ASM-MOCK003",
  //   errorMessage: "Paiement refusé",
  //   createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  //   updatedAt: new Date().toISOString(),
  // },
// ];

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ product: string; quantity: string }>();
  const product = params.product ? JSON.parse(params.product) : null;
  const quantity = parseInt(params.quantity || "1", 10);

  const {
    isProcessing,
    isWaitingConfirmation,
    paymentError,
    lastTransaction,
    initiatePayment,
    clearError,
  } = usePayment();

  const [step, setStep] = useState<'method' | 'phone' | 'waiting' | 'success'>('method');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('orange_money');
  const [phoneNumber, setPhoneNumber] = useState("");
    const [transactions, setTransactions] = useState(MOCK_TRANSACTIONS);

  useEffect(() => {
    if (phoneNumber.length >= 8 && isValidMalienPhone(phoneNumber)) {
      const operator = detectOperator(phoneNumber);
      if (operator) setSelectedMethod(operator);
    }
  }, [phoneNumber]);
  useEffect(() => {
   setStep('method')
  }, []);

  // Quand le webhook arrive via Socket.io
  useEffect(() => {
   
    if (lastTransaction?.status === 'completed' && lastTransaction?.esimIccid) {
      setStep('success');
    }
  }, [lastTransaction]);

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}><Text style={styles.errorText}>Produit non trouvé</Text></View>
      </SafeAreaView>
    );
  }

  const totalEUR = product.price.value * quantity;
  const totalXOF = Math.round(totalEUR * EUR_TO_XOF);
  const selectedConfig = PAYMENT_METHODS.find(m => m.id === selectedMethod)!;
  const formatData = (v: number, u: string) =>
    u === "GB" ? `${v} Go` : u === "MB" && v >= 1000 ? `${(v / 1000).toFixed(1)} Go` : `${v} ${u}`;

  const handleContinue = () => setStep('phone');

  const handlePay = async () => {
     console.log("Le STEP : ", step);
    if (!isValidMalienPhone(phoneNumber)) {
      Alert.alert("Numéro invalide", "Format: +223 XX XX XX XX");
      return;
    }
      // A enlever après API REST============
    setTimeout(() => {
       setStep('waiting');
    }, 1000);
    setTimeout(() => {
       setStep('success');
    }, 7000);
    //===============// ==============

    const result = await initiatePayment(
      selectedMethod,
      phoneNumber,
      product.id,
      product.name,
      totalXOF,
      'XOF',
    );
      // setStep('waiting');
     
    if (result?.success && result.status === 'pending') {
      setStep('waiting');
    }
  };

  const handleGoToInstall = () => {
    // if (lastTransaction?.esimIccid) {
    //   router.push({
    //     pathname: "/(main)/(yamsa)/install",
    //     params: {
    //       iccid: lastTransaction?.esimIccid,
    //       productName: product.name,
    //       lpaString: lastTransaction?.lpaString || "",
    //     },
    //   });
    // }
    //  else {
    //   router.replace("/(main)/(yamsa)");
    // }
      
    if (transactions) {
      router.push({
        pathname: "/(main)/(yamsa)/install",
        params: {
          iccid: transactions.esimIccid,
          productName: product.name,
          lpaString: transactions.lpaString || "",
        },
      });
    }
  };

  // ==================== ÉCRAN SUCCÈS ====================
  if (step === 'success') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <Ionicons name="checkmark-circle" size={100} color="#00CC88" />
          <Text style={styles.successTitle}>Paiement réussi !</Text>
          <Text style={styles.successAmount}>{totalXOF.toLocaleString()} FCFA</Text>
         
          <Text style={styles.successDesc}>Activer votre forfait maintenant ou plus tard !</Text>
          <TouchableOpacity style={styles.successButton} onPress={handleGoToInstall} activeOpacity={0.8}>
            <Ionicons name="download-outline" size={22} color="#FFFFFF" />
            <Text style={styles.successButtonText}>Acitiver mon Forfait</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => {
            if (step === 'method') router.back();
            else if (step === 'phone') setStep('method');
            else if (step === 'waiting') setStep('phone');
          }} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#1A1D26" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {step === 'method' ? '💳 Paiement' : step === 'phone' ? '📱 Numéro' : '⏳ Confirmation'}
          </Text>
          <View style={{ width: 44 }} />
        </View>

        {/* Résumé commande */}
        <View style={styles.summaryCard}>
          <View style={styles.productRow}>
            <MaterialCommunityIcons name="sim-outline" size={24} color="#f87305ff" />
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.name}</Text>
              <Text style={styles.productDetail}>{formatData(product.data.value, product.data.unit)} • {product.duration.value} jours • x{quantity}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <View style={styles.priceRight}>
              <Text style={styles.totalValue}>{totalXOF.toLocaleString()} FCFA</Text>
              <Text style={styles.totalEUR}>≈ {totalEUR.toFixed(2)} €</Text>
            </View>
          </View>
        </View>

        {/* ÉTAPE 1 : Méthode */}
        {step === 'method' && (
          <View style={styles.methodsCard}>
            <Text style={styles.sectionTitle}>Choisissez votre moyen de paiement</Text>
            <Text style={styles.sectionSubtitle}>Vous confirmerez sur votre téléphone</Text>
            {PAYMENT_METHODS.filter(m => m.enabled).map(method => (
              <TouchableOpacity
                key={method.id}
                style={[styles.methodItem, selectedMethod === method.id && styles.methodItemSelected]}
                onPress={() => setSelectedMethod(method.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.methodIcon, { backgroundColor: method.color + "15" }]}>
                  <Ionicons name={method.icon as any} size={24} color={method.color} />
                </View>
                <View style={styles.methodInfo}>
                  <Text style={styles.methodLabel}>{method.label}</Text>
                  <Text style={styles.methodDesc}>{method.description}</Text>
                </View>
                <View style={[styles.radio, selectedMethod === method.id && styles.radioSelected]}>
                  {selectedMethod === method.id && <View style={styles.radioDot} />}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ÉTAPE 2 : Téléphone */}
        {step === 'phone' && (
          <View style={styles.phoneCard}>
            <View style={[styles.methodBadge, { backgroundColor: selectedConfig.color + "15" }]}>
              <Text style={[styles.methodBadgeText, { color: selectedConfig.color }]}>{selectedConfig.label}</Text>
            </View>
            <Text style={styles.phoneLabel}>Votre numéro {selectedConfig.label}</Text>
            <View style={styles.phoneInputContainer}>
              <Text style={styles.phonePrefix}>+223</Text>
              <TextInput style={styles.phoneInput} placeholder="XX XX XX XX" placeholderTextColor="#9CA3AF" keyboardType="phone-pad" value={phoneNumber} onChangeText={setPhoneNumber} maxLength={10} />
            </View>
            {phoneNumber.length > 0 && isValidMalienPhone(phoneNumber) && (
              <View style={styles.phoneValid}>
                <Ionicons name="checkmark-circle" size={18} color="#00CC88" />
                <Text style={styles.phoneValidText}>{formatPhoneForDisplay(phoneNumber)}</Text>
              </View>
            )}
            <View style={styles.amountSummary}>
              <Text style={styles.amountLabel}>Montant à payer</Text>
              <Text style={styles.amountValue}>{totalXOF.toLocaleString()} FCFA</Text>
              <Text style={styles.amountEUR}>≈ {totalEUR.toFixed(2)} €</Text>
            </View>
          </View>
        )}

        {/* ÉTAPE 3 : En attente de confirmation */}
        {step === 'waiting' && (
          <View style={styles.waitingCard}>
            <View style={styles.waitingIconContainer}>
              <ActivityIndicator size="large" color="#f87305ff" />
            </View>
            <Text style={styles.waitingTitle}>En attente de confirmation</Text>
            <Text style={styles.waitingDesc}>
              Vérifiez votre téléphone. {'\n'}
              <Text style={styles.waitingMethod}>{selectedConfig.label}</Text> vous demande de confirmer le paiement de{' '}
              <Text style={styles.waitingAmount}>{totalXOF.toLocaleString()} FCFA</Text>
            </Text>
            <View style={styles.waitingSteps}>
              <View style={styles.waitingStep}>
                <Ionicons name="phone-portrait-outline" size={20} color="#f87305ff" />
                <Text style={styles.waitingStepText}>Ouvrez votre portefeuille {selectedConfig.label}</Text>
              </View>
              <View style={styles.waitingStep}>
                <Ionicons name="key-outline" size={20} color="#f87305ff" />
                <Text style={styles.waitingStepText}>Saisissez votre code secret</Text>
              </View>
              <View style={styles.waitingStep}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#f87305ff" />
                <Text style={styles.waitingStepText}>Validez le paiement</Text>
              </View>
            </View>
            <Text style={styles.waitingAuto}>
              Cette page se mettra à jour automatiquement après confirmation.
            </Text>
          </View>
        )}

        {/* Erreur */}
        {paymentError && (
          <View style={styles.errorCard}>
            <Ionicons name="warning-outline" size={20} color="#FF4444" />
            <Text style={styles.errorCardText}>{paymentError}</Text>
          </View>
        )}
      </ScrollView>

      {/* Bouton */}
      {step !== 'waiting' && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.payButton, (isProcessing || (step === 'phone' && !isValidMalienPhone(phoneNumber))) && styles.buttonDisabled]}
            onPress={step === 'method' ? handleContinue : handlePay}
            disabled={isProcessing || (step === 'phone' && !isValidMalienPhone(phoneNumber))}
            activeOpacity={0.8}
          >
            {isProcessing ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Ionicons name={step === 'method' ? "arrow-forward" : "lock-closed-outline"} size={20} color="#FFFFFF" />
                <Text style={styles.payButtonText}>
                  {step === 'method' ? 'Continuer' : `Acheter ${totalXOF.toLocaleString()} FCFA`}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#bdbbb0" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { fontSize: 16, color: "#FF4444" },
  scrollContent: { paddingBottom: 120 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12, backgroundColor: "#FFFFFF" },
  backButton: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#1A1D26" },
  summaryCard: { backgroundColor: "#FFFFFF", marginHorizontal: 16, marginTop: 16, borderRadius: 16, padding: 16 },
  productRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 12 },
  productInfo: { flex: 1 },
  productName: { fontSize: 15, fontWeight: "600", color: "#1A1D26" },
  productDetail: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  divider: { height: 1, backgroundColor: "#F0F2F5", marginVertical: 8 },
  priceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { fontSize: 15, fontWeight: "600", color: "#1A1D26" },
  priceRight: { alignItems: "flex-end" },
  totalValue: { fontSize: 22, fontWeight: "700", color: "#f87305ff" },
  totalEUR: { fontSize: 13, color: "#6B7280", marginTop: 2 },
  methodsCard: { backgroundColor: "#FFFFFF", marginHorizontal: 16, marginTop: 12, borderRadius: 16, padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#1A1D26", marginBottom: 4 },
  sectionSubtitle: { fontSize: 12, color: "#6B7280", marginBottom: 16 },
  methodItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12, marginBottom: 8, borderWidth: 2, borderColor: "#F0F2F5", gap: 12 },
  methodItemSelected: { borderColor: "#f87305ff", backgroundColor: "#FFF8F0" },
  methodIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  methodInfo: { flex: 1 },
  methodLabel: { fontSize: 15, fontWeight: "600", color: "#1A1D26" },
  methodDesc: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: "#D1D5DB", justifyContent: "center", alignItems: "center" },
  radioSelected: { borderColor: "#f87305ff" },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#f87305ff" },
  phoneCard: { backgroundColor: "#FFFFFF", marginHorizontal: 16, marginTop: 12, borderRadius: 16, padding: 24 },
  methodBadge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, alignSelf: "flex-start", marginBottom: 16 },
  methodBadgeText: { fontSize: 14, fontWeight: "700" },
  phoneLabel: { fontSize: 15, fontWeight: "600", color: "#1A1D26", marginBottom: 16 },
  phoneInputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F5F7FA", borderRadius: 14, paddingHorizontal: 16, borderWidth: 2, borderColor: "#E1E5EB" },
  phonePrefix: { fontSize: 18, fontWeight: "700", color: "#1A1D26", marginRight: 10 },
  phoneInput: { flex: 1, paddingVertical: 16, fontSize: 18, fontWeight: "600", color: "#1A1D26", letterSpacing: 2 },
  phoneValid: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12, backgroundColor: "#E8F5E9", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10 },
  phoneValidText: { fontSize: 15, fontWeight: "600", color: "#00CC88" },
  amountSummary: { marginTop: 24, backgroundColor: "#FFF8F0", borderRadius: 14, padding: 20, alignItems: "center", borderWidth: 1, borderColor: "#f87305ff20" },
  amountLabel: { fontSize: 14, color: "#6B7280", marginBottom: 4 },
  amountValue: { fontSize: 28, fontWeight: "800", color: "#f87305ff" },
  amountEUR: { fontSize: 14, color: "#6B7280", marginTop: 4 },
  // Waiting
  waitingCard: { backgroundColor: "#FFFFFF", marginHorizontal: 16, marginTop: 12, borderRadius: 16, padding: 32, alignItems: "center" },
  waitingIconContainer: { marginBottom: 20 },
  waitingTitle: { fontSize: 20, fontWeight: "700", color: "#1A1D26", marginBottom: 12 },
  waitingDesc: { fontSize: 15, color: "#6B7280", textAlign: "center", lineHeight: 22, marginBottom: 24 },
  waitingMethod: { fontWeight: "700", color: "#f87305ff" },
  waitingAmount: { fontWeight: "700", color: "#1A1D26" },
  waitingSteps: { width: "100%", gap: 16, marginBottom: 24 },
  waitingStep: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#FFF8F0", paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10 },
  waitingStepText: { fontSize: 14, fontWeight: "500", color: "#374151", flex: 1 },
  waitingAuto: { fontSize: 12, color: "#9CA3AF", textAlign: "center", fontStyle: "italic" },
  // Error
  errorCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFEBEE", marginHorizontal: 16, marginTop: 12, borderRadius: 12, padding: 14, gap: 10 },
  errorCardText: { flex: 1, fontSize: 14, color: "#FF4444" },
  // Bottom
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#FFFFFF", paddingHorizontal: 20, paddingVertical: 16, borderTopWidth: 1, borderTopColor: "#F0F2F5" },
  payButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#f87305ff", paddingVertical: 16, borderRadius: 14, gap: 8 },
  buttonDisabled: { opacity: 0.5 },
  payButtonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" },
  // Success
  successContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 32, backgroundColor: "#FFFFFF" },
  successTitle: { fontSize: 28, fontWeight: "800", color: "#00CC88", marginTop: 20, marginBottom: 8 },
  successAmount: { fontSize: 36, fontWeight: "800", color: "#1A1D26", marginBottom: 4 },
  successDesc: { fontSize: 16, color: "#6B7280", textAlign: "center", marginBottom: 4 },
  successButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#00CC88", paddingHorizontal: 32, paddingVertical: 16, borderRadius: 14, gap: 8, marginTop: 32 },
  successButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "700" },
});