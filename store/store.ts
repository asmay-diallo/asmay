

// store/store.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import authReducer from './slices/authSlice';
import signalReducer from './slices/signalSlice';
import chatReducer from './slices/chatSlice';
import messageReducer from './slices/messageSlice';
import voiceMessageReducer from './slices/voiceMessageSlice';
import userProfileReducer from './slices/userProfileSlice';
import likesReducer from "./slices/likesSlice"
import incomingCallReducer from './slices/incomingCallSlice';
import streamReducer from './slices/streamSlice'
import connexionReducer from './slices/connexionSlice'

// Types
export interface RootState {
  auth: ReturnType<typeof authReducer>;
  signals: ReturnType<typeof signalReducer>;
  chats: ReturnType<typeof chatReducer>;
  messages: ReturnType<typeof messageReducer>;
  voiceMessages: ReturnType<typeof voiceMessageReducer>;
  userProfile: ReturnType<typeof userProfileReducer>;
  likes:ReturnType<typeof likesReducer>;
  incomingCall:ReturnType<typeof incomingCallReducer>;
  stream:ReturnType<typeof streamReducer>;
  connexion:ReturnType<typeof connexionReducer>;
}

export type AppDispatch = typeof store.dispatch;

// Configuration de la persistance
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['auth'] as const,
};

const rootReducer = combineReducers({
  auth: authReducer,
  signals: signalReducer,
  chats: chatReducer,
  messages: messageReducer,
  voiceMessages: voiceMessageReducer,
  userProfile: userProfileReducer,
  likes:likesReducer,
  incomingCall:incomingCallReducer,
  stream:streamReducer,
  connexion:connexionReducer
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE','incomingCall/setIncomingCall'],
        ignoredPaths: ['incomingCall.callData.offer'],
      },
    }),
});

export const persistor = persistStore(store);