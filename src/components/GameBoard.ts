import { handTotals, isBlackjack, isPair } from '../game/deck';
import { legalActions } from '../game/engine';
import { applyPlayerAction, startRound, type AppState } from '../game/state';
import { renderControls, type ControlAction } from './Controls';
import { renderHand } from './Hand';
import { renderBetChips, renderPayout, renderPurse } from './Chip';

export function renderGameBoard(state: AppState, onQuit: () => void): HTMLElement {
  const root = document.createElement('section');
  root.className = 'blackjack-page';
  let showRoundSummary = false;
  let roundSummaryTimer: number | null = null;

  const draw = (): void => {
    root.innerHTML = '';
    const settings = document.createElement('div');
    settings.className = 'table-menu';
    settings.innerHTML = '<button class="table-menu__button" aria-label="More Options">⋮</button><div class="table-menu__sheet" hidden><button class="btn btn--ghost" data-quit>Quit</button></div>';
    const menuBtn = settings.querySelector('.table-menu__button') as HTMLButtonElement;
    const sheet = settings.querySelector('.table-menu__sheet') as HTMLElement;
    menuBtn.addEventListener('click', () => { sheet.hidden = !sheet.hidden; });
    settings.querySelector('[data-quit]')?.addEventListener('click', onQuit);

    const table = document.createElement('section');
    table.className = 'blackjack-table';
    const felt = document.createElement('div');
    felt.className = 'table-felt';

    const dealerZone = document.createElement('section');
    dealerZone.className = 'dealer-area';
    const playerZone = document.createElement('section');
    playerZone.className = 'player-area';
    const tableMarkings = document.createElement('div');
    tableMarkings.className = 'table-markings';
    tableMarkings.innerHTML = '<p>BLACKJACK PAYS 3 TO 2</p><p>DEALER MUST STAND ON 17</p><p>INSURANCE PAYS 2 TO 1</p>';
    const bettingCircle = document.createElement('div');
    bettingCircle.className = 'betting-circle';

    const round = state.round;
    if (round) {
      dealerZone.append(renderHand(round.dealer, { label: 'Dealer', hiddenSecond: round.dealerHidden }));
      playerZone.style.setProperty('--hand-count', String(Math.max(1, Math.min(4, round.hands.length))));
      round.hands.forEach((h, idx) => playerZone.append(renderHand(h.cards, { label: `Player ${idx + 1}`, active: idx === round.currentHand, bet: h.bet })));
      bettingCircle.innerHTML = `<span>BET</span><strong>${round.bet}</strong>`;
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
      felt.append(dealerZone, tableMarkings, playerZone, bettingCircle);
      table.append(felt);
      root.append(settings, table, purseWrap);
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
        if (!state.awaitingNextRound) {
          state.awaitingNextRound = true;
          showRoundSummary = true;
          if (roundSummaryTimer) window.clearTimeout(roundSummaryTimer);
          roundSummaryTimer = window.setTimeout(() => {
            showRoundSummary = false;
            draw();
          }, 2000);
        }
        const overlay = document.createElement('div');
        overlay.className = `round-overlay ${showRoundSummary ? 'is-visible' : ''}`;
        const delta = state.lastPayout?.delta ?? 0;
        const label = delta > 0 ? `You won ${delta}` : delta < 0 ? `You lost ${Math.abs(delta)}` : 'Push';
        overlay.innerHTML = `<div class="round-overlay__panel"><h3>Round complete</h3><p>${label}</p></div>`;
        const next = document.createElement('button');
        next.className = 'btn btn--primary next-round-overlay page-primary-cta';
        next.innerHTML = 'Next Round <span class="next-round-overlay__arrow">⟶</span>';
        next.addEventListener('click', () => {
          showRoundSummary = false;
          if (roundSummaryTimer) window.clearTimeout(roundSummaryTimer);
          roundSummaryTimer = null;
          state.round = null;
          state.lastPayout = null;
          state.awaitingNextRound = false;
          draw();
        });
        const dock = document.createElement('div');
        dock.className = 'bottom-control-dock';
        dock.append(next);
        root.append(overlay, dock);

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
      bettingCircle.innerHTML = `<span>BET</span><strong>${state.currentBet || 0}</strong>`;
      felt.append(dealerZone, tableMarkings, playerZone, bettingCircle);
      table.append(felt);
      root.append(settings, table);
      root.append(renderBetChips(state.bankroll, state.selectedChips, (chips) => {
        state.selectedChips = chips;
        state.currentBet = chips.reduce((sum, chip) => sum + chip, 0);
        draw();
      }));
      const next = document.createElement('button');
      next.className = 'btn btn--primary next-round-overlay page-primary-cta';
      next.textContent = 'Deal';
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
      const dock = document.createElement('div');
      dock.className = 'bottom-control-dock';
      dock.append(next);
      root.append(purseWrap, dock);
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
