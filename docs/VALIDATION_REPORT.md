# Pot Test Cases Validation Report

## Summary Statistics
- **Total Test Cases**: 13
- **Passed**: 1/13
- **Failed**: 12/13
- **Pass Rate**: 7.7%

## Detailed Results

### TC-1.1: Simple Preflop - Everyone Calls
**Status**: ✗ FAIL

- ✓ Position Labels
- ✗ Winner Stacks in Next Hand
- ✗ All Players in Next Hand
- ✓ Button Rotation
- ✓ Stack Setup Order
- ✓ Action Flow (Base vs More)
- ✓ Comparison Feature

**Errors**:
- Winner Stacks: Alice shows stack 9900 in Next Hand, expected 10300 (Final 9900 + Won)
- All Players: Player 200 missing from Next Hand Preview

---

### TC-2.2: One All-In Creates Side Pot
**Status**: ✗ FAIL

- ✓ Position Labels
- ✗ Winner Stacks in Next Hand
- ✗ All Players in Next Hand
- ✓ Button Rotation
- ✓ Stack Setup Order
- ✓ Action Flow (Base vs More)
- ✓ Comparison Feature

**Errors**:
- Winner Stacks: Bob shows stack 9300 in Next Hand, expected 10000 (Final 9300 + Won)
- All Players: Player 700 missing from Next Hand Preview

---

### TC-3.1: Two All-Ins at Different Amounts
**Status**: ✗ FAIL

- ✓ Position Labels
- ✗ Winner Stacks in Next Hand
- ✗ All Players in Next Hand
- ✗ Button Rotation
- ✓ Stack Setup Order
- ✓ Action Flow (Base vs More)
- ✓ Comparison Feature

**Errors**:
- Winner Stacks: Alice shows stack 8000 in Next Hand, expected 14300 (Final 8000 + Won)
- All Players: Player Charlie missing from Next Hand Preview
- All Players: Player Bob missing from Next Hand Preview
- Button Rotation: Button rotation incorrect: Previous BB (Bob) should be New SB, but New SB is Alice

---

### TC-5.1: Preflop to Flop - Pot Carries Forward
**Status**: ✗ FAIL

- ✓ Position Labels
- ✗ Winner Stacks in Next Hand
- ✗ All Players in Next Hand
- ✓ Button Rotation
- ✓ Stack Setup Order
- ✓ Action Flow (Base vs More)
- ✓ Comparison Feature

**Errors**:
- Winner Stacks: Alice shows stack 9700 in Next Hand, expected 11100 (Final 9700 + Won)
- All Players: Player 300 missing from Next Hand Preview
- All Players: Player 800 missing from Next Hand Preview
- All Players: Player 900 missing from Next Hand Preview

---

### TC-5.2: Preflop All-In Continues to River
**Status**: ✗ FAIL

- ✓ Position Labels
- ✗ Winner Stacks in Next Hand
- ✓ All Players in Next Hand
- ✓ Button Rotation
- ✓ Stack Setup Order
- ✓ Action Flow (Base vs More)
- ✓ Comparison Feature

**Errors**:
- Winner Stacks: Bob shows stack 0 in Next Hand, expected 14800 (Final 0 + Won)

---

### TC-6.1: 8 Players - Multi-Round Betting All Streets
**Status**: ✗ FAIL

- ✓ Position Labels
- ✗ Winner Stacks in Next Hand
- ✓ All Players in Next Hand
- ✗ Button Rotation
- ✓ Stack Setup Order
- ✓ Action Flow (Base vs More)
- ✓ Comparison Feature

**Errors**:
- Winner Stacks: Alice shows stack 9950 in Next Hand, expected 22450 (Final 9950 + Won)
- Button Rotation: Button rotation incorrect: Previous Dealer (Henry) should be New BB, but New BB is Charlie

---

### TC-7.1: 8 Players - Multiple All-Ins Creating 3 Side Pots
**Status**: ✗ FAIL

- ✓ Position Labels
- ✗ Winner Stacks in Next Hand
- ✗ All Players in Next Hand
- ✗ Button Rotation
- ✓ Stack Setup Order
- ✓ Action Flow (Base vs More)
- ✓ Comparison Feature

**Errors**:
- Winner Stacks: Alice shows stack 9950 in Next Hand, expected 28150 (Final 9950 + Won)
- All Players: Player 200 missing from Next Hand Preview
- Button Rotation: Button rotation incorrect: Previous Dealer (Henry) should be New BB, but New BB is Charlie

---

