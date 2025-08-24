import type { ProviderConfig } from '../types/providers';

export const DEFAULT_PROVIDERS: ProviderConfig[] = [
  {
    id: 'lmstudio',
    label: 'LM Studio',
    kind: 'lmstudio',
    baseUrl: 'http://localhost:1234',
    model: 'mistralai/mistral-7b-instruct-v0.3', // ✅ your LM Studio model
    createdAt: new Date().toISOString(),
  },
  {
    id: 'groq',
    label: 'Groq',
    kind: 'groq',
    model: 'llama-3.1-8b-instant', // ✅ your Groq model
    createdAt: new Date().toISOString(),
  },
  {
    id: 'openai',
    label: 'OpenAI',
    kind: 'openai',
    model: 'gpt-4o-mini', // adjust as needed
    createdAt: new Date().toISOString(),
  },
  {
    id: 'anthropic',
    label: 'Anthropic',
    kind: 'anthropic',
    model: 'claude-3-opus', // adjust as needed
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mistral',
    label: 'Mistral',
    kind: 'mistral',
    model: 'mistral-medium', // adjust as needed
    createdAt: new Date().toISOString(),
  },
  {
    id: 'google',
    label: 'Google (Gemini)',
    kind: 'google',
    model: 'gemini-1.5-pro', // adjust as needed
    createdAt: new Date().toISOString(),
  },
];
