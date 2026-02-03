import { Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";
import { Provider } from "react-redux";
import {useEffect} from "react"
import { StreamVideoProvider } from '../contexts/StreamVideoContext';
import { store } from "../store/store";
import { useAuth } from "../hooks/useAuth";
import ScreenLoading from "../components/ScreenLoading";
import mobileAds from 'react-native-google-mobile-ads';


function RootLayoutNav() {
  const { isAuthenticated, loading } = useAuth();

useEffect(() => {
    const initAdMob = async () => {
      await mobileAds().initialize();
      console.log('SDK AdMob initialisé pour le test.');
    };
    initAdMob();
  }, []);

  if (loading) {
    return <ScreenLoading />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="/(main)" />
      ) : (
        <Stack.Screen name="/(auth)" />
      )}
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthProvider>
       <StreamVideoProvider> 
          <RootLayoutNav />
        </StreamVideoProvider>
      </AuthProvider>
    </Provider>
  );
}
