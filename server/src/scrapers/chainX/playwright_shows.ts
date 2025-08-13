import { chromium } from 'playwright';

export async function scrapeShowsLive(city: string, dateISO: string) {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ userAgent: process.env.SCRAPER_USER_AGENT });
  const page = await ctx.newPage();
  const url = `https://example-chain.com/${city}/showtimes?date=${dateISO}`;
  await page.goto(url, { waitUntil: 'networkidle' });
  const data = await page.evaluate(() => {
    const el = document.querySelector('#__SHOWS__') as HTMLElement | null;
    const raw = el?.getAttribute('data-json');
    return raw ? JSON.parse(raw) : [];
  });
  await browser.close();
  return (data as any[]).map(r => ({
    id: r.id, venueId: r.venueId, movie: r.title,
    startAt: r.startTime,
    upstream: { url: r.url, externalId: r.extId },
    pricing: { adult: { currency: r.currency, amount: Math.round(r.price*100) } }
  })).filter(r => (r.startAt||'').startsWith(dateISO));
}
