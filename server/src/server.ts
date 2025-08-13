import Fastify from 'fastify';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Show, SeatMap } from './types';

const app = Fastify({ logger: { level: process.env.LOG_LEVEL || 'info' } });

app.get('/shows', async (request, reply) => {
  const city = (request.query as any).city || process.env.TARGET_CITY || 'NYC';
  const date = (request.query as any).date || new Date().toISOString().slice(0, 10);
  const file = path.join(process.cwd(), 'fixtures', 'shows.json');
  const raw = await readFile(file, 'utf8');
  const data: any[] = JSON.parse(raw);
  const filtered = data.filter((s) => s.city === city && (s.startAt ?? '').startsWith(date));
  return filtered as Show[];
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
  const file = path.join(process.cwd(), 'fixtures', `seatmap_${id}.json`);
  const raw = await readFile(file, 'utf8');
  const seatmap = JSON.parse(raw) as SeatMap;
  validateSeatMap(seatmap);
  return seatmap;
});

export async function start() {
  const port = Number(process.env.PORT || 3001);
  await app.listen({ port, host: '0.0.0.0' });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  start().catch((err) => { console.error(err); process.exit(1); });
}
