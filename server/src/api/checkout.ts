import type { FastifyInstance } from 'fastify';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import Stripe from 'stripe';
import type { Show } from '../types';
import { createOrder, updateOrder, getOrder } from '../orders';
import { enqueuePurchase } from '../jobs/purchase';
import { checkoutRequests, confirmRequests } from '../metrics.js';
import { getPrisma } from '../db/client.js';

const stripeKey = process.env.STRIPE_SECRET_KEY || 'sk_test_000';
const stripe = new Stripe(stripeKey);
const useStripe = !!process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY !== 'sk_test_000';

export default async function routes(app: FastifyInstance) {
  app.post('/checkout', async (request, reply) => {
    checkoutRequests.inc();
    const { orderDraft } = request.body as any;
    const showsRaw = await readFile(path.join(process.cwd(), 'fixtures', 'shows.json'), 'utf8');
    const shows: any[] = JSON.parse(showsRaw);
    const show = shows.find(s => s.id === orderDraft.showId) as Show | undefined;
    if (!show) return reply.code(400).send({ error: 'Invalid showId' });

    const seatmapRaw = await readFile(path.join(process.cwd(), 'fixtures', `seatmap_${orderDraft.showId}.json`), 'utf8');
    const seatmap = JSON.parse(seatmapRaw);
    const seatPrice = new Map<string, number>(seatmap.seats.map((s: any) => [s.code, s.price?.amount ?? 0]));
    const amount = (orderDraft.seats as string[]).reduce((acc, c) => acc + (seatPrice.get(c) || 0), 0);

    const order = createOrder({
      showId: orderDraft.showId,
      seats: orderDraft.seats,
      amount,
      currency: show.pricing.adult.currency,
      email: orderDraft.email,
      state: 'initiated',
    });

    // Persist to DB if available (best-effort)
    const prisma = getPrisma();
    if (prisma) {
      try {
        await prisma.order.create({ data: {
          id: order.id,
          showId: order.showId,
          seats: order.seats.join(','),
          amount: order.amount,
          currency: order.currency,
          email: order.email,
          state: order.state,
          paymentIntentId: order.paymentIntentId ?? null,
          externalOrderId: order.confirmation?.externalOrderId ?? null,
        }});
      } catch (err) {
        app.log.warn({ err }, 'failed to persist order');
      }
    }

    let clientSecret: string | null = null;
    if (useStripe) {
      const pi = await stripe.paymentIntents.create({
        amount,
        currency: show.pricing.adult.currency.toLowerCase(),
        automatic_payment_methods: { enabled: true },
        metadata: { orderId: order.id },
      });
      updateOrder(order.id, { state: 'paid', paymentIntentId: pi.id });
      clientSecret = pi.client_secret as string;
    } else {
      updateOrder(order.id, { state: 'paid', paymentIntentId: `pi_${order.id}` });
      clientSecret = `pi_${order.id}_secret_mock`;
    }

    return { clientSecret, orderId: order.id, amount, currency: show.pricing.adult.currency };
  });

  app.post('/confirm', async (request, reply) => {
    confirmRequests.inc();
    const { orderId } = request.body as any;
    const order = getOrder(orderId);
    if (!order) return reply.code(404).send({ error: 'Order not found' });

    const demoMode = process.env.DEMO_MODE === 'true' || !process.env.REDIS_URL;
    if (demoMode) {
      updateOrder(orderId, { state: 'purchased', confirmation: { externalOrderId: `ext_${orderId}` } });
      return { status: 'purchased' };
    }

    await enqueuePurchase(orderId, { attempts: 1 });
    return { status: 'queued' };
  });

  app.get('/orders/:id', async (request, reply) => {
    const { id } = request.params as any;
    const order = getOrder(id);
    if (!order) return reply.code(404).send({ error: 'Order not found' });
    return order;
  });
}
// Force rebuild - remove apiVersion
