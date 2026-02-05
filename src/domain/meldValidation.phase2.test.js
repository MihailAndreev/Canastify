/**
 * Unit Tests for Phase 2: Critical Meld Validation
 * Tests: wild canasta, run direction, canasta restrictions
 */

import {
  validateWildCanasta,
  canExtendRunEnd,
  validateRunDirection,
  validateAdditionToCanasta,
  canAddToMeldEnhanced,
  isWild
} from './meldValidation.js';

import {
  createMeld,
  isAllWild
} from './meldModel.js';

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
const four = (suit) => card(4, suit);
const five = (suit) => card(5, suit);
const six = (suit) => card(6, suit);
const seven = (suit) => card(7, suit);
const eight = (suit) => card(8, suit);
const nine = (suit) => card(9, suit);
const ten = (suit) => card(10, suit);

console.log('=== PHASE 2 VALIDATION TESTS ===\n');

// Test 1: validateWildCanasta - Block additions to wild canasta
console.log('Test 1: validateWildCanasta');
const wildCanasta = [
  joker(), joker(), joker(),
  joker(), joker(), joker(), joker()
];
const wildCheck1 = validateWildCanasta([five(SPADE)], wildCanasta);
console.log('✓ Cannot add to wild canasta:', 
  !wildCheck1.valid && wildCheck1.errorCode === 'CANNOT_ADD_TO_WILD_CANASTA');

const nonCanasta = [five(SPADE), six(SPADE), seven(SPADE)];
const wildCheck2 = validateWildCanasta([eight(SPADE)], nonCanasta);
console.log('✓ Non-canasta allows additions:', wildCheck2.valid === true);

const naturalCanasta = [
  five(SPADE), six(SPADE), seven(SPADE),
  eight(SPADE), nine(SPADE), ten(SPADE), joker()
];
const wildCheck3 = validateWildCanasta([four(SPADE)], naturalCanasta);
console.log('✓ Natural canasta not blocked here:', wildCheck3.valid === true);
console.log('');

// Test 2: canExtendRunEnd - Prevent prepending (UP direction)
console.log('Test 2: canExtendRunEnd - UP direction');
const upNaturals = [four(SPADE), five(SPADE), six(SPADE)];

// Adding 7 to end (valid)
const extend1 = canExtendRunEnd(seven(SPADE), upNaturals, 'up');
console.log('✓ Can extend UP with +1 rank (7 after 6):', extend1 === true);

// Adding 3 to beginning (invalid prepend)
const extend2 = canExtendRunEnd(card(3, SPADE), upNaturals, 'up');
console.log('✓ Cannot prepend (3 before 4):', extend2 === false);

// Adding wild to end (valid)
const extend3 = canExtendRunEnd(joker(), upNaturals, 'up');
console.log('✓ Can add wild for gap filling:', extend3 === true);
console.log('');

// Test 3: canExtendRunEnd - DOWN direction
console.log('Test 3: canExtendRunEnd - DOWN direction');
const downNaturals = [card(10, SPADE), nine(SPADE), eight(SPADE)]; // 10-9-8

// Adding 7 to end (valid)
const extend4 = canExtendRunEnd(seven(SPADE), downNaturals, 'down');
console.log('✓ Can extend DOWN with -1 rank (7 after 8):', extend4 === true);

// Adding Jack to beginning (invalid prepend)
const extend5 = canExtendRunEnd(card(11, SPADE), downNaturals, 'down');
console.log('✓ Cannot prepend (J before 10):', extend5 === false);

// Note: Cannot test extending below 2 because all 2s are wild
console.log('✓ All-2 cards are wild (skip natural 2 test)');
console.log('');

// Test 4: validateRunDirection - Direction consistency
console.log('Test 4: validateRunDirection - Direction consistency');
const newUpCards = [seven(SPADE), eight(SPADE)];
const existingUp = [four(SPADE), five(SPADE), six(SPADE)];

const dirCheck1 = validateRunDirection(newUpCards, existingUp, 'up');
console.log('✓ UP+UP direction consistent:', dirCheck1.valid === true);

// Test: try to add DOWN-facing cards to UP run
// K-Q (going down) to 4-5-6 (going up) = clash
const newDownCards = [card(13, SPADE), card(12, SPADE)]; // K-Q, direction would be DOWN
const dirCheck2 = validateRunDirection(newDownCards, existingUp, 'up');
console.log('✓ UP+DOWN mismatch detected:', 
  !dirCheck2.valid && dirCheck2.errorCode === 'RUN_DIRECTION_CHANGED');

