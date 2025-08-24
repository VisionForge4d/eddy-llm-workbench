// server/src/providers/lmstudio.ts
import { ENV } from '../env';
import type { ProviderResult, ChatMessage } from '../types';

const BASE = (ENV.LMSTUDIO_BASE_URL || 'http://127.0.0.1:1234').replace(/\/$/, '');

const toOpenAI = (msgs: ChatMessage[]) =>
  msgs.map(m => ({ role: m.role, content: m.content }));

type LMStudioChoice =
  | { message?: { content?: string }; text?: string }
  | { delta?: { content?: string } }; // (streaming-style fragments, just in case)

type LMStudioResp = {
  model?: string;
  choices?: LMStudioChoice[];
  // allow extra fields
  [k: string]: any;
};

export async function callLMStudio(
  model: string,
  messages: ChatMessage[],
): Promise<ProviderResult> {
  const t0 = Date.now();

  const res = await fetch(`${BASE}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(ENV.LMSTUDIO_API_KEY && { Authorization: `Bearer ${ENV.LMSTUDIO_API_KEY}` }),
    },
    body: JSON.stringify({
      model,
      messages: toOpenAI(messages),
      stream: false, // ensure non-streaming
    }),
  });

  const latency_ms = Date.now() - t0;

  if (!res.ok) {
    const errTxt = await res.text().catch(() => '');
    throw new Error(`LM Studio ${res.status}: ${errTxt}`);
  }

  let data: LMStudioResp;
  try {
    data = (await res.json()) as LMStudioResp;
  } catch (e) {
    const raw = await res.text().catch(() => '');
    throw new Error(`LM Studio JSON parse error: ${(e as Error).message}\nRAW: ${raw.slice(0, 500)}`);
  }

  // Be defensive about shapes:
  const choice = data.choices?.[0] ?? {};
  const text =
    // standard OpenAI-ish
    (choice as any)?.message?.content ??
    // some local servers use plain `text`
    (choice as any)?.text ??
    // if we ever accidentally hit a streamed-like shape:
    (choice as any)?.delta?.content ??
    '';

  const echoedModel = data.model ?? model;

  return { provider: 'lmstudio', model: echoedModel, text};
}
