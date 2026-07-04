import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { ChatMessage } from '../api/types';

// ─── State Shape ──────────────────────────────────────────────────────────────

interface ChatState {
  messages: ChatMessage[];
  isStreaming: boolean;
  error: string | null;
  conversationId: string | null;
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: "Hey! I know your pantry, tastes, and what's expiring. Ask me anything.",
  timestamp: 0,
};

const initialState: ChatState = {
  messages: [WELCOME_MESSAGE],
  isStreaming: false,
  error: null,
  conversationId: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    /**
     * Append a user message bubble.
     * Called by useChatStream before the SSE request is made.
     */
    addUserMessage: (state, action: PayloadAction<{ content: string }>) => {
      state.messages.push({
        id: `user-${Date.now()}`,
        role: 'user',
        content: action.payload.content,
        timestamp: Date.now(),
      });
      state.error = null;
    },

    /**
     * Add an empty assistant bubble and mark the stream as active.
     * Called right before the fetchEventSource request starts.
     */
    startAssistantStream: (
      state,
      action: PayloadAction<{ messageId: string; conversationId?: string }>,
    ) => {
      state.isStreaming = true;
      if (action.payload.conversationId) {
        state.conversationId = action.payload.conversationId;
      }
      state.messages.push({
        id: action.payload.messageId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        isStreaming: true,
      });
    },

    /**
     * Append a streaming token to the last assistant message.
     * Called for every SSE text-chunk event.
     */
    appendStreamToken: (
      state,
      action: PayloadAction<{ messageId: string; token: string }>,
    ) => {
      const msg = state.messages.find((m) => m.id === action.payload.messageId);
      if (msg) {
        msg.content += action.payload.token;
      }
    },

    /**
     * Mark streaming as done and attach an optional recipe suggestion.
     * Called when the server sends the [DONE] signal or closes the stream.
     */
    finalizeAssistantMessage: (
      state,
      action: PayloadAction<{ messageId: string; recipeId?: string }>,
    ) => {
      const msg = state.messages.find((m) => m.id === action.payload.messageId);
      if (msg) {
        msg.isStreaming = false;
        if (action.payload.recipeId) {
          msg.recipeId = action.payload.recipeId;
        }
      }
      state.isStreaming = false;
    },

    /**
     * Record a stream error and remove any empty streaming bubble.
     */
    setStreamError: (state, action: PayloadAction<string>) => {
      state.isStreaming = false;
      state.error = action.payload;
      const last = state.messages[state.messages.length - 1];
      if (last?.isStreaming) {
        state.messages.pop();
      }
    },

    /** Store the conversationId returned by the first SSE event. */
    setConversationId: (state, action: PayloadAction<string>) => {
      state.conversationId = action.payload;
    },

    /**
     * Reset the conversation to the welcome message.
     * Used when navigating to Chat with a fresh prompt.
     */
    clearChat: (state) => {
      state.messages = [WELCOME_MESSAGE];
      state.conversationId = null;
      state.isStreaming = false;
      state.error = null;
    },
  },
});

export const {
  addUserMessage,
  startAssistantStream,
  appendStreamToken,
  finalizeAssistantMessage,
  setStreamError,
  setConversationId,
  clearChat,
} = chatSlice.actions;

export default chatSlice.reducer;
