/**
 * Meld Validation for Bulgarian Canasta
 * Implements game rules for valid melds (sets and runs)
 */

import { SUITS, JOKER } from './cardMapping.js';
import { isAllWild, isCanasta, getRunDirection } from './meldModel.js';

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

// ============================================
// PHASE 2: Critical Validation Functions
// ============================================

/**
 * Validate all-wild canasta immutability (§3.2, §6.1)
 * Rule: Wild canasta (7+ all-wild cards) cannot be modified
 * 
 * @param {array} newCards - Cards attempting to add
 * @param {array} existingCards - Current meld cards
 * @returns {object} - { valid: boolean, errorCode: string|null, details: string|null }
 */
export function validateWildCanasta(newCards, existingCards) {
  if (!existingCards || existingCards.length < 7) {
    return { valid: true, errorCode: null, details: null };
  }

  // Check if existing meld is an all-wild canasta
  if (isAllWild(existingCards)) {
    return {
      valid: false,
      errorCode: 'CANNOT_ADD_TO_WILD_CANASTA',
      details: 'Cannot modify a completed wild canasta (immutable)'
    };
  }

  return { valid: true, errorCode: null, details: null };
}

/**
 * Check if a card can extend a run at the END (prevents prepending)
 * UP direction: new card rank must be maxRank + 1 or wild
 * DOWN direction: new card rank must be minRank - 1 or wild
 * 
 * @param {object} newCard - Card to add
 * @param {array} existingCards - Natural cards already in run (filter wilds first!)
 * @param {string} direction - 'up' or 'down'
 * @returns {boolean}
 */
export function canExtendRunEnd(newCard, existingCards, direction) {
  if (!existingCards || existingCards.length === 0) return false;

  const naturals = existingCards.filter(c => !isWild(c));
  if (naturals.length === 0) return false; // All wild (shouldn't reach here)

  if (direction === 'up') {
    const maxRank = Math.max(...naturals.map(c => c.rank));
    // Can add one higher or a wild
    return newCard.rank === maxRank + 1 || isWild(newCard);
  }

  if (direction === 'down') {
    const minRank = Math.min(...naturals.map(c => c.rank));
    // Can add one lower or a wild
    // Special case: cannot go below rank 2
    if (minRank === 2) return false;
    return newCard.rank === minRank - 1 || isWild(newCard);
  }

  return false;
}

/**
 * Validate run direction consistency and prepend prevention (§5.2, §5.3)
 * If adding to existing run:
 * - New cards must maintain same direction (up/down)
 * - New cards must only extend at end (no prepending)
 * 
 * @param {array} newCards - Cards to add
 * @param {array} existingCards - Cards already in run
 * @param {string} existingDirection - Established direction ('up' or 'down')
 * @returns {object} - { valid: boolean, errorCode: string|null, details: string|null }
 */
export function validateRunDirection(newCards, existingCards, existingDirection) {
  if (!existingCards || existingCards.length === 0) {
    return { valid: true, errorCode: null, details: null };
  }

  if (!existingDirection || (existingDirection !== 'up' && existingDirection !== 'down')) {
    return { valid: true, errorCode: null, details: null }; // Unknown direction, allow
  }

  // Infer direction of new cards
  const newDirection = getRunDirection(newCards);
  if (newDirection === 'unknown' || newDirection === null) {
    // Try adding: if all naturals match direction, it's OK
    const newNaturals = newCards.filter(c => !isWild(c));
    if (newNaturals.length === 0) {
      return { valid: true, errorCode: null, details: null }; // All wild, allow for gap filling
    }
  } else if (newDirection !== existingDirection) {
    // Direction mismatch
    return {
      valid: false,
      errorCode: 'RUN_DIRECTION_CHANGED',
      details: `Existing run goes ${existingDirection}, new cards would go ${newDirection}`
    };
  }

  // Check prepending: new cards must extend only at END
  const existingNaturals = existingCards.filter(c => !isWild(c));
  const newNaturals = newCards.filter(c => !isWild(c));
  
  if (existingNaturals.length === 0 || newNaturals.length === 0) {
    return { valid: true, errorCode: null, details: null }; // All wild in one, skip check
  }

  // All new naturals must extend from the end
  if (existingDirection === 'up') {
    const existingMax = Math.max(...existingNaturals.map(c => c.rank));
    const newMin = Math.min(...newNaturals.map(c => c.rank));
    
    if (newMin <= existingMax) {
      return {
        valid: false,
        errorCode: 'RUN_PREPEND_FORBIDDEN',
        details: 'Cards can only be added to the end of a run (not beginning)'
      };
    }
  } else if (existingDirection === 'down') {
    const existingMin = Math.min(...existingNaturals.map(c => c.rank));
    const newMax = Math.max(...newNaturals.map(c => c.rank));
    
    if (newMax >= existingMin) {
      return {
        valid: false,
        errorCode: 'RUN_PREPEND_FORBIDDEN',
        details: 'Cards can only be added to the end of a run (not beginning)'
      };
    }
  }

  return { valid: true, errorCode: null, details: null };
}

