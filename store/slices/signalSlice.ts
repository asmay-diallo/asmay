import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Signal } from '../../types';

interface SignalState {
  signals:Signal[];

}

const initialState: SignalState = {
  signals:[],
};

const signalSlice = createSlice({
  name: 'signal',
  initialState,
  reducers: {
  
    },

});

export const {
 
} = signalSlice.actions;

export default signalSlice.reducer;