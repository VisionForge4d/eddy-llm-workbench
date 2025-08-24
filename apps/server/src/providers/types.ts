// server/src/types.ts

export type Role = 'system' | 'user' | 'assistant';

export type ChatMessage = {
  role: Role;
  content: string;
};

// Supported providers
export type Provider = 'mock' | 'lmstudio' | 'openai' | 'groq';

// Client → API request
export type ProviderRequest = {
  provider: Provider;
  model: string;
  messages: ChatMessage[];
};

// Adapter → Server (no latency here)
export type ProviderResult = {
  provider: Provider;
  text: string;
  model?: string; // adapter may omit; API will fill with requested model
};

// API → Client response
export type ApiLLMResponse = {
  ok: true;
  provider: Provider;
  model: string;     // always present in final response
  text: string;
  latency_ms: number;
};
