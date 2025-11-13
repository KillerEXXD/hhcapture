"""
Side Pot Calculator Module
Add this to the generator to enable proper side pot calculations
"""

def calculate_side_pots(players, bb_ante):
    """
    Calculate main pot and side pots based on all-in amounts

    Args:
        players: List of Player objects with total_contribution and all_in_street attributes
        bb_ante: BB ante amount (dead money added to main pot)

    Returns:
        dict with 'pots' (list of pot dicts) and 'total_pot'
    """
    # Find BB player who paid ante
    bb_player = next((p for p in players if p.position == "BB"), None)

    # Calculate live contributions (excluding ante which is dead money)
    contributions = []
    for p in players:
        live_contrib = p.total_contribution
        # Compare by name instead of id (Player class doesn't have id attribute)
        if bb_player and p.name == bb_player.name:
            live_contrib -= bb_ante  # Ante is dead money, not part of live action

        contributions.append({
            'player': p,
            'live': live_contrib,
            'total': p.total_contribution
        })

    # Sort by live contribution amount
    contributions.sort(key=lambda x: x['live'])

    # Get unique contribution levels (where players went all-in)
    unique_levels = sorted(set(c['live'] for c in contributions))

    # Build pots
    pots = []
    remaining_players = len(contributions)
    prev_level = 0

    for i, level in enumerate(unique_levels):
        if remaining_players > 0:
            # Calculate pot amount: (level difference) × (number of players contributing)
            pot_amount = (level - prev_level) * remaining_players

            # Add ante to first (main) pot as dead money
            if i == 0:
                pot_amount += bb_ante

            # Determine eligible players: those who contributed at least to this level
            eligible = [c['player'] for c in contributions if c['live'] >= level]
            eligible_names = [p.name for p in eligible]

            pot_type = 'main' if i == 0 else f'side{i}'
            pot_name = 'Main Pot' if i == 0 else f'Side Pot {i}'

            pots.append({
                'type': pot_type,
                'name': pot_name,
                'amount': pot_amount,
                'eligible': eligible,
                'eligible_names': eligible_names,
                'level': level
            })

            # Remove players at this exact level from future pot calculations
            # (they're all-in and can't contribute more)
            remaining_players = len([c for c in contributions if c['live'] > level])
            prev_level = level

    total_pot = sum(p['amount'] for p in pots)

    # Calculate percentages
    for pot in pots:
        pot['percentage'] = (pot['amount'] / total_pot * 100) if total_pot > 0 else 0

    return {
        'pots': pots,
        'total_pot': total_pot,
        'bb_ante': bb_ante
    }


def generate_pot_html(pot_results, players, bb, ante):
    """
    Generate HTML for pot display with side pots

    Args:
        pot_results: Result from calculate_side_pots()
        players: List of Player objects
        bb: Big blind amount
        ante: Ante amount

    Returns:
        HTML string for pot section
    """
    pots = pot_results['pots']
    total_pot = pot_results['total_pot']
    bb_ante = pot_results['bb_ante']

    def fmt(n):
        return f"{n:,}"

    # Calculate live contributions (excluding ante)
    bb_player = next((p for p in players if p.position == "BB"), None)
    live_contributions = sum(
        p.total_contribution - (bb_ante if bb_player and p.name == bb_player.name else 0)
        for p in players
    )

    # Generate HTML for each pot
    pot_htmls = []
    for pot in pots:
        eligible_html = ' '.join([f'<span>{name}</span>' for name in pot['eligible_names']])

        if pot['type'] == 'main':
            calc_text = f"Calculation: {fmt(live_contributions)} (live) + {fmt(bb_ante)} (BB ante dead) = {fmt(total_pot)}"
        else:
            # For side pots, show the level calculation
            pot_num = int(pot['type'].replace('side', ''))
            prev_pot = pots[pot_num - 1] if pot_num > 0 else {'level': 0}
            prev_level = prev_pot.get('level', 0)
            level_diff = pot['level'] - prev_level
            num_players = len(pot['eligible'])

            calc_text = f"Calculation: {fmt(level_diff)} × {num_players} players = {fmt(pot['amount'])}"

        pot_html = f'''                <div class="pot-item {pot['type']}">
                    <div class="pot-name">{pot['name']}</div>
                    <div class="pot-amount">{fmt(pot['amount'])} ({pot['percentage']:.1f}%)</div>
                    <div class="eligible">Eligible: {eligible_html}</div>
                    <div style="font-size: 11px; color: #666; margin-top: 5px;">
                        {calc_text}
                    </div>
                </div>'''
        pot_htmls.append(pot_html)

    return '\n'.join(pot_htmls)


def generate_winner_cell_html(player, pot_results, fmt_func):
    """
    Generate winner cell HTML showing all pots won

    Args:
        player: Player dict/object
        pot_results: Result from calculate_side_pots()
        fmt_func: Function to format numbers

    Returns:
        HTML string for winner cell
    """
    pots = pot_results['pots']

    # Find which pots this player is eligible for
    eligible_pots = [pot for pot in pots if player['name'] in pot['eligible_names']]

    if not eligible_pots:
        return '<span class="winner-badge loser">-</span>'

    # Build pot names string
    pot_names = ' + '.join([pot['name'] for pot in eligible_pots])

    # Build breakdown
    breakdown_lines = [f'<div class="breakdown-line">Final Stack: {fmt_func(player["final_stack"])}</div>']

    total_won = 0
    for pot in eligible_pots:
        breakdown_lines.append(f'<div class="breakdown-line">+ {pot["name"]}: {fmt_func(pot["amount"])}</div>')
        total_won += pot['amount']

    breakdown_lines.append(f'<div class="breakdown-line total">= New Stack: {fmt_func(player["new_stack"])}</div>')

    winner_html = f'''<span class="winner-badge" onclick="toggleBreakdown(this)">
                                    🏆 {pot_names} <span class="expand-icon">▼</span>
                                </span>
                                <div class="breakdown-details" style="display:none;">
                                    {''.join(['                                    ' + line + '\\n' for line in breakdown_lines])}                                </div>'''

    return winner_html


# Integration example for TestCaseGenerator class:
#
# Replace calculate_pot_and_results() method with:
#
# def calculate_pot_and_results(self):
#     """Calculate pot with side pots, winners, and final stacks"""
#     from sidepot_calculator import calculate_side_pots
#
#     # Calculate side pots
#     pot_results = calculate_side_pots(self.players, self.ante)
#
#     winner = self.players[self.winner_idx]
#
#     results = []
#     for i, p in enumerate(self.players):
#         final_stack = p.current_stack
#         new_stack = final_stack
#         won_amount = 0
#
#         if i == self.winner_idx:
#             # Winner gets all pots they're eligible for
#             for pot in pot_results['pots']:
#                 if p in pot['eligible']:
#                     won_amount += pot['amount']
#             new_stack = final_stack + won_amount
#
#         results.append({
#             'name': p.name,
#             'position': p.position,
#             'starting_stack': p.starting_stack,
#             'final_stack': final_stack,
#             'contributed': p.total_contribution,
#             'is_winner': i == self.winner_idx,
#             'new_stack': new_stack,
#             'won_amount': won_amount
#         })
#
#     return {
#         'total_pot': pot_results['total_pot'],
#         'bb_ante': pot_results['bb_ante'],
#         'pots': pot_results['pots'],  # This now contains all pots (main + side)
#         'results': results,
#         'winner': winner
#     }
