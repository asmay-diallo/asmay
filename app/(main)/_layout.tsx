import { Stack } from "expo-router";
// import { AuthProvider } from "../contexts/AuthContext";
import { Provider } from "react-redux";
import {useEffect} from "react"
// import { StreamVideoProvider } from '../contexts/StreamVideoContext';
// import { store } from "../store/store";
// import { useAuth } from "../hooks/useAuth";
// import { AuthContext } from "../contexts/AuthContext";
// import ScreenLoading from "../components/ScreenLoading";
import mobileAds from 'react-native-google-mobile-ads';
//  function RootLayout() {
//   return (
//     <Provider store={store}>
//       <AuthProvider>
//        {/* <StreamVideoProvider>  */}
//           <RootLayoutNav />
//       {/* </StreamVideoProvider> */}
//       </AuthProvider>
//     </Provider>
//   );
// }

export default function RootLayoutBodyNav() {
//   const { isAuthenticated, loading } = useAuth();


  return (
    <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(asmay)" />
        <Stack.Screen name="(yamsa)" />
    </Stack>
  );
}