/**
 * Validate additions to a canasta (7+ cards) (§6.2)
 * Rules:
 * - Wild canasta (all wild): cannot add anything
 * - Natural canasta (7+ with naturals): can only add natural cards
 * 
 * @param {array} newCards - Cards attempting to add
 * @param {array} existingCanasta - Completed canasta (7+ cards)
 * @returns {object} - { valid: boolean, errorCode: string|null, details: string|null }
 */
export function validateAdditionToCanasta(newCards, existingCanasta) {
  if (!existingCanasta || existingCanasta.length < 7) {
    return { valid: true, errorCode: null, details: null }; // Not a canasta yet
  }

  // All-wild canasta: immutable
  if (isAllWild(existingCanasta)) {
    return {
      valid: false,
      errorCode: 'CANNOT_ADD_TO_WILD_CANASTA',
      details: 'Cannot add to an all-wild canasta'
    };
  }

  // Natural canasta: can only add natural cards (not wild)
  const newHasWild = newCards.some(c => isWild(c));
  if (newHasWild) {
    return {
      valid: false,
      errorCode: 'WILD_ADDED_AFTER_CANASTA',
      details: 'Can only add natural cards after a canasta is formed'
    };
  }

  return { valid: true, errorCode: null, details: null };
}

/**
 * Enhanced meld validation using Phase 3 rules
 * Determines meld type and applies appropriate enhanced validation
 * 
 * @param {array} cards - Array of card objects
 * @returns {object} - { valid: boolean, errorCode: string|null, details: string|null }
 */
function validateMeldEnhanced(cards) {
  if (!cards || cards.length < 3) {
    return { valid: false, errorCode: 'MELD_TOO_SMALL', details: 'Need minimum 3 cards' };
  }

  // Can't meld red or black threes
  if (cards.some(isRedThree)) {
    return { valid: false, errorCode: 'MELD_INVALID', details: 'Red threes cannot be melded' };
  }
  if (cards.some(isBlackThree)) {
    return { valid: false, errorCode: 'MELD_INVALID', details: 'Black threes cannot be melded' };
  }

  // Try as set first using enhanced validation
  const setResult = validateSetEnhanced(cards);
  if (setResult.valid) {
    return { valid: true, errorCode: null, details: null };
  }

  // Try as run using enhanced validation
  const runResult = validateRunEnhanced(cards);
  if (runResult.valid) {
    return { valid: true, errorCode: null, details: null };
  }

  // Neither valid - return most specific error
  return setResult.errorCode ? setResult : runResult;
}

/**
 * Enhanced validation for adding cards to meld with full metadata awareness
 * Combines all validation rules: basic, wild canasta, run direction, canasta restrictions, wild positions
 * 
 * @param {array} newCards - Cards to add
 * @param {object} meld - Meld metadata { cards, type, direction, isCanasta, id, team }
 * @returns {object} - { valid: boolean, errorCode: string|null, details: string|null }
 */
export function canAddToMeldEnhanced(newCards, meld) {
  if (!meld || !meld.cards) {
    // New meld - validate as standalone using enhanced validation
    const result = validateMeldEnhanced(newCards);
    return result;
  }

  // Check wild canasta immutability first (absolute blocker)
  const wildCanCheck = validateWildCanasta(newCards, meld.cards);
  if (!wildCanCheck.valid) return wildCanCheck;

  // Check canasta post-addition rules
  if (meld.isCanasta) {
    const canastaCheck = validateAdditionToCanasta(newCards, meld.cards);
    if (!canastaCheck.valid) return canastaCheck;
  }

  // For runs: check direction consistency and prepending
  if (meld.type === 'run' && meld.direction) {
    const directionCheck = validateRunDirection(newCards, meld.cards, meld.direction);
    if (!directionCheck.valid) return directionCheck;
  }

  // Final: combine and validate as unified meld using ENHANCED validators
  const combined = [...meld.cards, ...newCards];
  const result = validateMeldEnhanced(combined);
  
  return result;
}

