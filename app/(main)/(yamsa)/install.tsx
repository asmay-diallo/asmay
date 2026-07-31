// 
// import React, { useState, useEffect, useRef } from "react";
// import {
//   View, Text, StyleSheet, TouchableOpacity, Animated,
//   Easing, Alert, ActivityIndicator,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { useRouter, useLocalSearchParams } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";
// import { esimAPI } from "../../../services/api";
// 
// // ==================== MOCK ====================
// const USE_MOCK = true;
// 
// type InstallationStep = "checking" | "installing" | "activating" | "completed" | "error";
// 
// interface StepConfig {
//   label: string;
//   description: string;
//   icon: string;
//   color: string;
// }
// 
// const STEPS: Record<InstallationStep, StepConfig> = {
//   checking: { label: "Vérification", description: "Vérification de la compatibilité eSIM...", icon: "phone-portrait-outline", color: "#f87305ff" },
//   installing: { label: "Installation", description: "Téléchargement du profil eSIM sur votre appareil...", icon: "download-outline", color: "#f87305ff" },
//   activating: { label: "Activation", description: "Configuration et activation du forfait...", icon: "cellular-outline", color: "#f87305ff" },
//   completed: { label: "Activé !", description: "Votre Forfait est prêt à être utilisée", icon: "checkmark-circle", color: "#00CC88" },
//   error: { label: "Échoué", description: "Une erreur est survenue lors de l'activation", icon: "alert-circle", color: "#FF4444" },
// };
// 
// export default function InstallationScreen() {
//   const router = useRouter();
//   const params = useLocalSearchParams<{ iccid: string; productName: string; lpaString: string }>();
//   const { iccid, productName, lpaString } = params;
// 
//   const [currentStep, setCurrentStep] = useState<InstallationStep>("checking");
//   const [progress, setProgress] = useState(0);
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);
//   const [usingMock, setUsingMock] = useState(false);
// 
//   const progressAnim = useRef(new Animated.Value(0)).current;
//   const pulseAnim = useRef(new Animated.Value(1)).current;
//   const checkmarkScale = useRef(new Animated.Value(0)).current;
//   const fadeInAnim = useRef(new Animated.Value(0)).current;
// 
//   useEffect(() => { Animated.timing(fadeInAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start(); }, []);
// 
//   useEffect(() => {
//     if (currentStep !== "completed" && currentStep !== "error") {
//       const pulse = Animated.loop(Animated.sequence([
//         Animated.timing(pulseAnim, { toValue: 1.08, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
//         Animated.timing(pulseAnim, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
//       ]));
//       pulse.start();
//       return () => pulse.stop();
//     } else {
//       Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
//     }
//   }, [currentStep]);
// 
//   useEffect(() => { Animated.timing(progressAnim, { toValue: progress, duration: 400, useNativeDriver: false }).start(); }, [progress]);
// 
//   useEffect(() => {
//     if (currentStep === "completed") {
//       Animated.sequence([
//         Animated.timing(checkmarkScale, { toValue: 1.2, duration: 300, useNativeDriver: true }),
//         Animated.spring(checkmarkScale, { toValue: 1, friction: 3, tension: 100, useNativeDriver: true }),
//       ]).start();
//     }
//   }, [currentStep]);
// 
//   useEffect(() => {
//     const runInstallation = async () => {
//       try {
//         if (USE_MOCK) {
//           setUsingMock(true);
//         }
// 
//         setCurrentStep("checking"); setProgress(5); await delay(1500); setProgress(20);
// 
//         if (!USE_MOCK) {
//           try { await esimAPI.getESIMStatus(iccid); } catch (err) { console.warn("⚠️ Statut indisponible"); }
//         }
// 
//         setCurrentStep("installing"); setProgress(25); await delay(2000); setProgress(50); await delay(1500); setProgress(70);
//         setCurrentStep("activating"); setProgress(75); await delay(1500); setProgress(90);
// 
//         if (!USE_MOCK) {
//           try { await esimAPI.getESIMStatus(iccid); } catch (err) {}
//         }
// 
//         await delay(1000);
//         setProgress(100); setCurrentStep("completed");
//       } catch (error: any) {
//         setCurrentStep("error"); setErrorMessage(error.message || "Erreur inconnue");
//       }
//     };
//     if (iccid) runInstallation();
//   }, [iccid]);
// 
//   const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
// 
//   const handleFinish = () => { router.push("/(main)/(yamsa)"); };
// 
//   const handleRetry = () => {
//     setCurrentStep("checking"); setProgress(0); setErrorMessage(null);
//     const run = async () => {
//       try {
//         setCurrentStep("checking"); setProgress(5); await delay(1500); setProgress(20);
//         setCurrentStep("installing"); setProgress(25); await delay(2000); setProgress(50); await delay(1500); setProgress(70);
//         setCurrentStep("activating"); setProgress(75); await delay(1500); setProgress(90); await delay(1000);
//         setProgress(100); setCurrentStep("completed");
//       } catch (error: any) { setCurrentStep("error"); setErrorMessage(error.message || "Erreur inconnue"); }
//     };
//     run();
//   };
// 
//   const handleContactSupport = () => { Alert.alert("Support", "Notre équipe support est disponible 24/7.\n\nContactez-nous à support@monapp.com", [{ text: "OK" }]); };
// 
//   const step = STEPS[currentStep];
//   const progressWidth = progressAnim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] });
// 
//   return (
//     <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
//       <Animated.View style={[styles.content, { opacity: fadeInAnim }]}>
//         <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }], borderColor: step.color + "30", backgroundColor: step.color + "10" }, currentStep === "completed" && styles.iconContainerCompleted, currentStep === "error" && styles.iconContainerError]}>
//           {currentStep === "completed" ? <Animated.View style={{ transform: [{ scale: checkmarkScale }] }}><Ionicons name="checkmark-circle" size={80} color="#00CC88" /></Animated.View>
//           : currentStep === "error" ? <Ionicons name="alert-circle" size={80} color="#FF4444" />
//           : <Ionicons name={step.icon as any} size={56} color={step.color} />}
//         </Animated.View>
// 
//         <Text style={[styles.title, currentStep === "completed" && styles.titleSuccess, currentStep === "error" && styles.titleError]}>{step.label}</Text>
//         <Text style={styles.description}>{currentStep === "error" ? errorMessage : step.description}</Text>
// 
//         {usingMock && currentStep !== "completed" && currentStep !== "error" && (
//           <View style={styles.mockBadge}><Text style={styles.mockBadgeText}>🟡 Mode simulation</Text></View>
//         )}
// 
//         {productName && (
//           <View style={styles.productInfo}>
//             <Ionicons name="cellular-outline" size={20} color="#f87305ff" />
//             <View style={styles.productInfoText}>
//               <Text style={styles.productName} numberOfLines={1}>{productName}</Text>
//               {iccid && <Text style={styles.productIccid} numberOfLines={1}>ICCID: {iccid}</Text>}
//             </View>
//           </View>
//         )}
// 
//         {currentStep !== "completed" && currentStep !== "error" && (
//           <View style={styles.progressContainer}>
//             <View style={styles.progressBar}><Animated.View style={[styles.progressFill, { width: progressWidth, backgroundColor: step.color }]} /></View>
//             <Text style={[styles.progressText, { color: step.color }]}>{Math.round(progress)}%</Text>
//           </View>
//         )}
// 
//         <View style={styles.stepsContainer}>
//           {(["checking", "installing", "activating"] as InstallationStep[]).map((s, index) => {
//             const stepConfig = STEPS[s];
//             const isActive = currentStep === s;
//             const isPast = (s === "checking" && ["installing", "activating", "completed"].includes(currentStep)) || (s === "installing" && ["activating", "completed"].includes(currentStep)) || (s === "activating" && currentStep === "completed");
//             const isCurrentOrPast = isActive || isPast;
//             return (
//               <View key={s} style={styles.stepRow}>
//                 <View style={[styles.stepDot, isActive && { backgroundColor: stepConfig.color, borderColor: stepConfig.color }, isPast && { backgroundColor: "#00CC88", borderColor: "#00CC88" }, !isCurrentOrPast && { backgroundColor: "#F0F2F5", borderColor: "#E1E5EB" }]}>
//                   {isPast ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : isActive ? <View style={styles.stepDotPulse} /> : <Text style={styles.stepNumber}>{index + 1}</Text>}
//                 </View>
//                 <View style={styles.stepInfo}>
//                   <Text style={[styles.stepLabel, isCurrentOrPast && styles.stepLabelActive]}>{stepConfig.label}</Text>
//                   {isActive && <Text style={styles.stepDescription}>{stepConfig.description}</Text>}
//                 </View>
//                 {isActive && <ActivityIndicator size="small" color={stepConfig.color} />}
//               </View>
//             );
//           })}
//         </View>
//       </Animated.View>
// 
//       <View style={styles.bottomBar}>
//         {currentStep === "completed" && (
//           <TouchableOpacity style={styles.finishButton} onPress={handleFinish} activeOpacity={0.8}>
//             <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
//             <Text style={styles.finishButtonText}>Voir mes Forfaits</Text>
//           </TouchableOpacity>
//         )}
//         {currentStep === "error" && (
//           <View style={styles.errorActions}>
//             <TouchableOpacity style={styles.retryButton} onPress={handleRetry} activeOpacity={0.8}><Ionicons name="refresh" size={20} color="#f87305ff" /><Text style={styles.retryButtonText}>Réessayer</Text></TouchableOpacity>
//             <TouchableOpacity style={styles.supportButton} onPress={handleContactSupport} activeOpacity={0.7}><Ionicons name="chatbubble-ellipses-outline" size={18} color="#6B7280" /><Text style={styles.supportButtonText}>Contacter le support</Text></TouchableOpacity>
//           </View>
//         )}
//       </View>
// 
//       {(currentStep === "completed" || currentStep === "error") && (
//         <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
//           <Ionicons name="arrow-back" size={22} color="#fafafb" /><Text style={styles.backButtonText}>Retour</Text>
//         </TouchableOpacity>
//       )}
//     </SafeAreaView>
//   );
// }
// 
// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: "#FFFFFF" },
//   content: { flex: 1, alignItems: "center", paddingHorizontal: 24, paddingTop: 40 },
//   iconContainer: { width: 130, height: 130, borderRadius: 65, borderWidth: 3, justifyContent: "center", alignItems: "center", marginBottom: 24 },
//   iconContainerCompleted: { borderColor: "#00CC8830", backgroundColor: "#E8F5E9" },
//   iconContainerError: { borderColor: "#FF444430", backgroundColor: "#FFEBEE" },
//   title: { fontSize: 26, fontWeight: "700", color: "#1A1D26", textAlign: "center", marginBottom: 8 },
//   titleSuccess: { color: "#00CC88" },
//   titleError: { color: "#FF4444" },
//   description: { fontSize: 15, color: "#6B7280", textAlign: "center", lineHeight: 22, marginBottom: 24, paddingHorizontal: 10 },
//   mockBadge: { backgroundColor: "#FFF3E0", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10, marginBottom: 16 },
//   mockBadgeText: { fontSize: 13, fontWeight: "600", color: "#FF9800" },
//   productInfo: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF8F0", borderRadius: 12, padding: 14, marginBottom: 28, width: "100%", borderWidth: 1, borderColor: "#f87305ff20" },
//   productInfoText: { flex: 1, marginLeft: 10 },
//   productName: { fontSize: 15, fontWeight: "600", color: "#1A1D26" },
//   productIccid: { fontSize: 11, color: "#9CA3AF", fontFamily: "monospace", marginTop: 2 },
//   progressContainer: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 32, width: "100%" },
//   progressBar: { flex: 1, height: 10, backgroundColor: "#F0F2F5", borderRadius: 5, overflow: "hidden" },
//   progressFill: { height: "100%", borderRadius: 5 },
//   progressText: { fontSize: 16, fontWeight: "700", minWidth: 45, textAlign: "right" },
//   stepsContainer: { width: "100%", gap: 20 },
//   stepRow: { flexDirection: "row", alignItems: "center", gap: 14 },
//   stepDot: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, justifyContent: "center", alignItems: "center" },
//   stepDotPulse: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#FFFFFF" },
//   stepNumber: { fontSize: 14, fontWeight: "600", color: "#9CA3AF" },
//   stepInfo: { flex: 1 },
//   stepLabel: { fontSize: 16, fontWeight: "600", color: "#9CA3AF" },
//   stepLabelActive: { color: "#1A1D26" },
//   stepDescription: { fontSize: 13, color: "#6B7280", marginTop: 3, lineHeight: 18 },
//   bottomBar: { paddingHorizontal: 24, paddingVertical: 20, borderTopWidth: 1, borderTopColor: "#F0F2F5", backgroundColor: "#FFFFFF" },
//   finishButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#00CC88", paddingVertical: 16, borderRadius: 14, gap: 8, shadowColor: "#00CC88", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
//   finishButtonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" },
//   errorActions: { gap: 12 },
//   retryButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#FFF3E0", paddingVertical: 14, borderRadius: 14, gap: 8, borderWidth: 1, borderColor: "#f87305ff30" },
//   retryButtonText: { color: "#f87305ff", fontSize: 16, fontWeight: "600" },
//   supportButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, gap: 6 },
//   supportButtonText: { color: "#6B7280", fontSize: 14, textDecorationLine: "underline" },
//   backButton: { position: "absolute", top: 30, left: 16, flexDirection: "row", alignItems: "center", gap: 4, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, backgroundColor: "#f87305ff" },
//   backButtonText: { fontSize: 14, color: "#f7f9fc", fontWeight: "500" },
// });
import React, { useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Animated,
  Easing, Alert, ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useESIMInstall } from "../../../hooks/useESIMInstall";

