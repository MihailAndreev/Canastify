/**
 * Card Mapping for Vector Cards (Version 3.2)
 * Maps game card representation to SVG file paths
 */

const SUITS = {
  HEART: 'HEART',
  DIAMOND: 'DIAMOND',
  CLUB: 'CLUB',
  SPADE: 'SPADE'
};

const RANKS = {
  ACE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
  SIX: 6,
  SEVEN: 7,
  EIGHT: 8,
  NINE: 9,
  TEN: 10,
  JACK: 11,
  QUEEN: 12,
  KING: 13
};

const JOKER = 'JOKER';

/**
 * Get SVG path for a card
 * @param {string} suit - HEART, DIAMOND, CLUB, SPADE, or JOKER
 * @param {number} rank - 1-13 or joker number (1, 2, 3)
 * @returns {string} - Path to SVG file
 */
export function getCardSvgPath(suit, rank) {
  const BASE_PATH = '/assets/cards/vector_cards/FACES (PRINTABLE)/STANDARD (PRINTABLE)/Single Cards (One Per FIle)';
  
  if (suit === JOKER) {
    return `${BASE_PATH}/JOKER-${rank}.svg`;
  }
  
  const rankNames = {
    1: '1',
    2: '2',
    3: '3',
    4: '4',
    5: '5',
    6: '6',
    7: '7',
    8: '8',
    9: '9',
    10: '10',
    11: '11-JACK',
    12: '12-QUEEN',
    13: '13-KING'
  };
  
  const fileName = `${suit}-${rankNames[rank]}.svg`;
  return `${BASE_PATH}/${fileName}`;
}

/**
 * Create card object from suit and rank
 * @param {string} suit
 * @param {number} rank
 * @returns {object} - Card object with suit, rank, and svgPath
 */
export function createCard(suit, rank) {
  return {
    suit,
    rank,
    svgPath: getCardSvgPath(suit, rank),
    isJoker: suit === JOKER
  };
}

/**
 * Get all cards in deck (2 standard decks + 6 jokers for Canasta)
 * @returns {array} - Array of card objects
 */
export function getDeck() {
  const deck = [];
  
  // 2 standard decks
  for (let i = 0; i < 2; i++) {
    Object.values(SUITS).forEach(suit => {
      for (let rank = 1; rank <= 13; rank++) {
        deck.push(createCard(suit, rank));
      }
    });
  }
  
  // 6 jokers
  for (let i = 1; i <= 6; i++) {
    deck.push(createCard(JOKER, Math.ceil(i / 2)));
  }
  
  return deck;
}

export { SUITS, RANKS, JOKER };
