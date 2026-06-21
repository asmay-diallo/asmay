 import { useCallback } from "react";
 import Toast from "react-native-toast-message";
 
 // Poper les infos de l'utilisateur qui a liké 
export const popUserInfos = useCallback((userData: { 
  username: string; 
  avatarUrl?: string; 
  message?: string;
   }) => {
  Toast.show({
    type: 'userLikeInfos',
    text1: "💛 Nouveau Like",
    text2: userData.username.toUpperCase(),
    props: {
      avatarUrl: userData.avatarUrl,
      message: userData.message || 'Vous a envoyé un like',
    },
    position: "top",
    visibilityTime: 5000,
    autoHide: true,
    swipeable: true,
   
  });
 }, []);

  // Poper les infos de l'utilisateur qui a liké 
 export const popMessagesInfos = useCallback((messagesData: { 
   username: string; 
   avatarUrl?: string; 
   message: string;
   type:boolean
    }) => {
   Toast.show({
     type: 'messagesInfos',
     text1: "💛 Nouveau Message",
     text2: messagesData.username.toUpperCase(),
     props: {
       avatarUrl: messagesData.avatarUrl,
       message: messagesData.message ,
       messageType:messagesData.type ? 'text' : 'audio'
     },
     position: "top",
     visibilityTime: 4000,
     autoHide: true,
     swipeable: true,
   });
  }, []);

  export const popSignalsInfos = useCallback((signalsData:{
  username: string; 
  avatarUrl?: string; 
  message: string;
  })=>{
    Toast.show({
     type: 'signalsInfos',
     text1: "✨ Nouveau signal ",
     text2: signalsData.username.toUpperCase(),
     props: {
       avatarUrl: signalsData.avatarUrl,
       message: signalsData.message ,
     },
     position: "top",
     visibilityTime: 5000,
     autoHide: true,
     swipeable: true,
   });
  },[])