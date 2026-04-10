// // hooks/queries/useMessagesQuery.ts
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { chatAPI } from '../../services/api';
// import { Message } from '../../types';
// import { useAuth } from '../useAuth';
// import { useSocket } from '../useSocket';
// 
// // Lecture des messages
// export const useMessagesQuery = (chatId: string) => {
//   const { user } = useAuth();
//   
//   return useQuery({
//     queryKey: ['messages', chatId],
//     queryFn: async () => {
//       const response = await chatAPI.getMessages(chatId);
//       return response.data.data as Message[];
//     },
//     enabled: !!chatId && !!user,
//     staleTime: 30 * 1000, // 30 secondes
//     gcTime: 5 * 60 * 1000, // 5 minutes
//   });
// };
// 
// //  Envoi de message avec mise à jour optimiste
// export const useSendMessage = (chatId: string) => {
//   const queryClient = useQueryClient();
//   const { user } = useAuth();
//   
//   return useMutation({
//     mutationFn: (content: string) => chatAPI.sendMessage(chatId, content),
//     
//     onMutate: async (content) => {
//       // Annuler les requêtes en cours
//       await queryClient.cancelQueries({ queryKey: ['messages', chatId] });
//       
//       // Sauvegarder l'état précédent
//       const previousMessages = queryClient.getQueryData(['messages', chatId]);
//       
//       // Créer le message temporaire
//       const tempMessage: Message = {
//         _id: `temp-${Date.now()}`,
//         chatId: chatId,
//         content: content,
//         sender: {
//           _id: user?._id || '',
//           username: user?.username || 'Vous',
//           profilePicture: user?.profilePicture,
//         },
//         createdAt: new Date().toISOString(),
//         type: 'text',
//         temp: true,
//         isSending: true,
//         hasError: false,
//         readBy: [user?._id || '']
//       };
//       
//       // Mettre à jour le cache
//       queryClient.setQueryData(['messages', chatId], (old: Message[] = []) => [
//         ...old,
//         tempMessage
//       ]);
//       
//       // Mettre à jour le dernier message dans les chats
//       queryClient.setQueryData(['chats'], (oldChats: any[] = []) => {
//         return oldChats.map(chat => {
//           if (chat._id === chatId) {
//             return {
//               ...chat,
//               lastMessage: content,
//               lastActivity: new Date().toISOString(),
//             };
//           }
//           return chat;
//         });
//       });
//       
//       return { previousMessages, tempId: tempMessage._id };
//     },
//     
//     //  Succès - remplacer le message temporaire
//     onSuccess: (response, variables, context) => {
//       const realMessage = response.data.data;
//       
//       queryClient.setQueryData(['messages', chatId], (old: Message[] = []) => {
//         return old.map(msg => 
//           msg._id === context?.tempId ? { ...realMessage, isSending: false, temp: false } : msg
//         );
//       });
//       // S'assurer que les données soient fraiches Rêquete API
//       queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
//       queryClient.invalidateQueries({ queryKey: ['chats'] });
//     },
//     
//     //  Erreur - restaurer l'état précédent
//     onError: (err, variables, context) => {
//       if (context?.previousMessages) {
//         queryClient.setQueryData(['messages', chatId], context.previousMessages);
//       }
//     },
//   });
// };
// 
// //  Envoi de message vocal
// export const useSendVoiceMessage = (chatId: string) => {
//   const queryClient = useQueryClient();
//   const { user } = useAuth();
//   
//   return useMutation({
//     mutationFn: ({ audioUri, duration }: { audioUri: string; duration: number }) =>
//       chatAPI.sendVoiceMessage(chatId, audioUri, duration),
//     
//     onMutate: async ({ audioUri, duration }) => {
//       await queryClient.cancelQueries({ queryKey: ['messages', chatId] });
//       
//       const previousMessages = queryClient.getQueryData(['messages', chatId]);
//       
//       const tempMessage: Message = {
//         _id: `temp-voice-${Date.now()}`,
//         chatId: chatId,
//         content: '',
//         audioUrl: audioUri,
//         duration: duration,
//         sender: {
//           _id: user?._id || '',
//           username: user?.username || 'Vous',
//           profilePicture: user?.profilePicture,
//         },
//         createdAt: new Date().toISOString(),
//         type: 'audio',
//         temp: true,
//         isSending: true,
//         hasError: false,
//         readBy: [user?._id || '']
//       };
//       
//       queryClient.setQueryData(['messages', chatId], (old: Message[] = []) => [
//         ...old,
//         tempMessage
//       ]);
//       
//       queryClient.setQueryData(['chats'], (oldChats: any[] = []) => {
//         return oldChats.map(chat => {
//           if (chat._id === chatId) {
//             return {
//               ...chat,
//               lastMessage: "🎤 Message vocal",
//               lastActivity: new Date().toISOString(),
//             };
//           }
//           return chat;
//         });
//       });
//       
//       return { previousMessages, tempId: tempMessage._id };
//     },
//     
//     onSuccess: (response, variables, context) => {
//       const data = response.data.data;
//       
//       queryClient.setQueryData(['messages', chatId], (old: Message[] = []) => {
//         return old.map(msg => 
//           msg._id === context?.tempId ? {
//             ...msg,
//             _id: data._id,
//             audioUrl: data.audioFullUrl || data.audioUrl,
//             duration: data.duration,
//             isSending: false,
//             temp: false,
//           } : msg
//         );
//       });
//           // S'assurer que les données soient fraiches Rêquete API
//       queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
//       queryClient.invalidateQueries({ queryKey: ['chats'] });
// 
//     },
//     
//     onError: (err, variables, context) => {
//       if (err) {
//         console.log("Errror de voice :" ,err.message)
//       }
//       if (context?.previousMessages) {
//         queryClient.setQueryData(['messages', chatId], context.previousMessages);
//       }
//     },
//   });
// };
// 
// //  Suppression d'un message
// export const useDeleteMessage = (chatId: string) => {
//   const queryClient = useQueryClient();
//   
//   return useMutation({
//     mutationFn: (messageId: string) => chatAPI.deleteOneMessage(messageId, chatId),
//     onSuccess: (_, messageId) => {
//       queryClient.setQueryData(['messages', chatId], (old: Message[] = []) => {
//         const filtered = old.filter(msg => msg._id !== messageId);
//         
//         // Mettre à jour le dernier message
//         const lastMessage = filtered[filtered.length - 1];
//         queryClient.setQueryData(['chats'], (oldChats: any[] = []) => {
//           return oldChats.map(chat => {
//             if (chat._id === chatId) {
//               return {
//                 ...chat,
//                 lastMessage: lastMessage?.content || lastMessage?.audioUrl ? "🎤 Message vocal" : null,
//                 lastActivity: lastMessage?.createdAt || new Date().toISOString(),
//               };
//             }
//             return chat;
//           });
//         });
//         
//         return filtered;
//       });
//     },
//   });
// };
// 
// //  Marquer un message comme lu
// export const useMarkMessageAsRead= (chatId: string) => {
//   const queryClient = useQueryClient();
//   const { user } = useAuth();
//   
//   return useMutation({
//     mutationFn: (messageId: string) => Promise.resolve(),
//     onMutate: (messageId) => {
//       queryClient.setQueryData(['messages', chatId], (old: Message[] = []) => {
//         return old.map(msg => {
//           if (msg._id === messageId && !msg.readBy?.includes(user?._id || '')) {
//             return {
//               ...msg,
//               readBy: [...(msg.readBy || []), user?._id || '']
//             };
//           }
//           return msg;
//         });
//       });
//       
//       // Notifier le serveur via socket
//       const {socket} = useSocket();
//       if (socket) {
//         socket.emit('mark_message_read', { chatId, messageId });
//       }
//     },
//   });
// };
// hooks/queries/useMessagesQuery.ts (version complète)
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatAPI } from '../../services/api';
import { Message } from '../../types';
import { useAuth } from '../useAuth';
import { useSocket } from '../useSocket';

