import './styles/theme.css';
import './styles/base.css';
import './styles/components.css';
import { createModal } from './components/Modal';
import { renderGameBoard } from './components/GameBoard';
import { renderLobby } from './online/lobby';
import { createAppState, loadNumber, STORAGE_KEYS, type SoloConfig } from './game/state';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('App root not found');

const theme = localStorage.getItem(STORAGE_KEYS.theme) ?? 'dark';
document.documentElement.dataset.theme = theme;

const menu = document.createElement('main');
menu.className = 'menu';
menu.innerHTML = `<section class="menu__panel"><h1 class="menu__title">Blackjack</h1><p class="menu__subtitle">Play solo or go online</p><div class="menu__actions"><button class="btn btn--primary" data-action="solo">Play Solo</button><button class="btn btn--secondary" data-action="online">Play Online</button><button class="btn btn--ghost" data-action="rules">How to Play</button><button class="btn btn--ghost" data-action="theme">Toggle Theme</button></div></section><div class="offline-banner" hidden>You are offline. Solo mode is available.</div>`;
app.append(menu);

function openSolo(): void {
  const settings = document.createElement('div');
  settings.innerHTML = `<label>Role <select id='role'><option value='player'>Play as Player</option><option value='dealer'>Play as Dealer</option></select></label><label>Starting cash <input id='cash' type='number' min='10' max='10000' value='${loadNumber(STORAGE_KEYS.startingCash, 500)}'></label><label>Bet <input id='bet' type='number' min='10' value='10'></label><label>Difficulty <select id='difficulty'><option value='optimal'>Optimal</option><option value='casual'>Casual</option></select></label><button class='btn btn--primary' data-start>Start</button>`;
  settings.querySelector('[data-start]')?.addEventListener('click', () => {
    const cfg: SoloConfig = {
      role: (settings.querySelector('#role') as HTMLSelectElement).value as 'player' | 'dealer',
      startingCash: Number((settings.querySelector('#cash') as HTMLInputElement).value),
      bet: Number((settings.querySelector('#bet') as HTMLInputElement).value),
      difficulty: (settings.querySelector('#difficulty') as HTMLSelectElement).value as 'optimal' | 'casual'
    };
    const state = createAppState(cfg);
    document.body.append(createModal('Table', renderGameBoard(state, () => window.location.reload())));
  });
  document.body.append(createModal('Solo Setup', settings));
}

menu.addEventListener('click', (event) => {
  const action = (event.target as HTMLElement).getAttribute('data-action');
  if (action === 'solo') openSolo();
  if (action === 'online') document.body.append(createModal('Online Lobby', renderLobby()));
  if (action === 'rules') document.body.append(createModal('How to Play', Object.assign(document.createElement('p'), { textContent: 'Standard blackjack rules with split, double, surrender, insurance, and dealer play/settlement are implemented.' })));
  if (action === 'theme') {
    document.documentElement.dataset.theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEYS.theme, document.documentElement.dataset.theme ?? 'dark');
  }
});

const offlineBanner = menu.querySelector('.offline-banner') as HTMLElement;
window.addEventListener('online', () => offlineBanner.hidden = true);
window.addEventListener('offline', () => offlineBanner.hidden = false);
offlineBanner.hidden = navigator.onLine;

if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => undefined);
