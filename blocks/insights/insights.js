import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * AstraZeneca "Explore the trends" insights teaser block.
 * Content model (rows):
 *   1 cell, no image  -> section title
 *   image | body      -> teaser card (image + heading/description/link)
 */

/**
 * loads and decorates the insights block
 * @param {Element} block The insights block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  let title;
  const cards = [];

  rows.forEach((row) => {
    const cells = [...row.children];
    const picture = row.querySelector('picture');
    if (!picture && cells.length === 1) {
      title = cells[0].textContent.trim();
      return;
    }
    cards.push(row);
  });

  block.textContent = '';

  const inner = document.createElement('div');
  inner.className = 'insights-inner';

  if (title) {
    const heading = document.createElement('h2');
    heading.className = 'insights-title';
    heading.textContent = title;
    inner.append(heading);
  }

  const grid = document.createElement('div');
  grid.className = 'insights-grid';

  cards.forEach((row) => {
    const cells = [...row.children];
    const imageCell = cells.find((c) => c.querySelector('picture')) || cells[0];
    const bodyCell = cells.find((c) => c !== imageCell) || cells[1];

    const card = document.createElement('article');
    card.className = 'insights-card';

    // image
    const media = document.createElement('div');
    media.className = 'insights-card-image';
    const img = imageCell.querySelector('img');
    if (img) {
      media.append(createOptimizedPicture(img.src, img.alt, false, [{ width: '800' }]));
    }
    card.append(media);

    // body
    const body = document.createElement('div');
    body.className = 'insights-card-body';

    const texts = document.createElement('div');
    texts.className = 'insights-card-texts';

    const heading = bodyCell.querySelector('h1, h2, h3, h4, h5, h6');
    const link = bodyCell.querySelector('a');
    const paras = [...bodyCell.querySelectorAll('p')].filter((p) => !p.querySelector('a'));

    if (heading) {
      heading.className = 'insights-card-title';
      texts.append(heading);
    }
    paras.forEach((p) => {
      p.classList.add('insights-card-desc');
      texts.append(p);
    });
    body.append(texts);

    const separator = document.createElement('div');
    separator.className = 'insights-card-separator';
    body.append(separator);

    if (link) {
      link.classList.add('insights-card-cta');
      const arrow = document.createElement('span');
      arrow.className = 'insights-card-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '→';
      link.append(arrow);
      const ctaWrap = document.createElement('p');
      ctaWrap.className = 'insights-card-cta-wrapper';
      ctaWrap.append(link);
      body.append(ctaWrap);
    }

    card.append(body);
    grid.append(card);
  });

  inner.append(grid);
  block.append(inner);
}
