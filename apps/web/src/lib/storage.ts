const KEY = 'llm-switch.providers';

export function loadProviders<T=any[]>(): T {
  try { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) : ([] as unknown as T); }
  catch { return [] as unknown as T; }
}

export function saveProviders(list: any[]) {
  localStorage.setItem(KEY, JSON.stringify(list));
}
