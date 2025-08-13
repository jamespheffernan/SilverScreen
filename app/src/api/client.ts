export const API_BASE_URL = 'http://localhost:3001';

export async function getShows(city: string, dateISO: string) {
  const res = await fetch(`${API_BASE_URL}/shows?city=${encodeURIComponent(city)}&date=${encodeURIComponent(dateISO)}`);
  if (!res.ok) throw new Error(`Failed to fetch shows: ${res.status}`);
  return res.json();
}

export async function getSeatMap(showId: string) {
  const res = await fetch(`${API_BASE_URL}/shows/${encodeURIComponent(showId)}/seatmap`);
  if (!res.ok) throw new Error(`Failed to fetch seat map: ${res.status}`);
  return res.json();
}

export async function checkout(orderDraft: { showId: string; seats: string[]; email: string }) {
  const res = await fetch(`${API_BASE_URL}/checkout`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderDraft }) });
  if (!res.ok) throw new Error(`Checkout failed: ${res.status}`);
  return res.json();
}

export async function confirm(orderId: string) {
  const res = await fetch(`${API_BASE_URL}/confirm`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId }) });
  if (!res.ok) throw new Error(`Confirm failed: ${res.status}`);
  return res.json();
}

export async function getOrder(orderId: string) {
  const res = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderId)}`);
  if (!res.ok) throw new Error(`Get order failed: ${res.status}`);
  return res.json();
}
