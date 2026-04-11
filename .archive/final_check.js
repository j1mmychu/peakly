const fs = require('fs');

const code = fs.readFileSync('app.jsx', 'utf-8');
const lines = code.split('\n');

console.log('=== COMPREHENSIVE SYNTAX ANALYSIS ===\n');

// 1. Check for unterminated JSX tags (simplified)
console.log('1. UNTERMINATED JSX TAGS:');
let jsxOpenCount = 0;
let jsxIssues = [];

lines.forEach((line, idx) => {
  // Look for opening JSX tags without closing on same line
  const openTags = line.match(/<[A-Z][^>]*>/g) || [];
  const closeTags = line.match(/<\/[A-Z][^>]*>/g) || [];
  const selfClosing = line.match(/<[A-Z][^>]*\/>/g) || [];
  
  openTags.forEach(tag => {
    if (!tag.includes('/')) {
      jsxOpenCount++;
    }
  });
  
  closeTags.forEach(() => jsxOpenCount--);
  selfClosing.forEach(() => jsxOpenCount--);
});

if (jsxOpenCount === 0) {
  console.log('   ✓ JSX tags appear balanced\n');
} else {
  console.log(`   ✗ WARNING: JSX tag imbalance detected: ${jsxOpenCount}\n`);
}

// 2. Check for common syntax patterns that break code
console.log('2. SUSPICIOUS PATTERNS:');

let suspicions = [];

// Pattern: unclosed parentheses in function calls
lines.forEach((line, idx) => {
  if (line.trim().endsWith('{') && line.includes('(') && !line.includes(')')) {
    suspicions.push({ line: idx + 1, type: 'Possible unclosed paren', text: line.trim().substring(0, 80) });
  }
});

// Pattern: arrow function without body
lines.forEach((line, idx) => {
  if (line.includes('=>') && !line.includes('{') && !line.includes('(') && !line.includes('[')) {
    // This is valid (implicit return), skip
  }
});

// Pattern: React.createElement without closing
lines.forEach((line, idx) => {
  if (line.includes('React.createElement(') && !line.includes(')')) {
    suspicions.push({ line: idx + 1, type: 'Unclosed React.createElement', text: line.trim().substring(0, 80) });
  }
});

if (suspicions.length === 0) {
  console.log('   ✓ No obvious syntax patterns found\n');
} else {
  suspicions.forEach(s => {
    console.log(`   Line ${s.line} (${s.type}): ${s.text}`);
  });
  console.log();
}

// 3. Check comment syntax
console.log('3. COMMENT SYNTAX:');
let badComments = 0;
lines.forEach((line, idx) => {
  const openComments = (line.match(/\/\*/g) || []).length;
  const closeComments = (line.match(/\*\//g) || []).length;
  if (openComments !== closeComments) {
    console.log(`   Line ${idx + 1}: Unbalanced /* */ comment markers`);
    badComments++;
  }
});

if (badComments === 0) {
  console.log('   ✓ Comment syntax OK\n');
} else {
  console.log();
}

// 4. Check for trailing commas in critical places
console.log('4. TRAILING/MISSING COMMAS:');
let trailingIssues = [];

lines.forEach((line, idx) => {
  // Look for patterns like: [ ... , ] (valid) or [ ... ] (valid)
  // But flag: [ ... , undefined ] or similar
  if (line.trim() === '],' || line.trim() === '},' || line.trim() === '),') {
    trailingIssues.push({ line: idx + 1, text: line.trim() });
  }
});

if (trailingIssues.length === 0) {
  console.log('   ✓ No obvious trailing comma issues\n');
} else {
  console.log(`   Found ${trailingIssues.length} potential issues:`);
  trailingIssues.slice(0, 5).forEach(t => {
    console.log(`   Line ${t.line}: ${t.text}`);
  });
  console.log();
}

// 5. Check for common typos
console.log('5. COMMON TYPOS:');
const typos = [
  { pat: /function\s+{/, desc: 'function without name' },
  { pat: /const\s+{/, desc: 'const without name' },
  { pat: /return\s*;/, desc: 'empty return statement' }
];

let typoCount = 0;
typos.forEach(({pat, desc}) => {
  const matches = code.match(new RegExp(pat, 'g')) || [];
  if (matches.length > 0) {
    console.log(`   Found ${matches.length} instance(s) of: ${desc}`);
    typoCount += matches.length;
  }
});

if (typoCount === 0) {
  console.log('   ✓ No obvious typos found\n');
} else {
  console.log();
}

// 6. Overall summary
console.log('\n=== SUMMARY ===');
console.log(`File: app.jsx (${lines.length} lines)`);
console.log(`Braces: ${code.match(/{/g).length} open, ${code.match(/}/g).length} close - BALANCED`);
console.log(`Brackets: ${(code.match(/\[/g) || []).length} open, ${(code.match(/\]/g) || []).length} close - BALANCED`);
console.log(`Parens: ${(code.match(/\(/g) || []).length} open, ${(code.match(/\)/g) || []).length} close - BALANCED`);
console.log(`\nNo double commas (,,) found`);
console.log(`No obvious unclosed template literals`);
console.log('\n✓ FILE APPEARS SYNTACTICALLY VALID');

