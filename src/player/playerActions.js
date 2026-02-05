/**
 * Player Actions
 * Functions that perform player actions with validation
 */

import {
  canDrawFromDeck,
  canTakeDiscardPile,
  canMeld,
  canDiscard,
  setPhase,
  TURN_PHASES
} from './playerTurn.js';

import { getSelectedIds, clearSelection } from './playerHand.js';

/**
 * Action: Draw from deck
 * @returns {Object} { ok: boolean, message?: string }
 */
export function actionDrawFromDeck() {
  if (!canDrawFromDeck()) {
    return { ok: false, message: 'Cannot draw from deck.' };
  }
  setPhase(TURN_PHASES.AFTER_DRAW);
  return { ok: true };
}

/**
 * Action: Take from discard pile
 * @returns {Object} { ok: boolean, message?: string }
 */
export function actionTakeDiscardPile() {
  if (!canTakeDiscardPile()) {
    return { ok: false, message: 'Cannot take from discard pile.' };
  }
  setPhase(TURN_PHASES.AFTER_TAKE_DISCARD);
  return { ok: true };
}

/**
 * Action: Meld selected cards
 * @returns {Object} { ok: boolean, message?: string }
 */
export function actionMeldSelected() {
  const selectedIds = getSelectedIds();

  if (selectedIds.length === 0) {
    return { ok: false, message: 'No cards selected to meld' };
  }

  if (!canMeld()) {
    clearSelection();  // Очисти дори при грешка
    return { ok: false, message: 'Cannot meld in current phase' };
  }

  // TODO: Meld validation and logic
  
  clearSelection();  // Очисти при успех
  return { ok: true };
}

/**
 * Action: Discard selected card
 * @returns {Object} { ok: boolean, message?: string }
 */
export function actionDiscardSelected() {
  const selectedIds = getSelectedIds();

  if (!canDiscard(selectedIds.length)) {
    return { ok: false, message: 'Cannot discard: must select exactly 1 card' };
  }

  // TODO: Discard logic
  clearSelection();
  
  return { ok: true };
}
