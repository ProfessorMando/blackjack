import { legalActions } from '../game/engine';
import { applyPlayerAction, startRound, type AppState } from '../game/state';
import { renderControls, type ControlAction } from './Controls';
import { renderHand } from './Hand';
import { renderChip } from './Chip';

export function renderGameBoard(state: AppState, onQuit: () => void, mode: 'solo' | 'online'): HTMLElement {
  const root = document.createElement('section');
  root.className = 'table table-layout';

  const draw = (): void => {
    root.innerHTML = '';
    const settings = document.createElement('div');
    settings.className = 'table-menu';
    settings.innerHTML = '<button class="table-menu__button" aria-label="More options">⋮</button><div class="table-menu__sheet" hidden><button class="btn btn--ghost" data-quit>Quit</button></div>';
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
      const handCount = Math.max(1, Math.min(4, round.hands.length + (mode === 'online' ? 1 : 0)));
      playerZone.style.setProperty('--hand-count', String(handCount));
      round.hands.forEach((h, idx) => playerZone.append(renderHand(h.cards, { label: `Player ${idx + 1}`, active: idx === round.currentHand })));
      if (mode === 'online') {
        const seat = document.createElement('section');
        seat.className = 'hand hand--seat';
        seat.innerHTML = '<header><h3>Player 2</h3></header><div class="hand__cards"></div>';
        playerZone.append(seat);
      }
      const legal = round.phase === 'player' ? legalActions(round) : [];
      const enabled = {
        deal: false, hit: legal.includes('hit'), stand: legal.includes('stand'), double: legal.includes('double'), split: legal.includes('split'), surrender: legal.includes('surrender')
      };
      const controls = renderControls((action: ControlAction) => {
        Object.assign(state, applyPlayerAction(state, action as any));
        draw();
      }, enabled);
      root.append(dealerZone, playerZone, renderChip(state.bankroll), controls);
      if (round.phase === 'round-over' && state.bankroll >= state.minBet) {
        const next = document.createElement('button');
        next.className = 'btn btn--primary next-round-overlay';
        next.textContent = 'Next round';
        next.addEventListener('click', () => {
          Object.assign(state, startRound(state, round.bet));
          draw();
        });
        root.append(next);
      }
    } else {
      const c = renderControls((action) => {
        if (action === 'deal') {
          Object.assign(state, startRound(state, state.minBet));
          draw();
        }
      }, { deal: true });
      root.append(dealerZone, playerZone, renderChip(state.bankroll), c);
    }
  };
  draw();
  return root;
}
