/**
 * Browser-compatible modules (ES6)
 * All poker functions compiled to vanilla JavaScript
 */

// ============================================================================
// FORMAT UTILS
// ============================================================================

export function formatChips(amount, unit = 'actual') {
  if (unit === 'K') {
    return `${(amount / 1000).toFixed(1)}K`;
  } else if (unit === 'Mil') {
    return `${(amount / 1000000).toFixed(2)}M`;
  }
  return amount.toLocaleString();
}

export function formatStack(stack, preferredUnit = 'K') {
  if (stack >= 1000000 && preferredUnit !== 'actual') {
    return formatChips(stack, 'Mil');
  } else if (stack >= 1000 && preferredUnit !== 'actual') {
    return formatChips(stack, 'K');
  }
  return formatChips(stack, 'actual');
}

export function convertToActualValue(amount, unit) {
  if (unit === 'K') {
    return amount * 1000;
  } else if (unit === 'Mil') {
    return amount * 1000000;
  }
  return amount;
}

// ============================================================================
// STACK ENGINE
// ============================================================================

export function getLevelSuffix(level) {
  switch (level) {
    case 'base': return '';
    case 'more': return '_moreAction';
    case 'more2': return '_moreAction2';
    default: return '';
  }
}

export function getSuffixLevel(suffix) {
  switch (suffix) {
    case '': return 'base';
    case '_moreAction': return 'more';
    case '_moreAction2': return 'more2';
    default: return 'base';
  }
}

export function normalizePosition(position) {
  if (!position) return '';
  const pos = position.toLowerCase().trim();

  const positionMap = {
    'dealer': 'dealer',
    'btn': 'dealer',
    'button': 'dealer',
    'sb': 'sb',
    'small blind': 'sb',
    'bb': 'bb',
    'big blind': 'bb',
    'utg': 'utg',
    'under the gun': 'utg',
    'utg+1': 'utg+1',
    'utg1': 'utg+1',
    'utg+2': 'utg+2',
    'utg2': 'utg+2',
    'mp': 'mp',
    'middle position': 'mp',
    'mp+1': 'mp+1',
    'mp1': 'mp+1',
    'mp+2': 'mp+2',
    'mp2': 'mp+2',
    'co': 'co',
    'cutoff': 'co',
    'cut-off': 'co'
  };

  return positionMap[pos] || pos;
}

export function getAlreadyContributed(playerId, players, playerData, stage, suffix, defaultUnit = 'K') {
  const player = players.find(p => p.id === playerId);
  if (!player) return 0;

  const data = playerData[playerId] || {};
  const normalizedPos = normalizePosition(player.position);

  let totalContributed = 0;

  // For preflop, include posted blinds/antes
  if (stage === 'preflop') {
    if (normalizedPos === 'sb' && data.postedSB) {
      totalContributed += data.postedSB;
    }
    if (normalizedPos === 'bb' && data.postedBB) {
      totalContributed += data.postedBB;
    }

    // Add preflop base action amount (if in more action)
    if (suffix === '_moreAction' || suffix === '_moreAction2') {
      const baseAmount = data.preflop_amount;
      if (baseAmount) {
        const baseUnit = data.preflop_unit || defaultUnit;
        totalContributed += convertToActualValue(parseFloat(baseAmount), baseUnit);
      }
    }

    // Add more action 1 amount (if in more action 2)
    if (suffix === '_moreAction2') {
      const more1Amount = data.preflop_moreAction_amount;
      if (more1Amount) {
        const more1Unit = data.preflop_moreAction_unit || defaultUnit;
        totalContributed += convertToActualValue(parseFloat(more1Amount), more1Unit);
      }
    }
  } else {
    // For postflop stages
    if (suffix === '_moreAction' || suffix === '_moreAction2') {
      const baseAmount = data[`${stage}_amount`];
      if (baseAmount) {
        const baseUnit = data[`${stage}_unit`] || defaultUnit;
        totalContributed += convertToActualValue(parseFloat(baseAmount), baseUnit);
      }
    }

    if (suffix === '_moreAction2') {
      const more1Amount = data[`${stage}_moreAction_amount`];
      if (more1Amount) {
        const more1Unit = data[`${stage}_moreAction_unit`] || defaultUnit;
        totalContributed += convertToActualValue(parseFloat(more1Amount), more1Unit);
      }
    }
  }

  return totalContributed;
}

export function getPayoffAmount(playerId, players, playerData, stage, suffix, defaultUnit = 'K') {
  const data = playerData[playerId] || {};

  const actionKey = `${stage}${suffix}_action`;
  const amountKey = `${stage}${suffix}_amount`;
  const unitKey = `${stage}${suffix}_unit`;

  const action = data[actionKey];
  const amountStr = data[amountKey];
  const unit = data[unitKey] || defaultUnit;

  // No amount specified
  if (!amountStr || amountStr === '' || amountStr === '0') {
    return 0;
  }

  const amount = parseFloat(amountStr);
  const amountInActual = convertToActualValue(amount, unit);

  // Get already contributed in this stage
  const alreadyContributed = getAlreadyContributed(
    playerId,
    players,
    playerData,
    stage,
    suffix,
    defaultUnit
  );

  // For calls and raises, subtract what was already contributed
  if (action === 'call' || action === 'raise') {
    return Math.max(amountInActual - alreadyContributed, 0);
  }

  // For bets, all-in, and other actions, use the full amount
  return amountInActual;
}

