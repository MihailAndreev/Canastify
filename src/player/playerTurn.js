/**
 * Player Turn State and Phase Management
 * Manages turn phases and validates allowed actions
 */

export const TURN_PHASES = {
  START: 'START',
  BEFORE_DRAW: 'BEFORE_DRAW',
  AFTER_DRAW: 'AFTER_DRAW',
  AFTER_TAKE_DISCARD: 'AFTER_TAKE_DISCARD'
};

export const playerTurnState = {
  isMyTurn: false,
  phase: TURN_PHASES.START
};

/**
 * Start the player's turn
 */
export function startMyTurn() {
  playerTurnState.isMyTurn = true;
  playerTurnState.phase = TURN_PHASES.BEFORE_DRAW;
}

/**
 * End the player's turn
 */
export function endMyTurn() {
  playerTurnState.isMyTurn = false;
  playerTurnState.phase = TURN_PHASES.START;
}

/**
 * Set the current phase
 * @param {string} phase - Phase from TURN_PHASES
 */
export function setPhase(phase) {
  if (Object.values(TURN_PHASES).includes(phase)) {
    playerTurnState.phase = phase;
  }
}

/**
 * Check if drawing from deck is allowed
 * @returns {boolean}
 */
export function canDrawFromDeck() {
  return playerTurnState.isMyTurn && playerTurnState.phase === TURN_PHASES.BEFORE_DRAW;
}

/**
 * Check if taking discard pile is allowed
 * @returns {boolean}
 */
export function canTakeDiscardPile() {
  return playerTurnState.isMyTurn && playerTurnState.phase === TURN_PHASES.BEFORE_DRAW;
}

/**
 * Check if melding is allowed
 * @returns {boolean}
 */
export function canMeld() {
  return playerTurnState.isMyTurn && 
         (playerTurnState.phase === TURN_PHASES.AFTER_DRAW || 
          playerTurnState.phase === TURN_PHASES.AFTER_TAKE_DISCARD);
}

/**
 * Check if discarding is allowed
 * @param {number} selectedCount - Number of selected cards
 * @returns {boolean}
 */
export function canDiscard(selectedCount) {
  return playerTurnState.isMyTurn && 
         (playerTurnState.phase === TURN_PHASES.AFTER_DRAW || 
          playerTurnState.phase === TURN_PHASES.AFTER_TAKE_DISCARD) &&
         selectedCount === 1;
}
