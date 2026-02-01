/**
 * Game Page Entry Point
 * 
 * Manual test:
 * - Open http://localhost:5173/pages/game/game.html in dev server
 * - Check console for: [game] game.js loaded and [game] DOMContentLoaded
 * - Verify no new errors appear
 * - Check console for player turn state: isMyTurn === true, phase === 'BEFORE_DRAW'
 */

'use strict';

import { startMyTurn, playerTurnState, TURN_PHASES } from '../../src/player/playerTurn.js';

console.log('[game] game.js loaded');

document.addEventListener('DOMContentLoaded', () => {
  console.log('[game] DOMContentLoaded');
  
  // Initialize player turn state
  startMyTurn();
  playerTurnState.phase = TURN_PHASES.BEFORE_DRAW;
  console.log('[player]', playerTurnState);
});
