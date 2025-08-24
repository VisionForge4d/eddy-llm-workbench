import React, { useEffect, useMemo, useState } from 'react';
import ProviderCard from './ProviderCard';
import AddProviderDialog from './AddProviderDialog';
import PromptTile from './PromptTile'; // <-- add this
import { DEFAULT_PROVIDERS } from '../lib/defaults';
import { loadProviders, saveProviders } from '../lib/storage';
import type { ProviderConfig } from '../types/providers';

export default function ProviderGrid() {
  const [providers, setProviders] = useState<ProviderConfig[]>([]);
  const [showAdd, setShowAdd] = useState(false);

  useEffect(() => {
    const stored: ProviderConfig[] = loadProviders();
    const map = new Map<string, ProviderConfig>();
    [...DEFAULT_PROVIDERS, ...stored].forEach(p => map.set(p.id, p));
    setProviders([...map.values()]);
  }, []);

  useEffect(() => { saveProviders(providers); }, [providers]);

  async function handleTest(p: ProviderConfig) {
    try {
      const res = await fetch('/api/health');
      if (!res.ok) throw new Error('not ok');
      alert(`${p.label}: OK`);
    } catch {
      alert(`${p.label}: test failed`);
    }
  }

  function handleSelect(p: ProviderConfig) {
    localStorage.setItem('llm-switch.current', p.id);
    setProviders([...providers]); // refresh active dot
  }

  async function handleCreate(cfg: ProviderConfig) {
    setProviders(prev => [...prev, cfg]);
    try {
      await fetch('/api/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cfg),
      });
    } catch { /* dev-only; ignore */ }
  }

  const tiles = useMemo(() => providers, [providers]);

  return (
    <>
      {/* Responsive, even columns with healthy gaps */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tiles.map(p => (
          <ProviderCard key={p.id} item={p} onTest={handleTest} onSelect={handleSelect} />
        ))}

        <button
          onClick={() => setShowAdd(true)}
          className="aspect-square flex items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white p-4 text-gray-500 hover:border-gray-400 hover:shadow-md transition"
          title="Add Provider"
        >
          + Add Provider
        </button>

        {/* New prompt tile — same footprint as a card, pinned to lg: row2/col4 */}
        <PromptTile />
      </div>

      <AddProviderDialog open={showAdd} onClose={() => setShowAdd(false)} onCreate={handleCreate} />
    </>
  );
}
