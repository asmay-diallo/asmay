import { createSlice } from '@reduxjs/toolkit';

interface LikesState {
  count: number;
  lastLike: any;
}

const initialState: LikesState = {
  count: 0,
  lastLike: null,
};

const likesSlice = createSlice({
  name: 'likes',
  initialState,
  reducers: {
    incrementLikes: (state) => {
      state.count += 1;
    },
    setLastLike: (state, action) => {
      state.lastLike = action.payload;
    },
    resetLikes: (state) => {
      state.count = 0;
      state.lastLike = null;
    },
  },
});

export const { incrementLikes, setLastLike, resetLikes } = likesSlice.actions;
export default likesSlice.reducer;