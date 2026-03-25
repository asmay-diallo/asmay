
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';
import ScreenLoading from '../components/ScreenLoading';
import { store,persistor } from "../store/store";
import mobileAds from "react-native-google-mobile-ads";
import { useEffect } from "react"
// Etats de Redux 

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
    <Provider store={store}>
      <PersistGate  loading={<ScreenLoading />} persistor={persistor}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />          
          <Stack.Screen name="(auth)" />         
          <Stack.Screen name="(main)" />         
        </Stack>
    </PersistGate>
    </Provider>

  );
}