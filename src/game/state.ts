export interface GameState {
  bankroll: number;
  minBet: number;
  mode: 'solo-player' | 'solo-dealer' | 'online-pvp' | 'online-pvd';
}
const BANKROLL_KEY = 'blackjack.bankroll';
export function loadBankroll(defaultValue = 500): number {
  const raw = localStorage.getItem(BANKROLL_KEY);
  const parsed = raw ? Number(raw) : defaultValue;
  return Number.isFinite(parsed) ? parsed : defaultValue;
}
export function saveBankroll(amount: number): void { localStorage.setItem(BANKROLL_KEY, String(amount)); }
