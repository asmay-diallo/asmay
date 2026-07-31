import { Stack } from "expo-router";
export default function RootLayoutBodyNav() {

  return (
    <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(asmay)" /> 
         <Stack.Screen name="(yamsa)" />
    </Stack>

  );
}