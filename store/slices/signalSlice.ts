// store/slices/signalSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SignalState, Signal } from '../../types';
import { signalAPI } from '../../services/api';

// Async thunks
export const fetchSignals = createAsyncThunk(
  'signals/fetchSignals',
  async (_, { rejectWithValue }) => {
    try {
      const response = await signalAPI.getReceivedSignals();
      return response.data.data as Signal[];
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur chargement');
    }
  }
);

export const acceptSignal = createAsyncThunk(
  'signals/acceptSignal',
  async (signalId: string, { rejectWithValue }) => {
    try {
      const response = await signalAPI.respond(signalId, 'accepted');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur acceptation');
    }
  }
);

export const declineSignal = createAsyncThunk(
  'signals/declineSignal',
  async (signalId: string, { rejectWithValue }) => {
    try {
      const response = await signalAPI.respond(signalId, 'ignored');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur refus');
    }
  }
);

export const deleteSignal = createAsyncThunk(
  'signals/deleteSignal',
  async (signalId: string, { rejectWithValue }) => {
    try {
      const response = await signalAPI.delete(signalId);
      return signalId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur suppression');
    }
  }
);

const initialState: SignalState = {
  incomingSignals: [],
  outgoingSignals: [],
  loading: false,
  error: null,
  unreadCount: 0,
};

const signalSlice = createSlice({
  name: 'signals',
  initialState,
  reducers: {
    receiveNewSignal: (state, action: PayloadAction<Signal>) => {
      const signal = action.payload;
      if (!state.incomingSignals.some(s => s._id === signal._id)) {
        state.incomingSignals.unshift(signal);
        state.unreadCount += 1;
      }
    },
    signalAccepted: (state, action: PayloadAction<{ signalId: string }>) => {
      const { signalId } = action.payload;
      state.incomingSignals = state.incomingSignals.filter(s => s._id !== signalId);
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    },
    signalDeclined: (state, action: PayloadAction<{ signalId: string }>) => {
      const { signalId } = action.payload;
      state.incomingSignals = state.incomingSignals.filter(s => s._id !== signalId);
      state.unreadCount = Math.max(0, state.unreadCount - 1);
    },
    markSignalsAsRead: (state) => {
      state.unreadCount = 0;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSignals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSignals.fulfilled, (state, action) => {
        state.loading = false;
        state.incomingSignals = action.payload || [];
        state.unreadCount = action.payload?.filter(s => !s.viewed).length || 0;
      })
      .addCase(fetchSignals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(acceptSignal.fulfilled, (state, action) => {
        const signalId = action.meta.arg;
        state.incomingSignals = state.incomingSignals.filter(s => s._id !== signalId);
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      })
      .addCase(declineSignal.fulfilled, (state, action) => {
        const signalId = action.meta.arg;
        state.incomingSignals = state.incomingSignals.filter(s => s._id !== signalId);
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      })
      .addCase(deleteSignal.fulfilled, (state, action) => {
        state.incomingSignals = state.incomingSignals.filter(s => s._id !== action.payload);
      });
  },
});

export const {
  receiveNewSignal,
  signalAccepted,
  signalDeclined,
  markSignalsAsRead,
  clearError,
} = signalSlice.actions;

export default signalSlice.reducer;