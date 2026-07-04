import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { API_BASE_URL } from './config';

/**
 * Root RTK Query API slice.
 *
 * All feature-specific endpoints are injected via `baseApi.injectEndpoints()`
 * in their own files (pantryApi, recipesApi, userApi, chatApi).  This keeps
 * each domain isolated while sharing one cache, middleware, and tag system.
 */
export const baseApi = createApi({
  reducerPath: 'api',

  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // Avoid a circular import: cast getState to an inline shape instead of
      // importing RootState (which depends on this file via store/index.ts).
      const state = getState() as { auth: { token: string | null } };
      if (state.auth.token) {
        headers.set('Authorization', `Bearer ${state.auth.token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),

  // Tag types used for cache invalidation across all injected endpoints.
  tagTypes: ['Pantry', 'Recipes', 'MealPlan', 'User', 'Chat'],

  // Endpoints are defined in their own files using injectEndpoints().
  endpoints: () => ({}),
});
