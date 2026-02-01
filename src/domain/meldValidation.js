/**
 * Meld Validation for Bulgarian Canasta
 * Implements game rules for valid melds (sets and runs)
 */

import { SUITS, JOKER } from './cardMapping.js';

/**
 * Check if a card is a wild card (Joker or 2)
 * @param {object} card - Card object
 * @returns {boolean}
 */
export function isWild(card) {
  return card.suit === JOKER || card.rank === 2;
}

/**
 * Check if a card is a red three (3 of Heart or Diamond)
 * @param {object} card - Card object
 * @returns {boolean}
 */
export function isRedThree(card) {
  return card.rank === 3 && (card.suit === SUITS.HEART || card.suit === SUITS.DIAMOND);
}

/**
 * Check if a card is a black three (3 of Club or Spade)
 * @param {object} card - Card object
 * @returns {boolean}
 */
export function isBlackThree(card) {
  return card.rank === 3 && (card.suit === SUITS.CLUB || card.suit === SUITS.SPADE);
}

/**
 * Validate a SET meld (same rank cards)
 * Rules:
 * - Min 3 cards of same rank
 * - Max 3 wild cards
 * - Can't start with wild (need at least 2 originals first)
 * - Consecutive wilds must be less than preceding originals
 * 
 * @param {array} cards - Array of card objects
 * @returns {object} - { valid: boolean, reason: string }
 */
export function validateSet(cards) {
  if (!cards || cards.length < 3) {
    return { valid: false, reason: 'Set needs minimum 3 cards' };
  }

  // Separate wild and natural cards
  const wilds = cards.filter(isWild);
  const naturals = cards.filter(c => !isWild(c));

  // Can't have more than 3 wilds
  if (wilds.length > 3) {
    return { valid: false, reason: 'Maximum 3 wild cards allowed' };
  }

  // Need at least 2 natural cards to start
  if (naturals.length < 2) {
    return { valid: false, reason: 'Need at least 2 natural cards' };
  }

  // All natural cards must be same rank
  const ranks = new Set(naturals.map(c => c.rank));
  if (ranks.size > 1) {
    return { valid: false, reason: 'Natural cards must be same rank' };
  }

  return { valid: true, reason: 'Valid set' };
}

/**
 * Validate a RUN meld (sequential cards of same suit)
 * Rules:
 * - Min 3 consecutive cards from same suit
 * - Valid ranks: 4 to A (3 doesn't participate)
 * - 9 cannot be start or end
 * - A is only valid after K
 * - Max 3 wild cards
 * - Can't start with wild
 * - Consecutive wilds must be less than preceding originals
 * 
 * @param {array} cards - Array of card objects
 * @returns {object} - { valid: boolean, reason: string }
 */
export function validateRun(cards) {
  if (!cards || cards.length < 3) {
    return { valid: false, reason: 'Run needs minimum 3 cards' };
  }

  // Separate wild and natural cards
  const wilds = cards.filter(isWild);
  const naturals = cards.filter(c => !isWild(c));

  // Can't have more than 3 wilds
  if (wilds.length > 3) {
    return { valid: false, reason: 'Maximum 3 wild cards allowed' };
  }

  // Need at least 2 natural cards to start
  if (naturals.length < 2) {
    return { valid: false, reason: 'Need at least 2 natural cards' };
  }

  // All natural cards must be same suit
  const suits = new Set(naturals.map(c => c.suit));
  if (suits.size > 1) {
    return { valid: false, reason: 'Natural cards must be same suit' };
  }

  // Check ranks are sequential (allowing wilds as placeholders)
  const sortedNaturals = [...naturals].sort((a, b) => a.rank - b.rank);
  
  // Check no rank 3
  if (sortedNaturals.some(c => c.rank === 3)) {
    return { valid: false, reason: 'Rank 3 cannot be in runs' };
  }

  // Check 9 is not at edges if present
  const hasNine = sortedNaturals.some(c => c.rank === 9);
  if (hasNine) {
    const firstRank = sortedNaturals[0].rank;
    const lastRank = sortedNaturals[sortedNaturals.length - 1].rank;
    if (firstRank === 9 || lastRank === 9) {
      return { valid: false, reason: '9 cannot be start or end of run' };
    }
  }

  // Check A only after K (A=1, K=13)
  const hasAce = sortedNaturals.some(c => c.rank === 1);
  if (hasAce) {
    const hasKing = sortedNaturals.some(c => c.rank === 13);
    if (!hasKing) {
      return { valid: false, reason: 'Ace only valid after King' };
    }
  }

  // Verify cards are sequential (accounting for wilds filling gaps)
  // Calculate expected total span
  const minRank = sortedNaturals[0].rank;
  const maxRank = sortedNaturals[sortedNaturals.length - 1].rank;
  const expectedSpan = maxRank - minRank + 1;
  const totalCards = naturals.length + wilds.length;
  
  // Total cards must equal the span (each position filled by natural or wild)
  if (totalCards < expectedSpan) {
    return { valid: false, reason: 'Cards are not sequential (gaps cannot be filled by wilds)' };
  }
  
  // Wilds can only fill gaps, not extend beyond natural cards
  const wildcardGaps = expectedSpan - naturals.length;
  if (wilds.length > wildcardGaps) {
    return { valid: false, reason: 'Too many wild cards for the sequence' };
  }

  return { valid: true, reason: 'Valid run' };
}

/**
 * Determine if cards form a set or run, and validate
 * @param {array} cards - Array of card objects
 * @returns {object} - { valid: boolean, type: 'set'|'run'|null, reason: string }
 */
export function validateMeld(cards) {
  if (!cards || cards.length < 3) {
    return { valid: false, type: null, reason: 'Meld needs minimum 3 cards' };
  }

  // Can't meld red or black threes
  if (cards.some(isRedThree)) {
    return { valid: false, type: null, reason: 'Red threes cannot be melded' };
  }
  if (cards.some(isBlackThree)) {
    return { valid: false, type: null, reason: 'Black threes cannot be melded' };
  }

  // Try as set first
  const setResult = validateSet(cards);
  if (setResult.valid) {
    return { valid: true, type: 'set', reason: setResult.reason };
  }

  // Try as run
  const runResult = validateRun(cards);
  if (runResult.valid) {
    return { valid: true, type: 'run', reason: runResult.reason };
  }

  // Neither valid
  return { 
    valid: false, 
    type: null, 
    reason: `Not a valid set or run. Set: ${setResult.reason}. Run: ${runResult.reason}` 
  };
}

/**
 * Check if new cards can be added to existing meld
 * @param {array} existingCards - Cards already in meld
 * @param {array} newCards - Cards to add
 * @returns {object} - { valid: boolean, reason: string }
 */
export function canAddToMeld(existingCards, newCards) {
  if (!existingCards || existingCards.length === 0) {
    // Empty meld - validate new cards as new meld
    return validateMeld(newCards);
  }

  // Combine and validate
  const combined = [...existingCards, ...newCards];
  const result = validateMeld(combined);
  
  if (!result.valid) {
    return { valid: false, reason: `Cannot add cards: ${result.reason}` };
  }

  // Check wild card limits after addition
  const totalWilds = combined.filter(isWild).length;
  if (totalWilds > 3) {
    return { valid: false, reason: 'Would exceed 3 wild cards limit' };
  }

  return { valid: true, reason: 'Cards can be added to meld' };
}
