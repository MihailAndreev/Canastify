/**
 * Unit Tests for Phase 3: Wild Card Position Rules
 * Tests: wild start position, consecutive wild limit
 */

import {
  validateWildStartPosition,
  validateConsecutiveWilds,
  validateWildPositions,
  validateSetEnhanced,
  validateRunEnhanced,
  isWild
} from './meldValidation.js';

// Mock card factory
function card(rank, suit) {
  return {
    id: `${rank}${suit[0]}_${Math.random()}`,
    rank: rank,
    suit: suit,
    svgPath: ''
  };
}

const JOKER = 'JOKER';
const HEART = 'HEART';
const DIAMOND = 'DIAMOND';
const CLUB = 'CLUB';
const SPADE = 'SPADE';

// Helpers
const joker = () => card(0, JOKER);
const two = (suit) => card(2, suit);
const three = (suit) => card(3, suit);
const four = (suit) => card(4, suit);
const five = (suit) => card(5, suit);
const six = (suit) => card(6, suit);
const seven = (suit) => card(7, suit);
const eight = (suit) => card(8, suit);
const nine = (suit) => card(9, suit);
const ten = (suit) => card(10, suit);
const king = (suit) => card(13, suit);

console.log('=== PHASE 3 WILD POSITION TESTS ===\n');

// Test 1: validateWildStartPosition
console.log('Test 1: validateWildStartPosition');

// Natural start (valid)
const start1 = validateWildStartPosition([four(SPADE), five(SPADE), six(SPADE)]);
console.log('✓ Natural start allowed:', start1.valid === true);

// Wild start (invalid) 
const start2 = validateWildStartPosition([joker(), four(SPADE), five(SPADE), six(SPADE)]);
console.log('✓ Wild start blocked:', !start2.valid && start2.errorCode === 'MELD_STARTS_WITH_WILD');

// All-wild (exception - allowed)
const start3 = validateWildStartPosition([joker(), joker(), joker()]);
console.log('✓ All-wild allowed as exception:', start3.valid === true);

// 2 as natural start (but 2 is wild, so invalid)
const start4 = validateWildStartPosition([two(SPADE), four(SPADE), five(SPADE)]);
console.log('✓ 2 (wild) start blocked:', !start4.valid && start4.errorCode === 'MELD_STARTS_WITH_WILD');

console.log('');

// Test 2: validateConsecutiveWilds - Basic cases
console.log('Test 2: validateConsecutiveWilds - Basic');

// [N, N, W] = 2 naturals > 1 wild → valid
const consec1 = validateConsecutiveWilds([four(SPADE), five(SPADE), joker()]);
console.log('✓ [N,N,W] valid (2 naturals > 1 wild):', consec1.valid === true);

// [N, W, W] = 1 natural < 2 wilds → invalid
const consec2 = validateConsecutiveWilds([four(SPADE), joker(), joker()]);
console.log('✓ [N,W,W] blocked (1 natural < 2 wilds):', 
  !consec2.valid && consec2.errorCode === 'WILD_STREAK_TOO_LONG');

// [N, N, N, W, W, W] = 3 naturals = 3 wilds → INVALID (wilds must be strictly less)
const consec3 = validateConsecutiveWilds([four(SPADE), five(SPADE), six(SPADE), joker(), joker(), joker()]);
console.log('✓ [N,N,N,W,W,W] blocked (3 wilds not < 3 naturals):', 
  !consec3.valid && consec3.errorCode === 'WILD_STREAK_TOO_LONG');

// [N, N, N, W, W, W, W] = 3 naturals < 4 wilds → invalid
const consec4 = validateConsecutiveWilds([four(SPADE), five(SPADE), six(SPADE), joker(), joker(), joker(), joker()]);
console.log('✓ [N,N,N,W,W,W,W] blocked (3 naturals < 4 wilds):', 
  !consec4.valid && consec4.errorCode === 'WILD_STREAK_TOO_LONG');

console.log('');

// Test 3: validateConsecutiveWilds - Multiple wild sequences
console.log('Test 3: validateConsecutiveWilds - Multiple sequences');

// [N, N, W, N, W] = first W: 2 naturals > 1 wild (OK), second W: 1 new natural + 2 preceding = 3 total (OK)
const consec5 = validateConsecutiveWilds([four(SPADE), five(SPADE), joker(), six(SPADE), joker()]);
console.log('✓ [N,N,W,N,W] valid (each wild has enough preceding naturals):', consec5.valid === true);

// [N, W, W, N, W, W, W] = first [W,W]: 2 wilds, 1 natural before (invalid: 2 > 1)
const consec6 = validateConsecutiveWilds([four(SPADE), joker(), joker(), five(SPADE), joker(), joker(), joker()]);
console.log('✓ First [W,W] blocked (only 1 natural before):', 
  !consec6.valid && consec6.errorCode === 'WILD_STREAK_TOO_LONG');

console.log('');

// Test 4: validateWildPositions - Combined checks
console.log('Test 4: validateWildPositions - Combined');

