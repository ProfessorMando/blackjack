const CHIP_VALUES = [1, 5, 10, 20, 50, 100, 500, 1000, 2000, 5000, 10000] as const;

const CHIP_COLORS = ['#f5f5f5', '#d32f2f', '#1976d2', '#43a047', '#8e24aa', '#fb8c00', '#6d4c41', '#00897b', '#5e35b1', '#c62828', '#212121'] as const;

export function renderPurse(amount: number): HTMLElement {
  const el = document.createElement('div');
  el.className = 'purse';
  el.innerHTML = `<span class="purse__label">👛 Purse</span><strong>${amount}</strong>`;
  return el;
}

export function renderBetChips(bankroll: number, selected: number, onSelect: (bet: number) => void): HTMLElement {
  const wrap = document.createElement('section');
  wrap.className = 'betting';
  wrap.innerHTML = '<h3>Place Your Bet</h3>';

  const row = document.createElement('div');
  row.className = 'betting__chips';

  CHIP_VALUES.forEach((value, idx) => {
    const b = document.createElement('button');
    b.className = 'betting-chip';
    b.style.setProperty('--chip-color', CHIP_COLORS[idx]);
    b.textContent = String(value);
    b.disabled = value > bankroll;
    if (value === selected) b.classList.add('is-selected');
    b.addEventListener('click', () => onSelect(value));
    row.append(b);
  });

  const total = document.createElement('p');
  total.className = 'betting__selected';
  total.textContent = `Selected Bet: ${selected}`;

  wrap.append(row, total);
  return wrap;
}
