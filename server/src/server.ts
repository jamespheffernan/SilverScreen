import Fastify from 'fastify';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Show } from './types';

const app = Fastify({ logger: { level: process.env.LOG_LEVEL || 'info' } });

app.get('/shows', async (request, reply) => {
  const city = (request.query as any).city || process.env.TARGET_CITY || 'NYC';
  const date = (request.query as any).date || new Date().toISOString().slice(0, 10);
  const file = path.join(process.cwd(), 'fixtures', 'shows.json');
  const raw = await readFile(file, 'utf8');
  const data: Show[] = JSON.parse(raw);
  const filtered = (data as any[]).filter((s: any) => s.city === city && (s.startAt ?? '').startsWith(date));
  return filtered;
});

export async function start() {
  const port = Number(process.env.PORT || 3001);
  await app.listen({ port, host: '0.0.0.0' });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  start().catch((err) => { console.error(err); process.exit(1); });
}
