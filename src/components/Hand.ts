import type { Card } from '../game/deck';
import { handTotals } from '../game/deck';
import { renderCard } from './Card';
import { renderActiveBet } from './Chip';

export function renderHand(cards: Card[], opts: { hiddenSecond?: boolean; label: string; active?: boolean; bet?: number } ): HTMLElement {
  const wrap = document.createElement('section');
  wrap.className = `hand ${opts.active ? 'hand--active' : ''}`;
  const visible = opts.hiddenSecond ? [cards[0]] : cards;
  const score = handTotals(visible).total;
  wrap.innerHTML = `<header><h3>${opts.label}</h3><p class="hand__score">${opts.hiddenSecond ? '?' : score}</p></header><div class="hand__cards"></div>`;
  const cardsEl = wrap.querySelector('.hand__cards') as HTMLElement;
  cards.forEach((card, index) => cardsEl.append(renderCard(card, index, Boolean(opts.hiddenSecond && index === 1))));
  if (typeof opts.bet === 'number') wrap.append(renderActiveBet(opts.bet));
  return wrap;
}
