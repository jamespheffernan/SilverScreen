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
