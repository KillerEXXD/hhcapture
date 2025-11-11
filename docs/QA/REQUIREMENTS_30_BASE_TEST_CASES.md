# Requirements for 30 Base Test Cases Generation

## Document Information
- **Created**: 2025-11-10
- **Purpose**: Record requirements for generating 30 validated poker hand history test cases
- **Status**: Completed ✅
- **Output File**: `30_base_validated_cases.html`

---

## Original User Requirements

### 1. Test Case Distribution (30 Total)

**Requirement**: Equal distribution across player counts and complexity levels

- **TC 1-5**: Simple (2 players) - 5 test cases
- **TC 6-20**: Medium (2-4 players mixed) - 15 test cases
- **TC 21-30**: Complex (5-9 players) - 10 test cases

**Player Count Distribution**:
- 2 players: 10 cases
- 3-4 players: 15 cases (short-handed)
- 5-9 players: 10 cases (full ring)

---

### 2. Action Requirements

**Betting Action**:
- 15-20 test cases with bet/call/raise/re-raise across all streets
- Checking should occur only 30% of the time
- Action should progress through multiple streets (Preflop → Flop → Turn → River)

**Side Pots**:
- 1-2 side pots in 80% of test cases
- Varied all-in scenarios to create side pot situations

**Complexity Progression**:
- Start simple, progress to complex
- Simple cases: Straightforward action, fewer players
- Complex cases: Multiple streets, more players, varied betting patterns

---

### 3. Stack Size Requirements

**CRITICAL REQUIREMENT**:

> "also should use different stacks for different players ranging from 10 bigs to 60 bigs are more. the sb and bb should be relative to what amounts are they are playing. need examples in millions also and thousands in stacks size all in numbers. pls add this to requirement."

**Stack Size Specifications**:

1. **Different Stacks Per Player**
   - Each player MUST have a different starting stack
   - No duplicate stack sizes within a test case

2. **Stack Range**: 10 BB to 60+ BB
   - Short stacks: 10-20 BB
   - Medium stacks: 30-40 BB
   - Deep stacks: 41-60+ BB
   - Mix all three categories in each test case

3. **BB Calculation**:
   - "X BB" means X times the Big Blind value
   - Example: If BB = 100, then 10 BB = 1,000 chips

---

### 4. Blind Structure Requirements

**CRITICAL REQUIREMENT**:

> "the sb and bb should be relative to what amounts are they are playing. need examples in millions also and thousands in stacks size all in numbers."

**Blind Structure Variations**:

1. **Hundreds Range**:
   - 50/100/100 (SB/BB/Ante)
   - 250/500/500

2. **Thousands Range**:
   - 500/1,000/1,000
   - 2,500/5,000/5,000

3. **Tens of Thousands**:
   - 5,000/10,000/10,000
   - 10,000/20,000/20,000
   - 25,000/50,000/50,000

4. **Hundreds of Thousands**:
   - 50,000/100,000/100,000
   - 250,000/500,000/500,000

5. **Millions** (REQUIRED):
   - 500,000/1,000,000/1,000,000
   - 1,000,000/2,000,000/2,000,000
   - 2,500,000/5,000,000/5,000,000

**Format Requirement**:
- All numeric values (no abbreviations like "K" or "M")
- Display with comma formatting: 1,000,000 not 1M

---

### 5. Validation Requirements

**CRITICAL REQUIREMENT**:

> "the plan was you create each and verify with the spec and it should pass all validation in spec. do you want to do that. don't wait for my approval, if the validation is passed, create next one and update the html."

**Validation Process**:

1. **Create One Test Case at a Time**
2. **Validate Against TEST_CASE_GENERATION_SPEC.md**
3. **If Validation Passes**: Automatically create next test case
4. **Update HTML Progressively**: Add to `30_base_validated_cases.html`
5. **No User Approval Needed**: Continue autonomously until all 30 are done

**Validation Checks**:
- ✅ Base vs More section assignment (Section 4 of spec)
- ✅ Button rotation clockwise (Section 6 of spec)
- ✅ BB Ante posting order (Section 7 of spec)
- ✅ All players in next hand (including busted at 0)
- ✅ Proper position labels and order

---

### 6. Compliance with TEST_CASE_GENERATION_SPEC.md

**All test cases MUST follow**:

1. **BB Ante Posting Order** (FR-7):
   - BB posts ANTE FIRST (dead money)
   - Then BB posts BLIND (live money)
   - BB's available stack = Starting Stack - Ante - BB Blind

2. **Base vs More Section Assignment** (Section 4):
   - Base section: EVERY player's FIRST action on that street
   - Actions in canonical position order: SB → BB → UTG → ... → Dealer
   - More sections: Only when action circles back due to raises

3. **Button Rotation** (Section 6):
   - 3+ players: Previous SB → New Dealer
   - 2 players (heads-up): Players swap positions each hand

4. **Stack Setup Order**:
   - Start with Dealer (NOT SB or BB)
   - Order: Dealer → SB → BB → Player1 → Player2 → ...
   - Exception: Heads-up has NO Dealer line, only SB and BB

5. **Position Labels**:
   - Show positions ONLY for: Dealer, SB, BB
   - DO NOT show positions for: UTG, MP, CO, HJ
   - Format: `PlayerName Dealer Stack` or `PlayerName Stack` (no position)

6. **Next Hand Preview**:
   - ALL players must appear (including eliminated with 0 stack)
   - Winners show NEW Stack = Final Stack + Pots Won
   - Button rotates clockwise for next hand

---

### 7. Copy/Paste Functionality Requirements

**CRITICAL REQUIREMENT**:

> "Can you make copying results and copying debug logs to be copied and pasted in single google sheet cell? now it is splitting to multiple rows."

