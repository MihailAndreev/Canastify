/**
 * Player Hand State and Management
 * Manages the cards in the player's hand and selection state
 */

export const playerHandState = {
  cards: [],
  selectedIds: new Set()
};

/**
 * Set the player's hand cards
 * @param {Array} cardsArray - Array of card objects
 */
export function setHandCards(cardsArray) {
  playerHandState.cards = cardsArray || [];
}

/**
 * Toggle selection status of a card
 * @param {string} cardId - The card ID to toggle
 */
export function toggleSelected(cardId) {
  if (playerHandState.selectedIds.has(cardId)) {
    playerHandState.selectedIds.delete(cardId);
  } else {
    playerHandState.selectedIds.add(cardId);
  }
}

/**
 * Clear all selected cards
 */
export function clearSelection() {
  playerHandState.selectedIds.clear();
}

/**
 * Get array of selected card IDs
 * @returns {Array} Array of selected card IDs
 */
export function getSelectedIds() {
  return Array.from(playerHandState.selectedIds);
}

/**
 * Get count of selected cards
 * @returns {number} Number of selected cards
 */
export function getSelectedCount() {
  return playerHandState.selectedIds.size;
}
