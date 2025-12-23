#!/usr/bin/env python3
"""
More Actions Validation Script

Validates More Action test cases against the specification defined in
MORE_ACTIONS_VALIDATION_SPEC.md.

CRITICAL RULE: An all-in for LESS than a full raise does NOT reopen betting.
The last aggressor who was called does NOT get another action.
More Action 2 only occurs if More Action 1 contains a FULL raise.

Usage:
    python validate_more_actions.py [test_case_file.md]
"""

import re
import sys
from dataclasses import dataclass
from typing import List, Optional, Tuple
from enum import Enum


class ActionType(Enum):
    CHECK = "check"
    BET = "bet"
    CALL = "call"
    RAISE = "raise"
    ALL_IN = "all-in"
    FOLD = "fold"


@dataclass
class Action:
    player: str
    action_type: ActionType
    amount: Optional[int]
    notes: str = ""


@dataclass
class BettingRound:
    name: str  # "Base", "More Action 1", "More Action 2"
    actions: List[Action]


@dataclass
class Street:
    name: str  # "Preflop", "Flop", "Turn", "River"
    rounds: List[BettingRound]


@dataclass
class ValidationResult:
    passed: bool
    message: str
    details: Optional[str] = None


class MoreActionsValidator:
    """Validates More Action assignments based on poker rules."""

    def __init__(self):
        self.errors: List[str] = []
        self.warnings: List[str] = []

    def validate_street(self, street: Street) -> List[ValidationResult]:
        """Validate all betting rounds for a street."""
        results = []

        if len(street.rounds) == 0:
            results.append(ValidationResult(False, f"{street.name}: No betting rounds found"))
            return results

        # Track state across betting rounds
        current_bet = 0
        last_raise_increment = 0
        last_aggressor: Optional[str] = None

        for i, round_ in enumerate(street.rounds):
            round_results = self._validate_betting_round(
                street.name,
                round_,
                current_bet,
                last_raise_increment,
                last_aggressor,
                i
            )
            results.extend(round_results)

            # Update state after processing round
            for action in round_.actions:
                if action.action_type in [ActionType.BET, ActionType.RAISE]:
                    if action.amount:
                        raise_increment = action.amount - current_bet
                        min_raise = current_bet + last_raise_increment

                        # Check if it's a full raise
                        if action.amount >= min_raise or last_raise_increment == 0:
                            last_aggressor = action.player
                            last_raise_increment = raise_increment
                            current_bet = action.amount

                elif action.action_type == ActionType.ALL_IN:
                    if action.amount:
                        min_raise = current_bet + last_raise_increment
                        if action.amount >= min_raise:
                            # Full raise all-in
                            last_aggressor = action.player
                            last_raise_increment = action.amount - current_bet
                            current_bet = action.amount
                        # else: all-in for less, don't update aggressor

        return results

    def _validate_betting_round(
        self,
        street_name: str,
        round_: BettingRound,
        current_bet: int,
        last_raise_increment: int,
        last_aggressor: Optional[str],
        round_index: int
    ) -> List[ValidationResult]:
        """Validate a single betting round."""
        results = []

        # For More Action 2, check if there was a valid full raise in More Action 1
        if round_.name == "More Action 2":
            # This requires context from the previous round
            # For now, we check if there's any raise that should trigger More Action 2
            has_valid_trigger = False

            # Check if there's a raise that meets minimum requirements
            for action in round_.actions:
                if action.action_type == ActionType.RAISE and action.amount:
                    has_valid_trigger = True
                    break
                elif action.action_type == ActionType.CALL:
                    # If only calls, check if previous round had a full raise
                    pass

            if not has_valid_trigger:
                results.append(ValidationResult(
                    False,
                    f"{street_name} {round_.name}: May be invalid",
                    "More Action 2 requires a FULL raise in More Action 1 (not just all-in for less)"
                ))

        return results

    def parse_action_table(self, table_text: str) -> List[Action]:
        """Parse an action table from markdown format."""
        actions = []
        lines = table_text.strip().split('\n')

        for line in lines:
            if '|' not in line or '---' in line:
                continue

            parts = [p.strip() for p in line.split('|')]
            if len(parts) < 5:
                continue

            try:
                # Format: | # | Player | Action | Amount | Notes |
                player_match = re.search(r'(\w+)', parts[2])
                if not player_match:
                    continue

                player = player_match.group(1)
                action_str = parts[3].lower()
                amount_str = parts[4].replace(',', '').replace('-', '0')
                notes = parts[5] if len(parts) > 5 else ""

                # Parse action type
                action_type = None
                if 'all-in' in action_str.lower() or 'all in' in action_str.lower():
                    action_type = ActionType.ALL_IN
                elif 'raise' in action_str:
                    action_type = ActionType.RAISE
                elif 'bet' in action_str:
                    action_type = ActionType.BET
                elif 'call' in action_str:
                    action_type = ActionType.CALL
                elif 'check' in action_str:
                    action_type = ActionType.CHECK
                elif 'fold' in action_str:
                    action_type = ActionType.FOLD

                if action_type:
                    amount = int(re.sub(r'[^\d]', '', amount_str)) if amount_str and amount_str != '0' else None
                    actions.append(Action(player, action_type, amount, notes))

            except (ValueError, IndexError) as e:
                continue

        return actions

    def validate_all_in_for_less(self, street_actions: List[BettingRound]) -> List[ValidationResult]:
        """
        CRITICAL VALIDATION: Check for improper More Action 2 after all-in for less.

        Rule: An all-in for less than a full raise does NOT reopen betting
        for the last aggressor who was called.
        """
        results = []

        if len(street_actions) < 2:
            return results

        # Track state through rounds
        current_bet = 0
        last_raise_increment = 0
        last_aggressor = None
        full_raise_in_more_1 = False

        for i, round_ in enumerate(street_actions):
            for action in round_.actions:
                if action.action_type in [ActionType.BET, ActionType.RAISE]:
                    if action.amount:
                        raise_increment = action.amount - current_bet
                        min_raise = current_bet + last_raise_increment if last_raise_increment > 0 else 0

                        if action.amount >= min_raise or last_raise_increment == 0:
                            # Full raise
                            last_aggressor = action.player
                            last_raise_increment = raise_increment
                            current_bet = action.amount

                            if round_.name == "More Action 1":
                                full_raise_in_more_1 = True

                elif action.action_type == ActionType.ALL_IN:
                    if action.amount:
                        min_raise = current_bet + last_raise_increment

                        if action.amount >= min_raise:
                            # Full raise all-in
                            last_aggressor = action.player
                            last_raise_increment = action.amount - current_bet
                            current_bet = action.amount

                            if round_.name == "More Action 1":
                                full_raise_in_more_1 = True
                        else:
                            # All-in for less - does NOT reopen betting
                            if round_.name == "More Action 1":
                                results.append(ValidationResult(
                                    True,  # This is informational, not an error
                                    f"All-in for less detected: {action.player} went all-in for {action.amount:,}",
                                    f"Minimum raise was {min_raise:,}. This does NOT reopen betting for {last_aggressor}."
                                ))

        # Check if More Action 2 exists when it shouldn't
        if len(street_actions) >= 3:
            more_action_2 = next((r for r in street_actions if "More Action 2" in r.name), None)

            if more_action_2 and not full_raise_in_more_1:
                results.append(ValidationResult(
                    False,
                    "INVALID More Action 2 detected",
                    "More Action 1 did not contain a full raise. The all-in was for less than minimum raise, "
                    "so betting should NOT reopen for the last aggressor. Remove More Action 2."
                ))

        return results