> "The problem is when it starts with == signs, it thinks its a formual and shows error. can you remove the === signs in both copy logs and copy results and make it like --?"

**Copy Functionality Specifications**:

1. **Single-Cell Paste Format**
   - All copied text must paste into a single Google Sheets cell
   - Use " | " (space-pipe-space) as separator between lines
   - No line breaks that would split into multiple rows

2. **Formula Error Prevention**
   - Replace all "===" with "---" to avoid Google Sheets formula interpretation
   - Apply to both "Copy Player Data" (Next Hand logs) and "Copy Result" (comparison results)

3. **Implementation**:
   - `copyPlayerData()` function: Replace "===" with "---" before copying
   - `copyComparisonResult()` function:
     - Replace "===" with "---"
     - Replace newlines with " | "
     - Remove multiple spaces
   - Applied to ALL 30 test cases

4. **User Experience**:
   - Click "Copy" button copies formatted text
   - Paste into Google Sheets creates single cell with all data
   - No formula errors from "===" characters

---

## Implementation Details

### Progressive Generation Approach

**User Instruction**:
> "don't wait for my approval, if the validation is passed, create next one and update the html. the current html file you are updating is 30_base_validated_cases.html. Add test case to it progressively by testing each. don't wait for me to test the generated, go and create the next accroding to plan"

**Process**:
1. Generator creates TC-1
2. Validates against spec
3. If passed, adds to HTML
4. Immediately proceeds to TC-2
5. Repeat until all 30 complete
6. No manual intervention required

### File Output Structure

**Primary Output**: `30_base_validated_cases.html`
- Complete HTML with CSS and JavaScript
- All 30 test cases in expandable cards
- Copy/paste functionality for each test case
- Next Hand Preview with comparison feature
- Validation status displayed for each test case

**Generator Script**: `generate_30_progressive.py`
- Python script implementing all requirements
- Built-in validation logic
- Automatic progression through all 30 cases

**Validation Report**: `validation_report.md`
- Detailed validation results
- Blind structure distribution
- Stack size analysis
- Pass/fail status for each test case

---

## Success Criteria

### Must Have (All Required)

✅ **30 test cases generated** (5 Simple + 15 Medium + 10 Complex)

✅ **Different stack sizes per player** (10 BB to 60+ BB range)

✅ **Varied blind structures** (hundreds to millions, all numeric)

✅ **All validations pass** against TEST_CASE_GENERATION_SPEC.md

✅ **Progressive generation** (automatic, no approval needed)

✅ **Betting action** (15-20 cases with raises across streets)

✅ **Side pots** (1-2 side pots in 80% of cases)

✅ **Complete HTML output** with copy/paste and comparison features

### Validation Metrics

- **100% pass rate** on spec validation
- **0 validation errors** across all 30 test cases
- **Blind structure coverage**: Hundreds, thousands, tens of thousands, hundreds of thousands, **millions** ✅
- **Stack variety**: Short, medium, and deep stacks represented
- **Action variety**: Betting, checking, raising, re-raising
- **Side pot creation**: 80% of cases with 1-2 side pots

---

## Deliverables

### Primary Files

1. **30_base_validated_cases.html** (6,781 lines)
   - All 30 test cases
   - Ready for browser testing
   - Copy/paste functionality
   - Comparison features

2. **generate_30_progressive.py** (939 lines)
   - Complete generator script
   - Built-in validation
   - Progressive generation logic

3. **validation_report.md**
   - Detailed validation results
   - Test case breakdown
   - Blind structure analysis

### Reference Files

- **TEST_CASE_GENERATION_SPEC.md**: Complete specification for validation
- **REQUIREMENTS_30_BASE_TEST_CASES.md**: This document

---

## Usage Instructions

### To Generate Test Cases:

```bash
cd C:\Apps\HUDR\HHTool_Modular\docs
python generate_30_progressive.py
```

**Expected Output**:
```
======================================================================
Progressive Generation of 30 Validated Test Cases
======================================================================

[TC-1] Generating: 2P Simple... [PASSED]
[TC-2] Generating: 2P Simple... [PASSED]
...
[TC-30] Generating: 9P Complex... [PASSED]

======================================================================
[OK] Generation Complete!
Output: C:\Apps\HUDR\HHTool_Modular\docs\30_base_validated_cases.html
Total Test Cases: 30
======================================================================
```

### To Use Test Cases:

1. Open `30_base_validated_cases.html` in browser
2. Expand any test case
3. Click "Copy Player Data" button
4. Paste into your poker hand history application
5. Run the hand through your app
6. Copy the "Next Hand" output from your app
7. Click "Paste from Clipboard" in the comparison section
8. Click "Compare" to validate results
9. Click "Copy Result" to copy comparison results to clipboard for Google Sheets

---

## Revision History

| Date | Version | Changes |
|------|---------|---------|
| 2025-11-10 | 1.0 | Initial requirements captured from user conversation |
| 2025-11-10 | 1.1 | Added stack size requirements (10-60 BB, millions) |
| 2025-11-10 | 1.2 | Added progressive generation without approval requirement |
| 2025-11-10 | 2.0 | Final version - All 30 test cases generated and validated ✅ |
| 2025-11-10 | 2.1 | Added Google Sheets compatibility: single-cell paste and "===" → "---" replacement |

---

## Notes

- All requirements were successfully implemented
- 100% pass rate on validation (30/30 test cases)
- Blind structures include millions as requested
- Stack sizes vary from 10 BB to 60 BB as specified
- Progressive generation worked without manual intervention
- All test cases follow TEST_CASE_GENERATION_SPEC.md
- Copy/paste functions updated for Google Sheets compatibility (single-cell paste, no formula errors)

**Status**: ✅ **COMPLETE - Production Ready**
