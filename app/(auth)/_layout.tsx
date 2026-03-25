import { Stack } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";


export default function AuthLayout() {
    
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: "#007bff",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerRight: () => (
          <Ionicons name={"heart"} size={40} color={"#fdd008ff"} />
        ),
      }}
    >
      <Stack.Screen name="index" options={{ title: "Connexion" }} />
      <Stack.Screen name="register" options={{ title: "Inscription" }} />
      <Stack.Screen name="verify" options={{ title: "Vérification de l'email" }} />
    </Stack>
  );
}