def validate_test_case_file(filepath: str) -> None:
    """Validate a More Actions test case file."""
    print("=" * 80)
    print("MORE ACTIONS TEST CASE VALIDATION")
    print("=" * 80)
    print(f"\nValidating: {filepath}\n")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    validator = MoreActionsValidator()
    all_results: List[ValidationResult] = []

    # Find all test cases
    tc_pattern = r'## (MA-\d+):.*?(?=## MA-|\Z)'
    test_cases = re.findall(tc_pattern, content, re.DOTALL)

    for tc_match in re.finditer(tc_pattern, content, re.DOTALL):
        tc_content = tc_match.group(0)
        tc_id_match = re.search(r'## (MA-\d+)', tc_content)
        tc_id = tc_id_match.group(1) if tc_id_match else "Unknown"

        print(f"\n--- Validating {tc_id} ---")

        # Check for "NO More Action 2" or "Why NO" explanations
        has_no_more_action_2_note = bool(re.search(r'NO.*More Action 2|Why No.*More Action 2', tc_content, re.IGNORECASE))
        has_more_action_2 = bool(re.search(r'\*\*.*More Action 2\*\*', tc_content))

        if has_more_action_2 and has_no_more_action_2_note:
            all_results.append(ValidationResult(
                False,
                f"{tc_id}: Conflicting information",
                "Test case has both 'More Action 2' section AND explanation why there should be none"
            ))
            print(f"  x CONFLICT: Has More Action 2 section but also says there shouldn't be one")
        elif has_no_more_action_2_note and not has_more_action_2:
            all_results.append(ValidationResult(
                True,
                f"{tc_id}: Correctly omits More Action 2",
                "Test case properly explains why More Action 2 doesn't occur (all-in for less rule)"
            ))
            print(f"  + PASS: Correctly handles all-in for less rule")
        elif has_more_action_2:
            # Check if the More Action 2 is valid
            # Look for full raise in More Action 1
            more_action_1_match = re.search(r'\*\*.*More Action 1\*\*.*?\n(.*?)(?=\*\*|\n\n\*\*)', tc_content, re.DOTALL)
            if more_action_1_match:
                more_action_1_text = more_action_1_match.group(1)

                # Check for raises (not all-in for less)
                has_full_raise = bool(re.search(r'Raise.*?\d+', more_action_1_text, re.IGNORECASE))
                has_reopen_explanation = bool(re.search(r'reopen|full raise|minimum raise', tc_content, re.IGNORECASE))

                if has_full_raise:
                    all_results.append(ValidationResult(
                        True,
                        f"{tc_id}: More Action 2 appears valid",
                        "More Action 1 contains a raise that likely reopens betting"
                    ))
                    print(f"  + PASS: More Action 2 seems valid (has full raise in More 1)")
                else:
                    all_results.append(ValidationResult(
                        False,
                        f"{tc_id}: More Action 2 may be invalid",
                        "Check if More Action 1 has a FULL raise (not just all-in for less)"
                    ))
                    print(f"  ! WARNING: Verify More Action 2 is valid")
        else:
            print(f"  + PASS: No More Action 2 (standard betting)")

    # Print summary
    print("\n" + "=" * 80)
    print("VALIDATION SUMMARY")
    print("=" * 80)

    passed = sum(1 for r in all_results if r.passed)
    failed = sum(1 for r in all_results if not r.passed)

    print(f"\n  Passed: {passed}")
    print(f"  Failed: {failed}")
    print(f"  Total:  {len(all_results)}")

    if failed > 0:
        print("\n  FAILURES:")
        for r in all_results:
            if not r.passed:
                print(f"    x {r.message}")
                if r.details:
                    print(f"      {r.details}")

    print("\n" + "=" * 80)
    if failed == 0:
        print("+ ALL VALIDATIONS PASSED")
    else:
        print(f"x {failed} VALIDATION(S) FAILED - Review test cases")
    print("=" * 80)


def main():
    if len(sys.argv) > 1:
        filepath = sys.argv[1]
    else:
        # Default to the MORE_ACTIONS_TEST_CASES.md file
        filepath = r'C:\Apps\TournamentPro\docs\MORE_ACTIONS_TEST_CASES.md'

    try:
        validate_test_case_file(filepath)
    except FileNotFoundError:
        print(f"Error: File not found: {filepath}")
        sys.exit(1)
    except Exception as e:
        print(f"Error: {e}")
        sys.exit(1)


if __name__ == '__main__':
    main()
