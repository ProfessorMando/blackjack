import { describe, expect, it } from 'vitest';
import { getOptimalAction } from './ai';
import type { Card } from './deck';

const c = (rank: Card['rank'], suit: Card['suit']='♠'): Card => ({ rank, suit });

describe('basic strategy spot checks', () => {
  it('hard 16 vs 10', () => {
    const action = getOptimalAction([c('10'), c('6')], c('10'), ['hit','stand','surrender'], true);
    expect(['hit','surrender']).toContain(action);
  });
  it('hard 11 vs 6 double', () => expect(getOptimalAction([c('9'), c('2')], c('6'), ['hit','stand','double'])).toBe('double'));
  it('soft 18 vs 9 hit', () => expect(getOptimalAction([c('A'), c('7')], c('9'), ['hit','stand'])).toBe('hit'));
  it('pair 8 split', () => expect(getOptimalAction([c('8'), c('8')], c('5'), ['split','hit','stand'])).toBe('split'));
  it('pair 10 stand', () => expect(getOptimalAction([c('K'), c('Q')], c('6'), ['hit','stand','split'])).toBe('stand'));
  it('hard 12 vs 4 stand', () => expect(getOptimalAction([c('10'), c('2')], c('4'), ['hit','stand'])).toBe('stand'));
  it('hard 9 vs 3 hit', () => expect(getOptimalAction([c('5'), c('4')], c('3'), ['hit','stand','double'])).toBe('hit'));
  it('soft 17 vs 2 hit', () => expect(getOptimalAction([c('A'), c('6')], c('2'), ['hit','stand'])).toBe('hit'));
});
