const fs = require('fs');
const path = require('path');

const filesToFix = [
  path.join(__dirname, 'CountryScoutDashboard.tsx'),
];

const replacements = [
  // Off-spec text color #8a8c8d → Muted Light #64748B
  [/#8a8c8d/gi, '#64748B'],
  // Off-spec primary text #1a1c1d → Deep Midnight #0F172A
  [/#1a1c1d/gi, '#0F172A'],
  // scrollbar hover color (CSS only, not a brand color, use #94A3B8)
  // Already handled above
];

for (const filePath of filesToFix) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [pattern, replacement] of replacements) {
    content = content.replace(pattern, replacement);
  }
  // Also fix: scrollbar thumb hover should be muted, not off-spec
  // The scrollbar thumb hover "#8a8c8d" is already caught above
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed:', filePath);
}
console.log('All done.');
