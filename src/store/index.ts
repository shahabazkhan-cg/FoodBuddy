import { configureStore } from '@reduxjs/toolkit';
import { baseApi } from './api/baseApi';
import authReducer from './slices/authSlice';
import chatReducer from './slices/chatSlice';
import onboardingReducer from "./slices/onboardingSlice";

import { apiLoggingMiddleware } from './middleware/loggingMiddleware';

declare const __DEV__: boolean;

export const store = configureStore({
  reducer: {
    [baseApi.reducerPath]: baseApi.reducer,
    auth: authReducer,
    chat: chatReducer,
    onboarding: onboardingReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(baseApi.middleware)
      .concat(apiLoggingMiddleware),

  // Enable Redux DevTools in development
  // configureStore automatically detects the extension if available
  devTools: __DEV__
    ? {
        trace: true,
        traceLimit: 25,
      }
    : false,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
