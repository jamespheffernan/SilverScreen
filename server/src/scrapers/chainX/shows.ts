import { readFile } from 'node:fs/promises';
import path from 'node:path';

export async function scrapeShows(city: string, dateISO: string) {
  const html = await readFile(path.join(process.cwd(), 'fixtures', 'chainX_shows.html'), 'utf8');
  const match = html.match(/id=\"__SHOWS__\"[^>]*data-json='([^']+)'/);
  if (!match) return [];
  const raw = JSON.parse(match[1]);
  return raw.filter((r: any) => (r.startTime||'').startsWith(dateISO) && city.toUpperCase()==='NYC').map((r: any) => ({
    id: r.id, venueId: r.venueId, movie: r.title,
    startAt: r.startTime,
    upstream: { url: r.url, externalId: r.extId },
    pricing: { adult: { currency: r.currency, amount: Math.round(r.price*100) } }
  }));
}
