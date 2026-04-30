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

function openTable(startingCash: number): void {
  const state = createAppState({
    role: 'player',
    startingCash,
    bet: 10,
    difficulty: 'casual'
  });
  app!.innerHTML = '';
  app!.append(renderGameBoard(state, () => window.location.reload()));
}

function openStartAmountPrompt(): void {
  const panel = document.createElement('div');
  panel.innerHTML = '<p>Choose starting cash (1 - 100000)</p><input type="number" min="1" max="100000" value="500" class="start-cash-input" /><div class="menu__actions"><button class="btn btn--primary" data-start-new>Start New Run</button></div>';
  const modal = createModal('New Run', panel);
  panel.querySelector('[data-start-new]')?.addEventListener('click', () => {
    const input = panel.querySelector('.start-cash-input') as HTMLInputElement;
    const amount = Math.max(1, Math.min(100000, Math.floor(Number(input.value) || 500)));
    document.body.removeChild(modal);
    openTable(amount);
  });
  document.body.append(modal);
}

function openPlayChoice(): void {
  const hasSavedRun = localStorage.getItem(STORAGE_KEYS.hasSavedRun) === '1';
  if (!hasSavedRun) {
    openStartAmountPrompt();
    return;
  }
  const bankroll = loadNumber(STORAGE_KEYS.bankroll, 500);
  const panel = document.createElement('div');
  panel.innerHTML = `<p>You have an existing run with <strong>${bankroll}</strong> remaining.</p><div class="menu__actions"><button class="btn btn--primary" data-continue>Continue Last Run</button><button class="btn btn--ghost" data-new>Start New Run</button></div>`;
  const modal = createModal('Choose Run', panel);
  panel.querySelector('[data-continue]')?.addEventListener('click', () => {
    document.body.removeChild(modal);
    openTable(bankroll);
  });
  panel.querySelector('[data-new]')?.addEventListener('click', () => {
    document.body.removeChild(modal);
    openStartAmountPrompt();
  });
  document.body.append(modal);
}

menu.addEventListener('click', (event) => {
  const action = (event.target as HTMLElement).getAttribute('data-action');
  if (action === 'solo') openPlayChoice();
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
