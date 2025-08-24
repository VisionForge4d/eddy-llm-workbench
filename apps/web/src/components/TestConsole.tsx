import React, { useState } from 'react';

export default function TestConsole() {
  const [prompt, setPrompt] = useState("Say READY");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSend() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'google',            // match your provider card
          model: 'gemini-1.5-flash',     // exact model name you configured
          messages: [{ role: 'user', content: prompt }],
        }),
      });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch (err: any) {
      setResult('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>LLM Switch Test Console</h1>
      <textarea
        rows={3}
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />
      <div>
        <button onClick={handleSend} disabled={loading}>
          {loading ? 'Sending…' : 'Send'}
        </button>
      </div>
      {result && (
        <pre style={{ marginTop: 20, background: "#f0f0f0", padding: 10 }}>
          {result}
        </pre>
      )}
    </div>
  );
}
