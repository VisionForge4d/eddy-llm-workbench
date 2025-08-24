// server/src/env.ts
import 'dotenv/config';

function bool(v?: string) {
  if (!v) return false;
  const s = v.trim().toLowerCase();
  return s === '1' || s === 'true' || s === 'yes' || s === 'on';
}

export const ENV = {
  // Runtime
  PORT: Number(process.env.PORT ?? 5000),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  DRY_RUN: bool(process.env.DRY_RUN),

  // Base URLs
  LMSTUDIO_BASE_URL: process.env.LMSTUDIO_BASE_URL ?? 'http://127.0.0.1:1234',
  OPENAI_BASE_URL:   process.env.OPENAI_BASE_URL   ?? 'https://api.openai.com/v1',
  GROQ_BASE_URL:     process.env.GROQ_BASE_URL     ?? 'https://api.groq.com/openai/v1',
  GOOGLE_BASE_URL:
    process.env.GOOGLE_BASE_URL ??
    process.env.GEMINI_BASE_URL ?? // legacy alias
    'https://generativelanguage.googleapis.com/v1beta',
  MISTRAL_BASE_URL:  process.env.MISTRAL_BASE_URL  ?? 'https://api.mistral.ai',
  ANTHROPIC_API_BASE: process.env.ANTHROPIC_API_BASE ?? 'https://api.anthropic.com',

  // API keys (empty string if not set)
  OPENAI_API_KEY:    process.env.OPENAI_API_KEY    ?? '',
  GROQ_API_KEY:      process.env.GROQ_API_KEY      ?? '',
  GOOGLE_API_KEY:    process.env.GOOGLE_API_KEY    ?? (process.env.GEMINI_API_KEY ?? ''),
  MISTRAL_API_KEY:   process.env.MISTRAL_API_KEY   ?? '',
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ?? '',
  LMSTUDIO_API_KEY:  process.env.LMSTUDIO_API_KEY  ?? '',
} as const;

export type Env = typeof ENV;

/**
 * Throw if a given provider's API key is missing. Keeps your route logic tidy.
 */
export function requireVarFor(
  provider: 'openai' | 'groq' | 'google' | 'mistral' | 'anthropic'
) {
  const present =
    (provider === 'openai'    && !!ENV.OPENAI_API_KEY)    ||
    (provider === 'groq'      && !!ENV.GROQ_API_KEY)      ||
    (provider === 'google'    && !!ENV.GOOGLE_API_KEY)    ||
    (provider === 'mistral'   && !!ENV.MISTRAL_API_KEY)   ||
    (provider === 'anthropic' && !!ENV.ANTHROPIC_API_KEY);

  if (!present) {
    const name =
      provider === 'google' ? 'GOOGLE_API_KEY'
    : provider === 'openai' ? 'OPENAI_API_KEY'
    : provider === 'groq'   ? 'GROQ_API_KEY'
    : provider === 'mistral'? 'MISTRAL_API_KEY'
    :                         'ANTHROPIC_API_KEY';

    throw new Error(`${name} missing`);
  }
}
