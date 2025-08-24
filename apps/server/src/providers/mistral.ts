import { ChatMessage, ProviderResult } from '../types';
import { ENV } from '../env';

export async function callMistral(model: string, messages: ChatMessage[]): Promise<ProviderResult> {
  const apiKey = ENV.MISTRAL_API_KEY || process.env.MISTRAL_API_KEY;
  if (!apiKey) throw new Error('Missing MISTRAL_API_KEY');

  const base = (ENV.MISTRAL_BASE_URL || 'https://api.mistral.ai').replace(/\/$/, '');
  const url = `${base}/v1/chat/completions`;

  const r = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages,           // { role, content }[]
      stream: false,
      // Optional: temperature, max_tokens… accept via your call signature if needed
    }),
  });

  if (!r.ok) throw new Error(`Mistral API error: HTTP_${r.status} ${await r.text()}`);
  const data: any = await r.json();

  const text = data?.choices?.[0]?.message?.content ?? '';
  return { provider: 'mistral', model: data?.model ?? model, text, raw: data };
}
