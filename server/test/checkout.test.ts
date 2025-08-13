import { describe, expect, it } from 'vitest';
import Fastify from 'fastify';
import routes from '../src/api/checkout';

async function buildApp() {
  const app = Fastify({ logger: false });
  await routes(app);
  return app;
}

describe('checkout flow', () => {
  it('creates a paid order and confirms purchase', async () => {
    const app = await buildApp();
    const payload = { orderDraft: { showId: 'show_1', seats: ['A-1','A-3'], email: 'test@example.com' } };
    const res = await app.inject({ method: 'POST', url: '/checkout', payload });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.orderId).toBeTruthy();
    expect(body.amount).toBeGreaterThan(0);

    const res2 = await app.inject({ method: 'POST', url: '/confirm', payload: { orderId: body.orderId } });
    expect(res2.statusCode).toBe(200);

    const res3 = await app.inject({ method: 'GET', url: `/orders/${body.orderId}` });
    expect(res3.statusCode).toBe(200);
    const order = JSON.parse(res3.body);
    expect(order.state).toBe('purchased');
    expect(order.confirmation?.externalOrderId).toBeTruthy();
  });
});
