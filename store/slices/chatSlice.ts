import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Chat, Message } from '../../types';

interface ChatState {
  chats: Chat[];
  currentChat: Chat | null;
  isLoading: boolean;
  error: string | null;
  unreadCount: number;
}

const initialState: ChatState = {
  chats: [],
  currentChat: null,
  isLoading: false,
  error: null,
  unreadCount: 0,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    fetchChatsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchChatsSuccess: (state, action: PayloadAction<Chat[]>) => {
      state.isLoading = false;
      state.chats = action.payload;
      state.unreadCount = action.payload.reduce((total, chat) => total + (chat.unreadCount || 0), 0);
      state.error = null;
    },
    fetchChatsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    fetchMessagesStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchMessagesSuccess: (state, action: PayloadAction<{ chatId: string; messages: Message[] }>) => {
      state.isLoading = false;
      const chat = state.chats.find(chat => chat._id === action.payload.chatId);
      if (chat) {
        chat.messages = action.payload.messages;
      }
      if (state.currentChat && state.currentChat._id === action.payload.chatId) {
        state.currentChat.messages = action.payload.messages;
      }
      state.error = null;
    },
    fetchMessagesFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setCurrentChat: (state, action: PayloadAction<Chat | null>) => {
      state.currentChat = action.payload;
      if (action.payload) {
        // Reset unread count when opening a chat
        const chat = state.chats.find(chat => chat._id === action.payload?._id);
        if (chat && chat.unreadCount && chat.unreadCount > 0) {
          state.unreadCount -= chat.unreadCount;
          chat.unreadCount = 0;
        }
      }
    },
    sendMessageStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    sendMessageSuccess: (state, action: PayloadAction<{ chatId: string; message: Message }>) => {
      state.isLoading = false;
      const chat = state.chats.find(chat => chat._id === action.payload.chatId);
      if (chat) {
        if (!chat.messages) chat.messages = [];
        chat.messages.push(action.payload.message);
        chat.lastActivity = new Date().toISOString();
      }
      if (state.currentChat && state.currentChat._id === action.payload.chatId) {
        if (!state.currentChat.messages) state.currentChat.messages = [];
        state.currentChat.messages.push(action.payload.message);
      }
      state.error = null;
    },
    sendMessageFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    receiveMessage: (state, action: PayloadAction<{ chatId: string; message: Message }>) => {
      const chat = state.chats.find(chat => chat._id === action.payload.chatId);
      if (chat) {
        if (!chat.messages) chat.messages = [];
        chat.messages.push(action.payload.message);
        chat.lastActivity = new Date().toISOString();
        
        // Increment unread count if not current chat
        if (!state.currentChat || state.currentChat._id !== action.payload.chatId) {
          chat.unreadCount = (chat.unreadCount || 0) + 1;
          state.unreadCount += 1;
        }
      }
    },
    createChat: (state, action: PayloadAction<Chat>) => {
      state.chats.push(action.payload);
    },
    deleteChat: (state, action: PayloadAction<string>) => {
      const chat = state.chats.find(chat => chat._id === action.payload);
      if (chat && chat.unreadCount) {
        state.unreadCount -= chat.unreadCount;
      }
      state.chats = state.chats.filter(chat => chat._id !== action.payload);
      if (state.currentChat && state.currentChat._id === action.payload) {
        state.currentChat = null;
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const chat = state.chats.find(chat => chat._id === action.payload);
      if (chat && chat.unreadCount && chat.unreadCount > 0) {
        state.unreadCount -= chat.unreadCount;
        chat.unreadCount = 0;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    resetChatState: (state) => {
      state.chats = [];
      state.currentChat = null;
      state.unreadCount = 0;
      state.error = null;
      state.isLoading = false;
    },
  },
});

export const {
  fetchChatsStart,
  fetchChatsSuccess,
  fetchChatsFailure,
  fetchMessagesStart,
  fetchMessagesSuccess,
  fetchMessagesFailure,
  setCurrentChat,
  sendMessageStart,
  sendMessageSuccess,
  sendMessageFailure,
  receiveMessage,
  createChat,
  deleteChat,
  markAsRead,
  clearError,
  setLoading,
  resetChatState,
} = chatSlice.actions;

export default chatSlice.reducer;