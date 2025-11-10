# Poker Tournament Fantasy Betting System
## Design Document & Framework Proposal

**Date Created:** November 6, 2025  
**Version:** 1.0 - Initial Framework

---

## 1. SYSTEM REQUIREMENTS (Your Specification)

### 1.1 Overview
A fantasy-style betting system for poker tournament final tables where bettors pick 3 players and earn points based on both hand-by-hand performance and final placement.

### 1.2 Player Selection Structure
Bettors must select exactly **3 players**, one from each tier:
- **Tier 1:** One player from Top 3 stacks (chip leaders)
- **Tier 2:** One player from Middle 3 stacks
- **Tier 3:** One player from Bottom 3 stacks (short stacks)

### 1.3 Scoring Requirements

#### A. Per-Hand Scoring
- Track every hand played at the final table
- Record Big Blinds (BBs) won and lost by each player per hand
- Award points based on BB performance using an algorithmic approach
- Points should accumulate throughout the tournament

#### B. Finish Position Bonuses
- Award bonus points based on final placement (1st through 9th)
- Implement **underdog multipliers** based on starting stack position
- Example concept: If standard 1st place = 30 points, then:
  - Bottom tier (shortest stack) winning = 2x or 3x multiplier
  - Second-shortest winning = less than shortest but more than 30
  - Progressive scaling based on starting stack disadvantage

#### C. Penalties for Underperformance
- Consider reducing points if top-tier stacks finish poorly (7th, 8th, 9th)
- Failing to leverage chip advantage should be penalized

#### D. ICM Chop Scenarios
- When players agree to an ICM (Independent Chip Model) chop
- Points should be split based on:
  - Final BB counts at time of chop
  - Starting position/tier before tournament began
  - Fair distribution that rewards both performance and starting disadvantage

### 1.4 Mathematical Objectives
As a mathematician and bookie, the system should:
- Balance risk/reward across all three tiers
- Create compelling betting dynamics
- Reward skill and performance over pure luck
- Account for the inherent advantage of having more chips
- Make underdog victories appropriately more valuable

---

## 2. PROPOSED FRAMEWORK & SOLUTIONS

### 2.1 Key Questions to Answer Before Implementation

#### Game Structure Questions:
1. **Starting blind level?** (e.g., 1k/2k, 5k/10k)
2. **Do blinds increase during the final table?**
3. **Should we normalize BB calculations if blinds change?** (Use starting BBs or dynamic M-ratio?)
4. **Average number of hands in a typical final table?** (Affects per-hand point scaling)

#### Scoring Philosophy Questions:
5. **Per-hand point calculation:**
   - Linear (1 BB = 1 point)?
   - Logarithmic (diminishing returns)?
   - Context-dependent (early vs. late)?
6. **Negative points for losing BBs or only positive for winning?**
7. **Bust-out penalty or just absence of finish bonus?**

#### Tier Definition Questions:
8. **What defines each tier?** Example ranges:
   - Top tier: 80-120 BB
   - Middle tier: 40-79 BB
   - Bottom tier: 10-39 BB
9. **Should tiers have equal expected value (EV) or is risk/reward imbalance acceptable?**

#### Balancing Question:
10. **Target total point range?** (e.g., should winner typically score 150-200 or 500+ total points?)

---

### 2.2 Proposed Mathematical Framework

#### A. Per-Hand Scoring Formula

```
Points_per_hand = (BBs_won - BBs_lost) × Tier_Weight × Stage_Factor
```

**Tier Weights (Starting Stack Multipliers):**
- Top Tier (1-3): **1.0x** (baseline)
- Middle Tier (4-6): **1.3x** (moderate underdog bonus)
- Bottom Tier (7-9): **1.8x** (significant underdog bonus)

**Stage Factor (Optional):**
- Early stage (9-7 players): 1.0x
- Middle stage (6-4 players): 1.1x
- Late stage (3 players): 1.2x
- Rewards survival and late-game performance

**Example Calculation:**
- Bottom tier player wins 20 BB pot in late stage
- Points = 20 × 1.8 × 1.2 = **43.2 points**

