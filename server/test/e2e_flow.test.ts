import { describe, expect, it, beforeAll } from 'vitest';
import Fastify from 'fastify';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import checkoutRoutes from '../src/api/checkout';

async function buildApp() {
  process.env.DEMO_MODE = 'true';
  const app = Fastify({ logger: false });
  app.get('/shows', async (request, reply) => {
    const city = (request.query as any).city || 'NYC';
    const date = (request.query as any).date || '2025-08-14';
    const raw = await readFile(path.join(process.cwd(), 'fixtures', 'shows.json'), 'utf8');
    const data: any[] = JSON.parse(raw);
    return data.filter((s) => s.city === city && (s.startAt ?? '').startsWith(date));
  });
  app.get('/shows/:id/seatmap', async (request, reply) => {
    const id = (request.params as any).id as string;
    const raw = await readFile(path.join(process.cwd(), 'fixtures', `seatmap_${id}.json`), 'utf8');
    return JSON.parse(raw);
  });
  await checkoutRoutes(app);
  return app;
}

describe('E2E flow (fixtures + demo mode)', () => {
  it('browse -> seatmap -> checkout -> confirm -> purchased', async () => {
    const app = await buildApp();
    const showsRes = await app.inject({ method: 'GET', url: '/shows?city=NYC&date=2025-08-14' });
    expect(showsRes.statusCode).toBe(200);
    const shows = JSON.parse(showsRes.body) as any[];
    expect(shows.length).toBeGreaterThan(0);
    const show = shows[0];

    const seatRes = await app.inject({ method: 'GET', url: `/shows/${show.id}/seatmap` });
    expect(seatRes.statusCode).toBe(200);
    const seatmap = JSON.parse(seatRes.body);
    const freeSeats = seatmap.seats.filter((s:any)=> s.status==='free').slice(0,2);
    const seats = freeSeats.map((s:any)=> s.code);

    const checkoutPayload = { orderDraft: { showId: show.id, seats, email: 'test@example.com' } };
    const coRes = await app.inject({ method: 'POST', url: '/checkout', payload: checkoutPayload });
    expect(coRes.statusCode).toBe(200);
    const co = JSON.parse(coRes.body);

    const confRes = await app.inject({ method: 'POST', url: '/confirm', payload: { orderId: co.orderId } });
    expect(confRes.statusCode).toBe(200);

    const orderRes = await app.inject({ method: 'GET', url: `/orders/${co.orderId}` });
    expect(orderRes.statusCode).toBe(200);
    const order = JSON.parse(orderRes.body);
    expect(order.state).toBe('purchased');
  });
});
