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
