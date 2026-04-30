export type Suit = '♠' | '♥' | '♦' | '♣';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
export interface Card { suit: Suit; rank: Rank; }
export function createDeck(): Card[] {
  const suits: Suit[] = ['♠', '♥', '♦', '♣'];
  const ranks: Rank[] = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
  return suits.flatMap((suit) => ranks.map((rank) => ({ suit, rank })));
}
export function shuffle(deck: Card[]): Card[] { return [...deck].sort(() => Math.random() - 0.5); }
export function deal(deck: Card[], count = 1): Card[] { return deck.splice(0, count); }
