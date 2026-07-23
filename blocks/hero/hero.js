import { createOptimizedPicture } from '../../scripts/aem.js';

const CHART_SVG = `
<svg class="hero-chart" viewBox="0 0 300 150" preserveAspectRatio="none" role="img" aria-label="Global healthcare market growth 2024–2030">
  <defs>
    <linearGradient id="hero-chart-line" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0%" stop-color="#d0006f"/>
      <stop offset="55%" stop-color="#f0ab00"/>
      <stop offset="100%" stop-color="#f3bc33"/>
    </linearGradient>
  </defs>
  <g class="hero-chart-droplines" stroke="#b2b4b4" stroke-width="1" stroke-dasharray="2 3">
    <line x1="150" y1="86" x2="150" y2="132"/>
    <line x1="185" y1="96" x2="185" y2="132"/>
    <line x1="220" y1="74" x2="220" y2="132"/>
    <line x1="255" y1="58" x2="255" y2="132"/>
    <line x1="288" y1="30" x2="288" y2="132"/>
  </g>
  <polyline
    fill="none"
    stroke="url(#hero-chart-line)"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
    points="12,124 45,116 78,110 100,104 122,98 150,86 185,96 220,74 255,58 288,30"/>
  <g class="hero-chart-dots">
    <circle cx="45" cy="116" r="2.5" fill="#d0006f"/>
    <circle cx="78" cy="110" r="2.5" fill="#d0006f"/>
    <circle cx="100" cy="104" r="2.5" fill="#d0006f"/>
    <circle cx="122" cy="98" r="2.5" fill="#e0630f"/>
    <circle cx="150" cy="86" r="2.5" fill="#f0ab00"/>
    <circle cx="185" cy="96" r="2.5" fill="#f0ab00"/>
    <circle cx="220" cy="74" r="2.5" fill="#f0ab00"/>
    <circle cx="255" cy="58" r="2.5" fill="#f3bc33"/>
    <circle cx="288" cy="30" r="3.5" fill="#f3bc33"/>
  </g>
</svg>`;

/**
 * Finds the row cell that matches a predicate, returning the inner cell element.
 * @param {Element[]} rows Block child rows
 * @param {(cell: Element) => boolean} predicate Match test on the row's first cell
 */
function findCell(rows, predicate) {
  const row = rows.find((r) => r.firstElementChild && predicate(r.firstElementChild));
  return row ? { row, cell: row.firstElementChild } : null;
}

/**
 * Decorates the stat card: classifies label/value/CAGR/source lines and injects the chart.
 * @param {Element} cell The stat card cell
 */
function decorateStatCard(cell) {
  cell.classList.add('hero-stat-card');
  const eyebrow = cell.querySelector('h1, h2, h3, h4, h5, h6');
  if (eyebrow) eyebrow.classList.add('hero-stat-eyebrow');

  cell.querySelectorAll('p').forEach((p) => {
    const text = p.textContent.trim();
    if (/^source:/i.test(text)) {
      p.classList.add('hero-stat-source');
    } else if (/cagr/i.test(text)) {
      p.classList.add('hero-stat-cagr');
    } else if (p.querySelector('strong')) {
      p.classList.add('hero-stat-value');
    } else {
      p.classList.add('hero-stat-label');
    }
  });

  const source = cell.querySelector('.hero-stat-source');
  const chart = document.createRange().createContextualFragment(CHART_SVG);
  if (source) cell.insertBefore(chart, source);
  else cell.append(chart);
}

/**
 * Decorates the quick-links list into a row of arrow cards.
 * @param {Element} cell The cell containing the list
 */
function decorateQuickLinks(cell, wrapper) {
  wrapper.classList.add('hero-quicklinks');
  const list = cell.querySelector('ul');
  list.querySelectorAll('li').forEach((li) => {
    const link = li.querySelector('a');
    li.classList.add('hero-quicklink');
    if (link) {
      link.classList.add('hero-quicklink-link');
      const arrow = document.createElement('span');
      arrow.className = 'hero-quicklink-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '→';
      link.append(arrow);
    }
  });
}

/**
 * loads and decorates the hero
 * @param {Element} block The hero block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  // background image (a row whose only content is a picture)
  const bg = findCell(rows, (cell) => {
    const only = cell.children.length === 1 || (cell.children.length === 0 && cell.querySelector('picture'));
    return only && cell.querySelector('picture') && !cell.textContent.trim();
  });

  // stat card (row containing the eyebrow / market copy)
  const stat = findCell(rows, (cell) => /global healthcare market/i.test(cell.textContent)
    || cell.querySelector('.hero-stat-eyebrow'));

  // quick links (row containing a list)
  const links = findCell(rows, (cell) => cell.querySelector('ul'));

  // content (row with the headline) — falls back to the first remaining row
  const content = findCell(rows, (cell) => cell.querySelector('h1'))
    || rows.map((r) => ({ row: r, cell: r.firstElementChild }))
      .find(({ row }) => ![bg, stat, links].some((m) => m && m.row === row));

  block.textContent = '';

  if (bg) {
    const wrapper = document.createElement('div');
    wrapper.className = 'hero-bg';
    const img = bg.cell.querySelector('img');
    if (img) {
      wrapper.append(createOptimizedPicture(img.src, img.alt, true, [{ width: '2000' }]));
    } else {
      wrapper.append(bg.cell.querySelector('picture'));
    }
    block.append(wrapper);
    block.classList.add('hero-image');
  }

  const inner = document.createElement('div');
  inner.className = 'hero-inner';

  const top = document.createElement('div');
  top.className = 'hero-top';

  if (content) {
    content.cell.classList.add('hero-content');
    const cta = content.cell.querySelector('a');
    if (cta && !cta.classList.contains('button')) {
      cta.classList.add('button', 'primary');
      const p = cta.closest('p');
      if (p) p.classList.add('button-container');
    }
    top.append(content.cell);
  }

  if (stat) {
    decorateStatCard(stat.cell);
    top.append(stat.cell);
  }

  inner.append(top);

  if (links) {
    decorateQuickLinks(links.cell, links.cell);
    inner.append(links.cell);
  }

  block.append(inner);
}
