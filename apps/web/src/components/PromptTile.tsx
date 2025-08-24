import React, { useEffect, useState } from 'react';

type ActiveSel = {
  id: string | null;
  provider: string | null;
  model: string | null;
  label?: string | null;
};

export default function PromptTile() {
  const [active, setActive] = useState<ActiveSel>({
    id: null, provider: null, model: null, label: null,
  });
  const [prompt, setPrompt] = useState('Say READY');
  const [out, setOut] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Seed from localStorage (keeps selection on refresh)
  useEffect(() => {
    try {
      const id = localStorage.getItem('llm-switch.current');
      if (id) setActive(a => ({ ...a, id }));
    } catch {}
  }, []);

  // Follow the active card broadcast
  useEffect(() => {
    const onActive = (e: Event) => {
      const { id, provider, model, label } = (e as CustomEvent).detail || {};
      setActive({
        id: id ?? null,
        provider: provider ?? null,
        model: model ?? null,
        label: label ?? null,
      });
    };
    window.addEventListener('switch:active', onActive);
    return () => window.removeEventListener('switch:active', onActive);
  }, []);

  async function send() {
    if (!active.provider || !active.model || !prompt.trim()) return;
    setLoading(true); setOut('');
    try {
      const r = await fetch('/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: active.provider,
          model: active.model,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      const data = await r.json();
      setOut(JSON.stringify(data, null, 2));
    } catch (e: any) {
      setOut('Error: ' + (e?.message || String(e)));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="
        aspect-square relative flex flex-col justify-between p-4
        rounded-2xl border border-white/20
        bg-white/10 backdrop-blur-md
        shadow-xl shadow-black/30 ring-1 ring-white/10
        hover:bg-white/15 hover:border-white/30 hover:ring-white/20 transition
        lg:col-start-4 lg:row-start-2
      "
      title="Send a prompt to the active provider"
    >
      <div className="flex items-baseline justify-between">
        <h2 className="font-semibold text-white">Test Prompt</h2>
        <span className="text-xs text-white/80">
          {active.provider && active.model
            ? `${active.provider} • ${active.model}`
            : 'Select a provider tile'}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1 w-full mt-2">
        <textarea
          className="
            w-full h-full min-h-[6rem] max-h-full
            rounded-xl border border-white/20 bg-white/10 text-white/90 p-2 text-sm
            placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30
          "
          placeholder="Type a message…"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
        />
      </div>

      {/* Footer */}
      <div>
        <button
          onClick={send}
          disabled={!active.provider || !active.model || !prompt.trim() || loading}
          className="mt-3 w-full px-3 py-2 rounded-xl bg-black/80 text-white disabled:opacity-50 hover:bg-black"
        >
          {loading ? 'Sending…' : 'Send'}
        </button>

        {out && (
          <pre className="mt-2 bg-black/40 text-white/90 p-2 rounded-xl text-xs whitespace-pre-wrap break-words max-h-24 overflow-auto">
            {out}
          </pre>
        )}
      </div>
    </div>
  );
}
