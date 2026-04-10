
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';
import ScreenLoading from '../components/ScreenLoading';
import { store,persistor } from "../store/store";
import mobileAds from "react-native-google-mobile-ads";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from "react"

// Initialisation du Query dans App et la configuration par defaut
const queryClient = new QueryClient({
  defaultOptions:{
    queries:{
      staleTime:5*60*1000,
      gcTime:15*60*1000,
      retry:1,
      refetchOnWidowFocus:false,
      refetchOnReconnect:true
    },
    mutations:{
      retry:1
    }
  }
})

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
      <PersistGate  loading={<ScreenLoading />} persistor={persistor}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />          
          <Stack.Screen name="(auth)" />         
          <Stack.Screen name="(main)" />         
        </Stack>
    </PersistGate>
    </Provider>
    </QueryClientProvider>

  );
}