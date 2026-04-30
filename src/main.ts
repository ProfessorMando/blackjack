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
    const content = document.createElement('div');
    content.innerHTML = `
      <h3>Blackjack Quick Guide</h3>
      <p><strong>Goal:</strong> Beat the dealer without going over 21. If you go over 21, you bust and lose.</p>
      <p><strong>Card values:</strong> Number cards are face value, face cards are 10, and aces are 1 or 11.</p>
      <h4>Round flow</h4>
      <ol>
        <li>Place your bet.</li>
        <li>You and the dealer each get two cards (dealer has one hidden card).</li>
        <li>Choose actions on your turn: Hit, Stand, Double Down, Split (when allowed), or Surrender (if offered).</li>
        <li>Dealer reveals the hidden card and draws by house rules (usually hits up to 16 and stands on 17+).</li>
        <li>Hands are compared and bets are settled.</li>
      </ol>
      <h4>Key outcomes and payouts</h4>
      <ul>
        <li><strong>Blackjack (Ace + 10-value card):</strong> usually pays 3:2.</li>
        <li><strong>Standard win:</strong> pays 1:1.</li>
        <li><strong>Push (tie):</strong> your bet is returned.</li>
        <li><strong>Insurance:</strong> offered when dealer shows an Ace, pays 2:1 if dealer has blackjack.</li>
      </ul>
      <p><strong>Note:</strong> Table rules vary. Check the felt for rules like "Dealer hits soft 17" and blackjack payout (3:2 is better than 6:5).</p>
    `;
    document.body.append(createModal('How to Play', content));
  }
});

app.append(menu);

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => undefined);
}
