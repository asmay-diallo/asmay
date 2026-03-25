
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { MessageState, Message } from '../../types';
import { chatAPI } from '../../services/api';

export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async (chatId: string, { rejectWithValue }) => {
    try {
      const response = await chatAPI.getMessages(chatId);
      return { chatId, messages: response.data.data as Message[] };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur chargement messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async ({ chatId, content, tempId }: { chatId: string; content: string; tempId: string }, { rejectWithValue }) => {
    try {
      const response = await chatAPI.sendMessage(chatId, content);
      return { 
        ...response.data.data as Message, 
        tempId,
        chatId 
      };
    } catch (error: any) {
      return rejectWithValue({ 
        error: error.response?.data?.message || 'Erreur envoi',
        tempId 
      });
    }
  }
);

const initialState: MessageState = {
  messagesByChat: {},
  loading: false,
  error: null,
  sendingStatus: {},
};

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    // Recevoir un nouveau message
    receiveNewMessage: (state, action: PayloadAction<Message>) => {
      const message = action.payload;
      const chatId = message.chatId ;
      
      if (!chatId) return;
      
      if (!state.messagesByChat[chatId]) {
        state.messagesByChat[chatId] = [];
      }
      
      // 🔥 Vérifier si le message existe déjà (éviter les doublons)
      const exists = state.messagesByChat[chatId].some(m => m._id === message._id);
      
      if (exists) {
        console.log(`⚠️ Message ${message._id} existe déjà, ignoré`);
        return;
      }
      
      // 🔥 Rechercher un message temporaire à remplacer (par contenu)
      const tempIndex = state.messagesByChat[chatId].findIndex(m => 
        m.temp === true && 
        m.content === message.content &&
        m.sender._id === message.sender._id
      );
      
      if (tempIndex !== -1) {
        console.log(`🔄 Remplacement du message temporaire ${state.messagesByChat[chatId][tempIndex]._id} par ${message._id}`);
        state.messagesByChat[chatId][tempIndex] = {
          ...message,
          temp: false,
          tempId: undefined,
          isSending: false,
          hasError: false,
          readBy: message.readBy || []
        };
      } else {
        console.log(`✅ Ajout nouveau message de ${message.sender.username}`);
        state.messagesByChat[chatId].push({
          ...message,
          temp: false,
          isSending: false,
          hasError: false,
          readBy: message.readBy || []
        });
      }
      
      // Nettoyer le statut d'envoi
      if (message.tempId) {
        delete state.sendingStatus[message.tempId];
      }
    },
    
    // Ajouter un message temporaire
   // store/slices/messageSlice.ts
addTemporaryMessage: (state, action: PayloadAction<Message>) => {
  const message = action.payload;
  const chatId = message.chatId ;
  
  if (!chatId) return;
  
  if (!state.messagesByChat[chatId]) {
    state.messagesByChat[chatId] = [];
  }
  
  // 🔥 S'assurer que le message a un ID valide
  const messageWithValidId = {
    ...message,
    _id: message._id || message.tempId || `temp-${Date.now()}`,
    tempId: message.tempId || message._id,
  };
  
  state.messagesByChat[chatId].push(messageWithValidId);
  state.sendingStatus[messageWithValidId.tempId || messageWithValidId._id] = 'sending';
  console.log(`📝 Message temporaire ajouté: ${messageWithValidId._id}`);
},
    
    // Mettre à jour le statut d'un message
    updateMessageStatus: (state, action: PayloadAction<{
      tempId: string;
      status: 'sending' | 'sent' | 'error';
      messageId?: string;
      chatId?: string;
    }>) => {
      const { tempId, status, messageId, chatId } = action.payload;
      state.sendingStatus[tempId] = status;
      
      if (chatId && state.messagesByChat[chatId]) {
        const index = state.messagesByChat[chatId].findIndex(m => 
          m._id === tempId || m.tempId === tempId
        );
        
        if (index !== -1) {
          if (status === 'sent' && messageId) {
            state.messagesByChat[chatId][index]._id = messageId;
            state.messagesByChat[chatId][index].temp = false;
            state.messagesByChat[chatId][index].isSending = false;
            state.messagesByChat[chatId][index].tempId = undefined;
            console.log(`✅ Message ${tempId} confirmé, nouvel ID: ${messageId}`);
          } else if (status === 'error') {
            state.messagesByChat[chatId][index].hasError = true;
            state.messagesByChat[chatId][index].isSending = false;
            console.log(`❌ Message ${tempId} en erreur`);
          }
        }
      }
    },
    
    // Marquer un message comme lu
    markMessageAsRead: (state, action: PayloadAction<{
      messageId: string;
      chatId: string;
      userId: string;
    }>) => {
      const { messageId, chatId, userId } = action.payload;
      const messages = state.messagesByChat[chatId];
      
      if (messages) {
        const message = messages.find(m => m._id === messageId);
        if (message && !message.readBy?.includes(userId)) {
          message.readBy = [...(message.readBy || []), userId];
          console.log(`👁️ Message ${messageId} marqué comme lu par ${userId}`);
        }
      }
    },
    
    // Marquer tous les messages d'un chat comme lus
    markAllMessagesAsRead: (state, action: PayloadAction<{
      chatId: string;
      userId: string;
    }>) => {
      const { chatId, userId } = action.payload;
      const messages = state.messagesByChat[chatId];
      
      if (messages) {
        let markedCount = 0;
        messages.forEach(message => {
          if (message.sender._id !== userId && !message.readBy?.includes(userId)) {
            message.readBy = [...(message.readBy || []), userId];
            markedCount++;
          }
        });
        console.log(`✅ ${markedCount} message(s) marqué(s) comme lu dans le chat ${chatId}`);
      }
    },
    
    // Messages vocaux
    addTemporaryVoiceMessage: (state, action: PayloadAction<Message>) => {
      const message = action.payload;
      const chatId = message.chatId ;
      
      if (!chatId) return;
      
      if (!state.messagesByChat[chatId]) {
        state.messagesByChat[chatId] = [];
      }
      
      state.messagesByChat[chatId].push(message);
      state.sendingStatus[message.tempId || message._id] = 'sending';
      console.log(`🎤 Message vocal temporaire ajouté: ${message._id}`);
    },
    
    updateTemporaryVoiceMessage: (state, action: PayloadAction<{
      tempId: string;
      messageId: string;
      audioUrl: string;
      duration: number;
      chatId: string;
    }>) => {
      const { tempId, messageId, audioUrl, duration, chatId } = action.payload;
      const messages = state.messagesByChat[chatId];
      
      if (messages) {
        const index = messages.findIndex(m => m._id === tempId || m.tempId === tempId);
        if (index !== -1) {
          messages[index] = {
            ...messages[index],
            _id: messageId,
            audioUrl,
            duration,
            isSending: false,
            temp: false,
          };
          console.log(`🎤 Message vocal mis à jour: ${tempId} → ${messageId}`);
        }
      }
      
      state.sendingStatus[tempId] = 'sent';
    },
    
    markVoiceMessageError: (state, action: PayloadAction<{ tempId: string; chatId: string }>) => {
      const { tempId, chatId } = action.payload;
      const messages = state.messagesByChat[chatId];
      
      if (messages) {
        const index = messages.findIndex(m => m._id === tempId || m.tempId === tempId);
        if (index !== -1) {
          messages[index].hasError = true;
          messages[index].isSending = false;
          console.log(`❌ Message vocal en erreur: ${tempId}`);
        }
      }
      
      state.sendingStatus[tempId] = 'error';
    },
    
    receiveNewVoiceMessage: (state, action: PayloadAction<Message>) => {
      const message = action.payload;
      const chatId = message.chatId ;
      
      if (!chatId) return;
      
      if (!state.messagesByChat[chatId]) {
        state.messagesByChat[chatId] = [];
      }
      
      if (!state.messagesByChat[chatId].some(m => m._id === message._id)) {
        state.messagesByChat[chatId].push({
          ...message,
          temp: false,
          isSending: false,
          hasError: false,
          readBy: message.readBy || []
        });
        console.log(`🎤 Nouveau message vocal de ${message.sender.username}`);
      }
    },
    
    clearChatMessages: (state, action: PayloadAction<string>) => {
      delete state.messagesByChat[action.payload];
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        const { chatId, messages } = action.payload;
        state.messagesByChat[chatId] = messages.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        console.log(`📚 ${messages.length} messages chargés pour le chat ${chatId}`);
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(sendMessage.pending, (state, action) => {
        const { tempId } = action.meta.arg;
        state.sendingStatus[tempId] = 'sending';
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const { tempId } = action.payload;
        state.sendingStatus[tempId] = 'sent';
      })
      .addCase(sendMessage.rejected, (state, action) => {
        const { tempId } = (action.payload as any) || {};
        if (tempId) {
          state.sendingStatus[tempId] = 'error';
        }
      });
  },
});

export const {
  receiveNewMessage,
  addTemporaryMessage,
  updateMessageStatus,
  markMessageAsRead,
  markAllMessagesAsRead,
  clearChatMessages,
  clearError,
  addTemporaryVoiceMessage,
  updateTemporaryVoiceMessage,
  receiveNewVoiceMessage,
  markVoiceMessageError
} = messageSlice.actions;

export default messageSlice.reducer;