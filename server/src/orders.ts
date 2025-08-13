export type OrderState = 'initiated' | 'paid' | 'purchased' | 'failed';

export interface OrderRecord {
  id: string;
  showId: string;
  seats: string[];
  amount: number;
  currency: 'USD' | 'GBP';
  email: string;
  state: OrderState;
  paymentIntentId?: string;
  confirmation?: { externalOrderId: string };
}

const orders = new Map<string, OrderRecord>();

function generateId(prefix: string = 'ord_'): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

export function createOrder(input: Omit<OrderRecord, 'id' | 'state'> & { state?: OrderState }): OrderRecord {
  const id = generateId();
  const order: OrderRecord = { id, state: input.state ?? 'initiated', ...input };
  orders.set(id, order);
  return order;
}

export function getOrder(id: string): OrderRecord | undefined {
  return orders.get(id);
}

export function updateOrder(id: string, patch: Partial<OrderRecord>): OrderRecord | undefined {
  const current = orders.get(id);
  if (!current) return undefined;
  const next = { ...current, ...patch } as OrderRecord;
  orders.set(id, next);
  return next;
}