### TC-8.1: 8 Players - Aggressive Multi-Street Betting with Flop Raise War
**Status**: ✗ FAIL

- ✓ Position Labels
- ✗ Winner Stacks in Next Hand
- ✗ All Players in Next Hand
- ✗ Button Rotation
- ✓ Stack Setup Order
- ✓ Action Flow (Base vs More)
- ✓ Comparison Feature

**Errors**:
- Winner Stacks: Alice shows stack 14700 in Next Hand, expected 34200 (Final 14700 + Won)
- All Players: Player Frank missing from Next Hand Preview
- Button Rotation: Button rotation incorrect: Previous Dealer (Henry) should be New BB, but New BB is Charlie

---

### TC-9.1: 6 Players - Heavy Betting Every Street with Multiple Callers
**Status**: ✗ FAIL

- ✓ Position Labels
- ✓ Winner Stacks in Next Hand
- ✓ All Players in Next Hand
- ✗ Button Rotation
- ✓ Stack Setup Order
- ✓ Action Flow (Base vs More)
- ✓ Comparison Feature

**Errors**:
- Button Rotation: Button rotation incorrect: Previous Dealer (Frank) should be New BB, but New BB is Charlie

---

### TC-10.1: 7 Players - Turn and River Raise Wars
**Status**: ✗ FAIL

- ✓ Position Labels
- ✗ Winner Stacks in Next Hand
- ✓ All Players in Next Hand
- ✗ Button Rotation
- ✓ Stack Setup Order
- ✓ Action Flow (Base vs More)
- ✓ Comparison Feature

**Errors**:
- Winner Stacks: Alice shows stack 19950 in Next Hand, expected 45050 (Final 19950 + Won)
- Button Rotation: Button rotation incorrect: Previous Dealer (Grace) should be New BB, but New BB is Charlie

---

### TC-11.1: Heads-Up Preflop All-In
**Status**: ✗ FAIL

- ✓ Position Labels
- ✓ Winner Stacks in Next Hand
- ✓ All Players in Next Hand
- ✓ Button Rotation
- ✗ Stack Setup Order
- ✓ Action Flow (Base vs More)
- ✓ Comparison Feature

**Errors**:
- Stack Setup Order: Stack Setup starts with SB instead of Dealer: Alice SB 6000

---

### TC-12.1: 3-Player Side Pot with Different Winners
**Status**: ✓ PASS

- ✓ Position Labels
- ✓ Winner Stacks in Next Hand
- ✓ All Players in Next Hand
- ✓ Button Rotation
- ✓ Stack Setup Order
- ✓ Action Flow (Base vs More)
- ✓ Comparison Feature

---

### TC-13.1: 6-Player Complex Multi-Street with 3 Side Pots
**Status**: ✗ FAIL

- ✓ Position Labels
- ✓ Winner Stacks in Next Hand
- ✗ All Players in Next Hand
- ✗ Button Rotation
- ✓ Stack Setup Order
- ✓ Action Flow (Base vs More)
- ✓ Comparison Feature

**Errors**:
- All Players: Player David missing from Next Hand Preview
- All Players: Player Charlie missing from Next Hand Preview
- All Players: Player Alice missing from Next Hand Preview
- All Players: Player Bob missing from Next Hand Preview
- Button Rotation: Button rotation incorrect: Previous BB (Bob) should be New SB, but New SB is Eve

---

## Failed Test Cases

- [TC-1.1: Simple Preflop - Everyone Calls](#tc-1-1)
- [TC-2.2: One All-In Creates Side Pot](#tc-2-2)
- [TC-3.1: Two All-Ins at Different Amounts](#tc-3-1)
- [TC-5.1: Preflop to Flop - Pot Carries Forward](#tc-5-1)
- [TC-5.2: Preflop All-In Continues to River](#tc-5-2)
- [TC-6.1: 8 Players - Multi-Round Betting All Streets](#tc-6-1)
- [TC-7.1: 8 Players - Multiple All-Ins Creating 3 Side Pots](#tc-7-1)
- [TC-8.1: 8 Players - Aggressive Multi-Street Betting with Flop Raise War](#tc-8-1)
- [TC-9.1: 6 Players - Heavy Betting Every Street with Multiple Callers](#tc-9-1)
- [TC-10.1: 7 Players - Turn and River Raise Wars](#tc-10-1)
- [TC-11.1: Heads-Up Preflop All-In](#tc-11-1)
- [TC-13.1: 6-Player Complex Multi-Street with 3 Side Pots](#tc-13-1)

