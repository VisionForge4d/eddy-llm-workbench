import { Router } from 'express';
const r = Router();
const memory: any[] = [];

r.get('/health', (_req, res) => res.json({ ok: true }));

r.get('/providers', (_req, res) => res.json({ ok: true, providers: memory }));

r.post('/providers', (req, res) => {
  memory.push(req.body);
  res.json({ ok: true });
});

export default r;
