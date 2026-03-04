
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../store/store";
import { AuthProvider } from "../contexts/AuthContext";
import mobileAds from "react-native-google-mobile-ads";
import { useEffect } from "react"

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
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />          
          <Stack.Screen name="(auth)" />         
          <Stack.Screen name="(main)" />         
        </Stack>
      </AuthProvider>
    </Provider>
  );
}