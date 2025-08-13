export type Currency = 'USD' | 'GBP';
export interface Money { currency: Currency; amount: number }
export type SeatStatus = 'free' | 'held' | 'sold';
export interface Show {
  id: string; venueId: string; movie: string; rating?: string;
  startAt: string; // ISO
  runtimeMin?: number;
  pricing: { adult: Money; child?: Money }; // simplified
  upstream: { url: string; externalId: string };
}
export interface Seat { row: string; col: number; area?: string; status: SeatStatus; price: Money; code: string }
export interface SeatMap { showId: string; rows: number; cols: number; seats: Seat[]; updatedAt: string }
