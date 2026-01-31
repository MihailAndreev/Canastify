/**
 * Card Display Helper
 * Displays SVG cards in the game UI
 */

import { getCardSvgPath } from '../../domain/cardMapping.js';

/**
 * Create an img element for a card
 * @param {object} card - Card object with suit and rank
 * @param {object} options - Optional: className, width, height, onClick
 * @returns {HTMLElement} - img element
 */
export function createCardElement(card, options = {}) {
  const img = document.createElement('img');
  img.src = getCardSvgPath(card.suit, card.rank);
  img.alt = `${card.suit} ${card.rank}`;
  img.className = `card-img ${options.className || ''}`;
  
  if (options.width) img.style.width = options.width;
  if (options.height) img.style.height = options.height;
  if (options.onClick) img.addEventListener('click', options.onClick);
  
  return img;
}

/**
 * Create a hand display (multiple cards in a row)
 * @param {array} cards - Array of card objects
 * @param {object} options - Optional configuration
 * @returns {HTMLElement} - div container with card elements
 */
export function createHandDisplay(cards, options = {}) {
  const container = document.createElement('div');
  container.className = 'hand-display';
  
  cards.forEach((card, index) => {
    const cardEl = createCardElement(card, {
      className: options.className || '',
      width: options.width || '60px',
      onClick: (e) => {
        if (options.onCardClick) {
          options.onCardClick(card, index, e);
        }
      }
    });
    // Ensure proper sizing for all cards including jokers
    cardEl.style.objectFit = 'contain';
    cardEl.style.objectPosition = 'center';
    container.appendChild(cardEl);
  });
  
  return container;
}

/**
 * Create a meld display (cards stacked/grouped)
 * @param {array} melds - Array of meld arrays
 * @param {object} options - Optional configuration
 * @returns {HTMLElement} - div container with meld groups
 */
export function createMeldDisplay(melds, options = {}) {
  const container = document.createElement('div');
  container.className = 'meld-display';
  
  melds.forEach((meld, meldIndex) => {
    const meldGroup = document.createElement('div');
    meldGroup.className = 'meld-group';
    
    meld.forEach((card) => {
      const cardEl = createCardElement(card, {
        className: 'meld-card',
        width: options.width || '50px'
      });
      meldGroup.appendChild(cardEl);
    });
    
    container.appendChild(meldGroup);
  });
  
  return container;
}
