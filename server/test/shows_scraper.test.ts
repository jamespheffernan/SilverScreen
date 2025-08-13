import { describe, expect, it } from 'vitest';
import { scrapeShows } from '../src/scrapers/chainX/shows';

describe('scrapeShows (fixture mode)', () => {
  it('parses shows for a given date and city', async () => {
    const shows = await scrapeShows('NYC', '2025-08-14');
    expect(shows.length).toBe(1);
    expect(shows[0].id).toBe('show_1');
  });
});
