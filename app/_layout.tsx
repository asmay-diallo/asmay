import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";
import { Provider } from "react-redux";
import { useEffect, useState } from "react";
import { StreamVideoProvider } from "../contexts/StreamVideoContext";
import { store } from "../store/store";
import { useAuth } from "../hooks/useAuth";
import { AuthContext } from "../contexts/AuthContext";
import ScreenLoading from "../components/ScreenLoading";
import mobileAds from "react-native-google-mobile-ads";
function RootLayout() {
  return (
    <Provider store={store}>
      <AuthProvider>
        {/* <StreamVideoProvider>  */}
        <RootLayoutNav />
        {/* </StreamVideoProvider> */}
      </AuthProvider>
    </Provider>
  );
}

export default function RootLayoutNav() {
  const { isAuthenticated, loading } = useAuth();
  const [truth, setTruth] = useState(true);
  useEffect(() => {
    const initAdMob = async () => {
      await mobileAds().initialize();
      console.log("SDK AdMob initialisé pour le test.");
    };
    initAdMob();
    console.log("Est-il authentifié ? :", isAuthenticated);
  }, []);

  if (loading) {
    return <ScreenLoading />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="(auth)" />
      ) : (
        <Stack.Screen name="(main)" />
      )}
    </Stack>
  );
}
