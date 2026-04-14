
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { PersistGate } from 'redux-persist/integration/react';
import ScreenLoading from '../components/ScreenLoading';
import { store,persistor } from "../store/store";
import mobileAds from "react-native-google-mobile-ads";
import Toast from 'react-native-toast-message';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from "react"
import {StyleSheet,View, Text, Image} from 'react-native'

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
 const toastConfig = {
  userInfos: ({ text1, text2, props }: ToastConfigParams<any>) => (
    <View style={styles.userToast}>
      <Image 
        source={{ uri: props.avatarUrl || 'https://via.placeholder.com/50' }} 
        style={styles.avatar} 
      />
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{text1}</Text>
        <Text style={styles.userNickname}>{text2}</Text>
        {props.message && <Text style={styles.userMessage}>{props.message}</Text>}
      </View>
    </View>
  ),
  
  // Gardez les autres types si vous en avez
  success: (props: any) => (
    <View style={[styles.userToast, styles.successToast]}>
      <Text>{props.text1}</Text>
    </View>
  ),
};

const styles = StyleSheet.create({
  userToast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatar: {
    width: 65,
    height: 65,
    borderRadius: 35,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 15, fontWeight: 'bold', color: '#333' },
  userNickname: { fontSize: 13, color: '#FF6B6B', fontWeight: '500', marginTop: 2 },
  userMessage: { fontSize: 12, color: '#666', marginTop: 2 },
  successToast: { backgroundColor: '#D4EDDA' },
});
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
          <Toast config={toastConfig} />         
    </PersistGate>
    </Provider>
    </QueryClientProvider>

  );
}