import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Replaces the AstraZeneca brand text link with the inverted logo image.
 * @param {Element} region The brand region
 */
function decorateBrand(region) {
  region.classList.add('footer-brand');
  const link = region.querySelector('a');
  if (link && !link.querySelector('img')) {
    const logo = document.createElement('img');
    logo.src = `${window.hlx.codeBasePath}/icons/astrazeneca-logo-inverted.png`;
    logo.alt = link.textContent.trim() || 'AstraZeneca';
    logo.width = 180;
    logo.height = 46;
    link.textContent = '';
    link.append(logo);
  }
  const logoPara = link ? link.closest('p') : null;
  if (logoPara) logoPara.classList.add('footer-brand-logo');
  // tag the disclaimer (gets the gold divider) and the legal/review lines
  const paras = [...region.querySelectorAll('p')].filter((p) => p !== logoPara);
  if (paras[0]) paras[0].classList.add('footer-brand-disclaimer');
  if (paras[1]) paras[1].classList.add('footer-brand-legal');
}

/**
 * Tags each column link. The design uses plain text links (no chevron).
 * @param {Element} list The ul element
 */
function decorateLinkList(list) {
  list.classList.add('footer-link-list');
  list.querySelectorAll('li > a').forEach((a) => {
    a.classList.add('footer-link');
  });
}

/**
 * Replaces icon spans with inline <svg> so glyphs inherit `currentColor`
 * (white by default, gold on hover) instead of rendering as an isolated
 * black <img>.
 * @param {Element} scope Element containing `span.icon` nodes
 */
async function inlineIcons(scope) {
  const icons = [...scope.querySelectorAll('span.icon')];
  await Promise.all(icons.map(async (span) => {
    const iconClass = [...span.classList].find((c) => c.startsWith('icon-'));
    if (!iconClass) return;
    const name = iconClass.slice(5);
    try {
      const resp = await fetch(`${window.hlx.codeBasePath}/icons/${name}.svg`);
      if (!resp.ok) return;
      const svgText = await resp.text();
      const tmp = document.createElement('div');
      tmp.innerHTML = svgText;
      const svg = tmp.querySelector('svg');
      if (!svg) return;
      svg.removeAttribute('width');
      svg.removeAttribute('height');
      span.textContent = '';
      span.append(svg);
    } catch {
      // leave the span as-is if the fetch fails
    }
  }));
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);

  block.textContent = '';
  const footer = document.createElement('div');
  footer.className = 'footer-inner';
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  const regions = [...footer.children];

  // 1: brand + disclaimer, 2: link columns, 3: connect + newsletter, 4: meta nav
  const [brand, columns, connect, meta] = regions;

  if (brand) decorateBrand(brand);

  if (columns) {
    columns.classList.add('footer-columns');
    // group each heading + following list into a column
    [...columns.querySelectorAll('h4')].forEach((heading) => {
      const col = document.createElement('div');
      col.className = 'footer-col';
      heading.replaceWith(col);
      col.append(heading);
      let next = col.nextElementSibling;
      while (next && next.tagName !== 'H4') {
        const move = next;
        next = next.nextElementSibling;
        col.append(move);
      }
    });
    columns.querySelectorAll('ul').forEach((list) => decorateLinkList(list));
  }

  if (connect) {
    connect.classList.add('footer-connect');
    // group each heading + its following content into a column
    // (Connect with us | Stay updated)
    [...connect.querySelectorAll('h4')].forEach((heading) => {
      const col = document.createElement('div');
      col.className = 'footer-connect-col';
      heading.replaceWith(col);
      col.append(heading);
      let next = col.nextElementSibling;
      while (next && next.tagName !== 'H4') {
        const move = next;
        next = next.nextElementSibling;
        col.append(move);
      }
    });
    const social = connect.querySelector('ul');
    if (social) {
      social.classList.add('footer-social');
      // icon-only links: move the visible label into a visually-hidden span
      social.querySelectorAll('li > a').forEach((a) => {
        [...a.childNodes].forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
            const label = document.createElement('span');
            label.className = 'footer-social-label';
            label.textContent = node.textContent.trim();
            node.replaceWith(label);
          }
        });
      });
    }
    // the paragraph following "Stay updated" holds the Subscribe link
    const subscribe = connect.querySelector('h4 ~ p a');
    if (subscribe) subscribe.classList.add('footer-subscribe');
  }

  if (meta) {
    meta.classList.add('footer-meta');
    const [countrySelector, links, copyright] = [...meta.children];
    if (countrySelector) countrySelector.classList.add('footer-country');
    if (links) links.classList.add('footer-meta-links');
    if (copyright) copyright.classList.add('footer-copyright');
  }

  // group brand + link columns + connect into the top content row
  const content = document.createElement('div');
  content.className = 'footer-content';
  [brand, columns, connect].forEach((region) => {
    if (region) content.append(region);
  });
  footer.prepend(content);

  await inlineIcons(footer);

  block.append(footer);
}
