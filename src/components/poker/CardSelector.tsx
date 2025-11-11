/**
 * CardSelector Component
 *
 * Interactive component for selecting player cards (rank and suit)
 * Features:
 * - Rank buttons (A, 2-9, 10, J, Q, K)
 * - Suit buttons (♠, ♥, ♦, ♣)
 * - Keyboard shortcuts (a-9, t for 10, j, q, k | s, h, d, c for suits)
 * - Card availability validation
 * - Focus management with Tab navigation
 */

import React, { useState, useRef } from 'react';
import type { Card, Rank, Suit } from '../../types/poker';

interface CardSelectorProps {
  playerId: number;
  cardNumber: 1 | 2;
  currentCard: Card | null | undefined;
  onCardChange: (playerId: number, cardNumber: 1 | 2, card: Card) => void;
  isCardAvailable: (playerId: number, cardNumber: number, rank: string, suit: string) => boolean;
  areAllSuitsTaken: (playerId: number, cardNumber: number, rank: string) => boolean;
  dataCardFocus?: string; // For keyboard navigation
}

export const CardSelector: React.FC<CardSelectorProps> = ({
  playerId,
  cardNumber,
  currentCard,
  onCardChange,
  isCardAvailable,
  areAllSuitsTaken,
  dataCardFocus,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [pendingRank, setPendingRank] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
      onCardChange(playerId, cardNumber, null);
      setPendingRank(null);
      return;
    }

    // Check if current suit is still available with new rank
    const currentSuit = currentCard?.suit;
    if (currentSuit && isCardAvailable(playerId, cardNumber, normalizedRank, currentSuit)) {
      // Keep the suit with new rank
      onCardChange(playerId, cardNumber, {
        rank: normalizedRank as Rank,
        suit: currentSuit as Suit,
      });
      setPendingRank(null);

      // Auto-tab to next element when card is fully selected
      autoTabToNext();
    } else {
      // Just set pending rank, wait for suit selection
      setPendingRank(normalizedRank);
      onCardChange(playerId, cardNumber, null);
    }
  };

  const handleSuitSelect = (suit: string) => {
    const effectiveRank = currentCard?.rank || pendingRank;
    if (!effectiveRank) {
      return; // Must select rank first
    }

    const isAvailable = isCardAvailable(playerId, cardNumber, effectiveRank, suit);
    const isCurrentSelection = currentCard?.suit === suit;

    if (!isAvailable && !isCurrentSelection) {
      return; // Suit not available
    }

    // Toggle suit selection: deselect if same, otherwise set new suit
    if (isCurrentSelection) {
      onCardChange(playerId, cardNumber, null);
      // Keep pending rank if there was one
      if (pendingRank) {
        setPendingRank(effectiveRank);
      }
    } else {
      onCardChange(playerId, cardNumber, {
        rank: effectiveRank as Rank,
        suit: suit as Suit,
      });
      setPendingRank(null);

      // Auto-tab to next element when card is fully selected
      autoTabToNext();
    }
  };

  /**
   * Auto-tab to next element after card selection
   */
  const autoTabToNext = () => {
    if (!dataCardFocus) return;

    setTimeout(() => {
      if (cardNumber === 1) {
        // Move from Card 1 to Card 2
        const card2Selector = dataCardFocus.replace('-1-', '-2-');
        const card2Element = document.querySelector(`[data-card-focus="${card2Selector}"]`) as HTMLElement;
        if (card2Element) {
          card2Element.focus();
        }
      } else if (cardNumber === 2) {
        // Move from Card 2 to Action
        const parts = dataCardFocus.split('-');
        const playerId = parts[0];
        const stage = parts[2] + (parts[3] || '');
        const actionFocusAttr = `${playerId}-${stage}`;
        const actionElement = document.querySelector(`[data-action-focus="${actionFocusAttr}"]`) as HTMLElement;
        if (actionElement) {
          actionElement.focus();
        }
      }
    }, 100);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const key = e.key.toLowerCase();

    // Rank shortcuts: a, k, q, j, t (for 10), 2-9
    const rankMap: Record<string, string> = {
      a: 'A',
      k: 'K',
      q: 'Q',
      j: 'J',
      t: '10',
      '2': '2',
      '3': '3',
      '4': '4',
      '5': '5',
      '6': '6',
      '7': '7',
      '8': '8',
      '9': '9',
    };

    if (rankMap[key]) {
      e.preventDefault();
      e.stopPropagation();
      handleRankSelect(rankMap[key]);
      return;
    }

    // Suit shortcuts: d=diamond, c=clubs, h=hearts, s=spades
    const suitMap: Record<string, string> = {
      d: '♦',
      c: '♣',
      h: '♥',
      s: '♠',
    };

    if (suitMap[key]) {
      e.preventDefault();
      e.stopPropagation();
      handleSuitSelect(suitMap[key]);
      return;
    }

    // Tab navigation: move to next card or action
    if (e.key === 'Tab' && !e.shiftKey && dataCardFocus) {
      e.preventDefault();

      if (cardNumber === 1) {
        // Move from Card 1 to Card 2
        const card2Selector = dataCardFocus.replace('-1-', '-2-');
        const card2Element = document.querySelector(`[data-card-focus="${card2Selector}"]`) as HTMLElement;
        if (card2Element) {
          card2Element.focus();
          return;
        }
      } else if (cardNumber === 2) {
        // Move from Card 2 to Action
        const parts = dataCardFocus.split('-');
        const playerId = parts[0];
        const stage = parts[2] + (parts[3] || ''); // e.g., "preflop" or "preflop_moreAction"
        const actionFocusAttr = `${playerId}-${stage}`;
        const actionElement = document.querySelector(`[data-action-focus="${actionFocusAttr}"]`) as HTMLElement;
        if (actionElement) {
          actionElement.focus();
          return;
        }
      }
    }

    // Shift+Tab: Move backward
    if (e.key === 'Tab' && e.shiftKey && dataCardFocus) {
      e.preventDefault();

      if (cardNumber === 2) {
        // Move from Card 2 back to Card 1
        const card1Selector = dataCardFocus.replace('-2-', '-1-');
        const card1Element = document.querySelector(`[data-card-focus="${card1Selector}"]`) as HTMLElement;
        if (card1Element) {
          card1Element.focus();
          return;
        }
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`rounded p-2 transition-all outline-none ${
        isFocused
          ? 'border-2 border-blue-400 bg-blue-50 ring-2 ring-blue-500'
          : 'border-2 border-gray-300 bg-gray-50'
      }`}
      style={{ minWidth: '240px' }}
      tabIndex={0}
      data-card-focus={dataCardFocus}
      onKeyDown={handleKeyDown}
      onFocus={() => setIsFocused(true)}
      onBlur={(e) => {
        if (!containerRef.current?.contains(e.relatedTarget as Node)) {
          setIsFocused(false);
        }
      }}
      role="button"
      aria-label={`Card ${cardNumber}: ${displayRank || '?'}${displaySuit || '?'}`}
    >
      {/* Card Display - Compact with colored suits */}
      <div className="text-xs font-semibold mb-0.5 flex items-center justify-between">
        <div>
          <span className="text-gray-700">Card {cardNumber}: </span>
          <span className="text-blue-600">{displayRank === 'T' ? '10' : displayRank || '?'}</span>
          {displaySuit && (
            <span className={`${suitColors[displaySuit]} ml-0.5`}>{displaySuit}</span>
          )}
        </div>
        {/* TAB indicator */}
        <div className="text-[9px] text-gray-400 font-mono">TAB↓</div>
      </div>

      {/* Keyboard Shortcuts - Compact */}
      <div className="text-[10px] text-gray-500 mb-0.5 font-mono">
        a-9,t | d,c,h,s
      </div>

      {/* Rank Buttons Row 1 */}
      <div className="flex gap-0.5 mb-0.5 items-center">
        {ranksRow1.map((rank) => {
          const normalizedRank = rank === '10' ? 'T' : rank;
          const allSuitsTaken = areAllSuitsTaken(playerId, cardNumber, normalizedRank);
          const isCurrentSelection = displayRank === normalizedRank;
          const isDisabled = allSuitsTaken && !isCurrentSelection;

          return (
            <button
              key={rank}
              type="button"
              disabled={isDisabled}
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
          const allSuitsTaken = areAllSuitsTaken(playerId, cardNumber, normalizedRank);
          const isCurrentSelection = displayRank === normalizedRank;
          const isDisabled = allSuitsTaken && !isCurrentSelection;

          return (
            <button
              key={rank}
              type="button"
              disabled={isDisabled}
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
              ? isCardAvailable(playerId, cardNumber, displayRank, suit)
              : true;
            const isCurrentSelection = displaySuit === suit;
            const isDisabled = !displayRank || (!isAvailable && !isCurrentSelection);

            return (
              <button
                key={suit}
                type="button"
                disabled={isDisabled}
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
};
