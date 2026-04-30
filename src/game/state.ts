import { getComputerAction, type Difficulty } from './ai';
import {
  applyAction,
  createRound,
  dealInitial,
  legalActions,
  playDealer,
  type PlayerAction,
  type RoundState
} from './engine';

export type SoloRole = 'player' | 'dealer';

export interface SoloConfig {
  role: SoloRole;
  difficulty: Difficulty;
  startingCash: number;
  bet: number;
}

export interface AppState {
  round: RoundState | null;
  bankroll: number;
  minBet: number;
  role: SoloRole;
  difficulty: Difficulty;
}

export const STORAGE_KEYS = {
  bankroll: 'blackjack.bankroll',
  startingCash: 'blackjack.startingCash'
} as const;

export function loadNumber(key: string, fallback: number): number {
  const raw = localStorage.getItem(key);
  const value = raw ? Number(raw) : fallback;
  return Number.isFinite(value) ? value : fallback;
}

export function saveBankroll(amount: number): void {
  localStorage.setItem(STORAGE_KEYS.bankroll, String(Math.max(0, Math.floor(amount))));
}

export function createAppState(config: SoloConfig): AppState {
  localStorage.setItem(STORAGE_KEYS.startingCash, String(config.startingCash));
  const bankroll = Math.max(config.startingCash, config.bet);
  saveBankroll(bankroll);
  return { round: null, bankroll, minBet: 10, role: config.role, difficulty: config.difficulty };
}

export function startRound(state: AppState, bet: number): AppState {
  const round = dealInitial(createRound(state.bankroll, bet));
  return { ...state, bankroll: round.bankroll, round };
}

export function applyPlayerAction(state: AppState, action: PlayerAction): AppState {
  if (!state.round) return state;
  let round = applyAction(state.round, action);
  if (round.phase === 'dealer') round = playDealer(round);
  saveBankroll(round.bankroll);
  return { ...state, round, bankroll: round.bankroll };
}

export function runComputerTurn(state: AppState): AppState {
  if (!state.round) return state;
  let round = state.round;
  while (round.phase === 'player') {
    const hand = round.hands[round.currentHand];
    if (!hand) break;
    const acts = legalActions(round);
    const choice = getComputerAction(hand.cards, round.dealer[0], acts, state.difficulty);
    round = applyAction(round, choice);
  }
  return { ...state, round };
}
