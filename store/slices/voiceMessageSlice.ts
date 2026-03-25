// store/slices/voiceMessageSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { VoiceMessageState, VoiceMessage } from '../../types';
import { chatAPI } from '../../services/api';

export const sendVoiceMessage = createAsyncThunk(
  'voiceMessages/send',
  async ({ chatId, uri, duration, tempId }: { 
    chatId: string; 
    uri: string; 
    duration: number; 
    tempId: string 
  }, { rejectWithValue }) => {
    try {
      const response = await chatAPI.sendVoiceMessage(chatId, uri, duration);
      return { ...response.data.data as VoiceMessage, tempId, chatId };
    } catch (error: any) {
      return rejectWithValue({ 
        error: error.response?.data?.message || 'Erreur envoi vocal',
        tempId 
      });
    }
  }
);

const initialState: VoiceMessageState = {
  voiceMessagesByChat: {},
  currentlyPlaying: null,
  playbackStatus: {},
  uploadProgress: {},
  loading: false,
  error: null,
};

const voiceMessageSlice = createSlice({
  name: 'voiceMessages',
  initialState,
  reducers: {
    receiveNewVoiceMessage: (state, action: PayloadAction<VoiceMessage>) => {
      const message = action.payload;
      const chatId = message.chatId || '';
      
      if (!chatId) return;
      
      if (!state.voiceMessagesByChat[chatId]) {
        state.voiceMessagesByChat[chatId] = [];
      }
      
      if (!state.voiceMessagesByChat[chatId].some(m => m._id === message._id)) {
        state.voiceMessagesByChat[chatId].push(message);
      }
    },
    startPlaying: (state, action: PayloadAction<string>) => {
      const messageId = action.payload;
      state.currentlyPlaying = messageId;
      state.playbackStatus[messageId] = {
        ...state.playbackStatus[messageId],
        isPlaying: true,
      };
    },
    pausePlaying: (state, action: PayloadAction<string>) => {
      const messageId = action.payload;
      if (state.playbackStatus[messageId]) {
        state.playbackStatus[messageId].isPlaying = false;
      }
    },
    stopPlaying: (state) => {
      if (state.currentlyPlaying) {
        state.playbackStatus[state.currentlyPlaying] = {
          ...state.playbackStatus[state.currentlyPlaying],
          isPlaying: false,
          position: 0,
        };
        state.currentlyPlaying = null;
      }
    },
    updatePlaybackPosition: (state, action: PayloadAction<{
      messageId: string;
      position: number;
      duration: number;
    }>) => {
      const { messageId, position, duration } = action.payload;
      state.playbackStatus[messageId] = {
        ...state.playbackStatus[messageId],
        position,
        duration,
      };
    },
    setUploadProgress: (state, action: PayloadAction<{
      tempId: string;
      progress: number | 'error';
    }>) => {
      const { tempId, progress } = action.payload;
      state.uploadProgress[tempId] = progress;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendVoiceMessage.pending, (state, action) => {
        const { tempId } = action.meta.arg;
        state.uploadProgress[tempId] = 0;
      })
      .addCase(sendVoiceMessage.fulfilled, (state, action) => {
        const message = action.payload;
        const chatId = message.chatId || '';
        
        if (!state.voiceMessagesByChat[chatId]) {
          state.voiceMessagesByChat[chatId] = [];
        }
        
        state.voiceMessagesByChat[chatId].push(message);
        if (message.tempId) {
          delete state.uploadProgress[message.tempId];
        }
      })
      .addCase(sendVoiceMessage.rejected, (state, action) => {
        const { tempId } = action.meta.arg;
        state.uploadProgress[tempId] = 'error';
      });
  },
});

export const {
  receiveNewVoiceMessage,
  startPlaying,
  pausePlaying,
  stopPlaying,
  updatePlaybackPosition,
  setUploadProgress,
  clearError,
} = voiceMessageSlice.actions;

export default voiceMessageSlice.reducer;