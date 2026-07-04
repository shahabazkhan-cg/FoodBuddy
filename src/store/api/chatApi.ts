import { baseApi } from './baseApi';
import type { ChatInitResponse, ChatRequest } from './types';

/**
 * Non-streaming chat endpoints.
 *
 * The primary AI chat experience uses SSE streaming (see useChatStream).
 * These REST endpoints are used for:
 *   - Initiating a conversation and getting a conversationId
 *   - Fetching suggested prompt chips from the backend
 */
export const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * Non-streaming fallback: send a message and receive the full response
     * in one HTTP round-trip (useful for background / low-latency scenarios).
     */
    sendMessage: builder.mutation<ChatInitResponse, ChatRequest>({
      query: (body) => ({ url: '/chat', method: 'POST', body }),
      invalidatesTags: ['Chat'],
    }),

    /** Suggested prompt chips for the chat UI (personalised per user). */
    getSuggestedPrompts: builder.query<string[], void>({
      query: () => '/chat/prompts',
      providesTags: ['Chat'],
    }),
  }),
});

export const { useSendMessageMutation, useGetSuggestedPromptsQuery } = chatApi;
