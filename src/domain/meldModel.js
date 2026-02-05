/**
 * Meld Model & Metadata Utilities
 * Defines meld structure, inference, and detector functions
 */

import { isWild, isRedThree, isBlackThree } from './meldValidation.js';

// Re-export helpers for convenience
export { isWild, isRedThree, isBlackThree } from './meldValidation.js';

/**
 * Meld metadata structure
 * @typedef {Object} MeldMetadata
 * @property {string} id - Unique identifier (e.g., "meld_1")
 * @property {Array} cards - Card objects in meld
 * @property {'set'|'run'|'wild'|null} type - Inferred meld type
 * @property {'up'|'down'|null} direction - Run direction (up=4-8, down=10-K)
 * @property {'our'|'opponent'|null} team - Team ownership
 * @property {boolean} isCanasta - True if 7+ cards
 */

/**
 * Get cards that are NOT playable in melds
 * (Red 3s and Black 3s are excluded from standard melds)
 */
export function getPlayableCards(allCards) {
  return allCards.filter(card => !isRedThree(card) && !isBlackThree(card));
}

/**
 * Check if all cards in collection are wild (jokers or 2s)
 */
export function isAllWild(cards) {
  if (cards.length === 0) return false;
  return cards.every(card => isWild(card));
}

/**
 * Check if meld has reached canasta status (7+ cards)
 */
export function isCanasta(cards) {
  return cards.length >= 7;
}

/**
 * Determine if meld is a set or run based on card properties
 * @returns {'set'|'run'|'wild'|'mixed'|null}
 */
export function inferMeldType(cards) {
  if (cards.length === 0) return null;
  
  // All wild canasta
  if (isAllWild(cards)) {
    return 'wild';
  }

  // Get natural (non-wild) cards for type detection
  const naturals = cards.filter(card => !isWild(card));
  if (naturals.length === 0) {
    return 'wild'; // All wild
  }

  // Check if all naturals have the same rank (set)
  const firstRank = naturals[0].rank;
  const allSameRank = naturals.every(card => card.rank === firstRank);
  if (allSameRank) {
    return 'set';
  }

  // Check if all naturals have the same suit (potential run)
  const firstSuit = naturals[0].suit;
  const allSameSuit = naturals.every(card => card.suit === firstSuit);
  if (allSameSuit) {
    return 'run';
  }

  // Mixed suit/rank = invalid
  return 'mixed';
}

/**
 * Determine run direction based on natural cards
 * Direction is determined by the STARTING rank (minimum rank):
 * - Starts 4-8: UPWARD only (e.g., 5-6-7-8-9)
 * - Starts 10-K-A: DOWNWARD only (e.g., K-Q-J-10-9)
 * - Cannot start with 3, 2, or 9
 * 
 * @returns {'up'|'down'|'unknown'|null}
 */
export function getRunDirection(cards) {
  if (cards.length === 0) return null;

  // Get natural cards only
  const naturals = cards.filter(card => !isWild(card));
  if (naturals.length < 2) return 'unknown'; // Can't determine with <2 naturals

  // Get min and max ranks (potential starting points)
  const minRank = Math.min(...naturals.map(c => c.rank));
  const maxRank = Math.max(...naturals.map(c => c.rank));

  // Determine direction based on legal starting ranks
  // If minRank is a valid UP start (4-8), always prefer UP
  // Otherwise, if maxRank is a valid DOWN start (10-K-A), use DOWN
  // This prioritizes UP since most sequences start with lower cards

  if (minRank >= 4 && minRank <= 8) {
    // Valid UP start: minRank in 4-8, always prefer UP
    return 'up';
  }

  if (maxRank >= 10 || maxRank === 1) {
    // Valid DOWN start (only if UP doesn't apply)
    return 'down';
  }

  // No valid starting rank found
  return 'unknown';
}

/**
 * Check if card can be first (start) of a run
 * Rules:
 * - Not 3, not 9, not natural 2 (but 2 as wild is OK)
 * - Rank 4-8: direction defaults to UP
 * - Rank 10-K-A: direction defaults to DOWN
 */
export function isValidRunStart(card) {
  if (isWild(card)) return false; // Cannot start with wild
  if (card.rank === 3) return false; // Cannot start with 3
  if (card.rank === 9) return false; // Cannot start with 9
  
  // Valid: 4-8 (up), 10-K-A (down)
  return (card.rank >= 4 && card.rank <= 8) || card.rank >= 10 || card.rank === 1;
}

/**
 * Get expected direction for a run starting at a given rank
 */
export function getExpectedDirection(startRank) {
  if (startRank >= 4 && startRank <= 8) return 'up';   // 4-8 goes up
  if (startRank >= 10 || startRank === 1) return 'down'; // 10-K-A goes down
  return null; // Invalid start rank
}

/**
 * Check if a new card can be added to end of run (by direction)
 * For UP direction (4-8): next rank must be startRank+1, +2, etc.
 * For DOWN direction (10-A): next rank must be startRank-1, -2, etc.
 */
export function canExtendRunEnd(newCard, existingCards, direction) {
  if (existingCards.length === 0) return false; // No existing run to extend

  const naturals = existingCards.filter(c => !isWild(c));
  if (naturals.length === 0) return false; // All wild (shouldn't happen)

  if (direction === 'up') {
    // Find max rank; next card should be one higher or fillable by wild
    const maxRank = Math.max(...naturals.map(c => c.rank));
    return newCard.rank === maxRank + 1 || isWild(newCard);
  }

  if (direction === 'down') {
    // Find min rank; next card should be one lower or fillable by wild
    const minRank = Math.min(...naturals.map(c => c.rank));
    // Special case: going down from 3,2,A(1)
    if (minRank === 2) return false; // Can't go lower than 2
    return newCard.rank === minRank - 1 || isWild(newCard);
  }

  return false;
}

/**
 * Get card rank names for display/errors
 */
export function getRankName(rank) {
  const names = ['', 'Ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'Jack', 'Queen', 'King'];
  return names[rank] || `Rank ${rank}`;
}

/**
 * Sort cards for a run (by direction and position)
 * UP: ascending order (4,5,6,7,8,9)
 * DOWN: descending order (K,Q,J,10,9)
 * Wilds go at end (before the last natural card if filling a gap)
 */
export function sortRunCards(cards, direction = 'up') {
  const naturals = cards.filter(c => !isWild(c));
  const wilds = cards.filter(c => isWild(c));

  if (direction === 'down') {
    naturals.sort((a, b) => b.rank - a.rank);
  } else {
    naturals.sort((a, b) => a.rank - b.rank);
  }

  return [...naturals, ...wilds];
}

/**
 * Create a new meld metadata object
 */
export function createMeld(cards, id = null, team = null) {
  const type = inferMeldType(cards);
  const direction = type === 'run' ? getRunDirection(cards) : null;

  return {
    id: id || `meld_${Date.now()}`,
    cards: cards,
    type: type,
    direction: direction,
    team: team,
    isCanasta: isCanasta(cards)
  };
}

/**
 * Update meld with new cards and recompute metadata
 */
export function updateMeld(meld, newCards) {
  const updated = createMeld([...meld.cards, ...newCards], meld.id, meld.team);
  return updated;
}

/**
 * Check if meld is completely immutable (wild canasta only)
 * - Wild canasta (7+ all-wild): cannot add anything
 * - Natural canasta (7+ with naturals): can add naturals only (not "locked", but restricted)
 */
export function isMeldLocked(meld) {
  return meld.isCanasta && isAllWild(meld.cards);
}
