import './styles/theme.css';
import './styles/base.css';
import './styles/components.css';
import { createModal } from './components/Modal';
import { renderGameBoard } from './components/GameBoard';
import { renderLobby } from './online/lobby';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('App root not found');

const menu = document.createElement('main');
menu.className = 'menu';
menu.innerHTML = `
  <section class="menu__panel">
    <h1 class="menu__title">Blackjack</h1>
    <p class="menu__subtitle">Play solo or go online</p>
    <div class="menu__actions">
      <button class="btn btn--primary" data-action="solo">Play Solo</button>
      <button class="btn btn--secondary" data-action="online">Play Online</button>
      <button class="btn btn--ghost" data-action="rules">How to Play</button>
    </div>
  </section>
`;

menu.addEventListener('click', (event) => {
  const target = event.target as HTMLElement;
  const action = target.getAttribute('data-action');
  if (!action) return;
  if (action === 'solo') document.body.append(createModal('Solo Setup', renderGameBoard()));
  if (action === 'online') document.body.append(createModal('Online Lobby', renderLobby()));
  if (action === 'rules') {
    const content = document.createElement('p');
    content.textContent = '// GAME LOGIC: implement from rules spec';
    document.body.append(createModal('How to Play', content));
  }
});

app.append(menu);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => undefined);
}