// ============================================
// PHASE 3: Wild Card Position Rules
// ============================================

/**
 * Validate that first card is natural (not wild) (§3.3.2)
 * Rule: Melds cannot start with a wild card (joker or 2)
 * Exception: All-wild melds (canasta) - these are validated separately
 * 
 * @param {array} cards - Cards in meld
 * @returns {object} - { valid: boolean, errorCode: string|null, details: string|null }
 */
export function validateWildStartPosition(cards) {
  if (!cards || cards.length === 0) {
    return { valid: true, errorCode: null, details: null };
  }

  // All-wild melds are handled separately, so allow them here
  if (isAllWild(cards)) {
    return { valid: true, errorCode: null, details: null };
  }

  // Check if first card is wild
  if (cards.length > 0 && isWild(cards[0])) {
    return {
      valid: false,
      errorCode: 'MELD_STARTS_WITH_WILD',
      details: 'First card must be natural (not joker or 2)'
    };
  }

  return { valid: true, errorCode: null, details: null };
}

/**
 * Validate consecutive wild card sequences (§3.3.3)
 * Rule: Consecutive wild cards must be LESS THAN the naturals IMMEDIATELY preceding them
 * 
 * Key: Count naturals BACKWARD from each wild sequence until you hit another wild.
 * Each wild GROUP is evaluated independently with only its direct preceding naturals.
 * 
 * Examples:
 * ✅ [N, N, N, W, W, N, N]   - WW at 3-4: count back from 2 = 3 naturals → 2 < 3 ✓
 * ❌ [N, N, N, W, N, W, N]   - W at 3: 1<3 ✓, W at 5: count back hits W at 3, 1 natural → 1<1 ✗
 * ✅ [N, N, W, N, N, W, N]   - W at 2: 1<2 ✓, W at 5: count hits W at 2, 2 naturals → 2<2 ✗
 *    Actually [N,N,W,N,N,W,N] should be invalid because last 2 have exactly 2, need strictly <
 * 
 * @param {array} cards - Cards in meld
 * @returns {object} - { valid: boolean, errorCode: string|null, details: string|null }
 */
export function validateConsecutiveWilds(cards) {
  if (!cards || cards.length < 2) {
    return { valid: true, errorCode: null, details: null };
  }

  let i = 0;
  while (i < cards.length) {
    if (isWild(cards[i])) {
      // Found a wild sequence, count consecutive wilds
      let wildCount = 0;
      let j = i;
      while (j < cards.length && isWild(cards[j])) {
        wildCount++;
        j++;
      }

      // Count preceding naturals ONLY immediately before this wild sequence
      // Stop counting when you hit a wild card
      let precedingNaturals = 0;
      for (let k = i - 1; k >= 0; k--) {
        if (isWild(cards[k])) {
          // Hit a previous wild - stop counting, this marks the boundary
          break;
        }
        precedingNaturals++;
      }

      // Rule: consecutive wilds must be STRICTLY LESS THAN preceding naturals
      // Formula: wildCount < precedingNaturals (NOT <=)
      if (wildCount >= precedingNaturals) {
        return {
          valid: false,
          errorCode: 'WILD_STREAK_TOO_LONG',
          details: `${wildCount} consecutive wild(s) need strictly more than ${precedingNaturals} preceding natural(s). Require at least ${wildCount + 1}.`
        };
      }

      // Move past this wild sequence
      i = j;
    } else {
      i++;
    }
  }

  return { valid: true, errorCode: null, details: null };
}

/**
 * Validate wild card requirements: natural start + consecutive limit (§3.3.2, §3.3.3)
 * Combines both wild position rules
 * 
 * @param {array} cards - Cards in meld
 * @returns {object} - { valid: boolean, errorCode: string|null, details: string|null }
 */
export function validateWildPositions(cards) {
  // Check 1: Cannot start with wild (unless all-wild)
  const startCheck = validateWildStartPosition(cards);
  if (!startCheck.valid) return startCheck;

  // Check 2: Consecutive wilds rule
  const consecutiveCheck = validateConsecutiveWilds(cards);
  if (!consecutiveCheck.valid) return consecutiveCheck;

  return { valid: true, errorCode: null, details: null };
}

