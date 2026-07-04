import { useCallback, useRef } from "react";
import { fetchEventSourceRN } from "../utils/sseClient";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  addUserMessage,
  appendStreamToken,
  clearChat,
  finalizeAssistantMessage,
  setConversationId,
  setStreamError,
  startAssistantStream,
} from "../store/slices/chatSlice";
import { API_BASE_URL } from "../store/api/config";
import type { StreamEventPayload } from "../store/api/types";
import { logger } from "../utils/logger";

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

      logger.debug('Chat', 'User message sent', { content: trimmed, conversationId });

      // 1. Add the user bubble immediately.
      dispatch(addUserMessage({ content: trimmed }));

      // 2. Create an empty assistant bubble and mark streaming as active.
      const messageId = `assistant-${Date.now()}`;
      dispatch(startAssistantStream({ messageId }));

      // 3. Open the SSE stream.
      abortRef.current = new AbortController();

      try {
        logger.info('Chat', `Opening SSE stream to ${API_BASE_URL}/chat/sse`, {
          conversationId: conversationId || 'new',
        });

        await fetchEventSourceRN(`${API_BASE_URL}/chat/sse`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "text/event-stream",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            user_input: trimmed,
            ...(conversationId ? { conversationId } : {}),
          }),
          signal: abortRef.current.signal,

          // Called once the HTTP response headers are received.
          onopen(status: number) {
            if (status < 200 || status >= 300) {
              throw new Error(`Server responded with ${status}`);
            }
            logger.debug('Chat', `SSE stream opened: ${status}`, {
              status,
              url: `${API_BASE_URL}/chat/sse`,
            });
          },

          // Called for every SSE event the server emits.
          onmessage(event: { event: string; data: string; id?: string }) {
            console.log("📨 SSE message received:", event.data);
            logger.debug('Chat', 'SSE event received', { eventData: event.data.slice(0, 100) });

            // OpenAI-style end-of-stream sentinel.
            if (event.data === "[DONE]") {
              console.log("✅ Stream finished with [DONE]");
              logger.info('Chat', 'Stream finalized with [DONE]');
              dispatch(finalizeAssistantMessage({ messageId }));
              return;
            }

            try {
              const payload: any = JSON.parse(event.data);
              console.log("📦 Parsed payload:", payload);
              logger.debug('Chat', 'Parsed SSE payload', { payload });

              // Handle agent messages (the main response)
              if (payload.node === "agent" && payload.message) {
                console.log("💬 Agent message:", payload.message);
                logger.debug('Chat', 'Agent message from SSE', { message: payload.message });
                dispatch(
                  appendStreamToken({ messageId, token: payload.message }),
                );
                return;
              }

              // First event typically carries the conversationId.
              if (payload.conversationId) {
                logger.debug('Chat', 'Conversation ID set', {
                  conversationId: payload.conversationId,
                });
                dispatch(setConversationId(payload.conversationId));
              }

              // Streaming text token.
              if (payload.token !== undefined) {
                dispatch(
                  appendStreamToken({ messageId, token: payload.token }),
                );
              }

              // Server signals end of generation.
              if (payload.done) {
                logger.info('Chat', 'Server signaled done', {
                  recipeId: payload.recipeId,
                });
                dispatch(
                  finalizeAssistantMessage({
                    messageId,
                    recipeId: payload.recipeId,
                  }),
                );
              }
            } catch (err) {
              console.error("❌ Error parsing SSE message:", err);
              logger.error('Chat', 'Error parsing SSE message', { error: err });
              // Non-JSON stream (plain text tokens) — treat the whole data as a token.
              dispatch(appendStreamToken({ messageId, token: event.data }));
            }
          },

          // Called when the server closes the connection cleanly.
          onclose() {
            logger.info('Chat', 'SSE stream closed by server');
            dispatch(finalizeAssistantMessage({ messageId }));
          },

          // Called on network/server errors.
          onerror(err: Error) {
            const message =
              err instanceof Error
                ? err.message
                : "Stream error. Please try again.";
            logger.error('Chat', 'SSE stream error', {
              error: message,
              errorName: err instanceof Error ? err.name : 'Unknown',
              url: `${API_BASE_URL}/chat/sse`,
              timestamp: new Date().toISOString(),
            });
            dispatch(setStreamError(message));
            // Re-throw to prevent the library from auto-retrying.
            throw err;
          },
        });
      } catch (err) {
        // AbortError means the user cancelled — not an error worth showing.
        if (err instanceof Error && err.name === "AbortError") return;

        // Surface the original error message when possible so the UI can show
        // a helpful diagnostic (e.g. network/401/timeout messages) instead of
        // a generic "Connection failed". Also log for local debugging.
        const message = err instanceof Error ? err.message : String(err);
        // eslint-disable-next-line no-console
        console.warn("useChatStream error:", err);
        logger.error('Chat', 'useChatStream error', {
          error: message,
          stack: err instanceof Error ? err.stack : undefined,
        });

        // If the runtime reports the generic "Network request failed" on
        // Android this is often caused by either: (a) the emulator/device
        // having no network, or (b) the device not trusting the server TLS
        // certificate (common with internal/corporate CAs). Try a quick
        // diagnostic probe to disambiguate and give a clearer message.
        if (message && message.includes("Network request failed")) {
          const probe = async () => {
            try {
              const controller = new AbortController();
              const id = setTimeout(() => controller.abort(), 3000);
              // Lightweight endpoint that returns 204 quickly.
              const res = await fetch("https://www.gstatic.com/generate_204", {
                method: "GET",
                signal: controller.signal,
              });
              clearTimeout(id);
              return res && res.status === 204;
            } catch (e) {
              return false;
            }
          };

          const reachable = await probe();
          if (reachable) {
            dispatch(
              setStreamError(
                "Server unreachable or TLS handshake failed. Android emulators sometimes don't trust custom certificates — try a physical device or a server with a public CA certificate.",
              ),
            );
          } else {
            dispatch(
              setStreamError(
                "Device/emulator has no network access. Check emulator network, proxy settings, or try on a physical device.",
              ),
            );
          }
        } else {
          dispatch(
            setStreamError(message || "Connection failed. Please try again."),
          );
        }
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
