// import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { User } from '../../types';
// 
// interface AuthState {
//   user: User | null;
//   token: string | null;
//   isAuthenticated: boolean;
//   isLoading: boolean;
//   error: string | null;
// }
// 
// const initialState: AuthState = {
//   user: null,
//   token: null,
//   isAuthenticated: false,
//   isLoading: false,
//   error: null,
// };
// 
// const authSlice = createSlice({
//   name: 'auth',
//   initialState,
//   reducers: {
//     loginStart: (state) => {
//       state.isLoading = true;
//       state.error = null;
//     },
//     loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
//       state.isLoading = false;
//       state.isAuthenticated = true;
//       state.user = action.payload.user;
//       state.token = action.payload.token;
//       state.error = null;
//     },
//     loginFailure: (state, action: PayloadAction<string>) => {
//       state.isLoading = false;
//       state.isAuthenticated = false;
//       state.user = null;
//       state.token = null;
//       state.error = action.payload;
//     },
//     registerStart: (state) => {
//       state.isLoading = true;
//       state.error = null;
//     },
//     registerSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
//       state.isLoading = false;
//       state.isAuthenticated = true;
//       state.user = action.payload.user;
//       state.token = action.payload.token;
//       state.error = null;
//     },
//     registerFailure: (state, action: PayloadAction<string>) => {
//       state.isLoading = false;
//       state.isAuthenticated = false;
//       state.user = null;
//       state.token = null;
//       state.error = action.payload;
//     },
//     logout: (state) => {
//       state.isAuthenticated = false;
//       state.user = null;
//       state.token = null;
//       state.error = null;
//       state.isLoading = false;
//     },
//     updateUser: (state, action: PayloadAction<Partial<User>>) => {
//       if (state.user) {
//         state.user = { ...state.user, ...action.payload };
//       }
//     },
//     clearError: (state) => {
//       state.error = null;
//     },
//     setLoading: (state, action: PayloadAction<boolean>) => {
//       state.isLoading = action.payload;
//     },
//   },
// });
// 
// export const {
//   loginStart,
//   loginSuccess,
//   loginFailure,
//   registerStart,
//   registerSuccess,
//   registerFailure,
//   logout,
//   updateUser,
//   clearError,
//   setLoading,
// } = authSlice.actions;
// 
// export default authSlice.reducer;


// frontend/store/slices/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Restauration depuis AsyncStorage
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    },

    // Connexion
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },

    loginSuccess: (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;
    },

    loginFailure: (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.error = action.payload;
    },

    // Déconnexion
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.isLoading = false;
    },

    // Mise à jour utilisateur
    updateUser: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    // Effacer les erreurs
    clearError: (state) => {
      state.error = null;
    },

    // Nettoyage complet
    resetAuth: () => initialState,
  },
});

export const {
  setCredentials,
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  updateUser,
  clearError,
  resetAuth,
} = authSlice.actions;

export default authSlice.reducer;