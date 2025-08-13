import { readFile } from 'node:fs/promises';
import path from 'node:path';

export interface Seat {
  row: string;
  col: number;
  code: string;
  status: 'free' | 'sold' | 'held';
  price: { currency: 'USD' | 'GBP'; amount: number };
}

export interface SeatMap {
  showId: string;
  rows: number;
  cols: number;
  seats: Seat[];
  updatedAt: string;
}

export async function fetchSeatMap(showId: string): Promise<SeatMap> {
  const file = path.join(process.cwd(), 'fixtures', `seatmap_${showId}.json`);
  const raw = await readFile(file, 'utf8');
  const data = JSON.parse(raw);
  // Basic validation/normalization
  const codes = new Set<string>();
  for (const s of data.seats) {
    if (codes.has(s.code)) throw new Error('Duplicate seat code');
    codes.add(s.code);
  }
  return data as SeatMap;
}
