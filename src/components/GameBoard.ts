import { legalActions } from '../game/engine';
import { applyPlayerAction, startRound, type AppState } from '../game/state';
import { renderControls, type ControlAction } from './Controls';
import { renderHand } from './Hand';
import { renderChip } from './Chip';

export function renderGameBoard(state: AppState, onQuit: () => void): HTMLElement {
  const root = document.createElement('section');
  root.className = 'table';

  const draw = (): void => {
    root.innerHTML = '';
    const round = state.round;
    if (round) {
      root.append(renderHand(round.dealer, { label: 'Dealer', hiddenSecond: round.dealerHidden }));
      round.hands.forEach((h, idx) => root.append(renderHand(h.cards, { label: `Player ${idx + 1}`, active: idx === round.currentHand })));
      root.append(renderChip(state.bankroll));
      const legal = round.phase === 'player' ? legalActions(round) : [];
      const enabled = {
        deal: false,
        hit: legal.includes('hit'), stand: legal.includes('stand'), double: legal.includes('double'), split: legal.includes('split'), surrender: legal.includes('surrender'),
        'next-round': round.phase === 'round-over' && state.bankroll >= state.minBet,
        quit: true
      };
      root.append(renderControls((action: ControlAction) => {
        if (action === 'quit') return onQuit();
        if (action === 'next-round') {
          Object.assign(state, startRound(state, round.bet));
        } else if (['hit', 'stand', 'double', 'split', 'surrender'].includes(action)) {
          Object.assign(state, applyPlayerAction(state, action as any));
        }
        draw();
      }, enabled));
    } else {
      const c = renderControls((action) => {
        if (action === 'deal') {
          Object.assign(state, startRound(state, state.minBet));
          draw();
        }
        if (action === 'quit') onQuit();
      }, { deal: true, quit: true });
      root.append(renderChip(state.bankroll), c);
    }
  };
  draw();
  return root;
}
