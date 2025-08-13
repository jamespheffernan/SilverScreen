import { chromium } from 'playwright';

export type Currency = 'USD' | 'GBP';
export interface Seat { row: string; col: number; code: string; status: 'free'|'sold'|'held'; price: { currency: Currency; amount: number } }
export interface SeatMap { showId: string; rows: number; cols: number; seats: Seat[]; updatedAt: string }

export async function fetchSeatMapLive(upstreamUrl: string): Promise<SeatMap> {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ userAgent: process.env.SCRAPER_USER_AGENT });
  const page = await ctx.newPage();
  let captured: any = null;

  page.on('response', async (res) => {
    const url = res.url();
    if (url.includes('/api/seat')) {
      try { captured = await res.json(); } catch {}
    }
  });

  await page.goto(upstreamUrl, { waitUntil: 'networkidle' });
  // If seatmap requires a click, try a generic selector; ignore if not present
  await page.locator('text=Select seats').first().click({ trial: true }).catch(() => {});
  await page.waitForTimeout(1000);

  await browser.close();
  if (!captured) throw new Error('Seat map JSON not captured');

  const rows = captured.rows ?? 0;
  const cols = captured.cols ?? 0;
  const seats: Seat[] = (captured.seats || []).map((s: any) => ({
    row: s.rowLabel ?? s.row ?? 'A',
    col: s.col ?? 1,
    code: s.code ?? `${s.rowLabel ?? 'A'}-${s.col ?? 1}`,
    status: s.available === false ? 'sold' : 'free',
    price: { currency: (captured.currency ?? 'USD') as Currency, amount: Math.round((s.price ?? 0) * 100) }
  }));

  const showId = captured.showId ?? 'unknown';
  return { showId, rows, cols, seats, updatedAt: new Date().toISOString() };
}
