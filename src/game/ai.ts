// GAME LOGIC: implement from rules spec
export type Action = 'hit' | 'stand' | 'double' | 'split' | 'surrender';
export function getOptimalAction(): never {
  throw new Error('GAME LOGIC: implement from rules spec');
}
