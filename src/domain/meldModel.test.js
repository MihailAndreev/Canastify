/**
 * Unit tests for Meld Model functions
 * Test all detector and utility functions
 */

import {
  isAllWild,
  isCanasta,
  inferMeldType,
  getRunDirection,
  isValidRunStart,
  getExpectedDirection,
  sortRunCards,
  getRankName,
  createMeld,
  isMeldLocked
} from './meldModel.js';

// Mock card factory
function card(rank, suit, isJoker = false) {
  return {
    id: `${rank}${suit[0]}_${Math.random()}`,
    rank: rank,
    suit: suit,
    isJoker: isJoker,
    svgPath: ''
  };
}

const JOKER = 'JOKER';
const HEART = 'HEART';
const DIAMOND = 'DIAMOND';
const CLUB = 'CLUB';
const SPADE = 'SPADE';

// Test data
const joker = () => card(0, JOKER, true); // Joker has suit JOKER, rank 0
const two = (suit) => card(2, suit);     // Rank 2 is wild
const three = (suit) => card(3, suit);
const four = (suit) => card(4, suit);
const five = (suit) => card(5, suit);
const six = (suit) => card(6, suit);
const seven = (suit) => card(7, suit);
const eight = (suit) => card(8, suit);
const nine = (suit) => card(9, suit);

console.log('=== MELD MODEL TESTS ===\n');

// Test 1: isAllWild
console.log('Test 1: isAllWild');
console.log('✓ All wild cards:', isAllWild([joker(), joker()]) === true);
console.log('✓ Mixed cards:', isAllWild([four(SPADE), joker()]) === false);
console.log('✓ All 2s (wild):', isAllWild([two(SPADE), two(HEART)]) === true);
console.log('✓ Empty array:', isAllWild([]) === false);
console.log('');

// Test 2: isCanasta
console.log('Test 2: isCanasta');
const sevenCards = [
  four(SPADE), five(SPADE), six(SPADE),
  seven(SPADE), eight(SPADE), joker(), two(SPADE)
];
console.log('✓ 7 cards = canasta:', isCanasta(sevenCards) === true);
console.log('✓ 3 cards != canasta:', isCanasta([four(SPADE), five(SPADE), six(SPADE)]) === false);
console.log('✓ 6 cards != canasta:', isCanasta(sevenCards.slice(0, 6)) === false);
console.log('');

// Test 3: inferMeldType - SET
console.log('Test 3: inferMeldType - SET');
const kingSet = [
  card(13, SPADE),
  card(13, HEART),
  card(13, DIAMOND)
];
console.log('✓ Kings set:', inferMeldType(kingSet) === 'set');
console.log('✓ Kings + wild:', inferMeldType([...kingSet, joker()]) === 'set');
console.log('');

// Test 4: inferMeldType - RUN (natural)
console.log('Test 4: inferMeldType - RUN');
const naturalRun = [
  four(SPADE),
  five(SPADE),
  six(SPADE)
];
console.log('✓ Natural run (4-5-6):', inferMeldType(naturalRun) === 'run');
console.log('✓ Run with wild:', inferMeldType([...naturalRun, joker()]) === 'run');
console.log('');

// Test 5: inferMeldType - WILD (all wild)
console.log('Test 5: inferMeldType - WILD');
const allWildCards = [joker(), joker(), joker()];
console.log('✓ All jokers:', inferMeldType(allWildCards) === 'wild');
console.log('✓ Jokers + 2s:', inferMeldType([joker(), joker(), two(SPADE)]) === 'wild');
console.log('');

// Test 6: inferMeldType - MIXED (invalid)
console.log('Test 6: inferMeldType - Mixed/Invalid');
const mixedCards = [
  four(SPADE),
  five(HEART),  // different suit
  six(SPADE)
];
console.log('✓ Mixed suits/ranks:', inferMeldType(mixedCards) === 'mixed');
console.log('');

// Test 7: getRunDirection - UP
console.log('Test 7: getRunDirection - UP');
const upRun = [five(SPADE), six(SPADE), seven(SPADE)];
console.log('✓ 5-6-7 = UP:', getRunDirection(upRun) === 'up');
const upRun2 = [four(SPADE), five(SPADE), six(SPADE)];
console.log('✓ 4-5-6 = UP:', getRunDirection(upRun2) === 'up');
console.log('');

