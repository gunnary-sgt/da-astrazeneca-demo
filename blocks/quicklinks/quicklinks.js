/**
 * AstraZeneca quick-links block.
 * A horizontal row of link cards, each showing a short label and a trailing
 * arrow. The whole card is a single link.
 *
 * Content model — one link per row (or a single list of links):
 *   | quicklinks                        |
 *   | [Explore Growth Strategy](/…)     |
 *   | [Innovation Pipeline](/…)         |
 *   | …                                 |
 */

/**
 * Builds a single link card from an anchor.
 * @param {HTMLAnchorElement} anchor The source anchor
 * @returns {HTMLAnchorElement} The decorated card link
 */
function buildCard(anchor) {
  const card = document.createElement('a');
  card.className = 'quicklinks-card';
  card.href = anchor.getAttribute('href');
  if (anchor.title) card.title = anchor.title;

  const label = document.createElement('span');
  label.className = 'quicklinks-label';
  label.textContent = anchor.textContent.trim();

  const arrow = document.createElement('span');
  arrow.className = 'quicklinks-arrow';
  arrow.setAttribute('aria-hidden', 'true');
  arrow.textContent = '→';

  card.append(label, arrow);
  return card;
}

/**
 * loads and decorates the quick-links block
 * @param {Element} block The quicklinks block element
 */
export default function decorate(block) {
  const anchors = [...block.querySelectorAll('a')];

  block.textContent = '';

  const list = document.createElement('ul');
  list.className = 'quicklinks-list';

  anchors.forEach((anchor) => {
    const item = document.createElement('li');
    item.append(buildCard(anchor));
    list.append(item);
  });

  block.append(list);
}
