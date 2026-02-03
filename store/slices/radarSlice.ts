import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { NearbyUser } from '../../types';

interface RadarState {
  nearbyUsers: NearbyUser[];
  isVisible: boolean;
  isLoading: boolean;
  error: string | null;
  lastUpdate: number | null;
}

const initialState: RadarState = {
  nearbyUsers: [],
  isVisible: true,
  isLoading: false,
  error: null,
  lastUpdate: null,
};

const radarSlice = createSlice({
  name: 'radar',
  initialState,
  reducers: {
    fetchNearbyUsersStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchNearbyUsersSuccess: (state, action: PayloadAction<NearbyUser[]>) => {
      state.isLoading = false;
      state.nearbyUsers = action.payload;
      state.lastUpdate = Date.now();
      state.error = null;
    },
    fetchNearbyUsersFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setVisibility: (state, action: PayloadAction<boolean>) => {
      state.isVisible = action.payload;
    },
    addNearbyUser: (state, action: PayloadAction<NearbyUser>) => {
      const existingUserIndex = state.nearbyUsers.findIndex(user => user._id === action.payload._id);
      if (existingUserIndex === -1) {
        state.nearbyUsers.push(action.payload);
      } else {
        state.nearbyUsers[existingUserIndex] = action.payload;
      }
    },
    removeNearbyUser: (state, action: PayloadAction<string>) => {
      state.nearbyUsers = state.nearbyUsers.filter(user => user._id !== action.payload);
    },
    clearNearbyUsers: (state) => {
      state.nearbyUsers = [];
      state.lastUpdate = null;
    },
    updateUserPosition: (state, action: PayloadAction<{ userId: string; distance: number; bearing: number }>) => {
      const user = state.nearbyUsers.find(user => user._id === action.payload.userId);
      if (user) {
        user.relative_position = {
          distance: action.payload.distance,
          bearing: action.payload.bearing,
        };
      }
    },
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  fetchNearbyUsersStart,
  fetchNearbyUsersSuccess,
  fetchNearbyUsersFailure,
  setVisibility,
  addNearbyUser,
  removeNearbyUser,
  clearNearbyUsers,
  updateUserPosition,
  clearError,
  setLoading,
} = radarSlice.actions;

export default radarSlice.reducer;