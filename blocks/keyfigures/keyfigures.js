/**
 * AstraZeneca "at a glance" key figures block.
 * Content model (rows):
 *   1 cell, no link      -> section title
 *   1 cell with a link   -> CTA button
 *   4 cells              -> stat card: eyebrow | value | change | caption
 * In the value cell the bold fragment is the large number; text before it is
 * the currency prefix and text after it is the unit suffix.
 */

/**
 * Builds the value line, splitting currency prefix / big number / unit suffix.
 * @param {Element} cell The value cell
 * @returns {Element} The decorated value element
 */
function buildValue(cell) {
  const value = document.createElement('p');
  value.className = 'keyfigures-value';
  const strong = cell.querySelector('strong, b');
  const raw = cell.textContent.trim();
  const big = strong ? strong.textContent.trim() : raw;
  const [prefix, suffix] = strong
    ? [raw.slice(0, raw.indexOf(big)).trim(), raw.slice(raw.indexOf(big) + big.length).trim()]
    : ['', ''];

  if (prefix) {
    const pre = document.createElement('span');
    pre.className = 'keyfigures-value-prefix';
    pre.textContent = prefix;
    value.append(pre);
  }
  const num = document.createElement('span');
  num.className = 'keyfigures-value-number';
  num.textContent = big;
  value.append(num);
  if (suffix) {
    const suf = document.createElement('span');
    suf.className = 'keyfigures-value-suffix';
    suf.textContent = suffix;
    value.append(suf);
  }
  return value;
}

/**
 * Builds the YoY change indicator, deriving direction/color from the sign.
 * @param {Element} cell The change cell
 * @returns {Element} The decorated change element
 */
function buildChange(cell) {
  const text = cell.textContent.trim();
  const negative = text.startsWith('-') || /↓/.test(text);
  const change = document.createElement('p');
  change.className = `keyfigures-change ${negative ? 'keyfigures-change-negative' : 'keyfigures-change-positive'}`;

  const arrow = document.createElement('span');
  arrow.className = 'keyfigures-change-arrow';
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = negative ? '↓' : '↑';

  const label = document.createElement('span');
  label.className = 'keyfigures-change-label';
  label.textContent = text.replace(/^[+-]/, '').replace(/[↑↓]/g, '').trim();

  change.append(arrow, label);
  return change;
}

/**
 * Decorates a single stat card from a 4-cell row.
 * @param {Element[]} cells The four cells: eyebrow, value, change, caption
 * @returns {Element} The card element
 */
function buildCard(cells) {
  const [eyebrowCell, valueCell, changeCell, captionCell] = cells;
  const card = document.createElement('div');
  card.className = 'keyfigures-card';

  const body = document.createElement('div');
  body.className = 'keyfigures-card-body';

  const eyebrow = document.createElement('p');
  eyebrow.className = 'keyfigures-eyebrow';
  eyebrow.textContent = eyebrowCell ? eyebrowCell.textContent.trim() : '';

  const row = document.createElement('div');
  row.className = 'keyfigures-value-row';
  row.append(buildValue(valueCell));
  if (changeCell && changeCell.textContent.trim()) row.append(buildChange(changeCell));

  const caption = document.createElement('p');
  caption.className = 'keyfigures-caption';
  caption.textContent = captionCell ? captionCell.textContent.trim() : '';

  body.append(eyebrow, row, caption);

  const underline = document.createElement('div');
  underline.className = 'keyfigures-underline';

  card.append(body, underline);
  return card;
}

/**
 * loads and decorates the key figures block
 * @param {Element} block The keyfigures block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  let title;
  let cta;
  const cards = [];

  rows.forEach((row) => {
    const cells = [...row.children];
    if (cells.length >= 4) {
      cards.push(buildCard(cells));
    } else if (cells[0] && cells[0].querySelector('a')) {
      cta = cells[0].querySelector('a');
    } else if (cells[0]) {
      title = cells[0].textContent.trim();
    }
  });

  block.textContent = '';

  const inner = document.createElement('div');
  inner.className = 'keyfigures-inner';

  if (title) {
    const heading = document.createElement('h2');
    heading.className = 'keyfigures-title';
    heading.textContent = title;
    inner.append(heading);
  }

  if (cards.length) {
    const grid = document.createElement('div');
    grid.className = 'keyfigures-grid';
    cards.forEach((card) => grid.append(card));
    inner.append(grid);
  }

  if (cta) {
    cta.classList.add('keyfigures-cta', 'button');
    const arrow = document.createElement('span');
    arrow.className = 'keyfigures-cta-arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '→';
    cta.append(arrow);
    const wrapper = document.createElement('div');
    wrapper.className = 'keyfigures-cta-wrapper';
    wrapper.append(cta);
    inner.append(wrapper);
  }

  block.append(inner);
}
