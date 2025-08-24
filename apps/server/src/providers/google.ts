// server/src/providers/google.ts
import { ChatMessage, ProviderResult } from '../types';
import { ENV } from '../env';

type GenPart = { text?: string };
type GenContent = { role?: string; parts?: GenPart[] };
type Candidate = { content?: GenContent };
type GenResp = { candidates?: Candidate[] };

export async function callGoogle(
  model: string,
  messages: ChatMessage[],
  opts?: { temperature?: number; max_tokens?: number }
): Promise<ProviderResult> {
  const apiKey = ENV.GOOGLE_API_KEY;
  if (!apiKey) throw new Error('Missing GOOGLE_API_KEY');

  // Separate out a system message if present
  const systemMsg = messages.find(m => m.role === 'system')?.content;
  const chatMsgs = messages.filter(m => m.role !== 'system');

  // Map roles to Gemini expectations: user/model
  const contents: GenContent[] = chatMsgs.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const base = (ENV.GOOGLE_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta').replace(/\/$/, '');
  const url = `${base}/models/${model}:generateContent?key=${apiKey}`;

  const body: any = {
    contents,
    generationConfig: {
      ...(opts?.temperature != null ? { temperature: opts.temperature } : {}),
      ...(opts?.max_tokens != null ? { maxOutputTokens: opts.max_tokens } : {}),
    },
  };

  if (systemMsg) {
    body.systemInstruction = { parts: [{ text: systemMsg }] };
  }

  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!r.ok) {
    const errText = await r.text().catch(() => '');
    throw new Error(`Google API error: HTTP_${r.status} ${errText}`);
  }

  const data = (await r.json()) as GenResp;

  const text =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ??
    '';

  return {
    provider: 'google',
    model,
    text,
    raw: data,
  };
}
