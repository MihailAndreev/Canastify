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
  img.src = card.svgPath || getCardSvgPath(card.suit, card.rank);
  img.alt = `${card.suit} ${card.rank}`;
  img.className = `card-img ${options.className || ''}`;
  
  // Add stable card identifier
  if (card.id) {
    img.dataset.cardId = card.id;
  }
  
  if (options.width) img.style.width = options.width;
  if (options.height) img.style.height = options.height;
  if (options.onClick) img.addEventListener('click', options.onClick);
  
  return img;
}

/**
 * Calculate dynamic overlap percentage based on number of cards
 * If cards fit without overlap, return 0. Otherwise, calculate overlap
 * to fill the available width.
 * 
 * Logic: 
 * - If cards fit in full size (94.5px each) -> overlap = 0
 * - Otherwise: overlap increases to fit all cards in fixed width
 * - Max cards per row: 35 (original spec) but adaptive to actual width
 * 
 * @param {number} cardCount - Total number of cards to display
 * @param {number} containerWidth - Available width for hand cards (px)
 * @param {number} cardWidth - Width of single card (px)
 * @returns {number} - Overlap percentage (0 to 0.95)
 */
function calculateDynamicOverlap(cardCount, containerWidth, cardWidth = 94.5) {
  if (cardCount === 0) return 0;
  
  // If single card, no overlap needed
  if (cardCount === 1) return 0;
  
  // Calculate space needed with no overlap
  const fullWidth = cardCount * cardWidth;
  
  // If all cards fit without overlap, use no overlap
  if (fullWidth <= containerWidth) {
    return 0;
  }
  
  // Calculate required offset per card to fit all in container
  // Formula: totalWidth = cardWidth * (1 + (cardCount - 1) * (1 - overlap))
  // Solving for overlap:
  // containerWidth = cardWidth * (1 + (cardCount - 1) * (1 - overlap))
  // containerWidth / cardWidth = 1 + (cardCount - 1) * (1 - overlap)
  // (containerWidth / cardWidth - 1) / (cardCount - 1) = 1 - overlap
  // overlap = 1 - ((containerWidth / cardWidth - 1) / (cardCount - 1))
  
  const ratio = containerWidth / cardWidth;
  const overlap = 1 - ((ratio - 1) / (cardCount - 1));
  
  // Clamp between 0 and 0.95 (max 95% overlap)
  return Math.max(0, Math.min(0.95, overlap));
}

/**
 * Separate red threes from other cards
 * Red threes: 3 of HEART and 3 of DIAMOND
 * 
 * @param {array} cards - All cards
 * @returns {object} - { redThrees: [], otherCards: [] }
 */
function separateRedThrees(cards) {
  const redThrees = [];
  const otherCards = [];
  
  cards.forEach((card) => {
    // Check if it's a red three (3 of HEART or 3 of DIAMOND)
    if (card.rank === 3 && (card.suit === 'HEART' || card.suit === 'DIAMOND')) {
      if (redThrees.length < 4) {
        redThrees.push(card);
      } else {
        otherCards.push(card);
      }
    } else {
      otherCards.push(card);
    }
  });
  
  return { redThrees, otherCards };
}

/**
 * Distribute cards across two rows
 * Row 1 = first 35 cards, Row 2 = remaining cards
 * 
 * @param {array} cards - Cards to distribute
 * @returns {object} - { row1: [], row2: [] }
 */
function distributeCardsToRows(cards) {
  const ROW1_SIZE = 35;
  return {
    row1: cards.slice(0, ROW1_SIZE),
    row2: cards.slice(ROW1_SIZE)
  };
}

/**
 * Create a hand display (multiple cards in two rows with dynamic overlap)
 * 
 * Features:
 * - Red threes fixed on left (4 positions max, 85% overlap)
 * - Main hand cards in two overlapping rows
 * - Dynamic overlap based on card count
 * - Max 70 cards supported
 * 
 * @param {array} cards - Array of card objects
 * @param {object} options - Optional configuration
 * @returns {HTMLElement} - div container with card elements
 */
