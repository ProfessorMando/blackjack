export function createModal(title: string, content: HTMLElement): HTMLElement {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `<section class="modal-panel" role="dialog" aria-modal="true"><header class="modal-head"><h2>${title}</h2><button class="btn btn--ghost" data-close>Close</button></header></section>`;
  const panel = backdrop.querySelector('.modal-panel') as HTMLElement;
  panel.append(content);
  const close = (): void => backdrop.remove();
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
  (backdrop.querySelector('[data-close]') as HTMLButtonElement).onclick = close;
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); }, { once: true });
  return backdrop;
}
