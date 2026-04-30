import { Card, handTotals, isPair } from './deck';
import type { PlayerAction } from './engine';

export type Difficulty = 'optimal' | 'casual';

export function dealerShouldHit(cards: Card[]): boolean {
  const t = handTotals(cards);
  if (t.total <= 16) return true;
  if (t.total === 17 && t.isSoft) return true;
  return false;
}

function upVal(card: Card): number { return card.rank === 'A' ? 11 : (['J','Q','K'].includes(card.rank) ? 10 : Number(card.rank)); }

export function getOptimalAction(hand: Card[], dealerUp: Card, legal: PlayerAction[], allowSurrender = true): PlayerAction {
  if (isPair(hand)) {
    const v = upVal(hand[0]);
    if (v===8 && legal.includes('split')) return 'split';
    if (v===10) return legal.includes('stand') ? 'stand' : legal[0];
  }
  const total = handTotals(hand);
  const d = upVal(dealerUp);
  if (hand.length===2 && hand[0].rank==='10' && hand[1].rank==='6' && d===10) return allowSurrender && legal.includes('surrender') ? 'surrender':'stand';
  if (hand.length===2 && hand.some(c=>c.rank==='10') && hand.some(c=>c.rank==='5') && d===10) return allowSurrender && legal.includes('surrender') ? 'surrender':'hit';
  if (total.isSoft) {
    if (total.total===18 && d>=9) return 'hit';
    if (total.total===17 && d===2) return 'hit';
  } else {
    if (total.total===11 && d<=10 && legal.includes('double')) return 'double';
    if (total.total===12 && d>=4 && d<=6) return 'stand';
    if (total.total===9 && d===3) return 'hit';
    if (total.total===16 && d===10) return allowSurrender && legal.includes('surrender') ? 'surrender' : 'hit';
  }
  if (total.total>=17) return 'stand';
  if (total.total<=11) return legal.includes('double') && total.total===11 ? 'double':'hit';
  return d>=7 ? 'hit' : 'stand';
}

export function getComputerAction(hand: Card[], dealerUp: Card, legal: PlayerAction[], difficulty: Difficulty): PlayerAction {
  if (difficulty==='casual' && Math.random()<0.15) return legal[Math.floor(Math.random()*legal.length)] ?? 'stand';
  const optimal = getOptimalAction(hand, dealerUp, legal, legal.includes('surrender'));
  return legal.includes(optimal) ? optimal : (legal.includes('stand') ? 'stand' : legal[0]);
}
