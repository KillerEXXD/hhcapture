import fs from 'fs';

const files = [
  'src/lib/poker/engine/__tests__/river.test.ts',
  'src/lib/poker/engine/__tests__/turn.test.ts',
  'src/lib/poker/engine/__tests__/flop.test.ts',
  'src/lib/poker/engine/__tests__/potCalculation.test.ts',
  'src/lib/poker/__tests__/stackCarryOver.test.ts'
];

files.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(file, 'utf-8');

  // Pattern: 'key': {\n  1: value,\n  2: value\n}
  // Replace with: 'key': {\n  initial: { 1: value, 2: value },\n  current: { 1: value, 2: value },\n  updated: { 1: value, 2: value }\n}

  const pattern = /('[\w_]+'):\s*\{[\s\n]+((?:\s+\d+:\s*\d+,?[\s\n]*)+)\s*\}/g;

  const newContent = content.replace(pattern, (match, key, playersBlock) => {
    // Extract all player entries
    const playerEntries = playersBlock.trim().split(',').map(e => e.trim()).filter(e => e);

    if (playerEntries.length === 0) return match;

    // Build the player object string
    const playersObj = '{ ' + playerEntries.join(', ') + ' }';

    return `${key}: {
        initial: ${playersObj},
        current: ${playersObj},
        updated: ${playersObj}
      }`;
  });

  if (newContent !== content) {
    fs.writeFileSync(file, newContent, 'utf-8');
    console.log(`✅ Fixed ${file}`);
  } else {
    console.log(`⚠️  No changes needed in ${file}`);
  }
});

console.log('Done!');