---

#### B. Finish Position Bonus System

##### Base Point Structure (Exponential Decay)

| Position | Base Points | Points as % of 1st |
|----------|-------------|-------------------|
| 1st | 100 | 100% |
| 2nd | 70 | 70% |
| 3rd | 50 | 50% |
| 4th | 35 | 35% |
| 5th | 25 | 25% |
| 6th | 15 | 15% |
| 7th | 8 | 8% |
| 8th | 3 | 3% |
| 9th | 0 | 0% |

**Rationale:** Approximately 70% retention between positions, heavily rewarding top finishes

---

##### Tier Multipliers (Underdog Bonuses & Top Stack Penalties)

| Position | Bottom Tier (7-9) | Middle Tier (4-6) | Top Tier (1-3) |
|----------|-------------------|-------------------|----------------|
| **1st** | **3.5x** (350 pts) | **1.8x** (180 pts) | **1.0x** (100 pts) |
| **2nd** | **2.8x** (196 pts) | **1.5x** (105 pts) | **1.0x** (70 pts) |
| **3rd** | **2.2x** (110 pts) | **1.3x** (65 pts) | **1.0x** (50 pts) |
| **4th** | **1.6x** (56 pts) | **1.15x** (40 pts) | **1.0x** (35 pts) |
| **5th** | **1.3x** (33 pts) | **1.1x** (28 pts) | **1.0x** (25 pts) |
| **6th** | **1.1x** (17 pts) | **1.05x** (16 pts) | **0.95x** (14 pts) |
| **7th** | **1.0x** (8 pts) | **1.0x** (8 pts) | **0.8x** (6 pts) |
| **8th** | **1.0x** (3 pts) | **0.95x** (3 pts) | **0.6x** (2 pts) |
| **9th** | **0.8x** (0 pts) | **0.9x** (0 pts) | **0.4x** (0 pts) |

**Key Features:**
- **Massive underdog bonus:** Bottom tier winning = 3.5x standard points
- **Progressive scaling:** Each tier below rewards overperformance
- **Top tier penalties:** Chip leaders busting 7th-9th lose 20-60% of base points
- **Fairness at middle positions:** Minimal adjustment for 4th-6th place

**Mathematical Reasoning:**
- Bottom tier players have roughly 10-30% equity to win based on stack sizes
- 3.5x multiplier compensates for ~3.5x harder path to victory
- Top tier penalties punish failure to leverage 40-50% starting equity
- Creates drama: cheering for short stacks becomes strategically valuable

---

#### C. ICM Chop Point Distribution

When players agree to an ICM chop, points are calculated as:

```
Player_Chop_Points = (Weighted_Finish_Points + Performance_Points) × Tier_Multiplier
```

**Formula Breakdown:**

1. **Weighted Finish Points:**
   ```
   = Σ(Position_Points × ICM_Probability_for_that_Position)
   ```
   - Based on chip distribution at chop
   - If player has 40% of chips, they get 40% weighting toward 1st, 30% toward 2nd, etc.

2. **Performance Points:**
   - All per-hand points earned up to the chop remain
   - Rewards players who built their stack through play

3. **Tier Multiplier:**
   - Applied to finish points based on starting tier
   - Bottom tier player chopping with big stack still gets underdog bonus

**Example ICM Chop (3 players remaining):**

| Player | Starting Tier | Final Stack | ICM % | Base Weighted Points | Tier Mult | Final Bonus |
|--------|--------------|-------------|-------|---------------------|-----------|-------------|
| Player A | Top (1st) | 1.5M (50%) | 50% | 72 pts | 1.0x | 72 pts |
| Player B | Middle (5th) | 800k (33%) | 33% | 60 pts | 1.3x | 78 pts |
| Player C | Bottom (8th) | 400k (17%) | 17% | 45 pts | 2.2x | 99 pts |

Player C (short stack who survived to chop) gets highest finish bonus despite smallest chip share!

---

### 2.3 Complete Scoring Example

**Scenario:** Bottom tier player (starting 9th with 15 BB) wins the tournament

**Total Points Calculation:**

