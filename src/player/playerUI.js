/**
 * Player UI Management
 * Handles DOM initialization and updates for player interface
 */

import { playerTurnState, canDrawFromDeck, canTakeDiscardPile, canMeld } from '../player/playerTurn.js';

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

  // Internal function to apply turn UI logic
  function applyTurnUI({btnDrawDeck, btnTakeDiscard, btnMeld, btnDiscard}) {
    btnDrawDeck.disabled = !(playerTurnState.isMyTurn && canDrawFromDeck());
    btnTakeDiscard.disabled = !(playerTurnState.isMyTurn && canTakeDiscardPile());
    btnMeld.disabled = !(playerTurnState.isMyTurn && canMeld());
    btnDiscard.disabled = true;  // keep disabled for now (will be conditional after selection)

    console.log('[player-ui]', 'phase=', playerTurnState.phase, 'buttons updated');
  }

  applyTurnUI(buttons);
}
