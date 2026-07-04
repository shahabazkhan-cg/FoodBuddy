import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './api/baseApi';
import authReducer from './slices/authSlice';
import chatReducer from './slices/chatSlice';
import onboardingReducer from "./slices/onboardingSlice";


export const store = configureStore({
  reducer: {
    // RTK Query cache — one entry for the entire API
    [baseApi.reducerPath]: baseApi.reducer,

    // Feature slices
    auth: authReducer,
    chat: chatReducer,
    onboarding: onboardingReducer,
  },

  middleware: (getDefaultMiddleware) =>
    // RTK Query middleware handles cache lifecycle, invalidation, polling, etc.
    getDefaultMiddleware().concat(baseApi.middleware),
});

// Inferred types — import these instead of typing manually throughout the app.
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
