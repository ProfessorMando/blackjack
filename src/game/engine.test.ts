import { describe, expect, it } from 'vitest';
import { type Card, type ShoeState } from './deck';
import { applyAction, createRound, dealInitial, legalActions, playDealer, settle } from './engine';

const c = (rank: Card['rank'], suit: Card['suit'] = '♠'): Card => ({ rank, suit });
const shoeWith = (cards: Card[]): ShoeState => ({ cards: [...cards], dealt: 0, decks: 1, penetration: 1 });

describe('blackjack engine bankroll and flow', () => {
  it('deducts bet at round start', () => {
    const round = createRound(100, 10);
    expect(round.bankroll).toBe(90);
  });

  it('normal loss does not subtract again at settlement', () => {
    const end = settle({ ...createRound(100, 10), dealer: [c('10'), c('9')], dealerHidden: false, hands: [{ cards: [c('10'), c('8')], bet: 10 }], phase: 'settlement' });
    expect(end.bankroll).toBe(90);
  });

  it('push returns original bet', () => {
    const end = settle({ ...createRound(100, 10), dealer: [c('10'), c('8')], dealerHidden: false, hands: [{ cards: [c('9'), c('9')], bet: 10 }], phase: 'settlement' });
    expect(end.bankroll).toBe(100);
  });

  it('normal win pays 1:1', () => {
    const end = settle({ ...createRound(100, 10), dealer: [c('10'), c('7')], dealerHidden: false, hands: [{ cards: [c('10'), c('9')], bet: 10 }], phase: 'settlement' });
    expect(end.bankroll).toBe(110);
  });

  it('blackjack pays 3:2', () => {
    const end = settle({ ...createRound(100, 10), dealer: [c('10'), c('7')], dealerHidden: false, hands: [{ cards: [c('A'), c('K')], bet: 10 }], phase: 'settlement' });
    expect(end.bankroll).toBe(115);
  });

  it('natural blackjack immediately settles', () => {
    const round = dealInitial(createRound(100, 10, undefined, shoeWith([c('A'), c('9'), c('K'), c('7')])));
    expect(round.phase).toBe('round-over');
    expect(round.bankroll).toBe(115);
    expect(round.dealerHidden).toBe(false);
    expect(round.dealer).toHaveLength(2);
    expect(round.shoe.dealt).toBe(4);
  });

  it('dealer natural blackjack settles immediately', () => {
    const round = dealInitial(createRound(100, 10, undefined, shoeWith([c('10'), c('A'), c('9'), c('K')])));
    expect(round.phase).toBe('round-over');
    expect(round.bankroll).toBe(90);
  });

  it('both natural blackjack is a push', () => {
    const round = dealInitial(createRound(100, 10, undefined, shoeWith([c('A'), c('A'), c('K'), c('K')])));
    expect(round.phase).toBe('round-over');
    expect(round.bankroll).toBe(100);
  });

  it('natural blackjack beats non-natural 21', () => {
    const end = settle({
      ...createRound(100, 10),
      dealer: [c('7'), c('7'), c('7')],
      dealerHidden: false,
      hands: [{ cards: [c('A'), c('K')], bet: 10 }],
      phase: 'settlement'
    });
    expect(end.bankroll).toBe(115);
  });

  it('double draws one card, marks complete, uses doubled bet', () => {
    let round = dealInitial(createRound(100, 10, undefined, shoeWith([c('5'), c('6'), c('6'), c('10'), c('K')])));
    expect(legalActions(round)).toContain('double');
    round = applyAction(round, 'double');
    expect(round.hands[0].cards).toHaveLength(3);
    expect(round.hands[0].bet).toBe(20);
    expect(round.hands[0].doubled).toBe(true);
    expect(round.hands[0].stood || round.hands[0].busted).toBe(true);
    expect(round.phase).toBe('dealer');
    round = playDealer(round);
    expect(round.phase).toBe('round-over');
  });

  it('split subtracts extra bet and creates hands with same bet', () => {
    let round = dealInitial(createRound(100, 10, undefined, shoeWith([c('8'), c('5'), c('8'), c('9'), c('2'), c('3')])));
    round = applyAction(round, 'split');
    expect(round.bankroll).toBe(80);
    expect(round.hands).toHaveLength(2);
    expect(round.hands[0].bet).toBe(10);
    expect(round.hands[1].bet).toBe(10);
    expect(round.hands[0].fromSplit).toBe(true);
    expect(round.hands[1].fromSplit).toBe(true);
  });

  it('split ace 21 is paid as normal win not blackjack', () => {
    const end = settle({ ...createRound(100, 10), dealer: [c('10'), c('9')], dealerHidden: false, hands: [{ cards: [c('A'), c('K')], bet: 10, fromSplit: true, splitAces: true }], phase: 'settlement' });
    expect(end.bankroll).toBe(110);
  });

  it('21 on one split hand does not end other hand turn', () => {
    let round = dealInitial(createRound(100, 10, undefined, shoeWith([c('8'), c('5'), c('8'), c('9'), c('3'), c('2'), c('K')])));
    round = applyAction(round, 'split');
    round = applyAction(round, 'hit');
    expect(round.hands[0].stood).toBe(true);
    expect(round.currentHand).toBe(1);
    expect(round.phase).toBe('player');
  });
});