/**
 * Enhanced set validation with Phase 3 rules
 * 
 * @param {array} cards - Cards to validate
 * @returns {object} - { valid: boolean, errorCode: string|null, details: string|null }
 */
export function validateSetEnhanced(cards) {
  if (!cards || cards.length < 3) {
    return { valid: false, errorCode: 'MELD_TOO_SMALL', details: 'Need minimum 3 cards' };
  }

  const wilds = cards.filter(isWild);
  const naturals = cards.filter(c => !isWild(c));

  // Check wild count
  if (wilds.length > 3) {
    return { valid: false, errorCode: 'TOO_MANY_WILDS_IN_MELD', details: 'Maximum 3 wild cards' };
  }

  // Check naturals count
  if (naturals.length < 2) {
    return { valid: false, errorCode: 'INSUFFICIENT_NATURALS_BEFORE_WILD', details: 'Need at least 2 natural cards' };
  }

  // Check all naturals same rank
  const ranks = new Set(naturals.map(c => c.rank));
  if (ranks.size > 1) {
    return { valid: false, errorCode: 'SET_RANK_MISMATCH', details: 'All natural cards must be same rank' };
  }

  // Phase 3: Check wild positions
  const positionCheck = validateWildPositions(cards);
  if (!positionCheck.valid) return positionCheck;

  return { valid: true, errorCode: null, details: null };
}

/**
 * Enhanced run validation with Phase 3 rules
 * 
 * @param {array} cards - Cards to validate
 * @returns {object} - { valid: boolean, errorCode: string|null, details: string|null }
 */
export function validateRunEnhanced(cards) {
  if (!cards || cards.length < 3) {
    return { valid: false, errorCode: 'MELD_TOO_SMALL', details: 'Need minimum 3 cards' };
  }

  const wilds = cards.filter(isWild);
  const naturals = cards.filter(c => !isWild(c));

  // Check wild count
  if (wilds.length > 3) {
    return { valid: false, errorCode: 'TOO_MANY_WILDS_IN_MELD', details: 'Maximum 3 wild cards' };
  }

  // Check naturals count
  if (naturals.length < 2) {
    return { valid: false, errorCode: 'INSUFFICIENT_NATURALS_BEFORE_WILD', details: 'Need at least 2 natural cards' };
  }

  // Check all naturals same suit
  const suits = new Set(naturals.map(c => c.suit));
  if (suits.size > 1) {
    return { valid: false, errorCode: 'RUN_MIXED_SUITS', details: 'All natural cards must be same suit' };
  }

  const sortedNaturals = [...naturals].sort((a, b) => a.rank - b.rank);

  // Check no rank 3
  if (sortedNaturals.some(c => c.rank === 3)) {
    return { valid: false, errorCode: 'RUN_CONTAINS_THREE', details: '3 cannot be in runs' };
  }

  // Check 9 not at edges
  const hasNine = sortedNaturals.some(c => c.rank === 9);
  if (hasNine) {
    const firstRank = sortedNaturals[0].rank;
    const lastRank = sortedNaturals[sortedNaturals.length - 1].rank;
    if (firstRank === 9 || lastRank === 9) {
      return { valid: false, errorCode: 'RUN_9_AT_ENDPOINT', details: '9 cannot be start or end of run' };
    }
  }

  // Check Ace only after King
  const hasAce = sortedNaturals.some(c => c.rank === 1);
  if (hasAce) {
    const hasKing = sortedNaturals.some(c => c.rank === 13);
    if (!hasKing) {
      return { valid: false, errorCode: 'RUN_ACE_USED_LOW', details: 'Ace only valid after King' };
    }
  }

  // Check sequential
  const minRank = sortedNaturals[0].rank;
  const maxRank = sortedNaturals[sortedNaturals.length - 1].rank;
  const expectedSpan = maxRank - minRank + 1;
  const totalCards = naturals.length + wilds.length;

  if (totalCards < expectedSpan) {
    return { valid: false, errorCode: 'RUN_INVALID_SEQUENCE', details: 'Cards are not sequential' };
  }

  const wildcardGaps = expectedSpan - naturals.length;
  if (wilds.length > wildcardGaps) {
    return { valid: false, errorCode: 'RUN_WILD_SUBSTITUTION_INVALID', details: 'Too many wild cards for sequence' };
  }

  // Phase 3: Check wild positions
  const positionCheck = validateWildPositions(cards);
  if (!positionCheck.valid) return positionCheck;

  return { valid: true, errorCode: null, details: null };
}
