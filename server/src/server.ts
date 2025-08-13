import Fastify from 'fastify';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Show, SeatMap } from './types';
import { register, showsRequests, seatmapRequests } from './metrics.js';
import { globalCache } from './lib/cache.js';

const app = Fastify({ logger: { level: process.env.LOG_LEVEL || 'info' } });

app.get('/metrics', async (req, reply) => {
  reply.header('Content-Type', register.contentType);
  return register.metrics();
});

app.get('/shows', async (request, reply) => {
  showsRequests.inc();
  const city = (request.query as any).city || process.env.TARGET_CITY || 'NYC';
  const date = (request.query as any).date || new Date().toISOString().slice(0, 10);
  const cacheKey = `shows:${city}:${date}`;
  const cached = globalCache.get<Show[]>(cacheKey);
  if (cached) return cached;
  const file = path.join(process.cwd(), 'fixtures', 'shows.json');
  const raw = await readFile(file, 'utf8');
  const data: any[] = JSON.parse(raw);
  const filtered = data.filter((s) => s.city === city && (s.startAt ?? '').startsWith(date)) as Show[];
  globalCache.set(cacheKey, filtered, 15 * 60 * 1000);
  return filtered;
});

function validateSeatMap(seatmap: SeatMap) {
  const codes = new Set<string>();
  for (const seat of seatmap.seats) {
    if (seat.col < 1 || seat.col > seatmap.cols) throw new Error('Seat column out of bounds');
    if (codes.has(seat.code)) throw new Error('Duplicate seat code');
    codes.add(seat.code);
  }
  return true;
}

app.get('/shows/:id/seatmap', async (request, reply) => {
  const id = (request.params as any).id as string;
  const cacheKey = `seatmap:${id}`;
  const fresh = globalCache.get<SeatMap>(cacheKey);
  if (fresh) { seatmapRequests.inc(); return fresh; }
  const file = path.join(process.cwd(), 'fixtures', `seatmap_${id}.json`);
  const raw = await readFile(file, 'utf8');
  const seatmap = JSON.parse(raw) as SeatMap;
  validateSeatMap(seatmap);
  globalCache.set(cacheKey, seatmap, 60 * 1000);
  seatmapRequests.inc();
  return seatmap;
});


import checkoutRoutes from './api/checkout.js';
await checkoutRoutes(app as any);

export async function start() {
  const port = Number(process.env.PORT || 3001);
  await app.listen({ port, host: '0.0.0.0' });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  start().catch((err) => { console.error(err); process.exit(1); });
}
