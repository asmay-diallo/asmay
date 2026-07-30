import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "../store/store";
import mobileAds from "react-native-google-mobile-ads";
import Toast from "react-native-toast-message";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useIncomingCall } from "../hooks/webrtc/useIncomingCall";
import IncomingCallOverlay from "../components/IncomingCallOverlay";
import { useEffect } from "react";
import * as Updates from "expo-updates";
import { toastConfig } from "@/config/ToastConfig";
import { useAuth } from "../hooks/useAuth";
// import { useSocket } from '../hooks/useSocket';

// Initialisation du Query dans App et la configuration par defaut
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 15 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});
// function GlobalCallHandler() {
//   const { user } = useAuth();
// 
//   // Monte le gestionnaire global d'appels
//   useIncomingCall();
//   // Overlay visible PARTOUT
//   return <IncomingCallOverlay currentUser={user} />;
// }
function GlobalCallHandler() {
  const { user, isAuthenticated } = useAuth();

  //  N'activer le gestionnaire d'appels QUE si l'utilisateur est authentifié
  useIncomingCall();

  //  Protéger l'overlay
  if (!isAuthenticated || !user) return null;

  return <IncomingCallOverlay currentUser={user} />;
}
export default function RootLayout() {
  // const { hiReplyModal, handleSendHiReply } = useSocket()

  useEffect(() => {
    const initAdMob = async () => {
      try {
        await mobileAds().initialize();
        console.log("SDK AdMob initialisé");
      } catch (error) {
        console.error("Erreur AdMob:", error);
      }
    };
    initAdMob();
    //  Vérifie les mises à jour au lancement
    checkForUpdates();
  }, []);
  const checkForUpdates = async () => {
    // Ne vérifier pas en dev
    if (__DEV__) {
      return;
    }
    try {
      // Vérifie si une mise à jour est disponible
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        console.log("📦 Mise à jour disponible !");

        // Télécharge la mise à jour
        await Updates.fetchUpdateAsync();
        // Redémarre immédiatement et silencieusement
        Updates.reloadAsync();
      } else {
        console.log(" App à jour");
      }
    } catch (error: any) {
      console.log("Erreur vérification update:", error.message);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <PersistGate persistor={persistor}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "slide_from_right",
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(main)" />
          </Stack>
          <GlobalCallHandler />
          <Toast config={toastConfig} />
          {/* < HiReplyModal
       visible={hiReplyModal.visible}
        fromUser={hiReplyModal.fromUser}
        message={hiReplyModal.message}
        onClose={closeHiReplyModal}
        onSend={handleSendHiReply}
      />    */}
        </PersistGate>
      </Provider>
    </QueryClientProvider>
  );
}
