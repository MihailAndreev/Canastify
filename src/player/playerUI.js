/**
 * Player UI Management
 * Handles DOM initialization and updates for player interface
 */

import { playerTurnState, canDrawFromDeck, canTakeDiscardPile, canMeld, canDiscard } from '../player/playerTurn.js';
import { actionDrawFromDeck, actionTakeDiscardPile } from './playerActions.js';
import { toggleSelected, playerHandState, getSelectedCount, clearSelection } from './playerHand.js';

// Module-scoped variable to store current buttons for UI refresh
let currentButtons = null;

/**
 * Apply turn UI logic to buttons
 * Updates button disabled states based on current turn phase and capabilities
 */
function applyTurnUI({btnDrawDeck, btnTakeDiscard, btnMeld, btnDiscard}) {
  btnDrawDeck.disabled = !(playerTurnState.isMyTurn && canDrawFromDeck());
  btnTakeDiscard.disabled = !(playerTurnState.isMyTurn && canTakeDiscardPile());
  btnMeld.disabled = !(playerTurnState.isMyTurn && canMeld());
  btnDiscard.disabled = !(playerTurnState.isMyTurn && canDiscard(getSelectedCount()));

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

  // Store buttons in module-scoped variable for refresh
  currentButtons = buttons;

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

  // Attach event delegation for card selection in player's hand
  const playerHandContainer = document.getElementById('player-hand');
  if (playerHandContainer) {
    playerHandContainer.addEventListener('click', (event) => {
      // Find the closest element with data-card-id attribute
      const cardElement = event.target.closest('[data-card-id]');
      
      if (cardElement) {
        const cardId = cardElement.dataset.cardId;
        
        // Toggle selection in state
        toggleSelected(cardId);
        
        // Toggle CSS class on the card element
        cardElement.classList.toggle('card-selected');
        
        // Log current selection count
        console.log('[hand]', 'selected=', playerHandState.selectedIds.size);
        
        // Refresh UI so Discard button toggles correctly
        if (currentButtons) {
          refreshUI(currentButtons);
        }
      }
    });

    playerHandContainer.addEventListener('hand:reorder', () => {
      clearSelection();
      playerHandContainer.querySelectorAll('.card-selected').forEach((el) => {
        el.classList.remove('card-selected');
      });

      if (currentButtons) {
        refreshUI(currentButtons);
      }
    });
  } else {
    console.warn('Player hand container (#player-hand) not found');
  }
}
