/**
 * Interactive Test Playground
 * Run with: npx ts-node playground/test-playground.ts
 * Or compile and run: tsc playground/test-playground.ts && node playground/test-playground.js
 */

// Import the functions we want to test
import { formatChips, convertToActualValue, formatStack } from '../src/lib/poker/utils/formatUtils.js';
import { normalizePosition, inferPlayerPositions, sortPlayersByPosition } from '../src/lib/poker/utils/positionUtils.js';
import { getLevelSuffix, createSectionKey, getNextStage } from '../src/lib/poker/utils/navigationUtils.js';
import { generateDeck, shuffleDeck, getSelectedCards, isCardAvailable } from '../src/lib/poker/engine/cardEngine.js';
import { Player } from '../src/types/poker/index.js';

console.log('🎮 POKER HAND COLLECTOR - INTERACTIVE TEST PLAYGROUND\n');
console.log('=' .repeat(60));

// ============================================================================
// TEST 1: Format Utils
// ============================================================================
console.log('\n📊 TEST 1: Format Utils');
console.log('-'.repeat(60));

console.log('\n✅ formatChips():');
console.log(`  1000 in K: ${formatChips(1000, 'K')}`);           // Expected: "1.0K"
console.log(`  25000 in K: ${formatChips(25000, 'K')}`);         // Expected: "25.0K"
console.log(`  1500000 in Mil: ${formatChips(1500000, 'Mil')}`); // Expected: "1.50M"
console.log(`  5000 in actual: ${formatChips(5000, 'actual')}`); // Expected: "5,000"

console.log('\n✅ convertToActualValue():');
console.log(`  25K → ${convertToActualValue(25, 'K')}`);         // Expected: 25000
console.log(`  2.5M → ${convertToActualValue(2.5, 'Mil')}`);     // Expected: 2500000
console.log(`  100 actual → ${convertToActualValue(100, 'actual')}`); // Expected: 100

console.log('\n✅ formatStack():');
console.log(`  25000 → ${formatStack(25000)}`);                  // Expected: "25.0K"
console.log(`  1500000 → ${formatStack(1500000)}`);              // Expected: "1.50M"
console.log(`  500 → ${formatStack(500)}`);                      // Expected: "500"

// ============================================================================
// TEST 2: Position Utils
// ============================================================================
console.log('\n\n🎲 TEST 2: Position Utils');
console.log('-'.repeat(60));

console.log('\n✅ normalizePosition():');
console.log(`  "BTN" → "${normalizePosition('BTN')}"`);          // Expected: "Dealer"
console.log(`  "sb" → "${normalizePosition('sb')}"`);            // Expected: "SB"
console.log(`  "BIG BLIND" → "${normalizePosition('BIG BLIND')}"`); // Expected: "BB"

console.log('\n✅ inferPlayerPositions():');
const testPlayers: Player[] = [
  { id: 1, name: 'Alice', position: 'Dealer', stack: 10000 },
  { id: 2, name: 'Bob', position: '', stack: 8500 },
  { id: 3, name: 'Charlie', position: '', stack: 12000 },
  { id: 4, name: 'David', position: '', stack: 9500 },
  { id: 5, name: 'Emma', position: '', stack: 11000 },
  { id: 6, name: 'Frank', position: '', stack: 7500 },
];

const playersWithPositions = inferPlayerPositions(testPlayers);
console.log('  Players after position inference:');
playersWithPositions.forEach(p => {
  if (p.name) {
    console.log(`    ${p.name}: ${p.position}`);
  }
});

console.log('\n✅ sortPlayersByPosition():');
const sorted = sortPlayersByPosition(playersWithPositions);
console.log('  Players sorted by position:');
sorted.forEach(p => {
  if (p.name) {
    console.log(`    ${p.position}: ${p.name}`);
  }
});

// ============================================================================
// TEST 3: Navigation Utils
// ============================================================================
console.log('\n\n🧭 TEST 3: Navigation Utils');
console.log('-'.repeat(60));

console.log('\n✅ getLevelSuffix():');
console.log(`  'base' → "${getLevelSuffix('base')}"`);          // Expected: ""
console.log(`  'more' → "${getLevelSuffix('more')}"`);          // Expected: "_moreAction"
console.log(`  'more2' → "${getLevelSuffix('more2')}"`);        // Expected: "_moreAction2"

