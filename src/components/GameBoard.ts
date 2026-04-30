import { renderControls } from './Controls';
import { renderChip } from './Chip';
export function renderGameBoard(): HTMLElement {
  const root = document.createElement('section');
  root.className = 'modal-panel';
  root.innerHTML = '<h2>Game Board (Scaffold)</h2><p>// GAME LOGIC: implement from rules spec</p>';
  root.append(renderChip(500), renderControls());
  return root;
}
