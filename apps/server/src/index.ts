// server/src/index.ts
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';

import { ENV, requireVarFor } from './env';
import type {
  ChatMessage,
  Provider,
  ProviderResult,
  ApiLLMResponse,
} from './types';

import { callMock } from './providers/mock';
import { callLMStudio } from './providers/lmstudio';
import { callOpenAI } from './providers/openai';
import { callGroq } from './providers/groq';
import { callGoogle } from './providers/google';
import { callMistral } from './providers/mistral';     // ✅ NEW
import { callAnthropic } from './providers/anthropic'; // ✅ NEW

const app = express();
app.use(cors());
app.use(express.json());

// ---------------- Providers registry (placeholder) ----------------
const providerRegistry: any[] = [];

app.get('/api/providers', (_req: Request, res: Response) => {
  res.json({ ok: true, providers: providerRegistry });
});

app.post('/api/providers', (req: Request, res: Response) => {
  const cfg = { ...req.body, serverReceivedAt: new Date().toISOString() };
  providerRegistry.push(cfg);
  res.json({ ok: true });
});

// ---------------- Ping ----------------
app.get('/api/ping', (_req: Request, res: Response) => {
  res.status(200).json({ ok: true, ts: Date.now() });
});

// ---------------- Health ----------------
async function buildHealth() {
  const checks: Record<string, boolean | string> = {
    lmstudio: false,
    openai:     !!process.env.OPENAI_API_KEY     || !!ENV.OPENAI_API_KEY     || false,
    groq:       !!process.env.GROQ_API_KEY       || !!ENV.GROQ_API_KEY       || false,
    google:     !!process.env.GOOGLE_API_KEY     || !!ENV.GOOGLE_API_KEY     || false,
    mistral:    !!process.env.MISTRAL_API_KEY    || !!ENV.MISTRAL_API_KEY    || false, // ✅
    anthropic:  !!process.env.ANTHROPIC_API_KEY  || !!ENV.ANTHROPIC_API_KEY  || false, // ✅
  };

  try {
    const base = ENV.LMSTUDIO_BASE_URL.replace(/\/$/, '');
    const r = await fetch(`${base}/models`, { method: 'GET' });
    checks.lmstudio = r.ok ? true : `HTTP_${r.status}`;
  } catch (e: any) {
    checks.lmstudio = e?.message || 'ERR';
  }

  return {
    ok: true as const,
    env: { DRY_RUN: ENV.DRY_RUN, NODE_ENV: ENV.NODE_ENV },
    checks,
  };
}

app.get('/api/health', async (_req: Request, res: Response) => {
  res.status(200).json(await buildHealth());
});
app.get('/health', async (_req: Request, res: Response) => {
  res.status(200).json(await buildHealth());
});
app.get('/__env/google', (_req, res) => {
  const raw = process.env.GOOGLE_API_KEY ?? '';
  res.json({
    hasENVfromModule: !!ENV.GOOGLE_API_KEY,
    hasProcessEnv: !!process.env.GOOGLE_API_KEY,
    sample: raw ? `${raw.slice(0,4)}***${raw.slice(-3)}` : null,
  });
});

// ---------------- LLM switch ----------------
app.post('/api/llm', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { provider, model, messages } = req.body as {
      provider: Provider; model: string; messages: ChatMessage[];
    };
    if (!provider || !model || !Array.isArray(messages)) {
      return res.status(400).json({ ok: false, error: 'Invalid payload' });
    }

    if (ENV.DRY_RUN) {
      const strip = (s?: string) => (s ? '***' : undefined);
      const base = (p: string) => (n: string) => (p.replace(/\/$/, '') + n);

      const dry = {
        mock: {
          url: '[mock]',
          headers: {},
          payload: { model, messages, stream: false },
        },
        lmstudio: {
          url: base(ENV.LMSTUDIO_BASE_URL)('/v1/chat/completions'),
          headers: { 'Content-Type': 'application/json' },
          payload: { model, messages, stream: false },
        },
        openai: {
          url: base(ENV.OPENAI_BASE_URL)('/chat/completions'),
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${strip(ENV.OPENAI_API_KEY)}` },
          payload: { model, messages, stream: false },
        },
        groq: {
          url: base(ENV.GROQ_BASE_URL)('/chat/completions'),
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${strip(ENV.GROQ_API_KEY)}` },
          payload: { model, messages, stream: false },
        },
        google: {
          url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${strip(ENV.GOOGLE_API_KEY)}`,
          headers: { 'Content-Type': 'application/json' },
          payload: { contents: messages.map(m => ({ role: m.role, parts: [{ text: m.content }] })) },
        },
        mistral: {
          url: `${(ENV.MISTRAL_BASE_URL || 'https://api.mistral.ai').replace(/\/$/, '')}/v1/chat/completions`,
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${strip(ENV.MISTRAL_API_KEY)}` },
          payload: { model, messages, stream: false },
        },
        anthropic: {
          url: 'https://api.anthropic.com/v1/messages',
          headers: { 'Content-Type': 'application/json', 'x-api-key': strip(ENV.ANTHROPIC_API_KEY) ?? '***', 'anthropic-version': '2023-06-01' },
          payload: {
            model,
            max_tokens: 1024,
            messages: messages.filter(m => m.role === 'user' || m.role === 'assistant'),
            ...(messages.find(m => m.role === 'system') ? { system: messages.find(m => m.role === 'system')!.content } : {}),
          },
        },
      } as const;

      const wouldCall = (dry as any)[String(provider)] ?? { url: '[unknown]', headers: {}, payload: {} };
      return res.json({ ok: true, dryRun: true, provider, wouldCall: { method: 'POST', ...wouldCall } });
    }

    // Guard required keys for live calls
    if (provider === 'openai')    requireVarFor('openai');
    if (provider === 'groq')      requireVarFor('groq');
    if (provider === 'google')    requireVarFor('google');
    if (provider === 'mistral')   requireVarFor('mistral');    // ✅
    if (provider === 'anthropic') requireVarFor('anthropic');  // ✅

    const t0 = Date.now();
    let out: ProviderResult;

    switch (provider) {
      case 'mock':       out = await callMock(model, messages); break;
      case 'lmstudio':   out = await callLMStudio(model, messages); break;
      case 'openai':     out = await callOpenAI(model, messages); break;
      case 'groq':       out = await callGroq(model, messages); break;
      case 'google':     out = await callGoogle(model, messages); break;
      case 'mistral':    out = await callMistral(model, messages); break;     // ✅
      case 'anthropic':  out = await callAnthropic(model, messages); break;   // ✅
      default:
        return res.status(400).json({ ok: false, error: `Unknown provider ${provider}` });
    }

    const latency_ms = Math.max(0, Date.now() - t0);
    const payload: ApiLLMResponse = {
      ok: true,
      provider: out.provider,
      model: out.model ?? model,
      text: out.text,
      latency_ms,
    };
    res.json(payload);
  } catch (err) {
    next(err);
  }
});

// ---------------- 404 + Errors ----------------
app.use('/api', (_req: Request, res: Response) => {
  res.status(404).json({ ok: false, error: 'Not Found' });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('API error:', err);
  const status = typeof err?.status === 'number' ? err.status : 500;
  res.status(status).json({ ok: false, error: err?.message || 'Internal Server Error' });
});

// ---------------- Bind ----------------
app.listen(ENV.PORT, '0.0.0.0', () => {
  console.log(`Server listening on 0.0.0.0:${ENV.PORT} (DRY_RUN=${ENV.DRY_RUN ? 1 : 0})`);
});
