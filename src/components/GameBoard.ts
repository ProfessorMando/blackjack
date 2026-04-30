import { handTotals, isBlackjack, isPair } from '../game/deck';
import { legalActions } from '../game/engine';
import { applyPlayerAction, startRound, type AppState } from '../game/state';
import { renderControls, type ControlAction } from './Controls';
import { renderHand } from './Hand';
import { renderBetChips, renderPayout, renderPurse } from './Chip';

export function renderGameBoard(state: AppState, onQuit: () => void): HTMLElement {
  const root = document.createElement('section');
  root.className = 'blackjack-page';
  const RESULT_OVERLAY_MS = 2500;
  let roundResultTimeout: ReturnType<typeof setTimeout> | null = null;
  let activeRoundResultKey: string | null = null;

  const clearRoundResultTimeout = (): void => {
    if (roundResultTimeout) {
      clearTimeout(roundResultTimeout);
      roundResultTimeout = null;
    }
  };

  const dismissRoundResult = (): void => {
    clearRoundResultTimeout();
    state.round = null;
    state.lastPayout = null;
    state.awaitingNextRound = false;
    draw();
  };

  const draw = (): void => {
    root.innerHTML = '';
    const settings = document.createElement('div');
    settings.className = 'table-menu';
    settings.innerHTML = '<button class="table-menu__button" aria-label="More Options">⋮</button><div class="table-menu__sheet" hidden><button class="btn btn--ghost" data-quit>Quit</button></div>';
    const menuBtn = settings.querySelector('.table-menu__button') as HTMLButtonElement;
    const sheet = settings.querySelector('.table-menu__sheet') as HTMLElement;
    menuBtn.addEventListener('click', () => { sheet.hidden = !sheet.hidden; });
    settings.querySelector('[data-quit]')?.addEventListener('click', onQuit);

    const purseWrap = document.createElement('div');
    purseWrap.className = 'purse-wrap';
    purseWrap.append(renderPurse(state.bankroll));
    const payout = renderPayout(state.lastPayout ? {
      ...state.lastPayout,
      label: state.lastPayout.label === 'win' ? 'Won' : state.lastPayout.label === 'loss' ? 'Lost' : 'Push'
    } : null);
    if (payout) purseWrap.append(payout);

    const table = document.createElement('section');
    table.className = 'blackjack-table';
    const felt = document.createElement('div');
    felt.className = 'table-felt';
    const dealerZone = document.createElement('section'); dealerZone.className = 'dealer-area';
    const playerZone = document.createElement('section'); playerZone.className = 'player-area';
    const tableMarkings = document.createElement('div'); tableMarkings.className = 'table-markings';
    const bettingCircle = document.createElement('div'); bettingCircle.className = 'betting-circle';

    const round = state.round;
    if (round) {
      dealerZone.append(renderHand(round.dealer, { label: 'Dealer', hiddenSecond: round.dealerHidden }));
      playerZone.style.setProperty('--hand-count', String(Math.max(1, Math.min(4, round.hands.length))));
      round.hands.forEach((h, idx) => playerZone.append(renderHand(h.cards, { label: `Player ${idx + 1}`, active: idx === round.currentHand, bet: h.bet })));
      felt.append(dealerZone, tableMarkings, playerZone);
      table.append(felt);
      root.append(settings, purseWrap, table);

      const currentHand = round.hands[round.currentHand];
      const currentTotal = currentHand ? handTotals(currentHand.cards).total : 0;
      const currentHandComplete = !currentHand || currentTotal >= 21 || currentHand.stood || currentHand.busted;
      const legal = round.phase === 'player' ? legalActions(round) : [];
      const enabled = {
        hit: legal.includes('hit') && !currentHandComplete,
        stand: legal.includes('stand') && !currentHandComplete,
        double: legal.includes('double') && !currentHandComplete,
        split: legal.includes('split') && isPair(currentHand?.cards ?? []),
        surrender: false
      };
      if (round.phase === 'player' && !currentHandComplete) {
        const controls = renderControls((action: ControlAction) => {
          Object.assign(state, applyPlayerAction(state, action as any));
          draw();
        }, enabled);
        root.append(controls);
      }
      if (round.phase === 'round-over') {
        state.awaitingNextRound = true;
        const overlay = document.createElement('div');
        overlay.className = 'round-overlay is-visible';
        const delta = state.lastPayout?.delta ?? 0;
        const hasNaturalBlackjack = round.hands.some((h) => h.cards.length === 2 && isBlackjack(h.cards) && !h.fromSplit);
        const label = hasNaturalBlackjack && delta > 0 ? `Blackjack! You won ${delta}` : delta > 0 ? `You won ${delta}` : delta < 0 ? `You lost ${Math.abs(delta)}` : 'Push — bet returned';
        const dealerNaturalBlackjack = round.dealer.length === 2 && isBlackjack(round.dealer);
        const heading = hasNaturalBlackjack && !dealerNaturalBlackjack && delta > 0 ? 'BLACKJACK!' : 'Round complete';
        overlay.innerHTML = `<div class="round-overlay__panel ${heading === 'BLACKJACK!' ? 'round-overlay__panel--blackjack' : ''}"><h3>${heading}</h3><p>${label}</p></div>`;
        root.append(overlay);

        const playerNaturalBlackjack = round.hands.some((h) => h.cards.length === 2 && isBlackjack(h.cards) && !h.fromSplit);
        if (playerNaturalBlackjack && !dealerNaturalBlackjack && delta > 0) {
          const confetti = document.createElement('div');
          confetti.className = 'confetti-burst';
          confetti.innerHTML = Array.from({ length: 24 }).map((_, idx) => `<span class="confetti-piece confetti-piece--${idx % 6}"></span>`).join('');
          root.append(confetti);
        }

        const roundResultKey = `${delta}:${label}:${round.bankroll}`;
        if (activeRoundResultKey !== roundResultKey) {
          clearRoundResultTimeout();
          activeRoundResultKey = roundResultKey;
          roundResultTimeout = setTimeout(() => dismissRoundResult(), RESULT_OVERLAY_MS);
        }
      } else {
        clearRoundResultTimeout();
        activeRoundResultKey = null;
      }
    } else {
      clearRoundResultTimeout();
      activeRoundResultKey = null;
      bettingCircle.innerHTML = `<span>BET</span><strong>${state.currentBet || 0}</strong>`;
      felt.append(dealerZone, tableMarkings, playerZone, bettingCircle);
      table.append(felt);
      root.append(settings, purseWrap, table);
      root.append(renderBetChips(state.bankroll, state.selectedChips, (chips) => {
        state.selectedChips = chips;
        state.currentBet = chips.reduce((sum, chip) => sum + chip, 0);
        draw();
      }));
      const next = document.createElement('button');
      next.className = 'btn btn--primary next-round-overlay page-primary-cta';
      next.textContent = 'Deal';
      next.disabled = state.selectedChips.length === 0 || state.currentBet <= 0 || state.currentBet > state.bankroll;
      next.addEventListener('click', () => {
        const betTotal = state.selectedChips.reduce((sum, chip) => sum + chip, 0);
        if (state.selectedChips.length === 0 || betTotal <= 0 || betTotal > state.bankroll) return;
        state.currentBet = betTotal;
        Object.assign(state, startRound(state, betTotal));
        draw();
      });
      const dock = document.createElement('div'); dock.className = 'bottom-control-dock'; dock.append(next); root.append(dock);
    }
  };
  draw();
  return root;
}