// Prepend test: adding (3,4) to existing (5,6,7)
// Actually 3 cannot be in runs, so use (2,4) but 2 is wild
// Better: try to add lower cards to UP run but only naturals extend
const prependCards = [card(3, SPADE), four(SPADE)]; // 3 not allowed in runs anyway
// Use valid prepend attempt: cards with lower max than existing min
const validPreprependTest = [card(3, SPADE)]; // Invalid card for test, skip
// Better test: use valid low card that would prepend
const validPrependCards = [card(4, SPADE)]; // 4 would prepend to 5-6-7
const dirCheck3 = validateRunDirection(validPrependCards, [five(SPADE), six(SPADE), seven(SPADE)], 'up');
console.log('✓ Prepend attempt blocked:', 
  !dirCheck3.valid && dirCheck3.errorCode === 'RUN_PREPEND_FORBIDDEN');
console.log('');

// Test 5: validateAdditionToCanasta - Wild canasta immutable
console.log('Test 5: validateAdditionToCanasta');
const canastaCheck1 = validateAdditionToCanasta([four(SPADE)], wildCanasta);
console.log('✓ Cannot add to wild canasta:', 
  !canastaCheck1.valid && canastaCheck1.errorCode === 'CANNOT_ADD_TO_WILD_CANASTA');

// Natural canasta: can only add naturals
const canastaCheck2 = validateAdditionToCanasta([four(SPADE)], naturalCanasta);
console.log('✓ Can add natural to natural canasta:', canastaCheck2.valid === true);

// Natural canasta: reject wilds
const canastaCheck3 = validateAdditionToCanasta([joker()], naturalCanasta);
console.log('✓ Cannot add wild to natural canasta:', 
  !canastaCheck3.valid && canastaCheck3.errorCode === 'WILD_ADDED_AFTER_CANASTA');

// Non-canasta: no restrictions
const canastaCheck4 = validateAdditionToCanasta([four(SPADE)], nonCanasta);
console.log('✓ Non-canasta allows any cards:', canastaCheck4.valid === true);
console.log('');

// Test 6: canAddToMeldEnhanced - Integrated validation
console.log('Test 6: canAddToMeldEnhanced');

// New meld (no existing)
const newMeldCheck = canAddToMeldEnhanced(
  [four(SPADE), five(SPADE), six(SPADE)],
  null
);
console.log('✓ New meld validation works:', newMeldCheck.valid === true);

// Add to natural run meld
const runMeld = createMeld([four(SPADE), five(SPADE), six(SPADE)], 'meld_run', 'our');
const addToRun = canAddToMeldEnhanced([seven(SPADE)], runMeld);
console.log('✓ Can extend valid run:', addToRun.valid === true);

// Try to prepend to run
const prependToRun = canAddToMeldEnhanced([card(3, SPADE)], runMeld);
console.log('✓ Prepend blocked on enhanced check:', 
  !prependToRun.valid && prependToRun.errorCode === 'RUN_PREPEND_FORBIDDEN');

// Add to wild canasta
const wildCanastaMeld = createMeld(wildCanasta, 'meld_wild', 'our');
const addToWildCanasta = canAddToMeldEnhanced([joker()], wildCanastaMeld);
console.log('✓ Cannot add to wild canasta via enhanced:', 
  !addToWildCanasta.valid && addToWildCanasta.errorCode === 'CANNOT_ADD_TO_WILD_CANASTA');

// Add to natural canasta - use a clearly UP run canasta [4-10] (7 cards)
const runCanasta7 = [four(SPADE), five(SPADE), six(SPADE), seven(SPADE), eight(SPADE), nine(SPADE), ten(SPADE)];
const naturalCanastaMeld = createMeld(runCanasta7, 'meld_natural', 'our');
// canasta has cards 4-10, so can extend with 11 (J)
const addNaturalToCanasta = canAddToMeldEnhanced([card(11, SPADE)], naturalCanastaMeld);
console.log('✓ Can add natural to natural canasta:', addNaturalToCanasta.valid === true);

// Try to add wild to natural canasta
const addWildToCanasta = canAddToMeldEnhanced([joker()], naturalCanastaMeld);
console.log('✓ Cannot add wild to natural canasta:', 
  !addWildToCanasta.valid && addWildToCanasta.errorCode === 'WILD_ADDED_AFTER_CANASTA');

console.log('');
console.log('=== ALL PHASE 2 TESTS COMPLETE ===');
