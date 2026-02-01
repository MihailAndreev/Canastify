/**
 * Player UI Management
 * Handles DOM initialization and updates for player interface
 */

import { playerTurnState, canDrawFromDeck, canTakeDiscardPile, canMeld } from '../player/playerTurn.js';
import { actionDrawFromDeck, actionTakeDiscardPile } from './playerActions.js';

/**
 * Apply turn UI logic to buttons
 * Updates button disabled states based on current turn phase and capabilities
 */
function applyTurnUI({btnDrawDeck, btnTakeDiscard, btnMeld, btnDiscard}) {
  btnDrawDeck.disabled = !(playerTurnState.isMyTurn && canDrawFromDeck());
  btnTakeDiscard.disabled = !(playerTurnState.isMyTurn && canTakeDiscardPile());
  btnMeld.disabled = !(playerTurnState.isMyTurn && canMeld());
  btnDiscard.disabled = true;  // keep disabled for now (will be conditional after selection)

  console.log('[player-ui]', 'phase=', playerTurnState.phase, 'buttons updated');
}

/**
 * Refresh UI by applying turn state to all buttons
 */
function refreshUI(buttons) {
  applyTurnUI(buttons);
}

/**
 * Initialize player UI
 * Sets up DOM elements and event listeners
 */
export function initPlayerUI() {
  console.log('Initializing player UI...');
  
  const buttons = {
    btnDrawDeck: document.getElementById('btnDrawDeck'),
    btnTakeDiscard: document.getElementById('btnTakeDiscard'),
    btnMeld: document.getElementById('btnMeld'),
    btnDiscard: document.getElementById('btnDiscard')
  };

  const missingButtons = Object.entries(buttons).filter(([key, value]) => !value).map(([key]) => key);
  if (missingButtons.length > 0) {
    console.warn('Missing buttons:', missingButtons.join(', '));
    return;
  }

  // Initial UI application
  refreshUI(buttons);

  // Attach click listeners
  buttons.btnDrawDeck.addEventListener('click', () => {
    if (buttons.btnDrawDeck.disabled) return;
    const result = actionDrawFromDeck();
    refreshUI(buttons);
  });

  buttons.btnTakeDiscard.addEventListener('click', () => {
    if (buttons.btnTakeDiscard.disabled) return;
    const result = actionTakeDiscardPile();
    refreshUI(buttons);
  });
}