type InstallationStep = "checking" | "installing" | "activating" | "completed" | "error";

const STEPS: Record<InstallationStep, { label: string; description: string; icon: string; color: string }> = {
  checking: { label: "Vérification", description: "Vérification de la compatibilité eSIM...", icon: "phone-portrait-outline", color: "#f87305ff" },
  installing: { label: "Installation", description: "Téléchargement du profil eSIM...", icon: "download-outline", color: "#f87305ff" },
  activating: { label: "Activation", description: "Configuration et activation...", icon: "cellular-outline", color: "#f87305ff" },
  completed: { label: "Activé !", description: "Votre forfait est prêt !", icon: "checkmark-circle", color: "#00CC88" },
  error: { label: "Échec", description: "Une erreur est survenue", icon: "alert-circle", color: "#FF4444" },
};

export default function InstallationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ iccid: string; productName: string; lpaString: string }>();
  const { iccid, productName, lpaString } = params;

  const { currentStep, progress, error, installESIM } = useESIMInstall();

  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const fadeInAnim = useRef(new Animated.Value(0)).current;

  // Lancer l'installation automatiquement
  useEffect(() => {
    if (iccid && lpaString) {
      installESIM(lpaString, iccid, productName || "Forfait eSIM");
    }
  }, [iccid, lpaString]);

  // Animations
  useEffect(() => { Animated.timing(fadeInAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start(); }, []);

  useEffect(() => {
    if (currentStep !== "completed" && currentStep !== "error") {
      const pulse = Animated.loop(Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.08, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]));
      pulse.start();
      return () => pulse.stop();
    }
  }, [currentStep]);

  useEffect(() => { Animated.timing(progressAnim, { toValue: progress, duration: 400, useNativeDriver: false }).start(); }, [progress]);

  useEffect(() => {
    if (currentStep === "completed") {
      Animated.spring(checkmarkScale, { toValue: 1, friction: 3, tension: 100, useNativeDriver: true }).start();
    }
  }, [currentStep]);

  const handleFinish = () => router.replace("/(main)/(yamsa)");
  const handleRetry = () => installESIM(lpaString, iccid, productName || "Forfait eSIM");
  const handleContactSupport = () => Alert.alert("Support", "support@monapp.com", [{ text: "OK" }]);

  const step = STEPS[currentStep];
  const progressWidth = progressAnim.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] });

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, { opacity: fadeInAnim }]}>
        <Animated.View style={[styles.iconContainer, { transform: [{ scale: pulseAnim }], borderColor: step.color + "30", backgroundColor: step.color + "10" }, currentStep === "completed" && styles.iconContainerCompleted, currentStep === "error" && styles.iconContainerError]}>
          {currentStep === "completed" ? (
            <Animated.View style={{ transform: [{ scale: checkmarkScale }] }}>
              <Ionicons name="checkmark-circle" size={80} color="#00CC88" />
            </Animated.View>
          ) : currentStep === "error" ? (
            <Ionicons name="alert-circle" size={80} color="#FF4444" />
          ) : (
            <Ionicons name={step.icon as any} size={56} color={step.color} />
          )}
        </Animated.View>

        <Text style={[styles.title, currentStep === "completed" && styles.titleSuccess, currentStep === "error" && styles.titleError]}>{step.label}</Text>
        <Text style={styles.description}>{currentStep === "error" ? error : step.description}</Text>

        {productName && (
          <View style={styles.productInfo}>
            <Ionicons name="cellular-outline" size={20} color="#f87305ff" />
            <View style={styles.productInfoText}>
              <Text style={styles.productName} numberOfLines={1}>{productName}</Text>
              {iccid && <Text style={styles.productIccid} numberOfLines={1}>ICCID: {iccid}</Text>}
            </View>
          </View>
        )}

        {currentStep !== "completed" && currentStep !== "error" && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View style={[styles.progressFill, { width: progressWidth, backgroundColor: step.color }]} />
            </View>
            <Text style={[styles.progressText, { color: step.color }]}>{Math.round(progress)}%</Text>
          </View>
        )}

        <View style={styles.stepsContainer}>
          {(["checking", "installing", "activating"] as InstallationStep[]).map((s, index) => {
            const stepConfig = STEPS[s];
            const isActive = currentStep === s;
            const isPast = (s === "checking" && ["installing", "activating", "completed"].includes(currentStep)) || (s === "installing" && ["activating", "completed"].includes(currentStep)) || (s === "activating" && currentStep === "completed");
            const isCurrentOrPast = isActive || isPast;
            return (
              <View key={s} style={styles.stepRow}>
                <View style={[styles.stepDot, isActive && { backgroundColor: stepConfig.color, borderColor: stepConfig.color }, isPast && { backgroundColor: "#00CC88", borderColor: "#00CC88" }, !isCurrentOrPast && { backgroundColor: "#F0F2F5", borderColor: "#E1E5EB" }]}>
                  {isPast ? <Ionicons name="checkmark" size={14} color="#FFFFFF" /> : isActive ? <View style={styles.stepDotPulse} /> : <Text style={styles.stepNumber}>{index + 1}</Text>}
                </View>
                <View style={styles.stepInfo}>
                  <Text style={[styles.stepLabel, isCurrentOrPast && styles.stepLabelActive]}>{stepConfig.label}</Text>
                  {isActive && <Text style={styles.stepDescription}>{stepConfig.description}</Text>}
                </View>
                {isActive && <ActivityIndicator size="small" color={stepConfig.color} />}
              </View>
            );
          })}
        </View>
      </Animated.View>

      <View style={styles.bottomBar}>
        {currentStep === "completed" && (
          <TouchableOpacity style={styles.finishButton} onPress={handleFinish} activeOpacity={0.8}>
            <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
            <Text style={styles.finishButtonText}>Voir mes eSIM</Text>
          </TouchableOpacity>
        )}
        {currentStep === "error" && (
          <View style={styles.errorActions}>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry} activeOpacity={0.8}>
              <Ionicons name="refresh" size={20} color="#f87305ff" />
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.supportButton} onPress={handleContactSupport}>
              <Text style={styles.supportButtonText}>Contacter le support</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  content: { flex: 1, alignItems: "center", paddingHorizontal: 24, paddingTop: 40 },
  iconContainer: { width: 130, height: 130, borderRadius: 65, borderWidth: 3, justifyContent: "center", alignItems: "center", marginBottom: 24 },
  iconContainerCompleted: { borderColor: "#00CC8830", backgroundColor: "#E8F5E9" },
  iconContainerError: { borderColor: "#FF444430", backgroundColor: "#FFEBEE" },
  title: { fontSize: 26, fontWeight: "700", color: "#1A1D26", textAlign: "center", marginBottom: 8 },
  titleSuccess: { color: "#00CC88" },
  titleError: { color: "#FF4444" },
  description: { fontSize: 15, color: "#6B7280", textAlign: "center", lineHeight: 22, marginBottom: 24 },
  productInfo: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF8F0", borderRadius: 12, padding: 14, marginBottom: 28, width: "100%", borderWidth: 1, borderColor: "#f87305ff20" },
  productInfoText: { flex: 1, marginLeft: 10 },
  productName: { fontSize: 15, fontWeight: "600", color: "#1A1D26" },
  productIccid: { fontSize: 11, color: "#9CA3AF", fontFamily: "monospace", marginTop: 2 },
  progressContainer: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 32, width: "100%" },
  progressBar: { flex: 1, height: 10, backgroundColor: "#F0F2F5", borderRadius: 5, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 5 },
  progressText: { fontSize: 16, fontWeight: "700", minWidth: 45, textAlign: "right" },
  stepsContainer: { width: "100%", gap: 20 },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  stepDot: { width: 32, height: 32, borderRadius: 16, borderWidth: 2, justifyContent: "center", alignItems: "center" },
  stepDotPulse: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#FFFFFF" },
  stepNumber: { fontSize: 14, fontWeight: "600", color: "#9CA3AF" },
  stepInfo: { flex: 1 },
  stepLabel: { fontSize: 16, fontWeight: "600", color: "#9CA3AF" },
  stepLabelActive: { color: "#1A1D26" },
  stepDescription: { fontSize: 13, color: "#6B7280", marginTop: 3 },
  bottomBar: { paddingHorizontal: 24, paddingVertical: 20, borderTopWidth: 1, borderTopColor: "#F0F2F5" },
  finishButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#00CC88", paddingVertical: 16, borderRadius: 14, gap: 8 },
  finishButtonText: { color: "#FFFFFF", fontSize: 17, fontWeight: "700" },
  errorActions: { gap: 12 },
  retryButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#FFF3E0", paddingVertical: 14, borderRadius: 14, gap: 8, borderWidth: 1, borderColor: "#f87305ff30" },
  retryButtonText: { color: "#f87305ff", fontSize: 16, fontWeight: "600" },
  supportButton: { alignItems: "center", paddingVertical: 10 },
  supportButtonText: { color: "#6B7280", fontSize: 14, textDecorationLine: "underline" },
});