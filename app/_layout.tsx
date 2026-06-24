
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';
import { store,persistor } from "../store/store";
import mobileAds from "react-native-google-mobile-ads";
import Toast from 'react-native-toast-message';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useIncomingCall } from '../hooks/webrtc/useIncomingCall';
import IncomingCallOverlay from '../components/IncomingCallOverlay';
import { useEffect } from "react"
import { toastConfig } from "@/config/ToastConfig";
import { useAuth } from '../hooks/useAuth';

// Initialisation du Query dans App et la configuration par defaut
const queryClient = new QueryClient({
  defaultOptions:{
    queries:{
      staleTime:5*60*1000,
      gcTime:15*60*1000,
      retry:1,
      refetchOnWindowFocus:false,
      refetchOnReconnect:true
    },
    mutations:{
      retry:1
    }
  }
})
 function GlobalCallHandler() {
  const { user } = useAuth();
  
  // Monte le gestionnaire global d'appels
  useIncomingCall();
  // Overlay visible PARTOUT
  return <IncomingCallOverlay currentUser={user} />;
}
export default function RootLayout() {

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
  }, []);

  return (
    <QueryClientProvider client={queryClient} >
        <Provider store={store}>
      <PersistGate   persistor={persistor}>
        <Stack screenOptions={
          {
             headerShown: false ,
             animation: 'slide_from_right',
          }
          }>
          <Stack.Screen name="index" />          
          <Stack.Screen name="(auth)" />         
          <Stack.Screen name="(main)" /> 
        </Stack>
       <GlobalCallHandler />

          <Toast config={toastConfig} />         
    </PersistGate>
    </Provider>
    </QueryClientProvider>

  );
}