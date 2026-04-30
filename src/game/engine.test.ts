import { describe, expect, it } from 'vitest';
import { classifyHand, handTotals } from './deck';

describe('deck helpers', () => {
  it('soft/hard totals', () => {
    expect(handTotals([{rank:'A',suit:'♠'},{rank:'6',suit:'♣'}]).isSoft).toBe(true);
    expect(classifyHand([{rank:'10',suit:'♠'},{rank:'9',suit:'♣'}])).toBe('hard');
  });
  it('blackjack detection', () => {
    expect(classifyHand([{rank:'A',suit:'♠'},{rank:'K',suit:'♣'}])).toBe('blackjack');
  });
});
