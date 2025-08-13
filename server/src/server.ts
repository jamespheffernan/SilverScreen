import Fastify from 'fastify';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Show, SeatMap } from './types';
import { register, showsRequests, seatmapRequests } from './metrics.js';
import { globalCache } from './lib/cache.js';
import { getPrisma } from './db/client.js';

const app = Fastify({ logger: { level: process.env.LOG_LEVEL || 'info' } });

app.get('/metrics', async (req, reply) => {
  reply.header('Content-Type', register.contentType);
  return register.metrics();
});

// Propagate request id for debugging
app.addHook('onRequest', async (request, reply) => {
  // Fastify assigns request.id; expose it so clients can echo in bug reports
  reply.header('x-request-id', request.id);
});

app.get('/shows', async (request, reply) => {
  showsRequests.inc();
  const city = (request.query as any).city || process.env.TARGET_CITY || 'NYC';
  const date = (request.query as any).date || new Date().toISOString().slice(0, 10);
  const source = (request.query as any).source || process.env.SCRAPE_SOURCE || 'fixtures';
  const cacheKey = `shows:${city}:${date}`;
  const cached = globalCache.get<Show[]>(cacheKey);
  if (cached) return cached;
  if (source === 'live') {
    try {
      const mod = await import('./scrapers/chainX/playwright_shows.js');
      const live = await mod.scrapeShowsLive(city, date);
      return live as Show[];
    } catch (err) {
      request.log.warn({ err }, 'live shows scrape failed, falling back to fixtures');
    }
  }
  const file = path.join(process.cwd(), 'fixtures', 'shows.json');
  const raw = await readFile(file, 'utf8');
  const data: any[] = JSON.parse(raw);
  const filtered = data.filter((s) => s.city === city && (s.startAt ?? '').startsWith(date)) as Show[];
  // Best-effort persistence if DB configured
  const prisma = getPrisma();
  if (prisma) {
    try {
      for (const s of filtered) {
        await prisma.show.upsert({
          where: { id: s.id },
          create: {
            id: s.id,
            venueId: (s as any).venueId,
            movie: s.movie,
            startAt: new Date(s.startAt),
            currency: (s.pricing as any)?.adult?.currency || 'USD',
          },
          update: {
            venueId: (s as any).venueId,
            movie: s.movie,
            startAt: new Date(s.startAt),
            currency: (s.pricing as any)?.adult?.currency || 'USD',
          }
        });
      }
    } catch (err) {
      request.log.warn({ err }, 'failed to persist shows');
    }
  }
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
  const source = (request.query as any).source || process.env.SCRAPE_SOURCE || 'fixtures';
  const cacheKey = `seatmap:${id}`;
  const fresh = globalCache.get<SeatMap>(cacheKey);
  if (fresh) { seatmapRequests.inc(); return fresh; }
  if (source === 'live') {
    try {
      const showsFile = path.join(process.cwd(), 'fixtures', 'shows.json');
      const showsRaw = await readFile(showsFile, 'utf8');
      const shows: any[] = JSON.parse(showsRaw);
      const show = shows.find(s => s.id === id);
      if (show?.upstream?.url) {
        const mod = await import('./scrapers/chainX/playwright_seatmap.js');
        const live = await mod.fetchSeatMapLive(show.upstream.url);
        validateSeatMap(live as any);
        globalCache.set(cacheKey, live, 60 * 1000);
        seatmapRequests.inc();
        return live as SeatMap;
      }
    } catch (err) {
      request.log.warn({ err }, 'live seatmap scrape failed, falling back to fixtures');
    }
  }
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
