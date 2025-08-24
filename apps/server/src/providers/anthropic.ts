import { ChatMessage, ProviderResult } from '../types';
import { ENV } from '../env';

export async function callAnthropic(model: string, messages: ChatMessage[]): Promise<ProviderResult> {
  const apiKey = ENV.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('Missing ANTHROPIC_API_KEY');

  // Anthropic uses /v1/messages and a slightly different schema
  const url = 'https://api.anthropic.com/v1/messages';

  // Convert your messages as-is; roles must be 'user' or 'assistant'. (System goes into system field)
  const systemMsg = messages.find(m => m.role === 'system')?.content;
  const chatMsgs = messages
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .map(m => ({ role: m.role, content: m.content }));

  const body: any = {
    model,
    max_tokens: 1024,
    messages: chatMsgs,
  };
  if (systemMsg) body.system = systemMsg;

  const r = await fetch(url, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!r.ok) throw new Error(`Anthropic API error: HTTP_${r.status} ${await r.text()}`);
  const data: any = await r.json();

  const text = data?.content?.[0]?.text ?? '';
  return { provider: 'anthropic', model: data?.model ?? model, text, raw: data };
}
