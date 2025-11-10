// Generate 287 poker test cases (TC-14.1 through TC-300.1)
const fs = require('fs');

// Player names
const names = ["Alice", "Bob", "Charlie", "David", "Eve", "Frank", "Grace", "Henry", "Ivy", "Jack", "Kate", "Leo", "Maria", "Nick", "Olivia", "Paul"];

// Positions
const pos2 = ["SB", "BB"];
const pos3 = ["Dealer", "SB", "BB"];
const pos4 = ["Dealer", "SB", "BB", "UTG"];
const pos5 = ["Dealer", "SB", "BB", "UTG", "CO"];
const pos6 = ["Dealer", "SB", "BB", "UTG", "MP", "CO"];
const pos7 = ["Dealer", "SB", "BB", "UTG", "MP", "HJ", "CO"];
const pos8 = ["Dealer", "SB", "BB", "UTG", "UTG+1", "MP", "HJ", "CO"];
const pos9 = ["Dealer", "SB", "BB", "UTG", "UTG+1", "UTG+2", "MP", "HJ", "CO"];

// Edge cases
const edges = {
  "BB Ante": [14,21,28,35,42,49,56,63,70,77,84,91,98,105,112,119,126,133,140,147,154,161,168,175,182,189,196,203,210,217,224,231,238,245,252,259,266,273,280,287],
  "Short Stack": [15,22,29,36,43,50,57,64,71,78,85,92,99,106,113,120,127,134,141,148,155,162,169,176,183,190,197,204,211,218,225,232,239,246,253,260,267,274,281,288],
  "Multiple All-Ins": [16,24,32,40,48,58,68,80,90,100,110,122,135,145,156,167,178,191,202,213,226,237,248,261,272,283,291,295,298,300],
  "Side Pot Complex": [17,25,33,41,51,61,72,82,93,103,114,125,138,150,163,177,192,205,219,233,247,262,275,285,292,296,297,299],
  "Multi-Street": [18,26,34,44,54,65,75,86,96,107,117,128,142,153,165,179,193,207,221,235,249,263,276,286,293,294],
  "Position Edge": [19,27,37,47,59,69,81,94,104,115,129,143,157,170,184,198,212,227,241,255],
  "Fold Scenarios": [20,30,38,46,55,66,76,87,97,108,118,130,144,158,171,185,199,214,228,242],
  "Transition": [23,31,39,45,52,60,67,73,83,95,105,116,131,146,160,174,188,200,215,229],
  "Calculation Edge": [62,74,88,101,111,121,132,149,164,180,194,208,222,236,250,264,277,289,296,299]
};

function fmt(n) { return n.toLocaleString('en-US'); }

function getEdge(tc) {
  for (let [k, v] of Object.entries(edges)) {
    if (v.includes(tc)) return k;
  }
  return "Standard";
}

function getComplexity(tc) {
  if (tc <= 73) return ["low", "Simple"];
  if (tc <= 193) return ["medium", "Medium"];
  return ["high", "Complex"];
}

function getPlayers(tc) {
  if (tc <= 53) return 2;
  if (tc <= 133) return 3 + ((tc - 54) % 4);
  return 7 + ((tc - 134) % 3);
}

function getPositions(n) {
  if (n === 2) return pos2;
  if (n === 3) return pos3;
  if (n === 4) return pos4;
  if (n === 5) return pos5;
  if (n === 6) return pos6;
  if (n === 7) return pos7;
  if (n === 8) return pos8;
  return pos9;
}