// Test 8: getRunDirection - DOWN
console.log('Test 8: getRunDirection - DOWN');
const downRun = [card(13, SPADE), card(12, SPADE), card(11, SPADE)]; // K-Q-J
console.log('✓ K-Q-J = DOWN:', getRunDirection(downRun) === 'down');
const downRun2 = [card(10, SPADE), nine(SPADE), card(8, SPADE)]; // 10-9-8
console.log('✓ 10-9-8 = DOWN:', getRunDirection(downRun2) === 'down');
console.log('');

// Test 9: isValidRunStart
console.log('Test 9: isValidRunStart');
console.log('✓ 4 is valid start:', isValidRunStart(four(SPADE)) === true);
console.log('✓ 8 is valid start:', isValidRunStart(eight(SPADE)) === true);
console.log('✓ 10 is valid start:', isValidRunStart(card(10, SPADE)) === true);
console.log('✓ 3 is NOT valid:', isValidRunStart(three(SPADE)) === false);
console.log('✓ 9 is NOT valid:', isValidRunStart(nine(SPADE)) === false);
console.log('✓ Joker is NOT valid:', isValidRunStart(joker()) === false);
console.log('');

// Test 10: getExpectedDirection
console.log('Test 10: getExpectedDirection');
console.log('✓ Rank 4 expects UP:', getExpectedDirection(4) === 'up');
console.log('✓ Rank 8 expects UP:', getExpectedDirection(8) === 'up');
console.log('✓ Rank 10 expects DOWN:', getExpectedDirection(10) === 'down');
console.log('✓ Rank 13 (K) expects DOWN:', getExpectedDirection(13) === 'down');
console.log('✓ Rank 3 is invalid:', getExpectedDirection(3) === null);
console.log('');

// Test 11: getRankName
console.log('Test 11: getRankName');
console.log('✓ Rank 1:', getRankName(1) === 'Ace');
console.log('✓ Rank 11:', getRankName(11) === 'Jack');
console.log('✓ Rank 13:', getRankName(13) === 'King');
console.log('');

// Test 12: sortRunCards - UP
console.log('Test 12: sortRunCards - UP');
const unsortedUp = [seven(SPADE), five(SPADE), six(SPADE)];
const sortedUp = sortRunCards(unsortedUp, 'up');
console.log('✓ Up sort preserves 5-6-7 order:', 
  sortedUp[0].rank === 5 && sortedUp[1].rank === 6 && sortedUp[2].rank === 7);
console.log('');

// Test 13: sortRunCards - DOWN
console.log('Test 13: sortRunCards - DOWN');
const unsortedDown = [card(11, SPADE), card(13, SPADE), card(12, SPADE)]; // J, K, Q (unordered)
const sortedDown = sortRunCards(unsortedDown, 'down');
console.log('✓ Down sort gives K-Q-J order:',
  sortedDown[0].rank === 13 && sortedDown[1].rank === 12 && sortedDown[2].rank === 11);
console.log('');

// Test 14: createMeld
console.log('Test 14: createMeld');
const setMeld = createMeld(kingSet);
console.log('✓ Set meld type:', setMeld.type === 'set');
console.log('✓ Non-canasta 3-card:', setMeld.isCanasta === false);
const canastaMeld = createMeld(sevenCards);
console.log('✓ 7-card is canasta:', canastaMeld.isCanasta === true);
console.log('');

// Test 15: isMeldLocked
console.log('Test 15: isMeldLocked');
console.log('✓ Non-canasta not locked:', isMeldLocked(setMeld) === false);
console.log('✓ Natural canasta not completely locked:', isMeldLocked(canastaMeld) === false);
const allWildCanasta = createMeld([joker(), joker(), joker(), joker(), joker(), joker(), joker()]);
console.log('✓ All-wild canasta is locked:', isMeldLocked(allWildCanasta) === true);
console.log('');

console.log('=== ALL TESTS COMPLETE ===');
