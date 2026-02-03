import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import radarReducer from './slices/radarSlice';
import chatReducer from './slices/chatSlice';
import signalReducer from './slices/signalSlice';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    radar: radarReducer,
    chat: chatReducer,
    signal: signalReducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;