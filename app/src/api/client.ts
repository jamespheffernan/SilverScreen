const API_BASE = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3001';
export const API_BASE_URL = API_BASE;

async function request(path: string, init?: RequestInit) {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    const reqId = res.headers.get('x-request-id') || 'n/a';
    const body = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} (req ${reqId}) ${body}`.trim());
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res.text();
}

export async function getShows(city: string, dateISO: string) {
  return request(`/shows?city=${encodeURIComponent(city)}&date=${encodeURIComponent(dateISO)}`);
}

export async function getSeatMap(showId: string) {
  return request(`/shows/${encodeURIComponent(showId)}/seatmap`);
}

export async function checkout(orderDraft: { showId: string; seats: string[]; email: string }) {
  return request(`/checkout`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderDraft }) });
}

export async function confirm(orderId: string) {
  return request(`/confirm`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId }) });
}

export async function getOrder(orderId: string) {
  return request(`/orders/${encodeURIComponent(orderId)}`);
}
