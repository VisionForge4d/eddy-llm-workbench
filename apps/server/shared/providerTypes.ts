// server/shared/providerTypes.ts
// Single source of truth for provider schema shared across server modules.

export type BuiltInProvider =
  | 'openai'
  | 'anthropic'
  | 'groq'
  | 'mistral'
  | 'lmstudio'
  | 'google'        // ✅ Gemini / Google AI Studio
  | 'custom-http';

export interface ProviderConfig {
  id: string;                 // stable uuid (static providers use stable ids like "static-openai")
  label: string;              // display name
  kind: BuiltInProvider;      // selects adapter
  baseUrl?: string;           // required for lmstudio/custom-http; optional for others
  apiKeyRef?: string;         // server-side env/secrets key name (NEVER returned to client)
  defaultModel?: string;
  models?: string[];          // optional allowlist
  isEnabled: boolean;
  source: 'static' | 'user';
  createdAt: string;          // ISO
  updatedAt: string;          // ISO
}

export interface ProviderSecretWrite {
  apiKeyPlain?: string;       // accepted on write only; never persisted in JSON; never returned
}

// Optional helper: canonical ordered list for UI selects (frontend can import if you share via build step)
export const BUILTIN_KINDS: BuiltInProvider[] = [
  'openai',
  'anthropic',
  'groq',
  'mistral',
  'lmstudio',
  'google',
  'custom-http',
];
