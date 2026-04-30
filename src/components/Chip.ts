const CHIP_VALUES = [1, 5, 10, 20, 50, 100, 500, 1000, 2000, 5000, 10000] as const;

const CHIP_COLORS = ['#f5f5f5', '#d32f2f', '#1976d2', '#43a047', '#8e24aa', '#fb8c00', '#6d4c41', '#00897b', '#5e35b1', '#c62828', '#212121'] as const;
const CHIP_TEXT = ['#1a1a1a', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff', '#ffffff'] as const;

export function renderPurse(amount: number): HTMLElement {
  const el = document.createElement('div');
  el.className = 'purse';
  el.innerHTML = `<span class="purse__label">👛 Purse</span><strong>${amount}</strong>`;
  return el;
}

export function renderPayout(status: { label: string; delta: number } | null): HTMLElement {
  const el = document.createElement('div');
  el.className = 'payout';
  if (!status) {
    el.textContent = 'Payout: --';
    return el;
  }
  const sign = status.delta > 0 ? '+' : status.delta < 0 ? '-' : '';
  el.classList.add(status.delta > 0 ? 'payout--positive' : status.delta < 0 ? 'payout--negative' : 'payout--push');
  el.textContent = `${status.label} ${sign}${Math.abs(status.delta)}`;
  return el;
}

export function renderBetChips(bankroll: number, selectedChips: number[], onSelect: (chips: number[]) => void, onDeal?: () => void): HTMLElement {
  const wrap = document.createElement('section');
  wrap.className = 'betting';
  wrap.innerHTML = '<h3>Place Your Bet</h3>';

  const row = document.createElement('div');
  row.className = 'betting__chips';

  CHIP_VALUES.forEach((value, idx) => {
    const b = document.createElement('button');
    b.className = 'betting-chip';
    b.style.setProperty('--chip-color', CHIP_COLORS[idx]);
    b.style.setProperty('--chip-text', CHIP_TEXT[idx]);
    b.textContent = String(value);
    b.disabled = value > bankroll;
    b.addEventListener('click', () => {
      const next = [...selectedChips, value];
      const total = next.reduce((sum, chip) => sum + chip, 0);
      if (total <= bankroll) onSelect(next);
    });
    row.append(b);
  });

  const center = document.createElement('div');
  center.className = 'betting-center';
  const grouped = selectedChips.reduce<Record<number, number>>((acc, v) => {
    acc[v] = (acc[v] ?? 0) + 1;
    return acc;
  }, {});
  Object.entries(grouped).forEach(([value, count]) => {
    const stack = document.createElement('button');
    const idx = CHIP_VALUES.indexOf(Number(value) as (typeof CHIP_VALUES)[number]);
    stack.className = 'chip-stack';
    stack.style.setProperty('--chip-color', CHIP_COLORS[idx]);
    stack.style.setProperty('--chip-text', CHIP_TEXT[idx]);
    stack.innerHTML = `<span class="chip-stack__count">x${count}</span><span class="chip-stack__value">${value}</span>`;
    stack.addEventListener('click', () => {
      const removeValue = Number(value);
      const removeIndex = selectedChips.findIndex((chip) => chip === removeValue);
      if (removeIndex >= 0) {
        const next = [...selectedChips];
        next.splice(removeIndex, 1);
        onSelect(next);
      }
    });
    center.append(stack);
  });

  const selected = selectedChips.reduce((sum, v) => sum + v, 0);
  const total = document.createElement('p');
  total.className = 'betting__selected';
  total.textContent = `Bet: ${selected}`;

  wrap.append(row, center, total);
  if (onDeal) {
    const dealBtn = document.createElement('button');
    dealBtn.className = 'btn btn--primary betting__deal';
    dealBtn.textContent = 'Deal';
    dealBtn.disabled = selected < 1 || selected > bankroll;
    dealBtn.addEventListener('click', onDeal);
    wrap.append(dealBtn);
  }
  return wrap;
}