//  Lecture des messages (texte + vocal)
export const useMessagesQuery = (chatId: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['messages', chatId],
    queryFn: async () => {
      const response = await chatAPI.getMessages(chatId);
      return response.data.data as Message[];
    },
    enabled: !!chatId && !!user,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

//  Envoi de message texte
export const useSendMessageMutation = (chatId: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { socket } = useSocket();
  
  return useMutation({
    mutationFn: (content: string) => chatAPI.sendMessage(chatId, content),
    
    onMutate: async (content) => {
      await queryClient.cancelQueries({ queryKey: ['messages', chatId] });
      const previousMessages = queryClient.getQueryData(['messages', chatId]);
      
      const tempMessage: Message = {
        _id: `temp-${Date.now()}`,
        chatId: chatId,
        content: content,
        sender: {
          _id: user?._id || '',
          username: user?.username || 'Vous',
          profilePicture: user?.profilePicture,
        },
        createdAt: new Date().toISOString(),
        type: 'text',
        temp: true,
        isSending: true,
        hasError: false,
      };
      
      queryClient.setQueryData(['messages', chatId], (old: Message[] = []) => [...old, tempMessage]);
      
      // Mettre à jour le dernier message dans les chats
      queryClient.setQueryData(['chats'], (oldChats: any[] = []) => {
        return oldChats.map(chat => 
          chat._id === chatId 
            ? { ...chat, lastMessage: content, lastActivity: new Date().toISOString() }
            : chat
        );
      });
      
      if (socket) {
        socket.emit('send_message', { chatId, content, tempId: tempMessage._id });
      }
      
      return { previousMessages, tempId: tempMessage._id };
    },
    
    onSuccess: (response, _, context) => {
      const realMessage = response.data.data;
      queryClient.setQueryData(['messages', chatId], (old: Message[] = []) => {
        return old.map(msg => 
          msg._id === context?.tempId ? { ...realMessage, isSending: false } : msg
        );
      });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
    
    onError: (_, __, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['messages', chatId], context.previousMessages);
      }
    },
  });
};

