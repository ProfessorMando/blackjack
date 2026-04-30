export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
export interface Card { suit: Suit; rank: Rank; }

export interface ShoeState { cards: Card[]; dealt: number; decks: number; penetration: number; }

const SUITS: Suit[] = ['♠', '♥', '♦', '♣'];
const RANKS: Rank[] = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];

export function createDeck(): Card[] { return SUITS.flatMap((suit) => RANKS.map((rank) => ({ suit, rank }))); }
export function createShoe(decks = 6, penetration = 0.75): ShoeState {
  const cards: Card[] = [];
  for (let i = 0; i < decks; i += 1) cards.push(...createDeck());
  return { cards: shuffle(cards), dealt: 0, decks, penetration };
}

export function shuffle<T>(cards: T[]): T[] {
  const out = [...cards];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function cardValue(card: Card): number {
  if (card.rank === 'A') return 11;
  if (['J', 'Q', 'K'].includes(card.rank)) return 10;
  return Number(card.rank);
}

export function handTotals(hand: Card[]): { total: number; hardTotal: number; isSoft: boolean } {
  let total = hand.reduce((sum, c) => sum + cardValue(c), 0);
  let aces = hand.filter((c) => c.rank === 'A').length;
  while (total > 21 && aces > 0) { total -= 10; aces -= 1; }
  return { total, hardTotal: total - (aces > 0 ? 10 : 0), isSoft: aces > 0 && total <= 21 };
}

export function isPair(hand: Card[]): boolean {
  return hand.length === 2 && normalizedValue(hand[0]) === normalizedValue(hand[1]);
}
function normalizedValue(card: Card): number { return card.rank === 'A' ? 11 : (['J','Q','K'].includes(card.rank) ? 10 : Number(card.rank)); }
export function isBlackjack(hand: Card[]): boolean { return hand.length === 2 && handTotals(hand).total === 21; }
export function classifyHand(hand: Card[]): 'hard'|'soft'|'pair'|'blackjack'|'busted' {
  const totals = handTotals(hand);
  if (totals.total > 21) return 'busted';
  if (isBlackjack(hand)) return 'blackjack';
  if (isPair(hand)) return 'pair';
  return totals.isSoft ? 'soft' : 'hard';
}

export function drawCard(shoe: ShoeState): [Card, ShoeState] {
  let active = shoe;
  const usedRatio = shoe.dealt / (shoe.decks * 52);
  if (usedRatio >= shoe.penetration || shoe.cards.length === 0) active = createShoe(shoe.decks, shoe.penetration);
  const [card, ...rest] = active.cards;
  return [card, { ...active, cards: rest, dealt: active.dealt + 1 }];
}

export function cardDisplay(card: Card): string { return `${card.rank}${card.suit}`; }
