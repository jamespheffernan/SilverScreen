export const API_BASE_URL = 'http://localhost:3001';

export async function getShows(city: string, dateISO: string) {
  const res = await fetch(`${API_BASE_URL}/shows?city=${encodeURIComponent(city)}&date=${encodeURIComponent(dateISO)}`);
  if (!res.ok) throw new Error(`Failed to fetch shows: ${res.status}`);
  return res.json();
}
