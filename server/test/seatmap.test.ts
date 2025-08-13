import { describe, expect, it } from 'vitest';
import Fastify from 'fastify';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { SeatMap } from '../src/types';

function validateSeatMap(seatmap: SeatMap) {
  const codes = new Set<string>();
  for (const seat of seatmap.seats) {
    if (seat.col < 1 || seat.col > seatmap.cols) throw new Error('Seat column out of bounds');
    if (codes.has(seat.code)) throw new Error('Duplicate seat code');
    codes.add(seat.code);
  }
  return true;
}

async function buildApp() {
  const app = Fastify({ logger: false });
  app.get('/shows/:id/seatmap', async (request, reply) => {
    const id = (request.params as any).id as string;
    const file = path.join(process.cwd(), 'fixtures', `seatmap_${id}.json`);
    const raw = await readFile(file, 'utf8');
    const seatmap = JSON.parse(raw) as SeatMap;
    validateSeatMap(seatmap);
    return seatmap;
  });
  return app;
}

describe('GET /shows/:id/seatmap', () => {
  it('returns a valid seatmap for show_1', async () => {
    const app = await buildApp();
    const res = await app.inject({ method: 'GET', url: '/shows/show_1/seatmap' });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body) as SeatMap;
    expect(body.showId).toBe('show_1');
    expect(body.rows).toBeGreaterThan(0);
    expect(body.cols).toBeGreaterThan(0);
    expect(Array.isArray(body.seats)).toBe(true);
  });
});
