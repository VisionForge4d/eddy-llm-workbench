import React from 'react';
import ProviderGrid from './ProviderGrid';

export default function App() {
  return (
   <div className="min-h-screen bg-gradient-to-br from-sky-900 via-cyan-900 to-emerald-900 text-zinc-100 p-6">
      {/* Logo + Tagline */}
      <div className="flex flex-col items-center mb-8">
        <img
          src="/logo.png"
          alt="Eddy Logo"
          className="h-20 w-auto mb-2"
        />
        <h2 className="text-lg text-zinc-400">
          Switching intelligence, seamlessly.
        </h2>
      </div>

      {/* Provider Tiles */}
      <ProviderGrid />
    </div>
  );
}
