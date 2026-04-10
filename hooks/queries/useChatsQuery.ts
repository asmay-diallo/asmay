import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatAPI } from '../../services/api';
import { Chat } from '../../types';
import { useAuth } from '../useAuth';
import { useSocket } from '../useSocket';
import { useDispatch } from 'react-redux';
import { updateUnreadCount } from '../../store/slices/chatSlice';

// La lecture des chats (Lecture)===========
export const useChatsQuery = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['chats'],
    queryFn: async () => {
      const response = await chatAPI.getChats();
      const chats = response.data.data as Chat[];
      
      // Initialiser unreadCount à 0 
      return chats.map(chat => ({
        ...chat,
        unreadCount: 0
      }));
    },
    staleTime: 5 * 60 * 1000, 
    gcTime: 15 * 60 * 1000,   
    enabled: !!user, 
  });
};


// Supprimer un chat (mutation)
export const useDeleteChat =()=>{
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn:(chatId:string)=>chatAPI.deleteOneChat(chatId),
        onSuccess:(_,chatId)=>{
            // Mettre à jour cache en supprimant chat 
            queryClient.setQueryData(['chats'],(old:Chat[] = [])=>{
               return old.filter(chat =>chat._id !== chatId)
            })
        }
    })

}

// Mettre à jour le dernier message 
export const useUpdateChatLastMessage = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();

 const updateChat = (data: {
    chatId: string;
    content: string;
    senderId: string;
    currentUserId: string;
    type: string;
  }) => {
    const {chatId,content,senderId,currentUserId,type}=data

   queryClient.setQueryData(['chats'], (old: Chat[] = []) => {
      const chatIndex = old.findIndex(c => c._id === chatId);
      if (chatIndex === -1) return old;
      
      const newChats = [...old];
      const chat = { ...newChats[chatIndex] };
      
      // Mettre à jour le message et l'activité
      chat.lastActivity = new Date().toISOString();
      
      // Formater le message pour l'affichage
      if (type === "audio") {
        chat.lastMessage = "🎤 Message vocal";
      } else {
        chat.lastMessage = content.length > 35 ? content.substring(0, 35) + "..." : content;
      }
      
      // Gestion des messages non lus
      if (senderId !== currentUserId) {
        chat.unreadCount = (chat.unreadCount || 0) + 1;
        
        // Synchroniser avec Redux (pour le compteur global)
        dispatch(updateUnreadCount({ chatId, unreadCount: chat.unreadCount }));
      }
      
      newChats[chatIndex] = chat;
      
      // Déplacer le chat en haut
      const [movedChat] = newChats.splice(chatIndex, 1);
      newChats.unshift(movedChat);
      

  })
 }
 return {updateChat}
}

//  Marquer un chat comme lu
export const useMarkChatAsRead = () => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { socket, isConnected } = useSocket();
  
  return useMutation({
    mutationFn: async (chatId: string) => {
      // Mettre à jour le cache immédiatement (optimiste)
      queryClient.setQueryData(['chats'], (old: Chat[] = []) => {
        return old.map(chat => {
          if (chat._id === chatId) {
            return { ...chat, unreadCount: 0 };
          }
          return chat;
        });
      });
      
      // Synchroniser avec Redux
      dispatch(updateUnreadCount({ chatId, unreadCount: 0 }));
      
      // Notifier via socket
      if (socket && isConnected) {
        socket.emit('mark_chat_read', { chatId });
      }
      
      return chatId;
    },
  });
}