1. **Per-Hand Points:** 
   - Accumulated throughout: +180 points
   - (Multiple double-ups, key pots with 1.8x multiplier)

2. **Finish Bonus:**
   - 1st place base: 100 points
   - Bottom tier multiplier: 3.5x
   - Finish bonus: **350 points**

3. **Total Score: 530 points** 🏆

**Comparison - Top tier player winning:**
- Per-hand points: +150 points (1.0x multiplier)
- Finish bonus: 100 points (1.0x)
- Total: **250 points**

**Result:** Short stack victory worth **2.12x** more points - captures the "Cinderella story" premium!

---

### 2.4 System Balance & Expected Values

#### Tier Expected Value (EV) Analysis

Assuming typical stack distributions and skill equity:

| Tier | Win Probability | Avg Finish | Expected Finish Points | Expected Hand Points | Total EV |
|------|----------------|------------|----------------------|-------------------|----------|
| Top | 35% | 3.2 | ~95 pts | ~120 pts | ~215 pts |
| Middle | 30% | 4.1 | ~70 pts | ~95 pts | ~165 pts |
| Bottom | 15% | 5.8 | ~45 pts | ~65 pts | ~110 pts |

**With Multipliers Applied:**

| Tier | Adjusted EV | Risk Level | Reward Ceiling |
|------|------------|-----------|----------------|
| Top | ~215 pts | Low | 250 pts (if win) |
| Middle | ~190 pts | Medium | 285 pts (if win) |
| Bottom | ~175 pts | High | 530 pts (if win) |

**Analysis:**
- ~20% EV difference between tiers = acceptable risk/reward spread
- Bottom tier picks are "lottery tickets" with 3x upside
- Creates diverse betting strategies: safe vs. aggressive picks

---

### 2.5 Edge Cases & Special Scenarios

#### A. Ties in Stack Sizes
- If starting stacks overlap tier boundaries, use strict ranking
- Player with 1 more chip ranks higher
- Tiers determined at first hand dealt

#### B. Player Elimination Without Playing Hands
- If player is blinded out without playing
- Still receives (reduced) finish bonus with tier multiplier
- No per-hand points accumulated

#### C. Side Pot Complications
- Points based on BBs actually won by player
- If player is all-in and loses side pot, only main pot BBs count
- Prevents over-crediting players who are involved but not winning

#### D. Multiple Tournaments / Normalization
- If comparing across tournaments with different blind structures
- Normalize all BB counts to "starting tournament average"
- Formula: `Normalized_BBs = (Actual_BBs / Current_BigBlind) × (Starting_BigBlind / Starting_Avg_Stack)`

---

## 3. IMPLEMENTATION CHECKLIST

### Phase 1: Data Requirements
- [ ] Define starting stack tiers for each tournament
- [ ] Capture hand-by-hand BB changes
- [ ] Record final finishing positions
- [ ] Track ICM chop agreements (if applicable)
- [ ] Store blind level progression

### Phase 2: Calculation Engine
- [ ] Build per-hand point calculator
- [ ] Implement tier classification logic
- [ ] Create finish bonus lookup table with multipliers
- [ ] Code ICM chop point distribution
- [ ] Add stage factor adjustments (optional)

### Phase 3: Validation & Testing
- [ ] Run historical tournament simulations
- [ ] Verify tier EV balance
- [ ] Test edge cases (ties, chops, early eliminations)
- [ ] Gather bettor feedback on point scales
- [ ] Adjust multipliers if needed

### Phase 4: User Interface
- [ ] Display live point accumulation
- [ ] Show tier assignments clearly
- [ ] Highlight underdog bonuses
- [ ] Leaderboard for bettor scores
- [ ] Historical player performance stats

---

## 4. ADVANCED CONSIDERATIONS

### 4.1 Dynamic Tier Rebalancing
**Question:** Should tiers update if chip stacks dramatically shift mid-tournament?

**Pros:**
- More accurate representation of current equity
- Rewards comeback players

**Cons:**
- Complex for bettors to track
- Reduces value of good early picks

**Recommendation:** Keep tiers fixed at tournament start for simplicity

