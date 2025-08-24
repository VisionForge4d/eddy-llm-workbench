// server/src/types.ts

// Roles & messages
export type Role = 'system' | 'user' | 'assistant';

export type ChatMessage = {
  role: Role;
  content: string;
};

// Providers you support (extend as you add adapters)
export type Provider =
  | 'mock'
  | 'lmstudio'
  | 'openai'
  | 'groq'
  | 'google'     // ✅ add
  | 'mistral'    // ✅ add
  | 'anthropic'; // ✅ add

// What the client sends to /api/llm
export type ProviderRequest = {
  provider: Provider;
  model: string;
  messages: ChatMessage[];
  // optional knobs you may already pass through:
  // temperature?: number;
  // max_tokens?: number;
};

// What each provider adapter returns to the server (no latency here)
export type ProviderResult = {
  provider: Provider;
  text: string;
  model?: string; // optional; API will fill with requested model if missing
  raw?: unknown;  // optional: keep upstream payload for debugging
};

// What /api/llm returns to the client
export type ApiLLMResponse = {
  ok: true;
  provider: Provider;
  model: string;
  text: string;
  latency_ms: number;
};