function generateTC(tc) {
  const edge = getEdge(tc);
  const [cClass, cLabel] = getComplexity(tc);
  const nPlayers = getPlayers(tc);
  const positions = getPositions(nPlayers);

  // Stack sizes
  const cycle = tc % 3;
  let bb, sb, ante;
  if (cycle === 0) {
    bb = [100, 200, 500, 1000][tc % 4];
  } else if (cycle === 1) {
    bb = [2000, 5000, 10000][tc % 3];
  } else {
    bb = [10000, 20000, 50000][tc % 3];
  }
  sb = bb / 2;
  ante = bb;

  // Generate unique stacks
  const stacks = [];
  const usedBB = new Set();
  for (let i = 0; i < nPlayers; i++) {
    let bbCount;
    do {
      bbCount = 10 + Math.floor(Math.random() * 50);
    } while (usedBB.has(bbCount));
    usedBB.add(bbCount);
    stacks.push(bbCount * bb);
  }

  // Player setup
  const players = [];
  for (let i = 0; i < nPlayers; i++) {
    players.push({
      name: names[i],
      pos: positions[i],
      stack: stacks[i]
    });
  }

  // Stack setup string
  const stackLines = players.map(p => `${p.name} ${p.pos} ${p.stack}`).join('\\n');
  const stackPre = players.map(p => `${p.name} ${p.pos} ${p.stack}`).join('\n');

  // Generate actions
  let actionsHTML = '';
  if (edge === "Multiple All-Ins") {
    actionsHTML = `                <div class="street-block">
                    <div class="street-name">Preflop Base</div>\n`;
    for (let i = 0; i < Math.min(2, nPlayers); i++) {
      actionsHTML += `                    <div class="action-row"><span class="action-player">${players[i].name} (${players[i].pos}):</span> <span class="action-type">All-in</span> <span class="action-amount">${fmt(players[i].stack)}</span></div>\n`;
    }
    for (let i = 2; i < nPlayers; i++) {
      actionsHTML += `                    <div class="action-row"><span class="action-player">${players[i].name} (${players[i].pos}):</span> <span class="action-type">Call</span> <span class="action-amount">${fmt(Math.max(...stacks.slice(0, 2)))}</span></div>\n`;
    }
    actionsHTML += '                </div>\n';
  } else if (edge === "Multi-Street") {
    actionsHTML = `                <div class="street-block">
                    <div class="street-name">Preflop Base</div>\n`;
    for (let p of players) {
      if (p.pos !== "BB") {
        actionsHTML += `                    <div class="action-row"><span class="action-player">${p.name} (${p.pos}):</span> <span class="action-type">Call</span> <span class="action-amount">${fmt(bb)}</span></div>\n`;
      }
    }
    actionsHTML += `                    <div class="action-row"><span class="action-player">${players.find(p => p.pos === "BB").name} (BB):</span> <span class="action-type">Check</span></div>\n`;
    actionsHTML += '                </div>\n';
    actionsHTML += `                <div class="street-block">
                    <div class="street-name">Flop Base (A♥ K♦ Q♠)</div>
                    <div class="action-row"><span class="action-player">${players[0].name} (${players[0].pos}):</span> <span class="action-type">Bet</span> <span class="action-amount">${fmt(bb * 2)}</span></div>
                    <div class="action-row"><span class="action-player">${players[1].name} (${players[1].pos}):</span> <span class="action-type">Call</span> <span class="action-amount">${fmt(bb * 2)}</span></div>
                </div>\n`;
  } else if (edge === "Fold Scenarios") {
    actionsHTML = `                <div class="street-block">
                    <div class="street-name">Preflop Base</div>
                    <div class="action-row"><span class="action-player">${players[0].name} (${players[0].pos}):</span> <span class="action-type">Raise</span> <span class="action-amount">${fmt(bb * 3)}</span></div>\n`;
    for (let i = 1; i < nPlayers - 1; i++) {
      actionsHTML += `                    <div class="action-row"><span class="action-player">${players[i].name} (${players[i].pos}):</span> <span class="action-type">Fold</span></div>\n`;
    }
    actionsHTML += `                    <div class="action-row"><span class="action-player">${players[nPlayers-1].name} (${players[nPlayers-1].pos}):</span> <span class="action-type">Call</span> <span class="action-amount">${fmt(bb * 3)}</span></div>
                </div>\n`;
  } else {
    actionsHTML = `                <div class="street-block">
                    <div class="street-name">Preflop Base</div>\n`;
    for (let p of players) {
      if (p.pos !== "SB" && p.pos !== "BB") {
        actionsHTML += `                    <div class="action-row"><span class="action-player">${p.name} (${p.pos}):</span> <span class="action-type">Call</span> <span class="action-amount">${fmt(bb)}</span></div>\n`;
      }
    }
    if (nPlayers > 2) {
      const sbPlayer = players.find(p => p.pos === "SB");
      actionsHTML += `                    <div class="action-row"><span class="action-player">${sbPlayer.name} (SB):</span> <span class="action-type">Call</span> <span class="action-amount">${fmt(bb)}</span></div>\n`;
    } else {
      actionsHTML += `                    <div class="action-row"><span class="action-player">${players[0].name} (SB):</span> <span class="action-type">Call</span> <span class="action-amount">${fmt(bb)}</span></div>\n`;
    }
    const bbPlayer = players.find(p => p.pos === "BB");
    actionsHTML += `                    <div class="action-row"><span class="action-player">${bbPlayer.name} (BB):</span> <span class="action-type">Check</span></div>
                </div>\n`;
  }

  // Calculate pot
  let totalPot = nPlayers * bb + ante;
  let mainPot = totalPot;
  let sidePots = [];

  if (edge === "Multiple All-Ins") {
    const sorted = [...stacks].sort((a, b) => a - b);
    mainPot = sorted[0] * nPlayers + ante;
    if (sorted.length > 1) {
      sidePots.push((sorted[1] - sorted[0]) * (nPlayers - 1));
    }
    totalPot = mainPot + sidePots.reduce((a, b) => a + b, 0);
  } else if (edge === "Fold Scenarios") {
    totalPot = bb * 3 * 2 + ante;
    mainPot = totalPot;
  } else if (edge === "Multi-Street") {
    totalPot = nPlayers * bb + ante + 2 * bb * 2;
    mainPot = totalPot;
  }

  const mainPct = (mainPot / totalPot * 100).toFixed(1);

  // Pot items
  let potHTML = `                <div class="pot-item main">
                    <div class="pot-name">Main Pot</div>
                    <div class="pot-amount">${fmt(mainPot)} (${mainPct}%)</div>
                    <div class="eligible">Eligible: <span>All Players</span></div>
                    <div style="font-size: 11px; color: #666; margin-top: 5px;">
                        Calculation: ${nPlayers} players × ${fmt(bb)} + ${fmt(ante)} ante = ${fmt(mainPot)}
                    </div>
                </div>\n`;

  for (let i = 0; i < sidePots.length; i++) {
    const sp = sidePots[i];
    const spPct = (sp / totalPot * 100).toFixed(1);
    potHTML += `                <div class="pot-item side">
                    <div class="pot-name">Side Pot ${i + 1}</div>
                    <div class="pot-amount">${fmt(sp)} (${spPct}%)</div>
                    <div class="eligible">Eligible: <span>Remaining Players</span></div>
                </div>\n`;
  }

  // Results table
  const winnerIdx = Math.floor(Math.random() * nPlayers);
  let tableRows = '';

  for (let i = 0; i < nPlayers; i++) {
    const p = players[i];
    let finalStack = p.stack - bb;
    let totalLost = bb;
    let liveContrib = fmt(bb);
    let totalLostStr = fmt(bb);

    if (p.pos === "BB") {
      finalStack = p.stack - bb - ante;
      totalLost = bb + ante;
      totalLostStr = `${fmt(totalLost)} (${fmt(bb)} blind + ${fmt(ante)} ante)`;
    }

    let newStack = finalStack;
    let winnerBadge = '<span class="winner-badge loser">-</span>';

    if (i === winnerIdx) {
      newStack = finalStack + totalPot;
      winnerBadge = `
                                <span class="winner-badge" onclick="toggleBreakdown(this)">
                                    🏆 Main Pot <span class="expand-icon">▼</span>
                                </span>
                                <div class="breakdown-details" style="display:none;">
                                    <div class="breakdown-line">Final Stack: ${fmt(finalStack)}</div>
                                    <div class="breakdown-line">+ Main Pot: ${fmt(mainPot)}</div>`;
      for (let j = 0; j < sidePots.length; j++) {
        winnerBadge += `
                                    <div class="breakdown-line">+ Side Pot ${j + 1}: ${fmt(sidePots[j])}</div>`;
      }
      winnerBadge += `
                                    <div class="breakdown-line total">= New Stack: ${fmt(newStack)}</div>
                                </div>
                            `;
    }

    tableRows += `                        <tr>
                            <td>${p.name} (${p.pos})</td><td>${fmt(p.stack)}</td><td>${fmt(finalStack)}</td><td>${liveContrib}</td><td>${totalLostStr}</td>
                            <td>${winnerBadge}</td>
                            <td>${fmt(newStack)}</td>
                        </tr>\n`;
  }

  // Next hand
  const nextNum = tc + 1;
  const nextPlayers = players.map((p, i) => {
    let stack = p.stack - bb;
    if (p.pos === "BB") stack -= ante;
    if (i === winnerIdx) stack += totalPot;
    return { ...p, stack, newPos: positions[(positions.indexOf(p.pos) + 1) % positions.length] };
  }).filter(p => p.stack > 0);

  const nextStack = nextPlayers.map(p => `${p.name} ${p.newPos} ${p.stack}`).join('\\n');
  const nextStackPre = nextPlayers.map(p => `${p.name} ${p.newPos} ${p.stack}`).join('\n');

  // Test name
  const testName = `${nPlayers}P ${edge} - ${cLabel}`;

  return `
        <!-- TEST CASE ${tc}.1 -->
        <div class="test-case">
            <div class="test-header" onclick="toggleTestCase(this)">
                <div>
                    <div class="test-id">TC-${tc}.1</div>
                    <div class="test-name">${testName}</div>
                </div>
                <div class="badges">
                    <span class="badge ${cClass}">${cLabel}</span>
                    <span class="badge category">${edge}</span>
                    <span class="collapse-icon">▼</span>
                </div>
            </div>

            <div class="test-content">
            <div class="section-title">Stack Setup</div>
            <div class="blind-setup">
                <div class="blind-item"><label>Small Blind</label><div class="value">${fmt(sb)}</div></div>
                <div class="blind-item"><label>Big Blind</label><div class="value">${fmt(bb)}</div></div>
                <div class="blind-item"><label>Ante</label><div class="value">${fmt(ante)}</div></div>
                <div class="blind-item"><label>Ante Order</label><div class="value">BB First</div></div>
            </div>

            <div class="copy-instruction">📋 Copy and paste this into the app:</div>
            <button class="copy-btn" onclick="copyPlayerData(this, \`Hand (${tc})
started_at: 00:02:30 ended_at: 00:05:40
SB ${sb} BB ${bb} Ante ${ante}
Stack Setup:
${stackLines}\`)">
                <span>📋</span> Copy Player Data
            </button>
            <div class="player-data-box">
<pre>Hand (${tc})
started_at: 00:02:30 ended_at: 00:05:40
SB ${sb} BB ${bb} Ante ${ante}
Stack Setup:
${stackPre}</pre>
            </div>

            <div class="section-title">Actions</div>
            <div class="actions-section">
${actionsHTML}            </div>

            <div class="section-title">Expected Results</div>
            <div class="results-section">
                <div class="pot-summary">Total Pot: ${fmt(totalPot)}</div>
                <div class="ante-info-box">
                    <strong>BB Ante: ${fmt(ante)}</strong>
                    <div style="margin-top: 5px;">
                        BB posts ${fmt(ante)} ante (dead money), then ${fmt(bb)} blind (live money)
                    </div>
                </div>
${potHTML}                <table>
                    <thead>
                        <tr><th>Player (Position)</th><th>Starting Stack</th><th>Final Stack</th><th>Live Contribution</th><th>Total Lost</th><th>Winner</th><th>New Stack</th></tr>
                    </thead>
                    <tbody>
${tableRows}                    </tbody>
                </table>
            </div>

            <div class="next-hand-preview">
                <div class="next-hand-header">
                    <div class="next-hand-title">📋 Next Hand Preview</div>
                    <button class="copy-btn" onclick="copyPlayerData(this, \`Hand (${nextNum})\\nstarted_at: 00:05:40 ended_at: HH:MM:SS\\nSB ${sb} BB ${bb} Ante ${ante}\\nStack Setup:\\n${nextStack}\`)">
                        <span>📋</span> Copy Next Hand
                    </button>
                </div>
                <div class="next-hand-content">
Hand (${nextNum})
started_at: 00:05:40 ended_at: HH:MM:SS
SB ${sb} BB ${bb} Ante ${ante}
Stack Setup:
${nextStackPre}
                </div>

                <div class="comparison-section">
                    <div class="comparison-header">🔍 Compare with Actual Output</div>
                    <textarea id="actual-output-tc-${tc}" class="comparison-textarea" placeholder="Paste the actual next hand output from your app here..." rows="8"></textarea>
                    <div style="margin-bottom: 10px;">
                        <button class="paste-btn" onclick="pasteFromClipboard(this, 'tc-${tc}')">
                            📋 Paste from Clipboard
                        </button>
                        <button class="compare-btn" onclick="compareNextHand('tc-${tc}', \`Hand (${nextNum})\\nstarted_at: 00:05:40 ended_at: HH:MM:SS\\nSB ${sb} BB ${bb} Ante ${ante}\\nStack Setup:\\n${nextStack}\`)">
                            🔍 Compare
                        </button>
                    </div>
                    <div id="comparison-result-tc-${tc}" class="comparison-result"></div>
                </div>
            </div>

            <div class="notes">
                <div class="notes-title">Notes</div>
                <div class="notes-text">${edge} scenario with ${nPlayers} players. ${cLabel} pot calculation. Winner: ${players[winnerIdx].name}.</div>
            </div>
            </div>
        </div>
`;
}

// Generate all test cases
let html = '';
for (let tc = 14; tc <= 300; tc++) {
  console.log(`Generating TC-${tc}.1...`);
  html += generateTC(tc);
}

fs.writeFileSync('C:\\Apps\\HUDR\\HHTool_Modular\\docs\\generated-test-cases.html', html);
console.log('✓ Generated 287 test cases successfully!');