console.log('\n✅ createSectionKey():');
console.log(`  (preflop, base) → "${createSectionKey('preflop', 'base')}"`);   // Expected: "preflop_base"
console.log(`  (flop, more) → "${createSectionKey('flop', 'more')}"`);         // Expected: "flop_more"

console.log('\n✅ getNextStage():');
console.log(`  After 'preflop' → "${getNextStage('preflop')}"`); // Expected: "flop"
console.log(`  After 'flop' → "${getNextStage('flop')}"`);       // Expected: "turn"
console.log(`  After 'river' → ${getNextStage('river')}`);       // Expected: null

// ============================================================================
// TEST 4: Card Engine
// ============================================================================
console.log('\n\n🃏 TEST 4: Card Engine');
console.log('-'.repeat(60));

console.log('\n✅ generateDeck():');
const deck = generateDeck();
console.log(`  Deck size: ${deck.length} cards`);               // Expected: 52
console.log(`  First card: ${deck[0].rank}${deck[0].suit}`);
console.log(`  Last card: ${deck[51].rank}${deck[51].suit}`);

// Check for duplicates
const deckStrings = deck.map(c => `${c.rank}${c.suit}`);
const uniqueCards = new Set(deckStrings);
console.log(`  Unique cards: ${uniqueCards.size}`);             // Expected: 52 (no duplicates)

console.log('\n✅ shuffleDeck():');
const shuffled = shuffleDeck(deck);
console.log(`  Shuffled deck size: ${shuffled.length}`);        // Expected: 52
console.log(`  First 5 cards after shuffle: ${shuffled.slice(0, 5).map(c => `${c.rank}${c.suit}`).join(', ')}`);

// Check shuffling actually changed order
const sameOrder = shuffled.every((card, i) =>
  card.rank === deck[i].rank && card.suit === deck[i].suit
);
console.log(`  Order changed: ${!sameOrder}`);                  // Expected: true (very likely)

console.log('\n✅ getSelectedCards():');
const testPlayerData = {
  1: {
    card1: { rank: 'A' as const, suit: '♠' as const },
    card2: { rank: 'K' as const, suit: '♠' as const }
  },
  2: {
    card1: { rank: 'Q' as const, suit: '♥' as const },
    card2: { rank: 'J' as const, suit: '♥' as const }
  }
};

const testCommunityCards = {
  flop: {
    card1: { rank: 'A' as const, suit: '♥' as const },
    card2: { rank: 'K' as const, suit: '♦' as const },
    card3: { rank: 'Q' as const, suit: '♣' as const }
  },
  turn: { card1: null },
  river: { card1: null }
};

const selectedCards = getSelectedCards(testPlayers.slice(0, 2), testPlayerData, testCommunityCards);
console.log(`  Selected cards count: ${selectedCards.size}`);  // Expected: 7 (4 player cards + 3 flop)
console.log(`  Selected cards: ${Array.from(selectedCards).join(', ')}`);

console.log('\n✅ isCardAvailable():');
const aceSpadeAvailable = isCardAvailable(
  'A', '♠', 1, 1,
  testPlayers.slice(0, 2),
  testPlayerData,
  testCommunityCards,
  true
);
console.log(`  A♠ available (already assigned to player 1): ${aceSpadeAvailable}`); // Expected: true (can reassign to same player)

const aceHeartsAvailable = isCardAvailable(
  'A', '♥', 1, 1,
  testPlayers.slice(0, 2),
  testPlayerData,
  testCommunityCards,
  true
);
console.log(`  A♥ available (in flop): ${aceHeartsAvailable}`); // Expected: false

const twoClubsAvailable = isCardAvailable(
  '2', '♣', 1, 1,
  testPlayers.slice(0, 2),
  testPlayerData,
  testCommunityCards,
  true
);
console.log(`  2♣ available (not selected): ${twoClubsAvailable}`); // Expected: true

// ============================================================================
// SUMMARY
// ============================================================================
console.log('\n\n' + '='.repeat(60));
console.log('✅ TESTS COMPLETE!');
console.log('='.repeat(60));
console.log('\nIf all outputs match expected values, the functions are working correctly!');
console.log('\nTo run unit tests with coverage, install Vitest and run:');
console.log('  npm install --save-dev vitest');
console.log('  npm test\n');
