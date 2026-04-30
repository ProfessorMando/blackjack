import { Card, ShoeState, createShoe, drawCard, handTotals, isBlackjack, isPair } from './deck';

export type PlayerAction = 'hit' | 'stand' | 'double' | 'split' | 'surrender' | 'insurance';
export type Phase = 'betting'|'dealing'|'insurance'|'player'|'dealer'|'settlement'|'round-over';
export interface RulesConfig { decks:number; blackjackPayout:number; dealerHitsSoft17:boolean; minBet:number; maxHands:number; allowLateSurrender:boolean; }
export const DEFAULT_RULES: RulesConfig = { decks: 6, blackjackPayout: 1.5, dealerHitsSoft17: true, minBet: 1, maxHands: 4, allowLateSurrender: true };
export interface PlayerHand { cards: Card[]; bet: number; stood?: boolean; busted?: boolean; surrendered?: boolean; doubled?: boolean; splitAces?: boolean; insuranceBet?: number; settled?: number; }
export interface RoundState { bankroll:number; bet:number; shoe:ShoeState; dealer:Card[]; dealerHidden:boolean; hands:PlayerHand[]; currentHand:number; phase:Phase; message:string; dealerBlackjackChecked:boolean; }

export function createRound(bankroll:number, bet:number, rules:RulesConfig=DEFAULT_RULES, shoe=createShoe(rules.decks)): RoundState {
  if (bet < rules.minBet || bet > bankroll) throw new Error('Invalid bet');
  return { bankroll: bankroll - bet, bet, shoe, dealer: [], dealerHidden: true, hands: [{ cards: [], bet }], currentHand: 0, phase: 'dealing', message:'', dealerBlackjackChecked:false };
}

export function dealInitial(state: RoundState): RoundState {
  let next = { ...state };
  for (let i=0;i<2;i+=1) {
    let card; [card, next.shoe] = drawCard(next.shoe); next.hands[0].cards = [...next.hands[0].cards, card];
    [card, next.shoe] = drawCard(next.shoe); next.dealer = [...next.dealer, card];
  }
  const playerBlackjack = isBlackjack(next.hands[0].cards);
  if (playerBlackjack) {
    next.phase = 'settlement';
    next.dealerHidden = false;
    return settle(next);
  }
  next.phase = 'player';
  return next;
}

export function legalActions(state: RoundState): PlayerAction[] {
  const h = state.hands[state.currentHand]; if (!h || state.phase !== 'player') return [];
  const total = handTotals(h.cards).total;
  if (total >= 21) return [];
  const acts: PlayerAction[] = ['hit','stand'];
  if (h.cards.length===2 && !h.doubled && state.bankroll >= h.bet) acts.push('double');
  if (h.cards.length===2 && isPair(h.cards) && state.hands.length < DEFAULT_RULES.maxHands && state.bankroll >= h.bet && !(h.cards[0].rank==='A' && h.splitAces)) acts.push('split');
  if (h.cards.length===2) acts.push('surrender');
  return acts;
}

export function applyAction(state: RoundState, action: PlayerAction): RoundState {
  let next = { ...state, hands: state.hands.map((h)=>({...h,cards:[...h.cards]})), dealer:[...state.dealer] };
  const h = next.hands[next.currentHand];
  if (action==='hit') { let c; [c,next.shoe]=drawCard(next.shoe); h.cards.push(c); const total = handTotals(h.cards).total; if (total>21) h.busted=true; if (total===21) h.stood=true; }
  if (action==='double') { h.bet*=2; next.bankroll -= h.bet/2; h.doubled=true; }
  if (action==='stand') h.stood=true;
  if (action==='surrender') { h.surrendered=true; h.stood=true; }
  if (action==='split') { const [a,b]=h.cards; let c1,c2; [c1,next.shoe]=drawCard(next.shoe); [c2,next.shoe]=drawCard(next.shoe); h.cards=[a,c1]; const splitHand: PlayerHand={cards:[b,c2],bet:h.bet,splitAces:a.rank==='A'}; next.hands.splice(next.currentHand+1,0,splitHand); next.bankroll -= h.bet; }
  while (next.currentHand < next.hands.length && (next.hands[next.currentHand].stood || next.hands[next.currentHand].busted)) next.currentHand +=1;
  if (next.currentHand >= next.hands.length) next.phase='dealer';
  return next;
}

export function playDealer(state: RoundState): RoundState {
  const next = { ...state, dealerHidden:false, dealer:[...state.dealer] };
  while (true) {
    const t = handTotals(next.dealer);
    if (t.total > 21 || t.total > 17 || (t.total===17 && !t.isSoft)) break;
    let c; [c,next.shoe]=drawCard(next.shoe); next.dealer.push(c);
  }
  next.phase='settlement';
  return settle(next);
}

export function settle(state: RoundState): RoundState {
  const dealerTotal = handTotals(state.dealer).total;
  const dealerBJ = isBlackjack(state.dealer);
  const next: RoundState = {...state,hands:state.hands.map((h)=>({...h,cards:[...h.cards]})),phase:'round-over'};
  for (const h of next.hands) {
    if (h.surrendered) { next.bankroll += h.bet / 2; continue; }
    const pt = handTotals(h.cards).total;
    if (pt>21) continue;
    if (isBlackjack(h.cards) && !h.splitAces) {
      if (!dealerBJ) next.bankroll += h.bet * (1+DEFAULT_RULES.blackjackPayout); else next.bankroll += h.bet;
      continue;
    }
    if (dealerTotal>21 || pt>dealerTotal) next.bankroll += h.bet*2;
    else if (pt===dealerTotal) next.bankroll += h.bet;
  }
  return next;
}
