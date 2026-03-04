import { Stack } from "expo-router";
// import {Stack} from "@react-navigation/native"
import { Provider } from "react-redux";
import {useEffect} from "react"
import mobileAds from 'react-native-google-mobile-ads';


export default function RootLayoutBodyNav() {
//   const { isAuthenticated, loading } = useAuth();


  return (
    <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(asmay)" />
        <Stack.Screen name="(yamsa)" />
    </Stack>
  );
}