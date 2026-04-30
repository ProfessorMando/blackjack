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
      round.hands.forEach((h, idx) => playerZone.append(renderHand(h.cards, { label: `Player ${idx + 1}`, active: idx === round.currentHand })));
      const legal = round.phase === 'player' ? legalActions(round) : [];
      const enabled = {
        deal: false, hit: legal.includes('hit'), stand: legal.includes('stand'), double: legal.includes('double'), split: legal.includes('split'), surrender: legal.includes('surrender')
      };
      const controls = renderControls((action: ControlAction) => {
        Object.assign(state, applyPlayerAction(state, action as any));
        draw();
      }, enabled);
      const purseWrap = document.createElement('div');
      purseWrap.className = 'purse-wrap';
      purseWrap.append(renderPurse(state.bankroll), renderPayout(state.lastPayout));
      root.append(dealerZone, playerZone, purseWrap, controls);
      if (round.phase === 'round-over' && state.bankroll >= 1) {
        root.append(renderBetChips(state.bankroll, state.selectedChips, (chips) => {
          state.selectedChips = chips;
          state.currentBet = chips.reduce((sum, chip) => sum + chip, 0);
          draw();
        }));
        const next = document.createElement('button');
        next.className = 'btn btn--primary next-round-overlay';
        next.innerHTML = 'Next Round <span class="next-round-overlay__arrow">⟶</span>';
        next.disabled = state.currentBet < state.minBet || state.currentBet > state.bankroll;
        next.addEventListener('click', () => {
          Object.assign(state, startRound(state, state.currentBet));
          draw();
        });
        root.append(next);
      }
    } else {
      root.append(renderBetChips(state.bankroll, state.selectedChips, (chips) => {
        state.selectedChips = chips;
        state.currentBet = chips.reduce((sum, chip) => sum + chip, 0);
        draw();
      }));
      const c = renderControls((action) => {
        if (action === 'deal') {
          Object.assign(state, startRound(state, state.currentBet));
          draw();
        }
      }, { deal: state.currentBet <= state.bankroll });
      const purseWrap = document.createElement('div');
      purseWrap.className = 'purse-wrap';
      purseWrap.append(renderPurse(state.bankroll), renderPayout(state.lastPayout));
      root.append(dealerZone, playerZone, purseWrap, c);
    }
  };
  draw();
  return root;
}
