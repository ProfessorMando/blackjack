const actions = ['deal','hit','stand','double','split','surrender'] as const;
export type ControlAction = (typeof actions)[number];

export function renderControls(onAction: (action: ControlAction) => void, enabled: Partial<Record<ControlAction, boolean>>): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'controls controls--bottom';
  for (const action of actions) {
    const b = document.createElement('button');
    b.className = 'btn btn--secondary';
    b.textContent = action.replace('-', ' ');
    b.disabled = !enabled[action];
    b.addEventListener('click', () => onAction(action));
    wrap.append(b);
  }
  return wrap;
}
