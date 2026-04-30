import type { Card } from '../game/deck';

const red = new Set(['♥', '♦']);

export function renderCard(card: Card, index = 0, hidden = false): HTMLElement {
  const el = document.createElement('article');
  el.className = `card ${hidden ? 'card--back' : ''}`;
  el.style.animationDelay = `${index * 60}ms`;
  if (hidden) {
    el.innerHTML = '<div class="card__back"></div>';
    return el;
  }
  const suitClass = red.has(card.suit) ? 'is-red' : 'is-black';
  el.innerHTML = `
    <div class="card__corner ${suitClass}">${card.rank}${card.suit}</div>
    <div class="card__pip ${suitClass}">${card.suit}</div>
    <div class="card__corner card__corner--bottom ${suitClass}">${card.rank}${card.suit}</div>
  `;
  return el;
}
