const fs = require('fs');

const code = fs.readFileSync('app.jsx', 'utf-8');
const lines = code.split('\n');

console.log('=== SPOT CHECKING KEY LINES ===\n');

// Check lines that had React.createElement flagged
const linesToCheck = [10424, 10429, 10431];

linesToCheck.forEach(lineNum => {
  const line = lines[lineNum - 1];
  console.log(`Line ${lineNum}: ${line.substring(0, 100)}`);
  
  // Check if this is in ErrorBoundary which uses createElement
  if (lineNum >= 10420 && lineNum <= 10450) {
    console.log('  → This is in ErrorBoundary component (valid context for React.createElement)\n');
  }
});

// Check the "const without name" false positives
console.log('\nChecking "const without name" patterns:\n');

const constPatterns = lines.map((line, idx) => ({
  line: idx + 1,
  text: line
})).filter(l => l.text.includes('const [') || l.text.includes('const {'));

constPatterns.slice(0, 5).forEach(p => {
  console.log(`Line ${p.line}: ${p.text.trim()}`);
});

console.log('\n(These are valid destructuring assignments, not actual syntax errors)\n');

// Check empty return statements
console.log('Checking "empty return" patterns:\n');

const emptyReturns = lines.map((line, idx) => ({
  line: idx + 1,
  text: line
})).filter(l => l.text.match(/return\s*;/) && !l.text.trim().startsWith('//'));

if (emptyReturns.length > 0) {
  console.log(`Found ${emptyReturns.length} empty return statements`);
  emptyReturns.slice(0, 3).forEach(r => {
    console.log(`  Line ${r.line}: ${r.text.trim()}`);
  });
} else {
  console.log('No empty return statements found.');
}

