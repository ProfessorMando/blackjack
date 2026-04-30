export type QueueMode = 'pvp-computer-dealer' | 'player-vs-human-dealer';
export type QueueRole = 'player' | 'dealer';

export interface QueueStatus { pvpComputerDealer: number; playerVsHumanDealer: { player: number; dealer: number }; }
export interface QueueJoinRequest { mode: QueueMode; role: QueueRole; }
export interface QueueJoinResponse { matched: boolean; roomId?: string; ticket?: string; }

export type RoomMessage =
  | { type: 'joined'; id: string }
  | { type: 'relay'; payload: unknown }
  | { type: 'peer-disconnected' };
