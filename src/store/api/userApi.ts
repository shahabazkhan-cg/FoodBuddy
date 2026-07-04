import { baseApi } from './baseApi';
import type { ApiUser, LoginRequest, AuthResponse } from './types';

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Authenticate via Apple, Google, or email. */
    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),

    /** Invalidate server-side session. */
    logout: builder.mutation<void, void>({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      invalidatesTags: ['User', 'Pantry', 'Recipes', 'Chat'],
    }),

    /** Fetch the current user's profile. */
    getProfile: builder.query<ApiUser, void>({
      query: () => '/user/profile',
      providesTags: ['User'],
    }),

    /** Update display name, family size, etc. */
    updateProfile: builder.mutation<ApiUser, Partial<Omit<ApiUser, 'id'>>>({
      query: (body) => ({ url: '/user/profile', method: 'PATCH', body }),
      invalidatesTags: ['User'],
    }),

    /** Update diet / allergy / cuisine / goal preferences (used in onboarding). */
    updatePreferences: builder.mutation<
      ApiUser,
      Pick<ApiUser, 'dietPreferences' | 'allergies' | 'cuisinePreferences' | 'goal'>
    >({
      query: (body) => ({ url: '/user/preferences', method: 'PATCH', body }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUpdatePreferencesMutation,
} = userApi;
