import type { QueueJoinResponse, QueueStatus } from './sync';

export function renderLobby(): HTMLElement {
  const el = document.createElement('div');
  el.className = 'lobby';
  el.innerHTML = `<p data-status>Queue loading...</p><button class="btn btn--primary" data-join>Join Queue</button>`;
  const statusEl = el.querySelector('[data-status]') as HTMLElement;
  const refresh = async (): Promise<void> => {
    if (!navigator.onLine) { statusEl.textContent = 'Offline: online mode unavailable.'; return; }
    const data = await fetch('/api/queue/status').then((r) => r.json()) as QueueStatus;
    statusEl.textContent = `PVP/CD: ${data.pvpComputerDealer} | Human dealer (P/D): ${data.playerVsHumanDealer.player}/${data.playerVsHumanDealer.dealer}`;
  };
  void refresh();
  const timer = window.setInterval(refresh, 3000);
  el.addEventListener('remove', () => clearInterval(timer));
  (el.querySelector('[data-join]') as HTMLButtonElement).onclick = async () => {
    const res = await fetch('/api/queue/join', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ mode: 'pvp-computer-dealer', role: 'player' }) });
    const body = await res.json() as QueueJoinResponse;
    statusEl.textContent = body.matched ? `Matched room ${body.roomId}` : 'Queued. Waiting for opponent...';
  };
  return el;
}