// Valid: natural start + good consecutive wilds [2 naturals > 1 wild, but 2 wilds requires 3 naturals]
const pos1_attempt = validateWildPositions([four(SPADE), five(SPADE), joker(), joker()]);
console.log('✓ [N,N,W,W] blocked (2 wilds not < 2 naturals):', 
  !pos1_attempt.valid && pos1_attempt.errorCode === 'WILD_STREAK_TOO_LONG');

// Valid: 3 naturals > 2 wilds
const pos1 = validateWildPositions([four(SPADE), five(SPADE), six(SPADE), joker(), joker()]);
console.log('✓ Valid pattern [N,N,N,W,W]:', pos1.valid === true);

// Invalid: wild start
const pos2 = validateWildPositions([joker(), four(SPADE), five(SPADE)]);
console.log('✓ Wild start blocked:', !pos2.valid && pos2.errorCode === 'MELD_STARTS_WITH_WILD');

// Invalid: too many consecutive wilds (only 1 natural before 3 wilds)
const pos3 = validateWildPositions([four(SPADE), joker(), joker(), joker()]);
console.log('✓ Too many consecutive wilds blocked:', 
  !pos3.valid && pos3.errorCode === 'WILD_STREAK_TOO_LONG');

console.log('');

// Test 5: validateSetEnhanced - With wild position validation
console.log('Test 5: validateSetEnhanced');

// Valid set: 3 Kings with natural start
const kingSet = [
  card(13, SPADE),
  card(13, HEART),
  card(13, DIAMOND)
];
const set1 = validateSetEnhanced(kingSet);
console.log('✓ Valid set with naturals:', set1.valid === true);

// Invalid: wild start in set
const set2 = validateSetEnhanced([
  joker(),
  card(13, SPADE),
  card(13, HEART),
  card(13, DIAMOND)
]);
console.log('✓ Set with wild start blocked:', 
  !set2.valid && set2.errorCode === 'MELD_STARTS_WITH_WILD');

// Invalid: too many naturals + one wild but wild comes too early
// [Natural, Natural, Wild, Wild, Wild] = 3 wilds > 2 naturals → should fail
const set3 = validateSetEnhanced([
  card(13, SPADE),
  card(13, HEART),
  joker(),
  joker(),
  joker()
]);
console.log('✓ Set with too many consecutive wilds blocked:', 
  !set3.valid && set3.errorCode === 'WILD_STREAK_TOO_LONG');

console.log('');

// Test 6: validateRunEnhanced - Basic validation
console.log('Test 6: validateRunEnhanced');

// Valid run: 4-5-6 natural (3 same suit)
const run1 = validateRunEnhanced([
  four(SPADE),
  five(SPADE),
  six(SPADE)
]);
console.log('✓ Valid run with 3 naturals:', run1.valid === true);

// Invalid: Less than 2 naturals (only 1)
// [joker, joker, 4-spade, 5-spade] = 2 wilds, 2 naturals - but starts with wild
// This fails on wild start check
const run2_attempt = [
  joker(),
  four(SPADE),
  five(SPADE),
  six(SPADE)
];
// This should fail due to: 1) wild start, 2) runs need same suit for sequential check to work
// Let's verify it at least fails
const run2_result = validateRunEnhanced(run2_attempt);
console.log('✓ Run with issues (wild start + other) invalid:', !run2_result.valid);

// Invalid: only 1 natural + 3 wilds (need at least 2 naturals)
const run3_attempt = [
  four(SPADE),
  joker(),
  joker(),
  joker(),
  five(SPADE)
];
// This should fail: 2 naturals < 3 wild span + other issues  
const run3_result = validateRunEnhanced(run3_attempt);
console.log('✓ Run validation enforces rules:', !run3_result.valid);

console.log('');

// Test 7: Edge cases
console.log('Test 7: Edge cases');

// Empty array
const edge1 = validateWildPositions([]);
console.log('✓ Empty array allowed:', edge1.valid === true);

// Single card
const edge2 = validateWildPositions([four(SPADE)]);
console.log('✓ Single card allowed:', edge2.valid === true);

// 3 naturals + 3 consecutive wilds: 3 wilds NOT < 3 naturals → INVALID
const edge3 = validateWildPositions([
  four(SPADE),
  five(SPADE),
  six(SPADE),
  joker(),
  joker(),
  joker()
]);
console.log('✓ 3 naturals + 3 consecutive wilds blocked:', 
  !edge3.valid && edge3.errorCode === 'WILD_STREAK_TOO_LONG');

// 4 naturals + 3 consecutive wilds: 3 wilds < 4 naturals → VALID
const edge3b = validateWildPositions([
  four(SPADE),
  five(SPADE),
  six(SPADE),
  seven(SPADE),
  joker(),
  joker(),
  joker()
]);
console.log('✓ 4 naturals + 3 consecutive wilds valid:', edge3b.valid === true);

console.log('');

console.log('=== ALL PHASE 3 TESTS COMPLETE ===');