---

### 4.2 Skill Adjustments
**Question:** Should known strong players have adjusted multipliers?

**Example:**
- World champion in bottom tier = 3.0x instead of 3.5x
- Amateur in top tier = 1.1x instead of 1.0x

**Recommendation:** Keep system pure stack-based for transparency, let market odds handle skill

---

### 4.3 Variance Dampening
**Question:** Should massive suckouts/bad beats be capped for point purposes?

**Example:**
- Player wins 100 BB cooler pot
- Instead of full 100 × 1.8 = 180 points
- Cap per-hand points at 50 for any single hand

**Recommendation:** Implement reasonable caps (e.g., 50-75 points/hand max) to reduce luck factor

---

## 5. NEXT STEPS & QUESTIONS FOR YOU

### Critical Decisions Needed:

1. **What's your target total point range?**
   - Low scale: 100-300 points typical
   - High scale: 500-1000+ points typical

2. **Blind structure info:**
   - Starting level?
   - How fast do they increase?
   - Should we normalize across levels?

3. **Historical data availability:**
   - Do you have sample final table data?
   - Can we test this system on past tournaments?

4. **Bettor psychology:**
   - Should all tiers feel roughly "equal EV" or is imbalance okay?
   - How much variance is acceptable?

5. **ICM chops:**
   - How common are they in your tournaments?
   - Do you need sophisticated chop calculations or simple approximations?

### Recommended First Test:
- Run this system on 3-5 past final tables
- Calculate points for all players
- See if multipliers feel "right"
- Adjust base points and multipliers as needed

---

## 6. MATHEMATICAL APPENDIX

### A. Expected Value Calculations

For a player in tier T with stack S:

```
EV(points) = Σ(P(finish_i) × Points(finish_i, T)) + E(hand_points)

Where:
P(finish_i) = Probability of finishing in position i (ICM-based)
Points(finish_i, T) = Finish points for position i with tier T multiplier
E(hand_points) = Expected hand points = Avg_BBs_won × Tier_weight × Survival_time
```

### B. Tier Multiplier Optimization

To find optimal multipliers that balance tier EVs:

```
Target: EV(Bottom) ≈ 0.8 × EV(Top)  [acceptable 20% disadvantage]

Solve for M_bottom:
EV(Bottom) = P(win) × 100 × M_bottom + other_finish_EVs + hand_EVs

If P(win) = 15% for bottom vs 35% for top:
Need M_bottom ≈ 3.0-3.5x to compensate
```

### C. ICM Quick Reference

For 3-player chop with stacks [S1, S2, S3]:

```
ICM% for player with S1 chips ≈ 
  0.5 × (S1/Total) + 
  0.3 × (S1/Total)^1.5 + 
  0.2 × (S1/(S2+S3))

(Simplified approximation - use ICM calculator for precision)
```

---

## 7. GLOSSARY

- **BB (Big Blind):** Standard unit of measurement in poker (e.g., 50 BB = 50x the big blind)
- **ICM (Independent Chip Model):** Mathematical model for tournament equity based on chip stacks
- **Tier:** Group classification based on starting stack size (Top/Middle/Bottom)
- **Tier Multiplier:** Scaling factor applied to finish bonuses based on starting tier
- **M-Ratio:** Measure of stack health = Stack / (Blinds + Antes per orbit)
- **Underdog Bonus:** Extra points awarded for overperforming starting stack expectations

---

## Document Control

**Last Updated:** November 6, 2025  
**Next Review:** After initial test tournament  
**Owner:** Ravee  
**Status:** Awaiting parameter finalization

---

## Summary

This system creates a compelling fantasy betting structure that:
✅ Rewards both hand-by-hand performance and final placement  
✅ Heavily incentivizes underdog picks with 3.5x multipliers  
✅ Penalizes chip leaders who fail to convert advantage  
✅ Handles ICM chops fairly  
✅ Balances risk/reward across tiers (~20% EV spread)  
✅ Creates exciting "Cinderella story" scenarios worth 2-3x normal points  

**Ready to refine based on your specific tournament data and preferences!**
