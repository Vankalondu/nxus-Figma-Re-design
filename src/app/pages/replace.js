const fs = require('fs');
const path = require('path');

// Fix all off-spec colors in CountryScoutDashboard.tsx
const filePath = path.join(__dirname, 'CountryScoutDashboard.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all off-spec colors
content = content.replace(/#1a1c1d/gi, '#0F172A');
content = content.replace(/#8a8c8d/gi, '#64748B');

// Fix focus ring on form inputs - update from outline-none transition-all to include ember focus ring
// Inputs with no focus ring
content = content.replace(
  /text-\[#0F172A\] focus:outline-none transition-all" \/>/g,
  'text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FF5C00]/20 focus:border-[#FF5C00] transition-all" />'
);

// Selects with no focus ring
content = content.replace(
  /text-\[#0F172A\] focus:outline-none transition-all appearance-none cursor-pointer">/g,
  'text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-[#FF5C00]/20 focus:border-[#FF5C00] transition-all appearance-none cursor-pointer">'
);

// Fix Add Player button - change rounded-xl to rounded-full per spec
content = content.replace(
  /bg-\[#FF5C00\] hover:bg-\[#E05200\] text-white rounded-xl font-bold text-sm shadow-sm transition-all uppercase tracking-wide/g,
  'bg-[#FF5C00] hover:bg-[#E05200] text-[#F8FAFC] rounded-full font-bold text-[14px] shadow-sm transition-all uppercase tracking-wide'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Done! Fixed all off-spec colors in CountryScoutDashboard.tsx');
