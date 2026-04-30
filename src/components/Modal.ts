export function createModal(title: string, body: HTMLElement): HTMLElement {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  const panel = document.createElement('section');
  panel.className = 'modal-panel';
  const h2 = document.createElement('h2');
  h2.textContent = title;
  panel.append(h2, body);
  backdrop.append(panel);
  backdrop.addEventListener('click', (e) => { if (e.target === backdrop) backdrop.remove(); });
  return backdrop;
}
