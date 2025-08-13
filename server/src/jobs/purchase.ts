import { Queue, Worker, QueueEvents, JobsOptions } from 'bullmq';
import { getOrder, updateOrder } from '../orders';

const connection = { connection: { url: process.env.REDIS_URL || 'redis://localhost:6379' } } as any;

export const purchaseQueue = new Queue('purchase', connection);
export const purchaseQueueEvents = new QueueEvents('purchase', connection);

export function enqueuePurchase(orderId: string, opts?: JobsOptions) {
  return purchaseQueue.add('purchase', { orderId }, opts);
}

export function startPurchaseWorker() {
  const worker = new Worker('purchase', async (job) => {
    const { orderId } = job.data as { orderId: string };
    const order = getOrder(orderId);
    if (!order) throw new Error('Order not found');
    updateOrder(orderId, { state: 'purchased', confirmation: { externalOrderId: `ext_${orderId}` } });
  }, connection);
  return worker;
}
