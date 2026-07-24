import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Replaces the brand text link with the inverted AstraZeneca logo.
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
  const paras = [...region.querySelectorAll('p')].filter((p) => p !== logoPara);
  if (paras[0]) paras[0].classList.add('footer-brand-disclaimer');
  if (paras[1]) paras[1].classList.add('footer-brand-legal');
}

/**
 * Groups each heading + its following content into a column wrapper.
 * @param {Element} region The region containing h4 headings
 * @param {string} colClass Class to apply to each generated column
 */
function groupColumns(region, colClass) {
  [...region.querySelectorAll('h4')].forEach((heading) => {
    const col = document.createElement('div');
    col.className = colClass;
    heading.replaceWith(col);
    col.append(heading);
    let next = col.nextElementSibling;
    while (next && next.tagName !== 'H4') {
      const move = next;
      next = next.nextElementSibling;
      col.append(move);
    }
  });
}

/**
 * Replaces `span.icon` nodes with inline <svg> so glyphs inherit currentColor.
 * @param {Element} scope Element containing icon spans
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
      const tmp = document.createElement('div');
      tmp.innerHTML = await resp.text();
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

  const [brand, columns, connect, meta] = [...footer.children];

  if (brand) decorateBrand(brand);

  if (columns) {
    columns.classList.add('footer-columns');
    groupColumns(columns, 'footer-col');
    columns.querySelectorAll('ul').forEach((list) => list.classList.add('footer-link-list'));
    columns.querySelectorAll('li > a').forEach((a) => a.classList.add('footer-link'));
  }

  if (connect) {
    connect.classList.add('footer-connect');
    groupColumns(connect, 'footer-connect-col');
    const social = connect.querySelector('ul');
    if (social) {
      social.classList.add('footer-social');
      social.querySelectorAll('li > a').forEach((a) => {
        // move the visible text label into a visually-hidden span (icon-only)
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
    const subscribe = [...connect.querySelectorAll('p a')].find((a) => !a.closest('.footer-social'));
    if (subscribe && !subscribe.querySelector('.footer-subscribe-arrow')) {
      subscribe.classList.add('footer-subscribe');
      const arrow = document.createElement('span');
      arrow.className = 'footer-subscribe-arrow';
      arrow.setAttribute('aria-hidden', 'true');
      arrow.textContent = '→';
      subscribe.append(arrow);
    }
  }

  if (meta) {
    meta.classList.add('footer-meta');
    // the three paragraphs live inside a default-content-wrapper
    const metaScope = meta.querySelector('.default-content-wrapper') || meta;
    const [country, links, copyright] = [...metaScope.children];
    if (country) {
      country.classList.add('footer-country');
      const link = country.querySelector('a');
      if (link) {
        const globe = document.createElement('span');
        globe.className = 'icon icon-globe footer-country-globe';
        link.prepend(globe);
        const chevron = document.createElement('span');
        chevron.className = 'footer-country-chevron';
        chevron.setAttribute('aria-hidden', 'true');
        link.append(chevron);
      }
    }
    if (links) links.classList.add('footer-meta-links');
    if (copyright) copyright.classList.add('footer-copyright');
  }

  // group brand + columns + connect into the top content row
  const content = document.createElement('div');
  content.className = 'footer-content';
  [brand, columns, connect].forEach((region) => {
    if (region) content.append(region);
  });
  footer.prepend(content);

  await inlineIcons(footer);

  block.append(footer);
}
