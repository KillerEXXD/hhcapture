/**
 * AmountInput Component
 *
 * Specialized input field for entering bet/raise amounts with:
 * - Unit selection support (K, Mil, None/actual)
 * - Smart value persistence (Fix #3A: prevents clearing on re-render)
 * - Tab key navigation to next player's Card 1
 * - Enter key also navigates to next player
 * - Raw value storage (conversion happens during processing, not in input)
 * - Raise validation: ensures second raise is larger than first
 */

import React, { useState, useEffect, useRef } from 'react';
import type { ChipUnit } from '../../types/poker';
import { ValidationModal } from '../ui/ValidationModal';

interface AmountInputProps {
  playerId: number;
  selectedAmount?: string;
  selectedAction?: string;
  selectedUnit?: ChipUnit;
  suffix?: string;
  isForcedAllIn?: boolean;
  isDisabled?: boolean;
  defaultUnit?: ChipUnit;
  previousRaiseAmount?: number; // For validation
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
  previousRaiseAmount = 0,
  onAmountChange,
  onUnitChange,
  onTabComplete
}: AmountInputProps): React.ReactElement {
  const [localAmount, setLocalAmount] = useState(selectedAmount || '');
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
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
    // Validate raise amount if action is raise and we have a previous raise
    if (selectedAction === 'raise' && previousRaiseAmount > 0 && localAmount) {
      const currentUnit = selectedUnit || defaultUnit;
      let actualAmount = parseFloat(localAmount);

      // Convert to actual value based on unit
      if (currentUnit === 'K') {
        actualAmount *= 1000;
      } else if (currentUnit === 'Mil') {
        actualAmount *= 1000000;
      }

      // Check if current raise is less than or equal to previous raise
      if (actualAmount <= previousRaiseAmount) {
        setValidationMessage(
          `Invalid Raise Amount!\n\nYour raise of ${formatAmount(actualAmount)} must be greater than the previous raise of ${formatAmount(previousRaiseAmount)}.\n\nPlease enter a higher amount.`
        );
        setShowValidationModal(true);
        return false;
      }
    }

    // Simply save the raw value without conversion
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
    // Shift+Tab: Navigate back to Action column
    if (e.key === 'Tab' && e.shiftKey) {
      console.log(`🔙 [AmountInput] Shift+Tab pressed for player ${playerId}${suffix}`);
      e.preventDefault();
      const isValid = validateAndSave();
      if (!isValid) {
        console.log(`❌ [AmountInput] Validation failed, stopping navigation`);
        return; // Stop if validation failed
      }

      // Navigate back to Action column
      setTimeout(() => {
        const actionFocusAttr = `${playerId}-preflop${suffix}`;
        console.log(`🎯 [AmountInput] Looking for action element: [data-action-focus="${actionFocusAttr}"]`);
        const actionElement = document.querySelector(`[data-action-focus="${actionFocusAttr}"]`) as HTMLElement;
        if (actionElement) {
          console.log(`✅ [AmountInput] Found action element, focusing`);
          actionElement.focus();
        } else {
          console.log(`❌ [AmountInput] Action element not found`);
        }
      }, 100);

      // Mark to skip blur validation since we already validated
      e.currentTarget.dataset.skipBlur = 'true';
      return;
    }

    // Tab key handling - validate and navigate to next player
    if (e.key === 'Tab' && !e.shiftKey) {
      console.log(`➡️ [AmountInput] Tab pressed for player ${playerId}${suffix}`);
      e.preventDefault();
      const isValid = validateAndSave();
      if (!isValid) {
        console.log(`❌ [AmountInput] Validation failed, stopping navigation`);
        return; // Stop if validation failed
      }

      console.log(`✅ [AmountInput] Validation passed, calling onTabComplete`);
      // Navigate to next player's Card 1
      if (onTabComplete) {
        setTimeout(() => {
          console.log(`🔄 [AmountInput] Executing onTabComplete callback`);
          onTabComplete();
        }, 100);
      } else {
        console.log(`⚠️ [AmountInput] No onTabComplete callback provided`);
      }

      // Mark to skip blur validation since we already validated
      e.currentTarget.dataset.skipBlur = 'true';
      return;
    }

    // Enter key - validate and move to next field
    if (e.key === 'Enter') {
      const isValid = validateAndSave();
      if (!isValid) return; // Stop if validation failed

      // Also navigate on Enter
      if (onTabComplete) {
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
      <ValidationModal
        isOpen={showValidationModal}
        title="Invalid Raise Amount"
        message={validationMessage}
        onClose={() => setShowValidationModal(false)}
        inputRef={inputRef}
      />
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