export function convertFromActualValue(actualAmount, unit) {
  if (unit === 'K') {
    return actualAmount / 1000;
  } else if (unit === 'Mil') {
    return actualAmount / 1000000;
  }
  return actualAmount;
}

export function getAppropriateUnit(amount) {
  if (amount >= 1000000) {
    return 'Mil';
  } else if (amount >= 1000) {
    return 'K';
  }
  return 'actual';
}

// ============================================================================
// POSITION UTILS
// ============================================================================

export function normalizePosition(position) {
  const normalized = position.trim().toUpperCase();

  const positionMap = {
    'BTN': 'Dealer',
    'BUTTON': 'Dealer',
    'D': 'Dealer',
    'DEALER': 'Dealer',
    'SB': 'SB',
    'SMALL BLIND': 'SB',
    'BB': 'BB',
    'BIG BLIND': 'BB',
    'UTG': 'UTG',
    'UTG+1': 'UTG+1',
    'UTG+2': 'UTG+2',
    'MP': 'MP',
    'MP+1': 'MP+1',
    'MP+2': 'MP+2',
    'CO': 'CO',
    'CUTOFF': 'CO',
    'HJ': 'HJ',
    'HIJACK': 'HJ',
  };

  return positionMap[normalized] || position;
}

export function getPositionOrder(tableSize) {
  const fullOrder = ['Dealer', 'SB', 'BB', 'UTG', 'UTG+1', 'UTG+2', 'MP', 'CO', 'HJ'];

  if (tableSize <= 6) {
    return ['Dealer', 'SB', 'BB', 'UTG', 'MP', 'CO'];
  } else if (tableSize <= 7) {
    return ['Dealer', 'SB', 'BB', 'UTG', 'UTG+1', 'MP', 'CO'];
  } else if (tableSize <= 8) {
    return ['Dealer', 'SB', 'BB', 'UTG', 'UTG+1', 'MP', 'CO', 'HJ'];
  }

  return fullOrder;
}

// ============================================================================
// NAVIGATION UTILS
// ============================================================================

export function getLevelSuffix(level) {
  switch (level) {
    case 'base': return '';
    case 'more': return '_moreAction';
    case 'more2': return '_moreAction2';
    default: return '';
  }
}

export function createSectionKey(stage, level) {
  return `${stage}_${level}`;
}

export function getNextStage(currentStage) {
  const stageOrder = ['stack', 'preflop', 'flop', 'turn', 'river'];
  const currentIndex = stageOrder.indexOf(currentStage);

  if (currentIndex === -1 || currentIndex === stageOrder.length - 1) {
    return null;
  }

  return stageOrder[currentIndex + 1];
}

export function getStageDisplayName(stage) {
  const displayNames = {
    stack: 'Stack Setup',
    preflop: 'Pre-Flop',
    flop: 'Flop',
    turn: 'Turn',
    river: 'River',
  };

  return displayNames[stage] || stage;
}

// ============================================================================
// CARD ENGINE
// ============================================================================

const ALL_RANKS = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2'];
const ALL_SUITS = ['♠', '♥', '♦', '♣'];

export function generateDeck() {
  const deck = [];

  ALL_RANKS.forEach(rank => {
    ALL_SUITS.forEach(suit => {
      deck.push({ rank, suit });
    });
  });

  return deck;
}

export function shuffleDeck(deck) {
  const shuffled = [...deck];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

export function cardToString(card) {
  if (!card || !card.rank || !card.suit) {
    return '';
  }
  return `${card.rank}${card.suit}`;
}

export function getSelectedCards(players, playerData, communityCards) {
  const selectedCards = new Set();

  players.forEach(player => {
    const data = playerData[player.id];
    if (data) {
      if (data.card1?.rank && data.card1?.suit) {
        selectedCards.add(`${data.card1.rank}${data.card1.suit}`);
      }
      if (data.card2?.rank && data.card2?.suit) {
        selectedCards.add(`${data.card2.rank}${data.card2.suit}`);
      }
    }
  });

  if (communityCards.flop.card1?.rank && communityCards.flop.card1?.suit) {
    selectedCards.add(`${communityCards.flop.card1.rank}${communityCards.flop.card1.suit}`);
  }
  if (communityCards.flop.card2?.rank && communityCards.flop.card2?.suit) {
    selectedCards.add(`${communityCards.flop.card2.rank}${communityCards.flop.card2.suit}`);
  }
  if (communityCards.flop.card3?.rank && communityCards.flop.card3?.suit) {
    selectedCards.add(`${communityCards.flop.card3.rank}${communityCards.flop.card3.suit}`);
  }
  if (communityCards.turn.card1?.rank && communityCards.turn.card1?.suit) {
    selectedCards.add(`${communityCards.turn.card1.rank}${communityCards.turn.card1.suit}`);
  }
  if (communityCards.river.card1?.rank && communityCards.river.card1?.suit) {
    selectedCards.add(`${communityCards.river.card1.rank}${communityCards.river.card1.suit}`);
  }

  return selectedCards;
}
