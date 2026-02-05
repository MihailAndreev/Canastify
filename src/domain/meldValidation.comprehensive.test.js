/**
 * Comprehensive Test Suite for Wild Card Position Rules (§10.3)
 * Based on official Bulgarian Canasta rules (updated)
 * 
 * Validates ALL valid and invalid combinations for:
 * 1. First meld of team (W only at positions 4–7; starts with N N N)
 * 2. Subsequent melds (W at positions 3–7; starts with N N)
 */

import { validateConsecutiveWilds, isWild } from './meldValidation.js';

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

const N = () => card(4, HEART);     // Natural card
const W = () => card(2, HEART);     // Wild card (2)

console.log('═══════════════════════════════════════════════════════════════════════');
console.log('COMPREHENSIVE WILD CARD POSITION TEST SUITE');
console.log('Based on: docs/GAME_RULES_bg.md § 10.3');
console.log('═══════════════════════════════════════════════════════════════════════\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function test(name, cards, expectedValid) {
  totalTests++;
  const result = validateConsecutiveWilds(cards);
  const passed = result.valid === expectedValid;
  
  if (passed) {
    passedTests++;
    console.log(`✅ ${name}`);
  } else {
    failedTests++;
    console.log(`❌ ${name}`);
    console.log(`   Expected: ${expectedValid ? 'VALID' : 'INVALID'}`);
    console.log(`   Got: ${result.valid ? 'VALID' : 'INVALID'}`);
    if (result.errorCode) console.log(`   Error: ${result.errorCode} - ${result.details}`);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 1: FIRST MELD OF TEAM
// Start: N N N (positions 0-2)
// Wilds: Only at positions 4-7
// ═══════════════════════════════════════════════════════════════════════════════

console.log('SECTION 1: FIRST MELD OF TEAM (N N N W ... | W only at pos 4-7)');
console.log('───────────────────────────────────────────────────────────────────────\n');

console.log('✓ Valid: 1 Wild');
test('N N N W N N N', [N(), N(), N(), W(), N(), N(), N()], true);
test('N N N N W N N', [N(), N(), N(), N(), W(), N(), N()], true);
test('N N N N N W N', [N(), N(), N(), N(), N(), W(), N()], true);
test('N N N N N N W', [N(), N(), N(), N(), N(), N(), W()], true);
console.log('');

console.log('✓ Valid: 2 Wilds');
test('N N N W W N N', [N(), N(), N(), W(), W(), N(), N()], true);
test('N N N W N N W', [N(), N(), N(), W(), N(), N(), W()], true);
test('N N N N W W N', [N(), N(), N(), N(), W(), W(), N()], true);
test('N N N N N W W', [N(), N(), N(), N(), N(), W(), W()], true);
console.log('');

console.log('✓ Valid: 3 Wilds');
test('N N N N W W W', [N(), N(), N(), N(), W(), W(), W()], true);
console.log('');

console.log('✗ Invalid: 2 Wilds');
test('N N N W N W N (W at pos 3 + W at pos 5 separately)', [N(), N(), N(), W(), N(), W(), N()], false);
test('N N N N W N W (W at pos 5 + W at pos 6: 1<1)', [N(), N(), N(), N(), W(), N(), W()], false);
console.log('');

console.log('✗ Invalid: 3 Wilds');
test('N N N W W W N (3 wilds < 3 naturals before)', [N(), N(), N(), W(), W(), W(), N()], false);
test('N N N W W N W (2 wilds before the last W)', [N(), N(), N(), W(), W(), N(), W()], false);
test('N N N W N W W (W at pos 3 OK, then 2 wilds < 1 natural at pos 4)', [N(), N(), N(), W(), N(), W(), W()], false);
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION 2: SUBSEQUENT MELDS
// Start: N N (positions 0-1)
// Wilds: Can be at positions 2-7
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\nSECTION 2: SUBSEQUENT MELDS (N N ... | W at positions 2-7)');
console.log('───────────────────────────────────────────────────────────────────────\n');

console.log('✓ Valid: 1 Wild');
test('N N W N N N N', [N(), N(), W(), N(), N(), N(), N()], true);
test('N N N W N N N', [N(), N(), N(), W(), N(), N(), N()], true);
test('N N N N W N N', [N(), N(), N(), N(), W(), N(), N()], true);
test('N N N N N W N', [N(), N(), N(), N(), N(), W(), N()], true);
test('N N N N N N W', [N(), N(), N(), N(), N(), N(), W()], true);
console.log('');

console.log('✓ Valid: 2 Wilds');
test('N N W N N W N', [N(), N(), W(), N(), N(), W(), N()], true);
test('N N W N N N W', [N(), N(), W(), N(), N(), N(), W()], true);
test('N N N W W N N', [N(), N(), N(), W(), W(), N(), N()], true);
test('N N N W N N W', [N(), N(), N(), W(), N(), N(), W()], true);
test('N N N N W W N', [N(), N(), N(), N(), W(), W(), N()], true);
test('N N N N N W W', [N(), N(), N(), N(), N(), W(), W()], true);
console.log('');

console.log('✓ Valid: 3 Wilds');
test('N N N N W W W', [N(), N(), N(), N(), W(), W(), W()], true);
console.log('');

console.log('✗ Invalid: 2 Wilds');
test('N N W W N N N (2 wilds < 2 preceding)', [N(), N(), W(), W(), N(), N(), N()], false);
test('N N W N W N N (W at 2: 1<1 after first W)', [N(), N(), W(), N(), W(), N(), N()], false);
test('N N N W N W N (W at pos 3: 1<1 after 4th natural, then W at 5)', [N(), N(), N(), W(), N(), W(), N()], false);
test('N N N N W N W (W at pos 4: 1<1 after preceding W)', [N(), N(), N(), N(), W(), N(), W()], false);
console.log('');

console.log('✗ Invalid: 3 Wilds');
test('N N W W W N N (3 wilds < 2 preceding)', [N(), N(), W(), W(), W(), N(), N()], false);
test('N N W W N W N (2 wilds < 2, then 1 wild < 1)', [N(), N(), W(), W(), N(), W(), N()], false);
test('N N W W N N W (2 wilds < 2, then 1 wild < 2)', [N(), N(), W(), W(), N(), N(), W()], false);
test('N N W N W W N (1 wild < 1 after first W, then 2 < 1)', [N(), N(), W(), N(), W(), W(), N()], false);
test('N N W N W N W (alternating W, each after insufficient naturals)', [N(), N(), W(), N(), W(), N(), W()], false);
test('N N W N N W W (1 wild < 1 at pos 2, then 2 wilds < 1 at pos 5)', [N(), N(), W(), N(), N(), W(), W()], false);
test('N N N W W W N (3 wilds < 3 preceding)', [N(), N(), N(), W(), W(), W(), N()], false);
test('N N N W W N W (2 wilds < 3, then 1 wild < 1)', [N(), N(), N(), W(), W(), N(), W()], false);
test('N N N W N W W (1 wild < 3, then 2 wilds < 1, final W has 0 preceding)', [N(), N(), N(), W(), N(), W(), W()], false);
console.log('');

// ═══════════════════════════════════════════════════════════════════════════════
// SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════

console.log('\n═══════════════════════════════════════════════════════════════════════');
console.log('TEST SUMMARY');
console.log('═══════════════════════════════════════════════════════════════════════');
console.log(`Total Tests: ${totalTests}`);
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log(`Pass Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

if (failedTests === 0) {
  console.log('\n🎉 ALL TESTS PASSED! Wild card validation logic is correct.');
  console.log('Ready for Phase 4: Team context validation.');
} else {
  console.log(`\n⚠️  ${failedTests} test(s) failed. Review the logic.`);
}
console.log('═══════════════════════════════════════════════════════════════════════\n');