export function createHandDisplay(cards, options = {}) {
  const container = document.createElement('div');
  container.className = 'hand-display';

  let draggedCardEl = null;
  let draggedCardEls = [];
  let dragSourceRow = null;
  const dropIndicators = new Map();
  
  // Limit to 70 cards max
  const validCards = cards.slice(0, 70);
  
  // Separate red threes from other cards
  const { redThrees, otherCards } = separateRedThrees(validCards);
  
  const CARD_WIDTH = 94.5;
  const RED_THREE_OVERLAP = 0.85;
  
  /**
   * Recalculate and reposition cards based on current container width
   */
  function updateCardPositions() {
    // Calculate available width for hand cards
    const RED_THREE_SECTION_WIDTH = redThrees.length > 0 
      ? CARD_WIDTH + (Math.max(0, redThrees.length - 1) * CARD_WIDTH * (1 - RED_THREE_OVERLAP))
      : 0;
    const SEPARATOR_WIDTH = redThrees.length > 0 ? 9.45 : 0;
    const RIGHT_PADDING_WIDTH = 150;
    const PADDING = 24; // Left and right padding
    
    const containerInnerWidth = container.offsetWidth - PADDING - RED_THREE_SECTION_WIDTH - SEPARATOR_WIDTH - RIGHT_PADDING_WIDTH;
    
    // Get row elements
    const row1 = container.querySelector('.hand-row.row-1');
    const row2 = container.querySelector('.hand-row.row-2');
    
    if (row1) {
      const row1Cards = row1.querySelectorAll('.hand-card');
      const overlap1 = calculateDynamicOverlap(row1Cards.length, containerInnerWidth, CARD_WIDTH);
      const cardOffset1 = CARD_WIDTH * (1 - overlap1);
      
      row1Cards.forEach((cardEl, index) => {
        cardEl.style.left = `${index * cardOffset1}px`;
      });
    }
    
    if (row2) {
      const row2Cards = row2.querySelectorAll('.hand-card');
      const overlap2 = calculateDynamicOverlap(row2Cards.length, containerInnerWidth, CARD_WIDTH);
      const cardOffset2 = CARD_WIDTH * (1 - overlap2);
      
      row2Cards.forEach((cardEl, index) => {
        cardEl.style.left = `${index * cardOffset2}px`;
      });
    }
  }
  
  // Create red threes section (ALWAYS - even if empty)
  const redThreesSection = document.createElement('div');
  redThreesSection.className = 'red-threes-section';
  
  // Create 4 fixed slots for red threes
  for (let i = 0; i < 4; i++) {
    const slot = document.createElement('div');
    slot.className = 'red-three-slot';
    
    // Add card if available
    if (i < redThrees.length) {
      const cardEl = createCardElement(redThrees[i], {
        className: 'red-three-card',
        onClick: (e) => {
          if (options.onCardClick) {
            const cardIndex = validCards.indexOf(redThrees[i]);
            options.onCardClick(redThrees[i], cardIndex, e);
          }
        }
      });
      
      slot.appendChild(cardEl);
    }
    // Slot remains empty if no card available
    
    redThreesSection.appendChild(slot);
  }
  
  container.appendChild(redThreesSection);
  
  // Add separator (always present)
  const separator = document.createElement('div');
  separator.className = 'hand-cards-separator';
  container.appendChild(separator);
  
  // Create hand cards wrapper
  const handWrapper = document.createElement('div');
  handWrapper.className = 'hand-cards-wrapper';
  
  // Distribute cards to two rows
  const { row1, row2 } = distributeCardsToRows(otherCards);
  
  // Create row 1
  const rowEl1 = document.createElement('div');
  rowEl1.className = 'hand-row row-1';

  function getDropIndicator(rowEl) {
    if (!dropIndicators.has(rowEl)) {
      const indicator = document.createElement('div');
      indicator.className = 'hand-drop-indicator';
      indicator.style.display = 'none';
      rowEl.appendChild(indicator);
      dropIndicators.set(rowEl, indicator);
    }
    return dropIndicators.get(rowEl);
  }

  function hideDropIndicator(rowEl) {
    if (rowEl) {
      const indicator = dropIndicators.get(rowEl);
      if (indicator) indicator.style.display = 'none';
      return;
    }

    dropIndicators.forEach((indicator) => {
      indicator.style.display = 'none';
    });
  }

  function getInsertBeforeEl(rowEl, clientX) {
    const cards = Array.from(rowEl.querySelectorAll('.hand-card'))
      .filter((el) => !draggedCardEls.includes(el));
    const rowRect = rowEl.getBoundingClientRect();

    for (const cardEl of cards) {
      const rect = cardEl.getBoundingClientRect();
      const midpoint = rect.left + rect.width / 2;
      if (clientX < midpoint) {
        return { beforeEl: cardEl, left: rect.left - rowRect.left };
      }
    }

    if (cards.length > 0) {
      const lastRect = cards[cards.length - 1].getBoundingClientRect();
      return { beforeEl: null, left: lastRect.right - rowRect.left };
    }

    return { beforeEl: null, left: 0 };
  }

  function attachDragHandlers(rowEl) {
    rowEl.addEventListener('dragover', (event) => {
      if (!draggedCardEl || draggedCardEls.length === 0) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';

      const { beforeEl, left } = getInsertBeforeEl(rowEl, event.clientX);
      rowEl._dropBeforeEl = beforeEl;

      const indicator = getDropIndicator(rowEl);
      indicator.style.left = `${Math.max(0, left)}px`;
      indicator.style.display = 'block';
    });

    rowEl.addEventListener('drop', (event) => {
      if (!draggedCardEl || draggedCardEls.length === 0) return;
      event.preventDefault();

      const beforeEl = rowEl._dropBeforeEl || null;
      if (beforeEl) {
        draggedCardEls.forEach((cardEl) => {
          rowEl.insertBefore(cardEl, beforeEl);
        });
      } else {
        draggedCardEls.forEach((cardEl) => {
          rowEl.appendChild(cardEl);
        });
      }

      draggedCardEls.forEach((cardEl) => {
        cardEl.classList.remove('card-selected');
      });

      hideDropIndicator(rowEl);
      updateCardPositions();

      container.dispatchEvent(new CustomEvent('hand:reorder', {
        bubbles: true,
        detail: {
          cardIds: draggedCardEls
            .map((cardEl) => cardEl.dataset.cardId)
            .filter(Boolean)
        }
      }));
    });

    rowEl.addEventListener('dragleave', (event) => {
      if (!rowEl.contains(event.relatedTarget)) {
        hideDropIndicator(rowEl);
      }
    });
  }

  function applyDraggable(cardEl) {
    cardEl.draggable = true;

    cardEl.addEventListener('dragstart', (event) => {
      draggedCardEl = cardEl;
      cardEl.classList.add('is-dragging');
      dragSourceRow = cardEl.closest('.hand-row');

      if (cardEl.classList.contains('card-selected') && dragSourceRow) {
        draggedCardEls = Array.from(dragSourceRow.querySelectorAll('.hand-card.card-selected'));
      } else {
        draggedCardEls = [cardEl];
      }

      draggedCardEls.forEach((el) => el.classList.add('is-dragging'));

      event.dataTransfer.effectAllowed = 'move';
      if (cardEl.dataset.cardId) {
        event.dataTransfer.setData('text/plain', cardEl.dataset.cardId);
      } else {
        event.dataTransfer.setData('text/plain', 'hand-card');
      }
    });

    cardEl.addEventListener('dragend', () => {
      draggedCardEls.forEach((el) => el.classList.remove('is-dragging'));
      draggedCardEl = null;
      draggedCardEls = [];
      dragSourceRow = null;
      hideDropIndicator();
    });
  }

  attachDragHandlers(rowEl1);
  
  row1.forEach((card) => {
    const cardEl = createCardElement(card, {
      className: 'hand-card row-1-card',
      onClick: (e) => {
        if (options.onCardClick) {
          const cardIndex = validCards.indexOf(card);
          options.onCardClick(card, cardIndex, e);
        }
      }
    });

    applyDraggable(cardEl);
    
    // Initial position (will be updated by updateCardPositions)
    cardEl.style.width = `${CARD_WIDTH}px`;
    cardEl.style.height = '135px';
    
    rowEl1.appendChild(cardEl);
  });
  
  handWrapper.appendChild(rowEl1);
  
  // Create row 2 (if cards exist)
  if (row2.length > 0) {
    const rowEl2 = document.createElement('div');
    rowEl2.className = 'hand-row row-2';

    attachDragHandlers(rowEl2);
    
    row2.forEach((card) => {
      const cardEl = createCardElement(card, {
        className: 'hand-card row-2-card',
        onClick: (e) => {
          if (options.onCardClick) {
            const cardIndex = validCards.indexOf(card);
            options.onCardClick(card, cardIndex, e);
          }
        }
      });

      applyDraggable(cardEl);
      
      // Initial position (will be updated by updateCardPositions)
      cardEl.style.width = `${CARD_WIDTH}px`;
      cardEl.style.height = '135px';
      
      rowEl2.appendChild(cardEl);
    });
    
    handWrapper.appendChild(rowEl2);
  }
  
  container.appendChild(handWrapper);
  
  // Add right padding
  const rightPadding = document.createElement('div');
  rightPadding.className = 'right-padding';
  container.appendChild(rightPadding);
  
  // Store data for responsive updates
  container.dataset.cardCount = validCards.length;
  container.dataset.redThreeCount = redThrees.length;
  
  // Update positions once DOM is rendered
  requestAnimationFrame(() => {
    updateCardPositions();
  });
  
  // Set up ResizeObserver to handle window resizing
  const resizeObserver = new ResizeObserver(() => {
    updateCardPositions();
  });
  resizeObserver.observe(container);
  
  // Store observer for cleanup if needed
  container._resizeObserver = resizeObserver;
  
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