//  Envoi de message vocal
export const useSendVoiceMessageMutation = (chatId: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { socket } = useSocket();
  
  return useMutation({
    mutationFn: ({ audioUri, duration }: { audioUri: string; duration: number }) =>
      chatAPI.sendVoiceMessage(chatId, audioUri, duration),
    
    onMutate: async ({ audioUri, duration }) => {
      await queryClient.cancelQueries({ queryKey: ['messages', chatId] });
      const previousMessages = queryClient.getQueryData(['messages', chatId]);
      
      const tempMessage: Message = {
        _id: `temp-voice-${Date.now()}`,
        chatId: chatId,
        content: '',
        audioUrl: audioUri,
        duration: duration,
        sender: {
          _id: user?._id || '',
          username: user?.username || 'Vous',
          profilePicture: user?.profilePicture,
        },
        createdAt: new Date().toISOString(),
        type: 'audio',
        temp: true,
        isSending: true,
        hasError: false,
      };
      
      queryClient.setQueryData(['messages', chatId], (old: Message[] = []) => [...old, tempMessage]);
      
      // Mettre à jour le dernier message dans les chats
      queryClient.setQueryData(['chats'], (oldChats: any[] = []) => {
        return oldChats.map(chat => 
          chat._id === chatId 
            ? { ...chat, lastMessage: "🎤 Message vocal", lastActivity: new Date().toISOString() }
            : chat
        );
      });
      
      if (socket) {
        socket.emit('send_voice_message', { chatId, tempId: tempMessage._id, duration, audioUrl: audioUri });
      }
      
      return { previousMessages, tempId: tempMessage._id };
    },
    
    onSuccess: (response, _, context) => {
      const data = response.data.data;
      queryClient.setQueryData(['messages', chatId], (old: Message[] = []) => {
        return old.map(msg => 
          msg._id === context?.tempId 
            ? {
                ...msg,
                _id: data._id,
                audioUrl: data.audioFullUrl || data.audioUrl,
                duration: data.duration,
                isSending: false,
                temp: false,
              }
            : msg
        );
      });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
    
    onError: (_, __, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['messages', chatId], context.previousMessages);
      }
    },
  });
};

// Suppression d'un message
export const useDeleteMessageMutation = (chatId: string) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (messageId: string) => chatAPI.deleteOneMessage(messageId, chatId),
    onSuccess: (_, messageId) => {
      queryClient.setQueryData(['messages', chatId], (old: Message[] = []) => {
        const filtered = old.filter(msg => msg._id !== messageId);
        const lastMessage = filtered[filtered.length - 1];
        
        // Mettre à jour le dernier message du chat
        queryClient.setQueryData(['chats'], (oldChats: any[] = []) => {
          return oldChats.map(chat => 
            chat._id === chatId 
              ? { 
                  ...chat, 
                  lastMessage: lastMessage?.type === 'audio' ? "🎤 Message vocal" : lastMessage?.content || null,
                  lastActivity: lastMessage?.createdAt || new Date().toISOString(),
                }
              : chat
          );
        });
        
        return filtered;
      });
    },
  });
};