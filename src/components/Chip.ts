export function renderChip(amount: number): HTMLElement {
  const el = document.createElement('span');
  el.className = 'number';
  el.textContent = `$${amount}`;
  return el;
}
