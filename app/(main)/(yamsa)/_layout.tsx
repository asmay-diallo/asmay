// 
// import {useEffect, useState} from "react";
// import { Tabs } from "expo-router";
// import Ionicons from "@expo/vector-icons/Ionicons";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// 
// export default function MainLayout() {
//   const [unreadMessage,setUnreadMessage] = useState<number|undefined>()
//   const insets = useSafeAreaInsets();
// //   let  count =+ 
// // setTimeout(()=>{
// //  setUnreadMessage(count)
// //  
// // },10000)
//   return (
//     <Tabs
//       screenOptions={{
//         tabBarActiveTintColor: "#f87305ff", // Orange vif
//         tabBarInactiveTintColor: "#666668", // Gris doux
//         tabBarStyle: {
//           backgroundColor: "#ffffffff", // Fond blanc
//           height: 58 + insets.bottom,
//           paddingBottom: insets.bottom,
//           borderTopWidth: 1,
//           borderTopColor: "#E5E5EA",
//           elevation: 8, // Ombre Android
//           shadowColor: "#000", // Ombre iOS
//           shadowOffset: { width: 0, height: -2 },
//           shadowOpacity: 0.1,
//           shadowRadius: 8,
//         },
//         tabBarLabelStyle: {
//           fontSize: 14,
//           fontWeight: "bold",
//           marginTop: -4,
//         },
//         headerStyle: {
//           backgroundColor: "#007AFF", // Bleu iOS
//         },
//         headerShown:false,
//         headerTintColor: "#fff",
//         headerTitleStyle: {
//           fontWeight: "bold",
//           fontSize: 26,
//         },
//       }}
//     >
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: "Yamsa",
//           tabBarIcon: ({ color, size, focused }) => (
//             <Ionicons 
//               name={focused ? "heart" : "heart-outline"} 
//               size={size} 
//               color={color} 
//             />
//           ),
//         }}
//       />
//     
//          <Tabs.Screen
//               name="simA"
//               options={{
//                 title: "SimA",
//                 tabBarIcon: ({ color, size, focused }) => (
//                   <Ionicons 
//                     name={focused ? "card" : "card-outline"} 
//                     size={size} 
//                     color={color} 
//                   />
//                 ),
//               }}
//             />
//          <Tabs.Screen
//               name="contact"
//               options={{
//                 title: "Contact",
//                 tabBarIcon: ({ color, size, focused }) => (
//                   <Ionicons 
//                     name={focused ? "call" : "call-outline"} 
//                     size={size} 
//                     color={color} 
//                   />
//                 ),
//               }}
//             />
//      
//     </Tabs>
//   );
// }

import { useEffect, useState } from "react";
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function MainLayout() {
  const [unreadMessage, setUnreadMessage] = useState<number | undefined>();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#f87305ff",
        tabBarInactiveTintColor: "#666668",
        tabBarStyle: {
          backgroundColor: "#ffffffff",
          height: 58 + insets.bottom,
          paddingBottom: insets.bottom,
          borderTopWidth: 1,
          borderTopColor: "#E5E5EA",
          elevation: 8,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: "bold",
          marginTop: -4,
        },
        headerStyle: {
          backgroundColor: "#007AFF",
        },
        headerShown: false,
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
          fontSize: 26,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: " eSIM",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "heart" : "heart-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
   
      <Tabs.Screen
        name="simA"
        options={{
          title: "Shop",
          tabBarIcon: ({ color, size, focused }) => (
            <MaterialCommunityIcons
              name={focused ? "cart" : "cart-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="details"
        options={{
          title: "Détails",
           href: null, 
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "reader" : "reader-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transaction",
          // href:null,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "wallet" : "wallet-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="install"
        options={{
          title: "Activer",
          href:null,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "download" : "download-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="payment"
        options={{
          title: "Payer",
          href:null,
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "download" : "download-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}