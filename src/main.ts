import './styles/theme.css';
import './styles/base.css';
import './styles/components.css';
import { createModal } from './components/Modal';
import { renderGameBoard } from './components/GameBoard';
import { renderLobby } from './online/lobby';
import { createAppState, loadNumber, STORAGE_KEYS, type SoloConfig } from './game/state';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('App root not found');

const menu = document.createElement('main');
menu.className = 'menu';
menu.innerHTML = `<section class="menu__panel"><h1 class="menu__title">Blackjack</h1><p class="menu__subtitle">Play solo or go online</p><div class="menu__actions"><button class="btn btn--primary" data-action="solo">Play Solo</button><button class="btn btn--secondary" data-action="online">Play Online</button><button class="btn btn--ghost menu__rules-btn" data-action="rules">How to Play</button></div></section><div class="offline-banner" hidden>You are offline. Solo mode is available.</div>`;
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
  if (action === 'rules') {
    const rules = document.createElement('div');
    rules.className = 'rules-content';
    rules.innerHTML = `
      <h3>The Goal</h3><p>Blackjack is played against the dealer. Build a hand closer to 21 than the dealer without going over 21. Going over 21 is a bust and loses immediately.</p>
      <h3>Card Values</h3><ul><li>2-10 are worth face value.</li><li>Jack, Queen, King are worth 10.</li><li>Ace is worth 1 or 11, whichever helps the hand most.</li></ul><p>A hand with an Ace counted as 11 is a soft hand (for example, Ace + 6 is soft 17).</p>
      <h3>The Table and Equipment</h3><p>Blackjack is usually dealt at a semicircular table. Games use one or more standard 52-card decks with no jokers. Multi-deck games are commonly dealt from a shoe.</p>
      <h3>Round Flow</h3><ol><li>Players place bets before cards are dealt.</li><li>Each player gets two face-up cards.</li><li>Dealer gets one face-up card and one face-down card (hole card).</li><li>Players act left to right.</li><li>Dealer reveals hole card and finishes hand by fixed rules.</li></ol>
      <h3>Blackjack (Natural 21)</h3><p>An Ace with any 10-value card on the first two cards is a blackjack (natural), typically paid 3:2 unless dealer also has blackjack (push).</p>
      <h3>Insurance</h3><p>If dealer shows an Ace, players may place insurance up to half their original bet. Insurance pays 2:1 only if dealer has blackjack.</p>
      <h3>Player Options</h3><ul><li><strong>Stand:</strong> keep current total.</li><li><strong>Hit:</strong> take another card.</li><li><strong>Double Down:</strong> double bet, take exactly one card.</li><li><strong>Split:</strong> split a pair into two hands with an added equal bet.</li><li><strong>Surrender:</strong> forfeit hand and recover half bet (if offered).</li></ul>
      <h3>Busting</h3><p>If your total goes over 21, you bust and lose immediately, even if the dealer later busts too.</p>
      <h3>Splitting Notes</h3><ul><li>Split hands each receive a second card.</li><li>Many games cap total split hands (commonly up to 4).</li><li>Split Aces often receive only one additional card each.</li><li>A 10-value card after splitting Aces is usually not treated as blackjack.</li></ul>
      <h3>Dealer Rules</h3><ul><li>Dealer must hit 16 or less.</li><li>Dealer must stand 17 or more.</li><li>Some tables require hitting soft 17; others stand on all 17.</li></ul>
      <h3>Payouts</h3><ul><li>Standard win: 1:1.</li><li>Blackjack: usually 3:2.</li><li>Insurance: 2:1.</li><li>Push: bet returned.</li></ul><p>Watch for 6:5 blackjack tables, which are worse for players.</p>
      <h3>Common Variations</h3><p>Rules vary by table (DAS, RSA, surrender, soft-17 rule, and number of decks). Blackjack-like variants such as Spanish 21 or Blackjack Switch are different games with different odds.</p>
    `;
    document.body.append(createModal('How to Play', rules));
  }
});

const offlineBanner = menu.querySelector('.offline-banner') as HTMLElement;
window.addEventListener('online', () => offlineBanner.hidden = true);
window.addEventListener('offline', () => offlineBanner.hidden = false);
offlineBanner.hidden = navigator.onLine;

if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => undefined);
