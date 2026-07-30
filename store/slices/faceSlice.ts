import { createSlice } from '@reduxjs/toolkit';

interface FaceState {
faceMode : boolean
}

const initialState: FaceState = {
    faceMode:false
};

const faceSlice = createSlice({
  name: 'face',
  initialState,
  reducers: {
    toggleFaceMode: (state) => {
      state.faceMode = !state.faceMode ;
    },
  },
});

export const { toggleFaceMode} = faceSlice.actions;
export default faceSlice.reducer;