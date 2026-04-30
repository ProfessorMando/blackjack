const KEY = 'blackjack.theme';
export function initThemeToggle(): HTMLButtonElement {
  const button = document.createElement('button');
  button.className = 'btn btn--secondary theme-toggle';
  const saved = localStorage.getItem(KEY) as 'light' | 'dark' | null;
  const theme = saved ?? 'light';
  document.documentElement.dataset.theme = theme;
  button.textContent = theme === 'dark' ? '☀︎' : '☾';
  button.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem(KEY, next);
    button.textContent = next === 'dark' ? '☀︎' : '☾';
  });
  return button;
}
