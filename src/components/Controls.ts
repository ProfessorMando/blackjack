const actions = ['hit','stand','double','split','surrender'] as const;
export type ControlAction = (typeof actions)[number];

const LABELS: Record<ControlAction, string> = {
  hit: 'Hit',
  stand: 'Stand',
  double: 'Double',
  split: 'Split',
  surrender: 'Surrender'
};

export function renderControls(onAction: (action: ControlAction) => void, enabled: Partial<Record<ControlAction, boolean>>): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'controls controls--bottom';
  for (const action of actions) {
    if (!enabled[action]) continue;
    const b = document.createElement('button');
    b.className = 'btn btn--secondary';
    b.textContent = LABELS[action];
    b.addEventListener('click', () => onAction(action));
    wrap.append(b);
  }
  return wrap;
}
