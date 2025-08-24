// web/src/components/ProviderCard.tsx
import React, { useEffect, useState } from 'react';
import type { ProviderConfig } from '../types/providers';

// Import SVGs (place files in web/src/assets/logos/)
import openaiLogo from '../assets/logos/openai.svg';
import anthropicLogo from '../assets/logos/anthropic.svg';
import groqLogo from '../assets/logos/groq.svg';
import mistralLogo from '../assets/logos/mistral.svg';
import googleLogo from '../assets/logos/google.svg';
import lmstudioLogo from '../assets/logos/lmstudio.svg';

type Props = {
  item: ProviderConfig;
  onTest?: (p: ProviderConfig) => void;
  onSelect?: (p: ProviderConfig) => void;
};

const LOGOS: Record<string, string> = {
  openai: openaiLogo,
  anthropic: anthropicLogo,
  groq: groqLogo,
  mistral: mistralLogo,
  google: googleLogo,
  lmstudio: lmstudioLogo,
};

export default function ProviderCard({ item, onTest, onSelect }: Props) {
  const logo = LOGOS[item.kind] ?? null;

  // We re-read localStorage when 'llm-switch.current' changes to reflect the green light.
  const [tick, setTick] = useState(0);
  const active = typeof window !== 'undefined'
    ? localStorage.getItem('llm-switch.current') === item.id
    : false;

  // Listen for storage changes (helps if other components/pages update the key)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'llm-switch.current') setTick(t => t + 1);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function activateCard() {
    // 1) Persist the active card id so your existing badge logic keeps working
    try {
      localStorage.setItem('llm-switch.current', item.id);
    } catch {
      /* ignore storage errors */
    }

    // 2) Broadcast details so other components (e.g., PromptTile) can target the active provider/model
    window.dispatchEvent(
      new CustomEvent('switch:active', {
        detail: {
          id: item.id,
          provider: item.kind,       // e.g., 'google', 'groq', 'openai', etc.
          model: item.model ?? null, // exact model string if present
          label: item.label ?? item.id,
        },
      }),
    );

    // 3) Keep your existing callback behavior
    onSelect?.(item);

    // 4) Local re-render to immediately reflect the green light (since storage event
    //     may not fire in the same document)
    setTick(t => t + 1);
  }

  return (
    <button
      onClick={activateCard}
      className="
        group aspect-square relative flex flex-col justify-between items-center text-center p-6
        rounded-2xl border border-white/20
        bg-white/10 backdrop-blur-md
        shadow-xl shadow-black/30
        ring-1 ring-white/10
        hover:bg-white/15 hover:border-white/30 hover:ring-white/20
        transition
      "
    >
      {/* Center block: logo + name + model */}
      <div className="flex flex-col items-center justify-center flex-1">
        {logo ? (
          <div className="mb-3 rounded-xl bg-white/80 backdrop-blur-sm p-2 shadow-sm">
            <img
              src={logo}
              alt={`${item.label} logo`}
              className="h-12 w-12 md:h-16 md:w-16 object-contain"
            />
          </div>
        ) : (
          <div className="mb-3 h-12 w-12 md:h-16 md:w-16 rounded-xl bg-white/60" />
        )}

        <div className="font-medium text-white">{item.label}</div>
        <div className="text-xs text-white/80">{item.model ?? '—'}</div>
      </div>

      {/* Bottom row: Active badge (left) + Test button (right) */}
      <div className="mt-4 flex items-center justify-between w-full px-2 py-2 bg-white/5 rounded-xl">
        <div className="flex items-center gap-1 text-xs">
          <span
            className={`h-2 w-2 rounded-full ${
              active ? 'bg-emerald-400' : 'bg-white/50'
            }`}
          />
          {active && <span className="text-emerald-300 font-medium">Active</span>}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTest?.(item);
          }}
          className="text-xs px-3 py-1 rounded-md border border-white/30 bg-white/10
                     text-white/90 hover:bg-white/20 hover:border-white/50 transition"
        >
          Test
        </button>
      </div>
    </button>
  );
}
