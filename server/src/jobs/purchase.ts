import { Queue, Worker, QueueEvents, JobsOptions } from 'bullmq';
import { getOrder, updateOrder } from '../orders.js';

// Check if Redis is configured
const REDIS_URL = process.env.REDIS_URL;
const USE_QUEUE = !!REDIS_URL && REDIS_URL !== 'redis://localhost:6379';

let purchaseQueue: Queue | null = null;
let purchaseQueueEvents: QueueEvents | null = null;

// Only initialize BullMQ if Redis is properly configured
if (USE_QUEUE) {
  try {
    const connection = { connection: { url: REDIS_URL } } as any;
    purchaseQueue = new Queue('purchase', connection);
    purchaseQueueEvents = new QueueEvents('purchase', connection);
    console.log('BullMQ queue initialized with Redis');
  } catch (err) {
    console.warn('Failed to initialize BullMQ queue:', err);
  }
} else {
  console.log('Running without Redis queue - purchase jobs will be processed synchronously');
}

export async function enqueuePurchase(orderId: string, opts?: JobsOptions) {
  if (purchaseQueue) {
    // Use the queue if available
    return purchaseQueue.add('purchase', { orderId }, opts);
  } else {
    // Fallback: process synchronously when queue is not available
    console.log(`Processing purchase synchronously for order ${orderId}`);
    const order = getOrder(orderId);
    if (!order) throw new Error('Order not found');
    
    // Simulate async processing
    await new Promise(resolve => setTimeout(resolve, 100));
    
    updateOrder(orderId, { 
      state: 'purchased', 
      confirmation: { externalOrderId: `ext_${orderId}` } 
    });
    
    return { id: orderId, data: { orderId } };
  }
}

export function startPurchaseWorker() {
  if (!purchaseQueue) {
    console.log('Purchase worker not started - Redis not configured');
    return null;
  }
  
  const worker = new Worker('purchase', async (job) => {
    const { orderId } = job.data as { orderId: string };
    const order = getOrder(orderId);
    if (!order) throw new Error('Order not found');
    updateOrder(orderId, { 
      state: 'purchased', 
      confirmation: { externalOrderId: `ext_${orderId}` } 
    });
  }, { connection: { url: REDIS_URL } } as any);
  
  return worker;
}

// Export the queue instances for testing/monitoring (may be null)
export { purchaseQueue, purchaseQueueEvents };