// store/slices/userProfileSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userAPI } from '../../services/api';

export interface PublicUser {
  _id: string;
  username: string;
  profilePicture?: string | null;
  interests?: string[];
  bio?: string;
  lastActive?: Date;
  isOnline?: boolean;
  privacySettings?: {
    isVisible: boolean;
    showCommonInterestsOnly: boolean;
    showOnRadar: boolean;
  };
  connections?: string[];
  followers?: string[];
  followings?: string[];
}

interface UserProfileState {
  profile: PublicUser | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserProfileState = {
  profile: null,
  loading: false,
  error: null,
};

export const fetchUserProfile = createAsyncThunk(
  'userProfile/fetch',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await userAPI.getUserById(userId);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur chargement profil');
    }
  }
);

const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState,
  reducers: {
    clearUserProfile: (state) => {
      state.profile = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUserProfile } = userProfileSlice.actions;
export default userProfileSlice.reducer;