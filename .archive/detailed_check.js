const fs = require('fs');

const code = fs.readFileSync('app.jsx', 'utf-8');
const lines = code.split('\n');

console.log('=== CHECKING ADJACENT BRACES (} {) ===\n');

let adjacentBraceCount = 0;
lines.forEach((line, idx) => {
  const match = line.match(/}\s*{/);
  if (match && match.index !== undefined) {
    // Likely a valid pattern (end of one block, start of another)
    // Only report if NOT in array/object literal context
    const before = line.substring(0, match.index);
    const after = line.substring(match.index + match[0].length);
    
    // Heuristic: if followed by something that looks like a key, might be object property
    if (after.trim().match(/^[a-zA-Z_$]/)) {
      console.log(`Line ${idx + 1}: ${line.trim()}`);
      adjacentBraceCount++;
    }
  }
});

if (adjacentBraceCount === 0) {
  console.log('(No suspicious patterns found - all likely valid)\n');
}

console.log('\n=== CHECKING ADJACENT STRING LITERALS ===\n');

let issues = 0;
lines.forEach((line, idx) => {
  // Look for string/template literal pairs without operators between them
  const suspicious = line.match(/["'`][^"'`]*["'`]\s+["'`]/);
  if (suspicious) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
    issues++;
  }
});

if (issues === 0) {
  console.log('(No issues found)\n');
}

console.log('\n=== CHECKING FOR MISSING COMMAS (pattern: "x": y "x": z) ===\n');

let missingCommaCount = 0;
lines.forEach((line, idx) => {
  // Pattern: property: value followed immediately by another property
  const match = line.match(/:\s*[\w\[\{]/g);
  if (match && match.length > 1) {
    // Possible multiple properties on one line - check if commas exist
    if (line.includes(':') && !line.includes(',') && line.includes('{')) {
      // May have multiple properties on one line without commas
      const colonMatches = line.match(/:/g);
      const commaMatches = line.match(/,/g);
      if (colonMatches && commaMatches) {
        const colonCount = colonMatches.length;
        const commaCount = commaMatches.length;
        if (colonCount > commaCount + 1) {
          console.log(`Line ${idx + 1}: Multiple colons but few commas - ${line.trim().substring(0, 100)}`);
          missingCommaCount++;
        }
      }
    }
  }
});

if (missingCommaCount === 0) {
  console.log('(No obvious issues found)\n');
}

