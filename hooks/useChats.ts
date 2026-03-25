

import { useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'expo-router';
import { RootState, AppDispatch } from '../store/store';
import {
  fetchChats,
  setCurrentChat,
  receiveNewChat,
  updateChatLastMessage,
  markChatAsRead,
  updateUnreadCount,
  resetChats,
} from '../store/slices/chatSlice';
import { useAuth } from './useAuth';
import { useSocket } from './useSocket';
import { Chat } from '../types';

interface UseChatsReturn {
  chats: Chat[];
  currentChat: Chat | null;
  loading: boolean;
  error: string | null;
  unreadCount: number;
  loadChats: () => Promise<void>;
  setCurrentChat: (chat: Chat | null) => void;
  markAsRead: (chatId: string) => void;
  navigateToChat: (chatId: string) => void;
  getOtherUser: (chat: Chat) => any;
  getLastMessageTime: (lastActivity: string) => string;
   updateInChatLastMessage: (data: {   // ✅ ICI
    chatId: string;
    content: string;
    senderId:string;
    currentUserId: string;
    type:string,
    lastActivity?: string;
  }) => void;
  getChatUnreadCount: (chatId: string) => number;
}

export const useChats = (): UseChatsReturn => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  const chats = useSelector((state: RootState) => state.chats.chats);
  const currentChat = useSelector((state: RootState) => state.chats.currentChat);
  const loading = useSelector((state: RootState) => state.chats.loading);
  const error = useSelector((state: RootState) => state.chats.error);
  const unreadCount = useSelector((state: RootState) => state.chats.unreadCount);
  const messagesByChat = useSelector((state: RootState) => state.messages.messagesByChat);

  // 🔥 Calculer les messages non lus à partir des messages
  const getChatUnreadCount = useCallback((chatId: string): number => {
    const messages = messagesByChat[chatId] || [];
    
    const unreadMessages = messages.filter(msg => {
      if (msg.sender._id === user?._id) return false;
      const readBy = msg.readBy || [];
      return !readBy.includes(user?._id || '');
    });
    
    return unreadMessages.length;
  }, [messagesByChat, user?._id]);

  // 🔥 Synchroniser le compteur avec les messages
  useEffect(() => {
    chats.forEach(chat => {
      const calculatedUnread = getChatUnreadCount(chat._id);
      if (chat.unreadCount !== calculatedUnread) {
        dispatch(updateUnreadCount({ chatId: chat._id, unreadCount: calculatedUnread }));
      }
    });
  }, [messagesByChat, chats, getChatUnreadCount, dispatch]);

  const loadChats = useCallback(async () => {
    try {
      await dispatch(fetchChats()).unwrap();
    } catch (error) {
      console.error('❌ Erreur chargement chats:', error);
    }
  }, [dispatch]);

  const handleSetCurrentChat = useCallback((chat: Chat | null) => {
    dispatch(setCurrentChat(chat));
  }, [dispatch]);

  const markAsRead = useCallback((chatId: string) => {
    dispatch(markChatAsRead(chatId));
    
    if (socket && isConnected) {
      socket.emit('mark_chat_read', { chatId });
    }
  }, [dispatch, socket, isConnected]);

  const navigateToChat = useCallback((chatId: string) => {
    markAsRead(chatId);
    router.push({
      pathname: "/(main)/(asmay)/chat/[id]",
      params: { id: chatId }
    });
  }, [router, markAsRead]);

  const getOtherUser = useCallback((chat: Chat) => {
    if (!user) return null;
    
    const participant1 = typeof chat.participant1 === 'object' ? chat.participant1 : null;
    const participant2 = typeof chat.participant2 === 'object' ? chat.participant2 : null;
    
    if (participant1?._id === user._id) return participant2;
    if (participant2?._id === user._id) return participant1;
    
    return null;
  }, [user]);
  // 🔥 Fonction pour mettre à jour le dernier message dans chatSlice
 
 const updateInChatLastMessage = useCallback((data: {
    chatId: string;
    content: string;
    senderId:string;
    currentUserId: string;
    lastActivity?: string;
    type:string
  }) => {
    dispatch(updateChatLastMessage(data));
  })
  const getLastMessageTime = useCallback((lastActivity: string): string => {
    const date = new Date(lastActivity);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Maintenant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} j`;
    
    return date.toLocaleDateString('fr-FR');
  }, []);

  // Écoute des événements socket
  useEffect(() => {
    if (!socket) return;

    const handleNewChat = (chatData: Chat) => {
      dispatch(receiveNewChat(chatData));
    };

    const handleChatUpdated = (data: {
      _id: string;
      lastActivity: string;
      lastMessage: string;
      senderId: string;
      content:string,
      type:string
    }) => {
      dispatch(updateChatLastMessage({
        chatId: data._id,
        content: data.lastMessage,
        senderId: data.senderId,
        currentUserId: user?._id || '',
        type:data.type
      }));
    };

    socket.on('new_chat', handleNewChat);
    socket.on('chat_updated', handleChatUpdated);

    return () => {
      socket.off('new_chat', handleNewChat);
      socket.off('chat_updated', handleChatUpdated);
    };
  }, [socket, user?._id, dispatch]);

  useEffect(() => {
    loadChats();
    return () => {
      dispatch(resetChats());
    };
  }, []);

  return {
    chats,
    currentChat,
    loading,
    error,
    unreadCount,
    loadChats,
    setCurrentChat: handleSetCurrentChat,
    markAsRead,
    navigateToChat,
    getOtherUser,
    getLastMessageTime,
    getChatUnreadCount,
      updateInChatLastMessage,
  };
};