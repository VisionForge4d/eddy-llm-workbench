// server/src/providers/mock.ts
import type { ProviderResult, ChatMessage } from '../types';

export async function callMock(
  model: string,
  messages: ChatMessage[],
): Promise<ProviderResult> {
  const lastUser = [...messages].reverse().find(m => m.role === 'user')?.content ?? '';
  return { provider: 'mock', model, text: `Echo: ${lastUser}` };
}

