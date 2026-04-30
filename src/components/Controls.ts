export function renderControls(): HTMLElement {
  const wrap = document.createElement('div');
  ['Deal','Hit','Stand','Double','Split'].forEach((label)=>{const b=document.createElement('button');b.className='btn btn--primary';b.textContent=label;wrap.append(b);});
  return wrap;
}
