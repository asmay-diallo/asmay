
import { useCallback, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import {
  fetchMessages,
  sendMessage,
  receiveNewMessage,
  addTemporaryMessage,
  updateMessageStatus,
  markMessageAsRead,
  markAllMessagesAsRead,
  clearChatMessages,
  addTemporaryVoiceMessage,
  updateTemporaryVoiceMessage,
  markVoiceMessageError,
  receiveNewVoiceMessage,
} from '../store/slices/messageSlice';
import { updateChatLastMessage, updateUnreadCount } from '../store/slices/chatSlice';
import { useAuth } from './useAuth';
import { useSocket } from './useSocket';
import { Message } from '../types';

interface UseMessagesReturn {
  messages: Message[];
  loading: boolean;
  error: string | null;
  sendingStatus: Record<string, 'sending' | 'sent' | 'error'>;
  sendMessage: (content: string) => Promise<void>;
  sendVoiceMessage: (audioUri: string, duration: number) => Promise<void>;
  loadMessages: () => Promise<void>;
  
  clearMessages: () => void;
  markAsRead: (messageId: string) => void;
  markAllAsRead: () => void;
  isSending: (tempId: string) => boolean;
  retrySend: (tempId: string) => void;
  unreadCount: number;
  enterChat: () => void;
  leaveChat: () => void;
  scrollToBottom?: () => void;
}

export const useMessages = (chatId: string): UseMessagesReturn => {
  const dispatch = useDispatch<AppDispatch>();
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  const [isInChat, setIsInChat] = useState(false);
  const messageListRef = useRef<Message[]>([]);

  const messages = useSelector((state: RootState) => 
    state.messages.messagesByChat[chatId] || []
  );
  const loading = useSelector((state: RootState) => state.messages.loading);
  const error = useSelector((state: RootState) => state.messages.error);
  const sendingStatus = useSelector((state: RootState) => state.messages.sendingStatus);

  // Mettre à jour la référence
  useEffect(() => {
    messageListRef.current = messages;
  }, [messages]);

  // Calculer les messages non lus
  const unreadCount = messages.filter(msg => {
    if (msg.sender._id === user?._id) return false;
    const readBy = msg.readBy || [];
    return !readBy.includes(user?._id || '');
  }).length;

  

  // 🔥 Entrée/Sortie du chat
  const enterChat = useCallback(() => {
    setIsInChat(true);
    // if (unreadCount > 0) {
    //   markAllAsRead();
    // }
  }, [unreadCount]);

  const leaveChat = useCallback(() => {
    setIsInChat(false);
  }, []);

  const loadMessages = useCallback(async () => {
    if (!chatId) return;
    try {
      await dispatch(fetchMessages(chatId)).unwrap();
    } catch (error) {
      console.error('❌ Erreur chargement messages:', error);
    }
  }, [dispatch, chatId]);

  // ==================== ENVOI DE MESSAGE TEXTE ====================
  const sendMessageHandler = useCallback(async (content: string) => {
    if (!content.trim() || !chatId) return;

    const tempId = `temp-${Date.now()}`;

    const tempMessage: Message = {
      _id: tempId,
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
      tempId: tempId,
      isSending: true,
      hasError: false,
      readBy: [user?._id || '']
    };

    dispatch(addTemporaryMessage(tempMessage));
    updateLastMessageInChat(tempMessage, false);

    if (socket && isConnected) {
      socket.emit('send_message', {
        chatId,
        content,
        tempId,
        timestamp: new Date(),
      });

      const handleMessageSent = (data: { tempId: string; messageId: string }) => {
        if (data.tempId === tempId) {
          dispatch(updateMessageStatus({
            tempId: data.tempId,
            status: 'sent',
            messageId: data.messageId,
            chatId,
          }));
          socket.off('message_sent', handleMessageSent);
        }
      };

      const handleMessageError = (error: { tempId: string; error: string }) => {
        if (error.tempId === tempId) {
          dispatch(updateMessageStatus({
            tempId: error.tempId,
            status: 'error',
            chatId,
          }));
          socket.off('message_error', handleMessageError);
        }
      };

      socket.on('message_sent', handleMessageSent);
      socket.on('message_error', handleMessageError);

      setTimeout(() => {
        if (socket) {
          socket.off('message_sent', handleMessageSent);
          socket.off('message_error', handleMessageError);
        }
      }, 10000);
    }
  }, [dispatch, chatId, user, socket, isConnected]);

  // ==================== ENVOI DE MESSAGE VOCAL ====================
  const sendVoiceMessageHandler = useCallback(async (audioUri: string, duration: number) => {
    const tempId = `temp-voice-${Date.now()}`;

    const tempVoiceMessage: Message = {
      _id: tempId,
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
      tempId: tempId,
      isSending: true,
      hasError: false,
      readBy: [user?._id || '']
    };

    dispatch(addTemporaryVoiceMessage(tempVoiceMessage));
    updateLastMessageInChat(tempVoiceMessage, true);

    if (socket && isConnected) {
      socket.emit('send_voice_message', {
        chatId,
        tempId,
        duration,
        audioUrl: audioUri,
        timestamp: new Date(),
      });

      const handleVoiceMessageStored = (data: { tempId: string; messageId: string; audioUrl: string }) => {
        if (data.tempId === tempId) {
          dispatch(updateTemporaryVoiceMessage({
            tempId: data.tempId,
            messageId: data.messageId,
            audioUrl: data.audioUrl,
            duration,
            chatId,
          }));
          socket.off('voice_message_stored', handleVoiceMessageStored);
        }
      };

      const handleVoiceMessageError = (error: { tempId: string; error: string }) => {
        if (error.tempId === tempId) {
          dispatch(markVoiceMessageError({ tempId, chatId }));
          socket.off('voice_message_error', handleVoiceMessageError);
        }
      };

      socket.on('voice_message_stored', handleVoiceMessageStored);
      socket.on('voice_message_error', handleVoiceMessageError);

      setTimeout(() => {
        if (socket) {
          socket.off('voice_message_stored', handleVoiceMessageStored);
          socket.off('voice_message_error', handleVoiceMessageError);
        }
      }, 10000);
    }
  }, [dispatch, chatId, user, socket, isConnected]);

  // ==================== MARQUAGE COMME LU ====================
  const markAsRead = useCallback((messageId: string) => {
    if (!user?._id) return;
    
    dispatch(markMessageAsRead({
      messageId,
      chatId,
      userId: user._id,
    }));
    
    const updatedUnreadCount = messageListRef.current.filter(msg => {
      if (msg.sender._id === user._id) return false;
      const readBy = msg.readBy || [];
      return !readBy.includes(user._id) && msg._id !== messageId;
    }).length;
    
    dispatch(updateUnreadCount({ chatId, unreadCount: updatedUnreadCount }));
  }, [dispatch, chatId, user?._id]);

  const markAllAsRead = useCallback(() => {
    if (!user?._id) return;
    
    dispatch(markAllMessagesAsRead({
      chatId,
      userId: user._id,
    }));
    
    dispatch(updateUnreadCount({ chatId, unreadCount: 0 }));
    
    if (socket && isConnected) {
      socket.emit('mark_chat_read', { chatId });
    }
  }, [dispatch, chatId, user?._id, socket, isConnected]);

  // ==================== UTILITAIRES ====================
  const clearMessages = useCallback(() => {
    dispatch(clearChatMessages(chatId));
  }, [dispatch, chatId]);

  const isSending = useCallback((tempId: string): boolean => {
    return sendingStatus[tempId] === 'sending';
  }, [sendingStatus]);

  const retrySend = useCallback(async (tempId: string) => {
    const failedMessage = messages.find(m => m._id === tempId || m.tempId === tempId);
    if (failedMessage && failedMessage.content) {
      await sendMessageHandler(failedMessage.content);
    }
  }, [messages, sendMessageHandler]);

  // ==================== ÉCOUTE DES MESSAGES EN TEMPS RÉEL ====================
  useEffect(() => {
    if (!socket || !chatId) return;

    const handleNewMessage = (messageData: Message) => {
      const messageChatId = messageData.chatId || messageData.chat;
      
      if (messageChatId === chatId) {
        // 🔥 Ignorer mes propres messages (retour du serveur)
        if (messageData.sender._id === user?._id) {
          console.log(`📤 Mon propre message reçu en retour: ${messageData._id}`);
          
          const tempMessage = messageListRef.current.find(m => 
            m.temp === true && m.content === messageData.content
          );
          
          if (tempMessage && tempMessage.tempId) {
            dispatch(updateMessageStatus({
              tempId: tempMessage.tempId,
              status: 'sent',
              messageId: messageData._id,
              chatId,
            }));
          }
          return;
        }
        
        // 🔥 Message d'un autre utilisateur
        const exists = messageListRef.current.some(m => m._id === messageData._id);
        
        if (!exists) {
          console.log(`📨 Nouveau message de ${messageData.sender.username}`);
          
          dispatch(receiveNewMessage(messageData));
          updateLastMessageInChat(messageData, messageData.type === 'audio');
          
          if (!isInChat) {
            const newUnreadCount = unreadCount + 1;
            dispatch(updateUnreadCount({ chatId, unreadCount: newUnreadCount }));
            console.log(`📊 Incrémentation unreadCount (hors chat): ${newUnreadCount}`);
          } else {
            console.log(`👁️ Dans le chat, message marqué directement comme lu`);
            dispatch(markMessageAsRead({
              messageId: messageData._id,
              chatId,
              userId: user?._id || '',
            }));
          }
        }
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('new_voice_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('new_voice_message', handleNewMessage);
    };
  }, [socket, chatId, user?._id, dispatch, unreadCount, isInChat]);

  useEffect(() => {
    if (chatId) {
      loadMessages();
    }
    
    return () => {
      clearMessages();
    };
  }, [chatId]);

  return {
    messages,
    loading,
    error,
    sendingStatus,
    sendMessage: sendMessageHandler,
    sendVoiceMessage: sendVoiceMessageHandler,
    loadMessages,
    clearMessages,
    markAsRead,
    markAllAsRead,
    isSending,
    retrySend,
    unreadCount,
    enterChat,
    leaveChat,
  };
};