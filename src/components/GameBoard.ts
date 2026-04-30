import { handTotals, isBlackjack, isPair } from '../game/deck';
import { legalActions } from '../game/engine';
import { applyPlayerAction, startRound, type AppState } from '../game/state';
import { renderControls, type ControlAction } from './Controls';
import { renderHand } from './Hand';
import { renderBetChips, renderPayout, renderPurse } from './Chip';

export function renderGameBoard(state: AppState, onQuit: () => void): HTMLElement {
  const root = document.createElement('section');
  root.className = 'table table-layout';

  const draw = (): void => {
    root.innerHTML = '';
    const settings = document.createElement('div');
    settings.className = 'table-menu';
    settings.innerHTML = '<button class="table-menu__button" aria-label="More Options">⋮</button><div class="table-menu__sheet" hidden><button class="btn btn--ghost" data-quit>Quit</button></div>';
    const menuBtn = settings.querySelector('.table-menu__button') as HTMLButtonElement;
    const sheet = settings.querySelector('.table-menu__sheet') as HTMLElement;
    menuBtn.addEventListener('click', () => { sheet.hidden = !sheet.hidden; });
    settings.querySelector('[data-quit]')?.addEventListener('click', onQuit);
    root.append(settings);

    const dealerZone = document.createElement('section');
    dealerZone.className = 'table-zone table-zone--dealer';
    const playerZone = document.createElement('section');
    playerZone.className = 'table-zone table-zone--players';

    const round = state.round;
    if (round) {
      dealerZone.append(renderHand(round.dealer, { label: 'Dealer', hiddenSecond: round.dealerHidden }));
      playerZone.style.setProperty('--hand-count', String(Math.max(1, Math.min(4, round.hands.length))));
      round.hands.forEach((h, idx) => playerZone.append(renderHand(h.cards, { label: `Player ${idx + 1}`, active: idx === round.currentHand, bet: h.bet })));
      const tableBet = document.createElement('div');
      tableBet.className = 'table-bet-summary';
      const chipCount = state.selectedChips.length;
      tableBet.innerHTML = `<p class="table-bet-summary__amount">Table Bet: ${round.bet}</p><p class="table-bet-summary__chips">Chips on table: ${chipCount}</p>`;
      playerZone.append(tableBet);
      const legal = round.phase === 'player' ? legalActions(round) : [];
      const playerHasNatural = round.hands.some((h) => isBlackjack(h.cards) || handTotals(h.cards).total === 21);
      const enabled = {
        hit: legal.includes('hit') && !playerHasNatural,
        stand: legal.includes('stand') && !playerHasNatural,
        double: legal.includes('double') && round.hands[round.currentHand]?.cards.length === 2,
        split: legal.includes('split') && isPair(round.hands[round.currentHand]?.cards ?? []),
        surrender: legal.includes('surrender')
      };
      const purseWrap = document.createElement('div');
      purseWrap.className = 'purse-wrap';
      purseWrap.append(renderPurse(state.bankroll));
      const payout = renderPayout(state.lastPayout);
      if (payout) purseWrap.append(payout);
      root.append(dealerZone, playerZone, purseWrap);
      if (round.phase === 'player' && !playerHasNatural) {
        const controls = renderControls((action: ControlAction) => {
          Object.assign(state, applyPlayerAction(state, action as any));
          draw();
        }, enabled);
        root.append(controls);
      }
      if (playerHasNatural && round.phase === 'player') {
        Object.assign(state, applyPlayerAction(state, 'stand'));
        draw();
        return;
      }
      if (round.phase === 'round-over' && state.bankroll >= 1) {
        state.awaitingNextRound = true;
        const overlay = document.createElement('div');
        overlay.className = 'round-overlay';
        const delta = state.lastPayout?.delta ?? 0;
        const label = delta > 0 ? `You won ${delta}` : delta < 0 ? `You lost ${Math.abs(delta)}` : 'Push';
        overlay.innerHTML = `<div class="round-overlay__panel"><h3>Round complete</h3><p>${label}</p></div>`;
        const next = document.createElement('button');
        next.className = 'btn btn--primary next-round-overlay';
        next.innerHTML = 'Next Round <span class="next-round-overlay__arrow">⟶</span>';
        next.addEventListener('click', () => { state.round = null; state.lastPayout = null; state.awaitingNextRound = false; draw(); });
        root.append(overlay, next);

        const playerMade21 = round.hands.some((h) => handTotals(h.cards).total === 21);
        const dealerMade21 = handTotals(round.dealer).total === 21;
        const playerOnlyBlackjack = (round.hands.some((h) => isBlackjack(h.cards)) || playerMade21) && !dealerMade21;
        if (playerOnlyBlackjack) {
          const bj = document.createElement('div');
          bj.className = 'blackjack-overlay';
          bj.innerHTML = '<div class="blackjack-overlay__confetti"></div><div class="blackjack-overlay__text">BLACKJACK!</div>';
          root.append(bj);
        }
      }
    } else {
      root.append(renderBetChips(state.bankroll, state.selectedChips, (chips) => {
        state.selectedChips = chips;
        state.currentBet = chips.reduce((sum, chip) => sum + chip, 0);
        draw();
      }));
      const next = document.createElement('button');
      next.className = 'btn btn--primary next-round-overlay';
      next.textContent = 'Next Round';
      next.disabled = state.selectedChips.length === 0 || state.currentBet > state.bankroll;
      next.addEventListener('click', () => {
        const betTotal = state.selectedChips.reduce((sum, chip) => sum + chip, 0);
        if (state.selectedChips.length === 0 || betTotal <= 0 || betTotal > state.bankroll) return;
        state.currentBet = betTotal;
        Object.assign(state, startRound(state, betTotal));
        draw();
      });
      const purseWrap = document.createElement('div');
      purseWrap.className = 'purse-wrap';
      purseWrap.append(renderPurse(state.bankroll));
      root.append(dealerZone, playerZone, purseWrap, next);
    }

    const nextRoundButton = root.querySelector('.next-round-overlay') as HTMLButtonElement | null;
    if (nextRoundButton) {
      window.onkeydown = (event: KeyboardEvent) => {
        if ((event.key === 'Enter' || event.key === ' ') && !nextRoundButton.disabled) {
          event.preventDefault();
          nextRoundButton.click();
        }
      };
    } else {
      window.onkeydown = null;
    }
  };
  draw();
  return root;
}
