import type { Card } from '../game/deck';
export function renderCard(card: Card): HTMLElement {
  const el = document.createElement('div');
  el.textContent = `${card.rank}${card.suit}`;
  return el;
}
