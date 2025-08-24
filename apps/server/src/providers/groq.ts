// server/src/providers/groq.ts
import { ENV } from '../env';
import type { ProviderResult, ChatMessage } from '../types';

const BASE = ENV.GROQ_BASE_URL.replace(/\/$/, '');

const toOpenAI = (msgs: ChatMessage[]) =>
  msgs.map(m => ({ role: m.role, content: m.content }));

export async function callGroq(
  model: string,
  messages: ChatMessage[],
): Promise<ProviderResult> {
  const res = await fetch(`${BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ENV.GROQ_API_KEY}`,
    },
    body: JSON.stringify({ model, messages: toOpenAI(messages), stream: false }),
  });

  if (!res.ok) {
    const errTxt = await res.text().catch(() => '');
    throw new Error(`GROQ ${res.status}: ${errTxt}`);
  }

  const data: any = await res.json();
  const text = data?.choices?.[0]?.message?.content ?? '';
  const echoedModel = data?.model ?? model;

  return { provider: 'groq', model: echoedModel, text };
}
