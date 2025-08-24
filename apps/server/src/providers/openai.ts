// server/src/providers/openai.ts
import { ENV } from '../env';
import type { ProviderResult, ChatMessage } from '../types';

const BASE = ENV.OPENAI_BASE_URL.replace(/\/$/, '');

const toOpenAI = (msgs: ChatMessage[]) =>
  msgs.map(m => ({ role: m.role, content: m.content }));

export async function callOpenAI(
  model: string,
  messages: ChatMessage[],
): Promise<ProviderResult> {
  const res = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ENV.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({ model, messages: toOpenAI(messages), stream: false }),
  });

  if (!res.ok) {
    const errTxt = await res.text().catch(() => '');
    throw new Error(`OpenAI ${res.status}: ${errTxt}`);
  }

  const data: any = await res.json();
  const text = data?.choices?.[0]?.message?.content ?? '';
  const echoedModel = data?.model ?? model;

  return { provider: 'openai', model: echoedModel, text };
}

