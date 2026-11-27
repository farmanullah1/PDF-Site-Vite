/* ===== shared homepage UI ===== */

export function renderCategoryNav(cats) {
  const nav = document.querySelector('.category-nav');
  if (!nav) return;
  nav.innerHTML = cats.map((c) => {
    const url = c.id === 'all' ? './index.html' : `tools/${c.id}.html`;
    return `<a class="pill" href="${url}">${c.label}</a>`;
  }).join('');
}

export function renderFilterRow(cats, onRenderGrid) {
  const row = document.querySelector('.filter-row');
  if (!row) return;
  row.innerHTML = cats.map((c) => {
    const pressed = c.id === 'all' ? 'true' : 'false';
    return `<button class="pill" data-cat="${c.id}" aria-pressed="${pressed}">${c.label}</button>`;
  }).join('');
}

export function wireFilterPills(cats, onRenderGrid) {
  const row = document.querySelector('.filter-row');
  if (!row) return;
  const buttons = row.querySelectorAll('.pill[data-cat]');
  buttons.forEach((b) => {
    b.addEventListener('click', () => {
      buttons.forEach((x) => x.setAttribute('aria-pressed', 'false'));
      b.setAttribute('aria-pressed', 'true');
      const cat = b.getAttribute('data-cat');
      onRenderGrid(cat === 'all' ? null : cat);
    });
  });
  // if there is a default active pill, keep grid consistent
  const active = row.querySelector('.pill[aria-pressed="true"]');
  if (active) {
    const cat = active.getAttribute('data-cat');
    onRenderGrid(cat === 'all' ? null : cat);
  }
}

export function renderToolGrid(tools, urlMap, activeCategory) {
  const grid = document.querySelector('.tool-grid');
  if (!grid) return;
  const filtered = activeCategory
    ? tools.filter((t) => t.category === activeCategory)
    : tools;

  grid.innerHTML = filtered.map((t) => `
    <a class="tool-card" href="${urlMap[t.id]}">
      <div class="tool-card-mark">${t.mark}</div>
      <h2>${t.title}</h2>
      <p>${t.summary}</p>
      <span class="open">Open tool</span>
    </a>
  `).join('') || `<p style="color:var(--muted)">No tools match this category yet.</p>`;
}
