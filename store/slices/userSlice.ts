import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../../types';

interface UserState {
  currentUser: User | null;
  nearbyUsers: User[];
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  nearbyUsers: [],
  isLoading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setCurrentUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
    },
    updateCurrentUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload };
      }
    },
    clearCurrentUser: (state) => {
      state.currentUser = null;
    },
    setNearbyUsers: (state, action: PayloadAction<User[]>) => {
      state.nearbyUsers = action.payload;
    },
    addNearbyUser: (state, action: PayloadAction<User>) => {
      const existingUser = state.nearbyUsers.find(user => user._id === action.payload._id);
      if (!existingUser) {
        state.nearbyUsers.push(action.payload);
      }
    },
    removeNearbyUser: (state, action: PayloadAction<string>) => {
      state.nearbyUsers = state.nearbyUsers.filter(user => user._id !== action.payload);
    },
    clearNearbyUsers: (state) => {
      state.nearbyUsers = [];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetUserState: (state) => {
      state.currentUser = null;
      state.nearbyUsers = [];
      state.error = null;
      state.isLoading = false;
    },
  },
});

export const {
  setCurrentUser,
  updateCurrentUser,
  clearCurrentUser,
  setNearbyUsers,
  addNearbyUser,
  removeNearbyUser,
  clearNearbyUsers,
  setLoading,
  setError,
  clearError,
  resetUserState,
} = userSlice.actions;

export default userSlice.reducer;