/**
 * Unit Tests for formatUtils
 * Run with: npm test
 */

import { describe, it, expect } from 'vitest';
import {
  formatChips,
  formatStack,
  convertToActualValue,
  convertFromActualValue,
  getAppropriateUnit,
} from '../formatUtils';

describe('formatUtils', () => {
  describe('formatChips', () => {
    it('should format chips with K suffix', () => {
      expect(formatChips(1000, 'K')).toBe('1.0K');
      expect(formatChips(25000, 'K')).toBe('25.0K');
      expect(formatChips(5500, 'K')).toBe('5.5K');
    });

    it('should format chips with Mil suffix', () => {
      expect(formatChips(1000000, 'Mil')).toBe('1.00M');
      expect(formatChips(2500000, 'Mil')).toBe('2.50M');
      expect(formatChips(1234567, 'Mil')).toBe('1.23M');
    });

    it('should format chips as actual value', () => {
      expect(formatChips(5000, 'actual')).toBe('5,000');
      expect(formatChips(1234567, 'actual')).toBe('1,234,567');
    });

    it('should default to actual when no unit specified', () => {
      expect(formatChips(1000)).toBe('1,000');
    });
  });

  describe('formatStack', () => {
    it('should auto-select K for thousands', () => {
      expect(formatStack(25000)).toBe('25.0K');
      expect(formatStack(5500)).toBe('5.5K');
    });

    it('should auto-select Mil for millions', () => {
      expect(formatStack(1500000)).toBe('1.50M');
      expect(formatStack(2000000)).toBe('2.00M');
    });

    it('should use actual for small amounts', () => {
      expect(formatStack(500)).toBe('500');
      expect(formatStack(999)).toBe('999');
    });

    it('should respect preferred unit when actual is specified', () => {
      expect(formatStack(25000, 'actual')).toBe('25,000');
      expect(formatStack(1500000, 'actual')).toBe('1,500,000');
    });
  });

  describe('convertToActualValue', () => {
    it('should convert K to actual chips', () => {
      expect(convertToActualValue(1, 'K')).toBe(1000);
      expect(convertToActualValue(25, 'K')).toBe(25000);
      expect(convertToActualValue(5.5, 'K')).toBe(5500);
    });

    it('should convert Mil to actual chips', () => {
      expect(convertToActualValue(1, 'Mil')).toBe(1000000);
      expect(convertToActualValue(2.5, 'Mil')).toBe(2500000);
    });

    it('should return actual value unchanged', () => {
      expect(convertToActualValue(100, 'actual')).toBe(100);
      expect(convertToActualValue(5000, 'actual')).toBe(5000);
    });
  });

  describe('convertFromActualValue', () => {
    it('should convert actual chips to K', () => {
      expect(convertFromActualValue(1000, 'K')).toBe(1);
      expect(convertFromActualValue(25000, 'K')).toBe(25);
      expect(convertFromActualValue(5500, 'K')).toBe(5.5);
    });

    it('should convert actual chips to Mil', () => {
      expect(convertFromActualValue(1000000, 'Mil')).toBe(1);
      expect(convertFromActualValue(2500000, 'Mil')).toBe(2.5);
    });

    it('should return actual value unchanged', () => {
      expect(convertFromActualValue(100, 'actual')).toBe(100);
      expect(convertFromActualValue(5000, 'actual')).toBe(5000);
    });
  });

  describe('getAppropriateUnit', () => {
    it('should suggest Mil for millions', () => {
      expect(getAppropriateUnit(1000000)).toBe('Mil');
      expect(getAppropriateUnit(5500000)).toBe('Mil');
    });

    it('should suggest K for thousands', () => {
      expect(getAppropriateUnit(1000)).toBe('K');
      expect(getAppropriateUnit(25000)).toBe('K');
      expect(getAppropriateUnit(999999)).toBe('K');
    });

    it('should suggest actual for small amounts', () => {
      expect(getAppropriateUnit(100)).toBe('actual');
      expect(getAppropriateUnit(999)).toBe('actual');
    });
  });
});
