/**
 * CommunityCardSelector Component
 *
 * Button-based selector for community cards (Flop, Turn, River)
 * Matches the design of player hole card selectors with rank and suit buttons
 */

import React, { useState, forwardRef } from 'react';
import type { Card, Rank, Suit, Stage } from '../../types/poker';

interface CommunityCardSelectorProps {
  stage: Stage; // 'flop', 'turn', or 'river'
  cardNumber: number; // 1, 2, 3 for flop; 1 for turn/river
  label: string; // e.g., 'Flop 1', 'Turn', 'River'
  currentCard: Card | null;
  onCardChange: (stage: Stage, cardNumber: number, card: Card | null) => void;
  isCardAvailable: (rank: string, suit: string) => boolean;
  areAllSuitsTaken?: (rank: string) => boolean;
  autoSelect?: boolean; // If true, card can be auto-selected
}

interface CommunityCardSelectorHandle {
  focus: () => void;
}

export const CommunityCardSelector = forwardRef<HTMLDivElement, CommunityCardSelectorProps>(({
  stage,
  cardNumber,
  label,
  currentCard,
  onCardChange,
  isCardAvailable,
  areAllSuitsTaken = () => false,
  autoSelect = false,
}, ref) => {
  const [pendingRank, setPendingRank] = useState<string | null>(null);

  // Callback to move to next card selector
  const moveToNextCard = () => {
    console.log(`[CommunityCardSelector] Moving to next card from ${label}`);
    // Find next card selector or first player action
    const currentElement = (ref as React.RefObject<HTMLDivElement>)?.current;
    if (!currentElement) return;

    // Try to find the next card selector
    const allCardSelectors = Array.from(document.querySelectorAll('[data-community-card]'));
    const currentIndex = allCardSelectors.indexOf(currentElement);
    console.log(`[CommunityCardSelector] Current index: ${currentIndex}, Total cards: ${allCardSelectors.length}`);

    if (currentIndex < allCardSelectors.length - 1) {
      // Move to next card
      const nextCard = allCardSelectors[currentIndex + 1] as HTMLElement;
      console.log(`[CommunityCardSelector] Focusing next card`);
      nextCard.focus();
    } else {
      // Move to first player action
      console.log(`[CommunityCardSelector] All cards complete, finding first player action`);
      const firstAction = document.querySelector('[data-action-focus]') as HTMLElement;
      if (firstAction) {
        console.log(`[CommunityCardSelector] Focusing first player action`);
        firstAction.focus();
      }
    }
  };

  const ranksRow1 = ['A', '2', '3', '4', '5', '6', '7', '8', '9'];
  const ranksRow2 = ['K', 'Q', 'J', '10'];
  const suits = ['♠', '♥', '♦', '♣'];

  const suitColors: Record<string, string> = {
    '♠': 'text-gray-900',
    '♣': 'text-green-700',
    '♥': 'text-red-600',
    '♦': 'text-blue-600',
  };

  // Get the effective rank to display (either from currentCard or pendingRank)
  const displayRank = currentCard?.rank || pendingRank;
  const displaySuit = currentCard?.suit;

  const handleRankSelect = (rank: string) => {
    // Convert '10' to 'T' for the Rank type
    const normalizedRank = rank === '10' ? 'T' : rank;

    // If clicking the same rank that's already in currentCard, deselect it
    if (currentCard?.rank === normalizedRank) {
      onCardChange(stage, cardNumber, null);
      setPendingRank(null);
      return;
    }

    // Check if current suit is still available with new rank
    const currentSuit = currentCard?.suit;
    if (currentSuit && isCardAvailable(normalizedRank, currentSuit)) {
      // Keep the suit with new rank - card is now fully selected
      onCardChange(stage, cardNumber, {
        rank: normalizedRank as Rank,
        suit: currentSuit as Suit,
      });
      setPendingRank(null);

      // Auto-focus to next card
      setTimeout(() => moveToNextCard(), 50);
    } else {
      // Just set pending rank, wait for suit selection
      setPendingRank(normalizedRank);
      onCardChange(stage, cardNumber, null);
    }
  };

  const handleSuitSelect = (suit: string) => {
    const effectiveRank = currentCard?.rank || pendingRank;
    if (!effectiveRank) {
      return; // Must select rank first
    }

    const isAvailable = isCardAvailable(effectiveRank, suit);
    const isCurrentSelection = currentCard?.suit === suit;

    if (!isAvailable && !isCurrentSelection) {
      return; // Suit not available
    }

    // Toggle suit selection: deselect if same, otherwise set new suit
    if (isCurrentSelection) {
      onCardChange(stage, cardNumber, null);
      // Keep pending rank if there was one
      if (pendingRank) {
        setPendingRank(effectiveRank);
      }
    } else {
      // Card is now fully selected (rank + suit)
      onCardChange(stage, cardNumber, {
        rank: effectiveRank as Rank,
        suit: suit as Suit,
      });
      setPendingRank(null);

      // Auto-focus to next card
      setTimeout(() => moveToNextCard(), 50);
    }
  };

  // Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const key = e.key.toLowerCase();

    // Rank shortcuts: a, k, q, j, t (for 10), 2-9
    const rankMap: Record<string, string> = {
      a: 'A', k: 'K', q: 'Q', j: 'J', t: '10',
      '2': '2', '3': '3', '4': '4', '5': '5',
      '6': '6', '7': '7', '8': '8', '9': '9',
    };

    if (rankMap[key]) {
      e.preventDefault();
      e.stopPropagation();
      handleRankSelect(rankMap[key]);
      return;
    }

    // Suit shortcuts: d=diamond, c=clubs, h=hearts, s=spades
    const suitMap: Record<string, string> = {
      d: '♦', c: '♣', h: '♥', s: '♠',
    };

    if (suitMap[key]) {
      e.preventDefault();
      e.stopPropagation();
      handleSuitSelect(suitMap[key]);
      return;
    }
  };

  return (
    <div
      ref={ref}
      tabIndex={0}
      data-community-card={`${stage}-${cardNumber}`}
      onKeyDown={handleKeyDown}
      className="rounded p-2 transition-all border-2 border-gray-300 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
      {/* Card Display - Compact with colored suits */}
      <div className="text-xs font-semibold mb-0.5 flex items-center justify-between">
        <div>
          <span className="text-gray-700">{label}: </span>
          <span className="text-blue-600">{displayRank === 'T' ? '10' : displayRank || '?'}</span>
          {displaySuit && (
            <span className={`${suitColors[displaySuit]} ml-0.5`}>{displaySuit}</span>
          )}
        </div>
      </div>

      {/* Rank Buttons Row 1 */}
      <div className="flex gap-0.5 mb-0.5 items-center">
        {ranksRow1.map((rank) => {
          const normalizedRank = rank === '10' ? 'T' : rank;
          const allSuitsTaken = areAllSuitsTaken(normalizedRank);
          const isCurrentSelection = displayRank === normalizedRank;
          const isDisabled = allSuitsTaken && !isCurrentSelection;

          return (
            <button
              key={rank}
              type="button"
              disabled={isDisabled}
              tabIndex={-1}
              onMouseDown={(e) => {
                e.preventDefault();
                if (!isDisabled) {
                  handleRankSelect(rank);
                }
              }}
              className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center cursor-pointer transition-colors ${
                isDisabled
                  ? 'bg-gray-100 text-gray-300 line-through cursor-not-allowed opacity-50'
                  : isCurrentSelection
                  ? 'bg-blue-800 text-white hover:bg-blue-900'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {rank}
            </button>
          );
        })}
      </div>

      {/* Rank Buttons Row 2 + Suits */}
      <div className="flex gap-0.5 items-center">
        {ranksRow2.map((rank) => {
          const normalizedRank = rank === '10' ? 'T' : rank;
          const allSuitsTaken = areAllSuitsTaken(normalizedRank);
          const isCurrentSelection = displayRank === normalizedRank;
          const isDisabled = allSuitsTaken && !isCurrentSelection;

          return (
            <button
              key={rank}
              type="button"
              disabled={isDisabled}
              tabIndex={-1}
              onMouseDown={(e) => {
                e.preventDefault();
                if (!isDisabled) {
                  handleRankSelect(rank);
                }
              }}
              className={`w-6 h-6 rounded text-xs font-bold flex items-center justify-center cursor-pointer transition-colors ${
                isDisabled
                  ? 'bg-gray-100 text-gray-300 line-through cursor-not-allowed opacity-50'
                  : isCurrentSelection
                  ? 'bg-blue-800 text-white hover:bg-blue-900'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {rank === '10' ? 'T' : rank}
            </button>
          );
        })}

        {/* Divider */}
        <div className="border-l border-blue-300 h-6 mx-1"></div>

        {/* Suit Buttons */}
        <div className="flex gap-0.5">
          {suits.map((suit) => {
            const isAvailable = displayRank
              ? isCardAvailable(displayRank, suit)
              : true;
            const isCurrentSelection = displaySuit === suit;
            const isDisabled = !displayRank || (!isAvailable && !isCurrentSelection);

            return (
              <button
                key={suit}
                type="button"
                disabled={isDisabled}
                tabIndex={-1}
                onMouseDown={(e) => {
                  e.preventDefault();
                  if (displayRank && (isAvailable || isCurrentSelection)) {
                    handleSuitSelect(suit);
                  }
                }}
                className={`w-6 h-6 rounded text-sm font-bold flex items-center justify-center cursor-pointer transition-colors ${
                  !displayRank
                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed opacity-50'
                    : isCurrentSelection
                    ? 'bg-blue-800 text-white hover:bg-blue-900'
                    : !isAvailable
                    ? 'bg-gray-100 text-gray-300 line-through cursor-not-allowed opacity-50'
                    : `bg-gray-200 hover:bg-gray-300 ${suitColors[suit]}`
                }`}
              >
                {suit}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});

CommunityCardSelector.displayName = 'CommunityCardSelector';
