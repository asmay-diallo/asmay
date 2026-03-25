// hooks/useSocketWithRedux.ts
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useSocket } from './useSocket';
import { useAuth } from './useAuth';
import { AppDispatch } from '../store/store';

// Signal actions
import { receiveNewSignal, signalAccepted, signalDeclined } from '../store/slices/signalSlice';

// Chat actions
import { receiveNewChat, updateChatLastMessage } from '../store/slices/chatSlice';

// Message actions
import { receiveNewMessage, updateMessageStatus } from '../store/slices/messageSlice';

// Voice message actions
import { receiveNewVoiceMessage } from '../store/slices/voiceMessageSlice';

export const useSocketWithRedux = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (!socket || !isConnected || !user) return;

    console.log('🔌 Socket Redux connecté');

    // ===== SIGNALS =====
    socket.on('new_signal', (signalData: any) => {
      console.log('📨 Nouveau signal reçu (Redux)');
      dispatch(receiveNewSignal(signalData));
    });

    socket.on('signal_accepted', (data: { signalId: string }) => {
      console.log('✅ Signal accepté (Redux)');
      dispatch(signalAccepted(data));
    });

    socket.on('signal_declined', (data: { signalId: string }) => {
      console.log('❌ Signal refusé (Redux)');
      dispatch(signalDeclined(data));
    });

    // ===== CHATS =====
    socket.on('new_chat', (chatData: any) => {
      console.log('💬 Nouveau chat créé (Redux)');
      dispatch(receiveNewChat(chatData));
    });

    socket.on('chat_updated', (data: any) => {
      dispatch(updateChatLastMessage({
        chatId: data.chatId,
        message: data.message,
        senderId: data.senderId,
        currentUserId: user._id
      }));
    });

    // ===== MESSAGES TEXTE =====
    socket.on('new_message', (messageData: any) => {
      console.log('📝 Nouveau message texte (Redux)');
      dispatch(receiveNewMessage(messageData));
    });

    socket.on('message_sent', (data: { tempId: string; messageId: string }) => {
      dispatch(updateMessageStatus({
        tempId: data.tempId,
        status: 'sent',
        messageId: data.messageId
      }));
    });

    socket.on('message_error', (error: { tempId?: string; error: string }) => {
      if (error.tempId) {
        dispatch(updateMessageStatus({
          tempId: error.tempId,
          status: 'error'
        }));
      }
    });

    // ===== MESSAGES VOCAUX =====
    socket.on('new_voice_message', (messageData: any) => {
      console.log('🎤 Nouveau message vocal (Redux)');
      dispatch(receiveNewVoiceMessage(messageData));
    });

    socket.on('voice_message_sent', (data: { tempId: string; messageId: string }) => {
      dispatch(updateMessageStatus({
        tempId: data.tempId,
        status: 'sent',
        messageId: data.messageId
      }));
    });

    socket.on('voice_message_error', (error: { tempId?: string; error: string }) => {
      if (error.tempId) {
        dispatch(updateMessageStatus({
          tempId: error.tempId,
          status: 'error'
        }));
      }
    });

    return () => {
      socket.off('new_signal');
      socket.off('signal_accepted');
      socket.off('signal_declined');
      socket.off('new_chat');
      socket.off('chat_updated');
      socket.off('new_message');
      socket.off('message_sent');
      socket.off('message_error');
      socket.off('new_voice_message');
      socket.off('voice_message_sent');
      socket.off('voice_message_error');
    };
  }, [socket, isConnected, user, dispatch]);

  return { socket, isConnected };
};