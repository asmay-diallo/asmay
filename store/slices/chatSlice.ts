
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ChatState, Chat } from '../../types';
import { chatAPI } from '../../services/api';

export const fetchChats = createAsyncThunk(
  'chats/fetchChats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatAPI.getChats();
      const chats = response.data.data as Chat[];
      
      return chats.map(chat => ({
        ...chat,
        unreadCount: 0 // Sera calculé depuis les messages
      }));
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur chargement chats');
    }
  }
);

const initialState: ChatState = {
  chats: [],
  currentChat: null,
  loading: false,
  error: null,
  unreadCount: 0,
};

const chatSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    setCurrentChat: (state, action: PayloadAction<Chat | null>) => {
      state.currentChat = action.payload;
    },
    
    receiveNewChat: (state, action: PayloadAction<Chat>) => {
      const newChat = action.payload;
      if (!state.chats.some(c => c._id === newChat._id)) {
        state.chats.unshift({
          ...newChat,
          unreadCount: 0
        });
      }
    },
    
    updateChatLastMessage: (state, action: PayloadAction<{
      chatId: string;
      content: string;
      senderId:string;
      currentUserId: string;
      type: string;
    }>) => {
      const { chatId, content, senderId, currentUserId, type } = action.payload;
      const chatIndex = state.chats.findIndex(c => c._id === chatId);
      
      if (chatIndex !== -1) {
        const chat = state.chats[chatIndex];
        
        // Mettre à jour le message et l'activité
        chat.lastActivity = new Date().toISOString();
        
        // Formater le message pour l'affichage
        if (type==="audio") {
          chat.lastMessage = "🎤 Message vocal";
        } else {
          chat.lastMessage = content.length > 35? content.substring(0, 35) + "..." : content;
        }
        
        // 🔥 Gestion des messages non lus : SEULEMENT pour les messages des AUTRES
        if (senderId !== currentUserId) {
          chat.unreadCount = (chat.unreadCount || 0) + 1;
          console.log(`📊 [${chatId}] Nouveau message de ${senderId}, unreadCount: ${chat.unreadCount}`);
        } else {
          console.log(`📤 [${chatId}] Message de l'utilisateur courant, pas d'incrémentation`);
        }
        
        // Recalculer le total global
        state.unreadCount = state.chats.reduce((total, c) => {
          return total + (c.unreadCount || 0);
        }, 0);
        
        // 🔥 Déplacer le chat en HAUT (s'il n'est pas déjà premier)
        if (chatIndex !== 0) {
          const [movedChat] = state.chats.splice(chatIndex, 1);
          state.chats.unshift(movedChat);
          console.log(`📌 [${chatId}] Chat déplacé en haut de la liste`);
        }
        
        console.log(`💬 [${chatId}] Dernier message: "${chat.lastMessage}", total non lus: ${state.unreadCount}`);
      } else {
        console.log(`⚠️ Chat ${chatId} non trouvé`);
      }
    },
    
    markChatAsRead: (state, action: PayloadAction<string>) => {
      const chatId = action.payload;
      const chat = state.chats.find(c => c._id === chatId);
      
      if (chat && chat.unreadCount > 0) {
        const oldCount = chat.unreadCount;
        state.unreadCount -= oldCount;
        chat.unreadCount = 0;
        console.log(`✅ [${chatId}] Marquage comme lu, ${oldCount} message(s), total restant: ${state.unreadCount}`);
      }
    },
    
    updateUnreadCount: (state, action: PayloadAction<{ chatId: string; unreadCount: number }>) => {
      const { chatId, unreadCount } = action.payload;
      const chat = state.chats.find(c => c._id === chatId);
      
      if (chat) {
        const oldCount = chat.unreadCount || 0;
        chat.unreadCount = unreadCount;
        state.unreadCount = state.unreadCount - oldCount + unreadCount;
        console.log(`📊 [${chatId}] Mise à jour unreadCount: ${oldCount} → ${unreadCount}, total: ${state.unreadCount}`);
      }
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    resetChats: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload.sort((a, b) => 
          new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
        );
        state.unreadCount = 0;
        console.log(`✅ Chats chargés: ${state.chats.length} conversations`);
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCurrentChat,
  receiveNewChat,
  updateChatLastMessage,
  markChatAsRead,
  updateUnreadCount,
  clearError,
  resetChats,
} = chatSlice.actions;

export default chatSlice.reducer;