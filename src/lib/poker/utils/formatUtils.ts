/**
 * Format Utilities
 * Functions for formatting chip amounts, stacks, and display values
 */

import { ChipUnit } from '../../../types/poker';

/**
 * Format chip amount with unit suffix
 */
export function formatChips(amount: number, unit: ChipUnit = 'actual'): string {
  if (unit === 'K') {
    return `${(amount / 1000).toFixed(1)}K`;
  } else if (unit === 'Mil') {
    return `${(amount / 1000000).toFixed(2)}M`;
  }
  return amount.toLocaleString();
}

/**
 * Format stack display with appropriate unit
 */
export function formatStack(stack: number, preferredUnit: ChipUnit = 'K'): string {
  if (stack >= 1000000 && preferredUnit !== 'actual') {
    return formatChips(stack, 'Mil');
  } else if (stack >= 1000 && preferredUnit !== 'actual') {
    return formatChips(stack, 'K');
  }
  return formatChips(stack, 'actual');
}

/**
 * Convert chip amount based on unit to actual chips
 */
export function convertToActualValue(amount: number, unit: ChipUnit): number {
  if (unit === 'K') {
    return amount * 1000;
  } else if (unit === 'Mil') {
    return amount * 1000000;
  }
  return amount;
}

/**
 * Convert actual chips to specified unit
 */
export function convertFromActualValue(actualAmount: number, unit: ChipUnit): number {
  if (unit === 'K') {
    return actualAmount / 1000;
  } else if (unit === 'Mil') {
    return actualAmount / 1000000;
  }
  return actualAmount;
}

/**
 * Get appropriate unit for a given chip amount
 */
export function getAppropriateUnit(amount: number): ChipUnit {
  if (amount >= 1000000) {
    return 'Mil';
  } else if (amount >= 1000) {
    return 'K';
  }
  return 'actual';
}
