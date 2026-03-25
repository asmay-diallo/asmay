
import {useEffect, useState} from "react";
import { Tabs } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {useChats} from "../../../hooks/useChats"

export default function MainLayout() {
  const [unreadMessage,setUnreadMessage] = useState<number|undefined>()
  const {unreadCount:globalUnreadCount} = useChats()
  useEffect(()=>{

const unread = globalUnreadCount >  0 ? globalUnreadCount :undefined

setUnreadMessage(unread)
  },[globalUnreadCount])
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#f87305ff", // Orange vif
        tabBarInactiveTintColor: "#666668", // Gris doux
        tabBarStyle: {
          backgroundColor: "#ffffffff", // Fond blanc
          height: 58 + insets.bottom,
          paddingBottom: insets.bottom,
          borderTopWidth: 1,
          borderTopColor: "#E5E5EA",
          elevation: 8, // Ombre Android
          shadowColor: "#000", // Ombre iOS
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
          backgroundColor: "#007AFF", // Bleu iOS
        },
        headerShown:false,
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
          title: "Asmay",
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
        name="chat/videoCall"
         options={{ 
         headerShown: false,
         href: null,
    // presentation: 'modal' // Pour un effet modal
         }}   />
         <Tabs.Screen
              name="chat/[id]"
              options={{
                href: null, //  Cacher de la tab bar car c'est une page détail
                title: "Chat",
                tabBarIcon: ({ color, size, focused }) => (
                  <Ionicons 
                    name={focused ? "chatbubble" : "chatbubble-outline"} 
                    size={size} 
                    color={color} 
                  />
                ),
              }}
            />

      <Tabs.Screen
        name="message"
        options={{
          title: "Chats",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "chatbubbles" : "chatbubbles-outline"} 
              size={size} 
              color={color} 
            />
          ),
          tabBarBadge:unreadMessage
        }
      }

      />
      
      <Tabs.Screen
        name="notifications"
        options={{
          title: "Signaux",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "notifications" : "notifications-outline"} 
              size={size} 
              color={color} 
            />
          ),
          //  Badge pour notifications non lues

        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Moi",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons 
              name={focused ? "person" : "person-outline"} 
              size={size} 
              color={color} 
            />
          ),
        }}
      />
    </Tabs>
  );
}