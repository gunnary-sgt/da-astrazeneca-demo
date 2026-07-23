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
    logo.width = 160;
    logo.height = 41;
    link.textContent = '';
    link.append(logo);
  }
}

/**
 * Turns each list item link in a link column into a chevron row.
 * @param {Element} list The ul element
 */
function decorateChevronList(list) {
  list.classList.add('footer-link-list');
  list.querySelectorAll('li > a').forEach((a) => {
    a.classList.add('footer-link');
    const chevron = document.createElement('span');
    chevron.className = 'footer-link-chevron';
    chevron.setAttribute('aria-hidden', 'true');
    chevron.textContent = '›';
    a.append(chevron);
  });
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
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  const regions = [...footer.children];

  // 1: brand + disclaimer, 2: link columns, 3: connect + newsletter, 4: meta nav
  const [brand, columns, connect, meta] = regions;

  if (brand) decorateBrand(brand);

  if (columns) {
    columns.classList.add('footer-columns');
    columns.querySelectorAll('ul').forEach((list) => decorateChevronList(list));
  }

  if (connect) {
    connect.classList.add('footer-connect');
    const social = connect.querySelector('ul');
    if (social) social.classList.add('footer-social');
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

  block.append(footer);
}
