/**
 * Hand Format Parser
 *
 * Parses and formats the 4-line hand header format used in test cases:
 *
 * Hand (49)
 * started_at: 00:05:40 ended_at: HH:MM:SS
 * SB 1000000 BB 2000000 Ante 2000000
 * Stack Setup:
 * Bob Dealer 116000000
 * Charlie SB 48000000
 * David BB 0
 * Alice 80000000
 */

export interface HandHeader {
  handNumber: string;
  startedAt: string;
  endedAt?: string;
  sb: number;
  bb: number;
  ante: number;
}

export interface PlayerSetup {
  name: string;
  position: string;
  stack: number;
}

export interface ParsedHandData {
  header: HandHeader;
  players: PlayerSetup[];
}

/**
 * Parse the 4-line header format from raw input
 *
 * Example input:
 * ```
 * Hand (49)
 * started_at: 00:05:40 ended_at: HH:MM:SS
 * SB 1000000 BB 2000000 Ante 2000000
 * Stack Setup:
 * Bob Dealer 116000000
 * Charlie SB 48000000
 * David BB 0
 * Alice 80000000
 * ```
 */
export function parseHandFormat(rawInput: string): ParsedHandData | null {
  const lines = rawInput.trim().split('\n');

  if (lines.length < 4) {
    console.warn('Not enough lines for hand format');
    return null;
  }

  try {
    // Line 1: Hand (49)
    const handLine = lines[0].trim();
    const handMatch = handLine.match(/Hand\s*\((\d+)\)/);
    const handNumber = handMatch ? handMatch[1] : '';

    // Line 2: started_at: 00:05:40 ended_at: HH:MM:SS
    const timeLine = lines[1].trim();
    const startedMatch = timeLine.match(/started_at:\s*([\d:]+)/);
    const endedMatch = timeLine.match(/ended_at:\s*([\d:]+)/);
    const startedAt = startedMatch ? startedMatch[1] : '';
    const endedAt = endedMatch ? endedMatch[1] : undefined;

    // Line 3: SB 1000000 BB 2000000 Ante 2000000
    const blindsLine = lines[2].trim();
    const sbMatch = blindsLine.match(/SB\s+([\d,]+)/);
    const bbMatch = blindsLine.match(/BB\s+([\d,]+)/);
    const anteMatch = blindsLine.match(/Ante\s+([\d,]+)/);

    const sb = sbMatch ? parseInt(sbMatch[1].replace(/,/g, '')) : 0;
    const bb = bbMatch ? parseInt(bbMatch[1].replace(/,/g, '')) : 0;
    const ante = anteMatch ? parseInt(anteMatch[1].replace(/,/g, '')) : 0;

    // Line 4: Stack Setup: (skip this line)

    // Remaining lines: Player data
    const playerLines = lines.slice(4).filter(line => line.trim());
    const players: PlayerSetup[] = [];

    playerLines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 2) {
        const name = parts[0];
        let position = '';
        let stack = 0;

        // Check if second part is a position (Dealer, SB, BB)
        if (parts[1] === 'Dealer' || parts[1] === 'SB' || parts[1] === 'BB') {
          position = parts[1];
          stack = parseFloat(parts[2]?.replace(/,/g, '') || '0') || 0;
        } else {
          // No position specified
          stack = parseFloat(parts[1]?.replace(/,/g, '') || '0') || 0;
        }

        if (name && stack >= 0) { // Allow 0 stacks (busted players)
          players.push({ name, position, stack });
        }
      }
    });

    return {
      header: {
        handNumber,
        startedAt,
        endedAt,
        sb,
        bb,
        ante
      },
      players
    };
  } catch (error) {
    console.error('Error parsing hand format:', error);
    return null;
  }
}

/**
 * Format next hand data into the 4-line header format
 *
 * @param handNumber - Next hand number
 * @param startedAt - Start time (HH:MM:SS format)
 * @param sb - Small blind amount
 * @param bb - Big blind amount
 * @param ante - Ante amount
 * @param players - Array of players with name, position, stack
 * @returns Formatted string ready for Stack Setup textarea
 */
export function formatNextHand(
  handNumber: string,
  startedAt: string,
  sb: number,
  bb: number,
  ante: number,
  players: PlayerSetup[]
): string {
  const lines: string[] = [];

  // Line 1: Hand (50)
  lines.push(`Hand (${handNumber})`);

  // Line 2: started_at: HH:MM:SS ended_at: HH:MM:SS
  lines.push(`started_at: ${startedAt} ended_at: HH:MM:SS`);

  // Line 3: SB 1000000 BB 2000000 Ante 2000000
  lines.push(`SB ${sb} BB ${bb} Ante ${ante}`);

  // Line 4: Stack Setup:
  lines.push('Stack Setup:');

  // Player lines: Only include position for Dealer, SB, BB
  players.forEach(player => {
    const pos = player.position.toLowerCase();
    if (pos === 'dealer' || pos === 'sb' || pos === 'bb') {
      lines.push(`${player.name} ${player.position} ${player.stack}`);
    } else {
      lines.push(`${player.name} ${player.stack}`);
    }
  });

  return lines.join('\n');
}

/**
 * Format for display (with better formatting)
 */
export function formatNextHandForDisplay(
  handNumber: string,
  startedAt: string,
  sb: number,
  bb: number,
  ante: number,
  players: PlayerSetup[]
): string {
  const lines: string[] = [];

  lines.push(`Hand (${handNumber})`);
  lines.push(`started_at: ${startedAt} ended_at: HH:MM:SS`);
  lines.push(`SB ${sb.toLocaleString()} BB ${bb.toLocaleString()} Ante ${ante.toLocaleString()}`);
  lines.push('Stack Setup:');

  // Only include position for Dealer, SB, BB
  players.forEach(player => {
    const stackFormatted = player.stack.toLocaleString();
    const pos = player.position.toLowerCase();
    if (pos === 'dealer' || pos === 'sb' || pos === 'bb') {
      lines.push(`${player.name} ${player.position} ${stackFormatted}`);
    } else {
      lines.push(`${player.name} ${stackFormatted}`);
    }
  });

  return lines.join('\n');
}
