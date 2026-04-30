import './styles/theme.css';
import './styles/base.css';
import './styles/components.css';
import { createModal } from './components/Modal';
import { renderGameBoard } from './components/GameBoard';
import { createAppState, loadNumber, STORAGE_KEYS } from './game/state';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('App root not found');

const menu = document.createElement('main');
menu.className = 'menu';
menu.innerHTML = `<section class="menu__panel"><h1 class="menu__title">Blackjack</h1><p class="menu__subtitle">Play Locally in Your Browser</p><div class="menu__actions"><button class="btn btn--primary" data-action="solo">Play</button><button class="btn btn--ghost menu__rules-btn" data-action="rules">How to Play</button></div></section>`;
app.append(menu);

function openTable(): void {
  const state = createAppState({
    role: 'player',
    startingCash: loadNumber(STORAGE_KEYS.startingCash, 500),
    bet: 10,
    difficulty: 'casual'
  });
  app.innerHTML = '';
  app.append(renderGameBoard(state, () => window.location.reload()));
}

menu.addEventListener('click', (event) => {
  const action = (event.target as HTMLElement).getAttribute('data-action');
  if (action === 'solo') openTable();
  if (action === 'rules') {
    const rules = document.createElement('div');
    rules.className = 'rules-content';
    rules.innerHTML = `<h3>The Goal</h3><p>Blackjack is played against the dealer. Build a hand closer to 21 than the dealer without going over 21. Going over 21 is a bust and loses immediately.</p>`;
    document.body.append(createModal('How to Play', rules));
  }
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then((registration) => {
    registration.update().catch(() => undefined);
    setInterval(() => registration.update().catch(() => undefined), 60_000);
  }).catch(() => undefined);

  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });
}
