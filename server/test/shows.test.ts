import { describe, expect, it } from 'vitest';
import Fastify from 'fastify';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { Show } from '../src/types';

async function buildApp() {
  const app = Fastify({ logger: false });
  app.get('/shows', async (request, reply) => {
    const city = (request.query as any).city || 'NYC';
    const date = (request.query as any).date || '2025-08-14';
    const file = path.join(process.cwd(), 'fixtures', 'shows.json');
    const raw = await readFile(file, 'utf8');
    const data: Show[] = JSON.parse(raw);
    const filtered = (data as any[]).filter((s: any) => s.city === city && (s.startAt ?? '').startsWith(date));
    return filtered;
  });
  return app;
}

describe('GET /shows', () => {
  it('returns shows filtered by city and date', async () => {
    const app = await buildApp();
    const res = await app.inject({ method: 'GET', url: '/shows?city=NYC&date=2025-08-14' });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body) as any[];
    expect(body.length).toBe(1);
    expect(body[0].id).toBe('show_1');
  });
});
