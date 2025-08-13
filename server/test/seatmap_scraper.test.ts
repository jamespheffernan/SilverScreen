import { describe, expect, it } from 'vitest';
import { fetchSeatMap } from '../src/scrapers/chainX/seatmap';

describe('fetchSeatMap (fixture mode)', () => {
  it('loads and validates seatmap for show_1', async () => {
    const sm = await fetchSeatMap('show_1');
    expect(sm.showId).toBe('show_1');
    expect(sm.seats.length).toBeGreaterThan(0);
  });
});
