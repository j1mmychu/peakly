const fs = require('fs');

const code = fs.readFileSync('app.jsx', 'utf-8');

// Check for unclosed template literals
let templateLiterals = 0;
let inTemplateLiteral = false;
let lineNum = 1;
let char = '';
let prevChar = '';

for (let i = 0; i < code.length; i++) {
  char = code[i];
  if (char === '\n') lineNum++;
  
  // Skip escaped backticks
  if (char === '`' && prevChar !== '\\') {
    inTemplateLiteral = !inTemplateLiteral;
  }
  prevChar = char;
}

if (inTemplateLiteral) {
  console.log('ERROR: Unclosed template literal detected');
}

// Check braces
let openBrace = 0, closeBrace = 0;
let openBracket = 0, closeBracket = 0;
let openParen = 0, closeParen = 0;

for (let i = 0; i < code.length; i++) {
  const ch = code[i];
  if (ch === '{') openBrace++;
  if (ch === '}') closeBrace++;
  if (ch === '[') openBracket++;
  if (ch === ']') closeBracket++;
  if (ch === '(') openParen++;
  if (ch === ')') closeParen++;
}

console.log('BRACE CHECK:');
console.log(`  { } : ${openBrace} open, ${closeBrace} close, diff: ${openBrace - closeBrace}`);
console.log(`  [ ] : ${openBracket} open, ${closeBracket} close, diff: ${openBracket - closeBracket}`);
console.log(`  ( ) : ${openParen} open, ${closeParen} close, diff: ${openParen - closeParen}`);

// Check for double commas
const lines = code.split('\n');
lines.forEach((line, idx) => {
  if (line.includes(',,')) {
    console.log(`\nDOUBLE COMMA at line ${idx + 1}: ${line.trim().substring(0, 80)}`);
  }
});

// Check for common patterns indicating issues
console.log('\n\nSTRING/QUOTE CHECK (searching for suspicious patterns):');
const suspiciousPatterns = [
  { pat: /["'`][^"'`]*["'`]\s+["'`]/g, name: 'Adjacent string literals' },
  { pat: /}\s*{/g, name: 'Adjacent braces (potential missing comma)' }
];

suspiciousPatterns.forEach(({pat, name}) => {
  let match;
  let count = 0;
  while ((match = pat.exec(code)) !== null) {
    count++;
  }
  if (count > 0) {
    console.log(`  ${name}: ${count} occurrences`);
  }
});

