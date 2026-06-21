import { createSlice } from '@reduxjs/toolkit';

interface ConnexionState {
 internetState: any
}

const initialState: ConnexionState = {
    internetState:null,
 
};

const connexionSlice = createSlice({
  name: 'connexion',
  initialState,
  reducers: {
    setConnexionState:(state,action) =>{
    state.internetState = action.payload;
  
    },

  },
});

export const {setConnexionState} = connexionSlice.actions;
export default connexionSlice.reducer;