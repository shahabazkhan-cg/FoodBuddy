import { useCallback, useRef } from 'react';
import { fetchEventSource } from 'react-native-fetch-event-source';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  addUserMessage,
  appendStreamToken,
  clearChat,
  finalizeAssistantMessage,
  setConversationId,
  setStreamError,
  startAssistantStream,
} from '../store/slices/chatSlice';
import { API_BASE_URL } from '../store/api/config';
import type { StreamEventPayload } from '../store/api/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseChatStreamReturn {
  /** Send a user message and start streaming the AI response via SSE. */
  sendMessage: (content: string) => Promise<void>;
  /** Abort the current in-flight stream (e.g. user taps a stop button). */
  cancelStream: () => void;
  /** True while the AI response is being streamed. */
  isStreaming: boolean;
  /** Last error message, if any. */
  error: string | null;
  /** Clear conversation history and reset to the welcome message. */
  resetChat: () => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * useChatStream
 *
 * Manages the AI chat experience for the ChatScreen:
 *   1. Dispatches the user message to Redux.
 *   2. Opens a Server-Sent Events stream via `react-native-fetch-event-source`.
 *   3. Appends incoming tokens to the assistant bubble in real time.
 *   4. Finalises the message (and attaches any recipe suggestion) on [DONE].
 *
 * The hook is intentionally stateless — all chat state lives in the Redux
 * `chat` slice so the UI simply reads from the store.
 */
export function useChatStream(): UseChatStreamReturn {
  const dispatch = useAppDispatch();
  const isStreaming = useAppSelector((state) => state.chat.isStreaming);
  const error = useAppSelector((state) => state.chat.error);
  const conversationId = useAppSelector((state) => state.chat.conversationId);
  const token = useAppSelector((state) => state.auth.token);

  // Holds a reference to the AbortController so we can cancel mid-stream.
  const abortRef = useRef<AbortController | null>(null);

  // ── sendMessage ────────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isStreaming) return;

      // 1. Add the user bubble immediately.
      dispatch(addUserMessage({ content: trimmed }));

      // 2. Create an empty assistant bubble and mark streaming as active.
      const messageId = `assistant-${Date.now()}`;
      dispatch(startAssistantStream({ messageId }));

      // 3. Open the SSE stream.
      abortRef.current = new AbortController();

      try {
        await fetchEventSource(`${API_BASE_URL}/chat/sse`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            user_input: trimmed,
            ...(conversationId ? { conversationId } : {}),
          }),
          signal: abortRef.current.signal,

          // Called once the HTTP response headers are received.
          async onopen(response) {
            if (!response.ok) {
              throw new Error(`Server responded with ${response.status}`);
            }
          },

          // Called for every SSE event the server emits.
          onmessage(event) {
            // OpenAI-style end-of-stream sentinel.
            if (event.data === '[DONE]') {
              dispatch(finalizeAssistantMessage({ messageId }));
              return;
            }

            try {
              const payload: StreamEventPayload = JSON.parse(event.data);

              // First event typically carries the conversationId.
              if (payload.conversationId) {
                dispatch(setConversationId(payload.conversationId));
              }

              // Streaming text token.
              if (payload.token !== undefined) {
                dispatch(appendStreamToken({ messageId, token: payload.token }));
              }

              // Server signals end of generation.
              if (payload.done) {
                dispatch(
                  finalizeAssistantMessage({
                    messageId,
                    recipeId: payload.recipeId,
                  }),
                );
              }
            } catch {
              // Non-JSON stream (plain text tokens) — treat the whole data as a token.
              dispatch(appendStreamToken({ messageId, token: event.data }));
            }
          },

          // Called when the server closes the connection cleanly.
          onclose() {
            dispatch(finalizeAssistantMessage({ messageId }));
          },

          // Called on network/server errors.
          onerror(err) {
            const message =
              err instanceof Error ? err.message : 'Stream error. Please try again.';
            dispatch(setStreamError(message));
            // Re-throw to prevent the library from auto-retrying.
            throw err;
          },
        });
      } catch (err) {
        // AbortError means the user cancelled — not an error worth showing.
        if (err instanceof Error && err.name === 'AbortError') return;
        dispatch(setStreamError('Connection failed. Please try again.'));
      }
    },
    [dispatch, isStreaming, conversationId, token],
  );

  // ── cancelStream ───────────────────────────────────────────────────────────
  const cancelStream = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  // ── resetChat ──────────────────────────────────────────────────────────────
  const resetChat = useCallback(() => {
    abortRef.current?.abort();
    dispatch(clearChat());
  }, [dispatch]);

  return { sendMessage, cancelStream, isStreaming, error, resetChat };
}
