export type ProviderKind = 'openai' | 'anthropic' | 'mistral' | 'groq' | 'lmstudio' | 'google';

export type ProviderConfig = {
  id: string;         // uuid or slug
  label: string;      // "Google (Gemini)"
  kind: ProviderKind;
  baseUrl?: string;   // for OpenAI-compatible / local endpoints
  apiKey?: string;    // stored in browser for dev only
  model?: string;     // default model hint
  createdAt: string;  // ISO
};
