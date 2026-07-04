// ─── FoodBuddy API Types ──────────────────────────────────────────────────────

// ── Generic API response envelope ────────────────────────────────────────────
// Every endpoint returns this wrapper; feature-specific data lives in `payload`.

export interface ApiResponse<T> {
  schema_version: string;
  thread_id: string;
  /** Human-readable status message (e.g. "Loaded 3 pantry item(s)"). */
  message: string;
  payload: T;
  artifacts: ApiArtifact[];
  actions: ApiAction[];
  context: ApiContext;
  trace: ApiTrace[];
  approval: ApiApproval;
  errors: string[];
}

// ── Shared building blocks ────────────────────────────────────────────────────

export interface ApiAction {
  action_id: string;
  label: string;
  kind: string;
  target: string;
  payload: Record<string, unknown>;
  requires_confirmation: boolean;
}

export interface ApiArtifactLayout {
  variant: string;
  density: string | null;
  media_position: string | null;
  group_by: string | null;
  metadata: Record<string, unknown>;
}

export interface ApiArtifact {
  artifact_id: string;
  type: 'table' | 'card' | 'chart' | string;
  title: string;
  description: string;
  data: {
    columns?: string[];
    rows?: unknown[];
    [key: string]: unknown;
  };
  actions: ApiAction[];
  layout: ApiArtifactLayout;
  accessibility: { role: string; aria_label: string };
  meta: { domain: string; [key: string]: unknown };
}

export interface ApiContext {
  intent: string;
  domain: string;
}

export interface ApiTrace {
  node: string;
  [key: string]: unknown;
}

export interface ApiApproval {
  required: boolean;
  approved: boolean | null;
  reason: string;
}

export interface ApiToolOutput {
  tool_name: string;
  data: Record<string, unknown>;
}

// ── Pantry ────────────────────────────────────────────────────────────────────

/** Mirrors the exact shape returned by the backend pantry endpoints. */
export interface ApiPantryItem {
  id: number;
  itemName: string;
  quantity: number;
  unit: string;
  purchaseDate: string;
  expiryDate: string | null;
  /** Uppercase constant, e.g. "DAIRY", "OTHER", "PRODUCE". */
  category: string;
}

export interface PantryPayload {
  pantry_items: ApiPantryItem[];
  tool_outputs: ApiToolOutput[];
}

export interface ScanResult {
  ingredients: ApiPantryItem[];
  summary: string;
}

export interface PantryHealth {
  score: number;
  fresh: number;
  soon: number;
  expired: number;
}

// ── Recipes ───────────────────────────────────────────────────────────────────

export interface ApiRecipeIngredient {
  name: string;
  qty: string;
  have: boolean;
}

export interface ApiRecipe {
  id: string;
  title: string;
  emoji: string;
  minutes: number;
  kcal: number;
  protein: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  uses: number;
  total: number;
  why: string[];
  ingredients: ApiRecipeIngredient[];
  steps: string[];
}

export interface MealPlanDay {
  day: string;
  meals: ApiRecipe[];
}

// ── User / Auth ───────────────────────────────────────────────────────────────

export interface ApiUser {
  id: string;
  name: string;
  email: string;
  familySize: number;
  dietPreferences: string[];
  allergies: string[];
  cuisinePreferences: string[];
  goal: string;
}

export interface LoginRequest {
  provider: 'apple' | 'google' | 'email';
  /** Provider-issued identity token */
  token: string;
  email?: string;
}

export interface AuthResponse {
  token: string;
  user: ApiUser;
}

// ── Chat ──────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  /** Attached recipe suggestion from the AI */
  recipeId?: string;
  /** True while the assistant is still generating tokens */
  isStreaming?: boolean;
}

export interface ChatRequest {
  user_input: string;
  conversationId?: string;
}

export interface ChatInitResponse {
  messageId: string;
  conversationId: string;
}

/**
 * Shape of each SSE event data payload emitted by the backend.
 *
 * The server can send:
 *   - { token: "…" }           → streaming text chunk
 *   - { conversationId: "…" }  → first event, sets conversation context
 *   - { done: true, recipeId?: "…" } → stream finished
 *   - "[DONE]"                 → OpenAI-style end signal (handled as raw string)
 */
export interface StreamEventPayload {
  token?: string;
  done?: boolean;
  recipeId?: string;
  conversationId?: string;
}
