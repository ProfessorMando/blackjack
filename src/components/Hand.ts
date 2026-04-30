import type { Card } from '../game/deck';
import { renderCard } from './Card';
export function renderHand(cards: Card[]): HTMLElement {
  const hand = document.createElement('div');
  cards.forEach((card) => hand.append(renderCard(card)));
  return hand;
}
