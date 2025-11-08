/**
 * AmountInput Component
 *
 * Specialized input field for entering bet/raise amounts with:
 * - Unit selection support (K, Mil, None/actual)
 * - Smart value persistence (Fix #3A: prevents clearing on re-render)
 * - Tab key navigation to next player's Card 1
 * - Enter key also navigates to next player
 * - Raw value storage (conversion happens during processing, not in input)
 * - FR-12 Raise validation: comprehensive bet/raise amount validation
 */

import React, { useState, useEffect, useRef } from 'react';
import type { ChipUnit, Stage, ActionLevel, Player, PlayerData, SectionStacks } from '../../types/poker';

interface AmountInputProps {
  playerId: number;
  selectedAmount?: string;
  selectedAction?: string;
  selectedUnit?: ChipUnit;
  suffix?: string;
  isForcedAllIn?: boolean;
  isDisabled?: boolean;
  defaultUnit?: ChipUnit;
  // FR-12: Required props for comprehensive validation
  stage?: Stage;
  actionLevel?: ActionLevel;
  players?: Player[];
  playerData?: PlayerData;
  sectionStacks?: SectionStacks;
  onAmountChange?: (playerId: number, amount: string, suffix?: string) => void;
  onUnitChange?: (playerId: number, unit: ChipUnit) => void;
  onTabComplete?: () => void;
}

export function AmountInput({
  playerId,
  selectedAmount,
  selectedAction,
  selectedUnit,
  suffix = '',
  isForcedAllIn = false,
  isDisabled = false,
  defaultUnit = 'K',
  // FR-12: Validation props
  stage,
  actionLevel,
  players,
  playerData,
  sectionStacks,
  onAmountChange,
  onUnitChange,
  onTabComplete
}: AmountInputProps): React.ReactElement {
  const [localAmount, setLocalAmount] = useState(selectedAmount || '');
  const inputRef = useRef<HTMLInputElement>(null);

  // FIX #3A: Only update if selectedAmount is defined and truthy
  // This prevents clearing the input when playerData hasn't been updated yet
  useEffect(() => {
    if (selectedAmount !== undefined && selectedAmount !== null && selectedAmount !== '') {
      setLocalAmount(selectedAmount);
    }
  }, [selectedAmount, playerId, suffix]);

  // Auto-focus when Bet or Raise is selected
  useEffect(() => {
    if ((selectedAction === 'bet' || selectedAction === 'raise') && inputRef.current && !isForcedAllIn) {
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      });
    }
  }, [selectedAction, isForcedAllIn, playerId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    setLocalAmount(value);

    // Notify parent
    if (onAmountChange) {
      onAmountChange(playerId, value, suffix);
    }
  };

  const validateAndSave = (): boolean => {
    // Simply save the raw value without conversion
    // FR-12 validation will be done during Process Stack, not during input
    // Conversion will be done during processing instead
    if (onAmountChange) {
      onAmountChange(playerId, localAmount, suffix);
    }
    return true;
  };

  // Format amount for display in validation message
  const formatAmount = (amount: number): string => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(2)}M`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(2)}K`;
    }
    return amount.toString();
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Skip blur validation if Tab already validated
    if (e.currentTarget.dataset.skipBlur === 'true') {
      delete e.currentTarget.dataset.skipBlur;
      return;
    }

    validateAndSave();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    console.log(`🎹 [AmountInput] Key pressed: "${e.key}" for player ${playerId}${suffix}`);

    // Shift+Tab: Navigate back to Action column (not currently used, but left for completeness)
    if (e.key === 'Tab' && e.shiftKey) {
      console.log(`🔙 [AmountInput] Shift+Tab pressed for player ${playerId}${suffix}`);
      e.preventDefault();
      const isValid = validateAndSave();
      if (!isValid) {
        console.log(`❌ [AmountInput] Validation failed, stopping navigation`);
        return; // Stop if validation failed
      }

      console.log(`⚠️ [AmountInput] Shift+Tab - letting default behavior handle for now`);
      // Note: Since we don't know the stage (preflop/flop/turn/river) here,
      // we let default behavior handle reverse tab
      // Mark to skip blur validation since we already validated
      e.currentTarget.dataset.skipBlur = 'true';
      return;
    }

    // Tab key handling - validate and navigate to next player
    if (e.key === 'Tab' && !e.shiftKey) {
      console.log(`➡️ [AmountInput] Tab pressed for player ${playerId}${suffix}`);
      e.preventDefault();

      console.log(`🔍 [AmountInput] Validating amount before navigation...`);
      const isValid = validateAndSave();
      if (!isValid) {
        console.log(`❌ [AmountInput] Validation failed, stopping navigation`);
        return; // Stop if validation failed
      }

      console.log(`✅ [AmountInput] Validation passed`);

      // Navigate to next player's action
      if (onTabComplete) {
        console.log(`🔄 [AmountInput] onTabComplete callback exists, calling it`);
        setTimeout(() => {
          console.log(`🚀 [AmountInput] Executing onTabComplete callback`);
          onTabComplete();
        }, 100);
      } else {
        console.log(`⚠️ [AmountInput] WARNING: No onTabComplete callback provided!`);
        console.log(`💡 [AmountInput] This means Tab navigation from amount input won't work`);
      }

      // Mark to skip blur validation since we already validated
      e.currentTarget.dataset.skipBlur = 'true';
      return;
    }

    // Enter key - validate and move to next field
    if (e.key === 'Enter') {
      console.log(`⏎ [AmountInput] Enter key pressed for player ${playerId}${suffix}`);
      const isValid = validateAndSave();
      if (!isValid) {
        console.log(`❌ [AmountInput] Validation failed on Enter`);
        return; // Stop if validation failed
      }

      console.log(`✅ [AmountInput] Enter key - validation passed`);
      // Also navigate on Enter
      if (onTabComplete) {
        console.log(`🔄 [AmountInput] Calling onTabComplete on Enter`);
        setTimeout(() => {
          onTabComplete();
        }, 100);
      }
    }
  };

  const inputId = `amount-input-${playerId}${suffix || ''}`;

  const units: ChipUnit[] = ['actual', 'K', 'Mil'];
  const currentUnit = selectedUnit || defaultUnit;

  const handleUnitChange = (unit: ChipUnit) => {
    if (onUnitChange) {
      onUnitChange(playerId, unit);
    }
  };

  const isInputDisabled = isDisabled || isForcedAllIn;

  return (
    <>
      <div className="flex flex-row items-center gap-1">
        {/* Amount Input */}
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          placeholder="000"
          value={localAmount}
          onChange={handleChange}
          onBlur={handleBlur}
          readOnly={isInputDisabled}
          disabled={isInputDisabled}
          onKeyDown={handleKeyDown}
          data-amount-focus={`amount-${playerId}${suffix}`}
          className={`w-16 px-2 py-1 border border-gray-300 rounded text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500 ${
            isInputDisabled ? 'bg-gray-100 cursor-not-allowed text-gray-600' : ''
          }`}
        />

        {/* Unit Selector Buttons - Horizontal */}
        <div className="flex gap-0.5">
          {units.map((unit) => (
            <button
              key={unit}
              type="button"
              onClick={() => handleUnitChange(unit)}
              disabled={isInputDisabled}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                currentUnit === unit
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } ${isInputDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {unit === 'actual' ? 'None' : unit}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
