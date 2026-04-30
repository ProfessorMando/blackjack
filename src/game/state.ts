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
  currentBet: number;
  selectedChips: number[];
  lastPayout: { label: string; delta: number } | null;
  role: SoloRole;
  difficulty: Difficulty;
  awaitingNextRound: boolean;
  roundStartBankroll: number;
  hasStartedRound: boolean;
}

export const STORAGE_KEYS = {
  bankroll: 'blackjack.bankroll',
  startingCash: 'blackjack.startingCash',
  hasSavedRun: 'blackjack.hasSavedRun'
} as const;

export function loadNumber(key: string, fallback: number): number {
  const raw = localStorage.getItem(key);
  const value = raw ? Number(raw) : fallback;
  return Number.isFinite(value) ? value : fallback;
}

export function saveBankroll(amount: number): void {
  localStorage.setItem(STORAGE_KEYS.bankroll, String(Math.max(0, Math.floor(amount))));
  localStorage.setItem(STORAGE_KEYS.hasSavedRun, '1');
}

export function createAppState(config: SoloConfig): AppState {
  localStorage.setItem(STORAGE_KEYS.startingCash, String(config.startingCash));
  const bankroll = config.startingCash;
  const initialBet = Math.max(1, Math.min(config.bet, bankroll));
  saveBankroll(bankroll);
  return { round: null, bankroll, minBet: 1, currentBet: initialBet, selectedChips: [initialBet], lastPayout: null, role: config.role, difficulty: config.difficulty, awaitingNextRound: false, roundStartBankroll: bankroll, hasStartedRound: false };
}

export function startRound(state: AppState, bet: number): AppState {
  const bankrollBeforeRound = state.bankroll;
  const round = dealInitial(createRound(bankrollBeforeRound, bet));
  saveBankroll(round.bankroll);
  const delta = round.phase === 'round-over' ? round.bankroll - bankrollBeforeRound : 0;
  const label = delta > 0 ? 'win' : delta < 0 ? 'loss' : 'push';
  return { ...state, bankroll: round.bankroll, round, currentBet: bet, lastPayout: round.phase === 'round-over' ? { label, delta } : null, roundStartBankroll: bankrollBeforeRound, hasStartedRound: true };
}

export function applyPlayerAction(state: AppState, action: PlayerAction): AppState {
  if (!state.round) return state;
  const before = state.roundStartBankroll;
  let round = applyAction(state.round, action);
  if (round.phase === 'dealer') round = playDealer(round);
  saveBankroll(round.bankroll);
  const delta = round.phase === 'round-over' ? round.bankroll - before : 0;
  const label = delta > 0 ? 'win' : delta < 0 ? 'loss' : 'push';
  return { ...state, round, bankroll: round.bankroll, lastPayout: round.phase === 'round-over' ? { label, delta } : state.lastPayout };
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
