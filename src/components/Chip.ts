export function renderChip(amount: number): HTMLElement {
  const el = document.createElement('div');
  el.className = 'chip';
  el.innerHTML = `<span>Bankroll</span><strong>${amount}</strong>`;
  return el;
}
