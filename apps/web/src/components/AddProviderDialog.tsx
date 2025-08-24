import React, { useRef } from 'react';
import type { ProviderConfig, ProviderKind } from '../types/providers';

type Props = { open: boolean; onClose: () => void; onCreate: (cfg: ProviderConfig) => void; };
const KINDS: ProviderKind[] = ['lmstudio','groq','openai','anthropic','mistral','google'];

function pretty(k: string) {
  if (k === 'lmstudio') return 'LM Studio';
  if (k === 'google') return 'Google (Gemini)';
  return k[0].toUpperCase() + k.slice(1);
}

export default function AddProviderDialog({ open, onClose, onCreate }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData(formRef.current!);
    const kind = String(fd.get('kind')) as ProviderKind;
    const label = String(fd.get('label') || '').trim() || pretty(kind);
    const cfg: ProviderConfig = {
      id: crypto.randomUUID(),
      label,
      kind,
      baseUrl: String(fd.get('baseUrl') || '') || undefined,
      apiKey: String(fd.get('apiKey') || '') || undefined,
      model: String(fd.get('model') || '') || undefined,
      createdAt: new Date().toISOString(),
    };
    onCreate(cfg);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        <div className="text-lg font-semibold text-zinc-100">Add Provider</div>
        <p className="text-sm text-zinc-400 mt-1">
          For Google, use a Google AI Studio key and a model like <code className="text-zinc-300">gemini-1.5-pro</code>.
        </p>

        <form ref={formRef} onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Kind</label>
            <select name="kind" className="w-full rounded-lg bg-zinc-900 border border-zinc-800 p-2 text-zinc-100">
              {KINDS.map(k => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Label (optional)</label>
            <input name="label" placeholder="Google (Gemini) – Prod" className="w-full rounded-lg bg-zinc-900 border border-zinc-800 p-2 text-zinc-100" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Base URL (optional)</label>
              <input name="baseUrl" placeholder="http://localhost:1234" className="w-full rounded-lg bg-zinc-900 border border-zinc-800 p-2 text-zinc-100" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Default Model (optional)</label>
              <input name="model" placeholder="gemini-1.5-pro" className="w-full rounded-lg bg-zinc-900 border border-zinc-800 p-2 text-zinc-100" />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">API Key (stored locally for dev)</label>
            <input name="apiKey" type="password" placeholder="sk-..." className="w-full rounded-lg bg-zinc-900 border border-zinc-800 p-2 text-zinc-100" />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-2 rounded-lg border border-zinc-800 text-zinc-300 hover:bg-zinc-900">Cancel</button>
            <button type="submit" className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500">Add</button>
          </div>
        </form>
      </div>
    </div>
  );
}
