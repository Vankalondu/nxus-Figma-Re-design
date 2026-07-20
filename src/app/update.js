const fs = require('fs');

content = fs.readFileSync('pages/CountryScoutDashboard.tsx', 'utf-8');

// 1. Imports
content = content.replace("import { \n  Search, \n  Calendar,", "import { \n  Search, \n  Calendar,\n  Crown,");

// 2. defaultNonTargetColumns -> function
let newColsDef = `const getNonTargetColumns = (navigate: any): ColumnDef[] => [
  { id: 'actions', group: 'PLAYER IDENTIFICATION', label: 'Actions', isSticky: 'left-0', width: 'w-20',
    renderCell: (p) => (
      <div className="flex items-center space-x-2 px-1">
        <div className={\`w-2.5 h-2.5 rounded-full \${p.dotColor}\`}></div>
        <button className="bg-primary/10 text-primary hover:bg-primary/20 font-bold text-[10px] px-2 py-1 rounded transition-colors uppercase tracking-wider">Reserve</button>
        <button className="bg-primary/10 text-primary hover:bg-primary/20 font-bold text-[10px] px-2 py-1 rounded transition-colors uppercase tracking-wider">Short</button>
      </div>
    )
  },
  { id: 'details', group: 'PLAYER IDENTIFICATION', label: 'Player Details', isSticky: 'left-[64px]', minWidth: 'min-w-[240px]', borderRight: true,
    renderCell: (p) => (
      <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate(\`/player/\${p.id}\`)}>
        <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-sm shrink-0">{p.initials}</div>
        <div className="flex flex-col">
          <span className="font-bold text-foreground text-[13px] hover:underline">{p.name}</span>
          <span className="text-muted-foreground text-[11px]">Age {p.age}</span>
        </div>
      </div>
    )
  },
  { id: 'dob', group: 'BIO DATA', label: 'DOB',
    renderCell: (p) => <span className="text-muted-foreground text-[13px]">{p.dob}</span>
  },
  { id: 'nat', group: 'BIO DATA', label: 'Nat',
    renderCell: (p) => <span className="bg-secondary text-foreground px-2 py-0.5 rounded text-xs font-bold tracking-wide">{p.nationality}</span>
  },
  { id: 'country', group: 'BIO DATA', label: 'Country',
    renderCell: (p) => <span className="text-muted-foreground font-medium text-[13px]">{p.country}</span>
  },
  { id: 'pos', group: 'BIO DATA', label: 'Pos',
    renderCell: (p) => <span className="font-bold text-foreground text-[13px]">{p.pos}</span>
  },
  { id: 'pteam', group: 'BIO DATA', label: 'P.Team',
    renderCell: (p) => <span className="text-muted-foreground font-medium text-[13px]">{p.pTeam}</span>
  },
  { id: 'lvl', group: 'BIO DATA', label: 'Lvl',
    renderCell: (p) => <span className="text-muted-foreground font-medium text-[13px]">{p.pCountry}</span>
  },
  { id: 'match', group: 'BIO DATA', label: 'Match', borderRight: true,
    renderCell: (p) => <span className="text-muted-foreground font-medium text-[13px]">{p.cTeam}</span>
  },
  { id: 'mins', group: 'GAME STATS', label: 'Mins', bgHeader: 'bg-secondary/30', bgCell: 'bg-secondary/30 group-hover:bg-secondary/80', fontMono: true, align: 'center',
    renderCell: (p) => <span className="text-muted-foreground">{p.app}</span>
  },
  { id: 'gls', group: 'GAME STATS', label: 'Gls', fontMono: true, align: 'center',
    renderCell: (p) => <span className="text-muted-foreground">{p.starts}</span>
  },
  { id: 'ast', group: 'GAME STATS', label: 'Ast', bgHeader: 'bg-secondary/30', bgCell: 'bg-secondary/30 group-hover:bg-secondary/80', fontMono: true, align: 'center',
    renderCell: (p) => <span className="font-bold text-foreground">{p.goals}</span>
  },
  { id: 'xg', group: 'GAME STATS', label: 'xG', fontMono: true, align: 'center',
    renderCell: (p) => <span className="text-muted-foreground">{p.ass}</span>
  },
  { id: 'xa', group: 'GAME STATS', label: 'xA', bgHeader: 'bg-secondary/30', bgCell: 'bg-secondary/30 group-hover:bg-secondary/80', fontMono: true, align: 'center',
    renderCell: (p) => <span className="text-muted-foreground">{p.pens}</span>
  },
  { id: 'shots', group: 'GAME STATS', label: 'Shots', fontMono: true, align: 'center',
    renderCell: (p) => <span className="text-muted-foreground">{p.gcMins}</span>
  },
  { id: 'sot', group: 'GAME STATS', label: 'SOT', bgHeader: 'bg-secondary/30', bgCell: 'bg-secondary/30 group-hover:bg-secondary/80', fontMono: true, align: 'center',
    renderCell: (p) => <span className="text-muted-foreground">{p.m90}</span>
  },
  { id: 'pass', group: 'GAME STATS', label: 'Pass%', fontMono: true, align: 'center',
    renderCell: (p) => <span className="text-muted-foreground">{p.g90}</span>
  },
  { id: 'tckl', group: 'GAME STATS', label: 'Tckl', bgHeader: 'bg-secondary/30', bgCell: 'bg-secondary/30 group-hover:bg-secondary/80', fontMono: true, align: 'center',
    renderCell: (p) => <span className="text-muted-foreground">{p.a90}</span>
  },
  { id: 'int', group: 'GAME STATS', label: 'Int', fontMono: true, align: 'center',
    renderCell: (p) => <span className="text-muted-foreground">{p.gc90}</span>
  },
  { id: 'clr', group: 'GAME STATS', label: 'Clr', bgHeader: 'bg-secondary/30', bgCell: 'bg-secondary/30 group-hover:bg-secondary/80', fontMono: true, align: 'center',
    renderCell: (p) => <span className="text-muted-foreground">{p.mpg}</span>
  },
  { id: 'aer', group: 'GAME STATS', label: 'Aer', fontMono: true, borderRight: true, align: 'center',
    renderCell: (p) => <span className="font-bold text-foreground">{p.potMins}</span>
  },
  { id: 'match_videos', group: 'VIDEOS', label: <div className="flex justify-center items-center space-x-1"><Video size={14} /> <span>Match</span></div>, fontMono: true, align: 'center',
    renderCell: (p) => (
       <div className="flex justify-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate(\`/player/\${p.id}\`)}>
          <span className="bg-primary/10 text-primary font-bold px-2 py-0.5 rounded text-xs flex items-center">
             F{p.matchVideos}
          </span>
       </div>
    )
  },
  { id: 'high_videos', group: 'VIDEOS', label: <div className="flex justify-center items-center space-x-1"><Video size={14} /> <span>High</span></div>, fontMono: true, align: 'center',
    renderCell: (p) => (
       <div className="flex justify-center cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate(\`/player/\${p.id}\`)}>
          <span className="bg-emerald-500/10 text-emerald-600 font-bold px-2 py-0.5 rounded text-xs flex items-center">
             H{p.highlightVideos}
          </span>
       </div>
    )
  }
];

const getTargetColumns = (navigate: any): ColumnDef[] => [
  { id: 'actions', group: 'PLAYER IDENTIFICATION', label: 'Actions', isSticky: 'left-0', width: 'w-20',
    renderCell: (p) => (
      <div className="flex items-center space-x-2 px-1">
        <div className={\`w-2.5 h-2.5 rounded-full \${p.dotColor}\`}></div>
        <button className="bg-primary/10 text-primary hover:bg-primary/20 font-bold text-[10px] px-2 py-1 rounded transition-colors uppercase tracking-wider">Reserve</button>
        <button className="bg-primary/10 text-primary hover:bg-primary/20 font-bold text-[10px] px-2 py-1 rounded transition-colors uppercase tracking-wider">Short</button>
      </div>
    )
  },
  { id: 'details', group: 'PLAYER IDENTIFICATION', label: 'Player Details', isSticky: 'left-[64px]', minWidth: 'min-w-[240px]', borderRight: true,
    renderCell: (p) => (
      <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate(\`/player/\${p.id}\`)}>
        <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shadow-sm shrink-0">{p.initials}</div>
        <div className="flex flex-col">
          <span className="font-bold text-foreground text-[13px] hover:underline">{p.name}</span>
          <span className="text-muted-foreground text-[11px]">Age {p.age}</span>
        </div>
      </div>
    )
  },
  { id: 'dob', group: 'BIO DATA', label: 'DOB',
    renderCell: (p) => <span className="text-muted-foreground text-[13px]">{p.dob}</span>
  },
  { id: 'pos', group: 'BIO DATA', label: 'Pos',
    renderCell: (p) => <span className="font-bold text-foreground text-[13px]">{p.pos}</span>
  },
  { id: 'team', group: 'BIO DATA', label: 'Team',
    renderCell: (p) => <span className="text-muted-foreground font-medium text-[13px]">{p.team}</span>
  },
  { id: 'nation', group: 'BIO DATA', label: 'Nation', borderRight: true,
    renderCell: (p) => <span className="bg-secondary text-foreground px-2 py-0.5 rounded text-xs font-bold tracking-wide">{p.nation}</span>
  },
  { id: 'pprofile', group: 'SCOUTING', label: 'PProfile', bgHeader: 'bg-secondary/30', bgCell: 'bg-secondary/30 group-hover:bg-secondary/80',
    renderCell: (p) => <span className={\`px-2 py-1 rounded-full text-xs font-semibold \${p.pProfile === 'Wonderkid' ? 'bg-purple-500/20 text-purple-500' : 'bg-primary/20 text-primary'}\`}>{p.pProfile}</span>
  },
  { id: 'grade', group: 'SCOUTING', label: 'Grade',
    renderCell: (p) => <span className={\`px-2.5 py-1 rounded-full text-xs font-bold \${p.grade === 'A' ? 'bg-green-500/20 text-green-500' : p.grade === 'B' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-secondary text-foreground'}\`}>{p.grade}</span>
  },
  { id: 'status', group: 'SCOUTING', label: 'Status', bgHeader: 'bg-secondary/30', bgCell: 'bg-secondary/30 group-hover:bg-secondary/80',
    renderCell: (p) => <span className={\`px-2 py-1 rounded text-xs font-semibold \${p.status === 'Playing' ? 'bg-green-500/20 text-green-500' : p.status === 'Training' ? 'bg-primary/20 text-primary' : 'bg-red-500/20 text-red-500'}\`}>{p.status}</span>
  },
  { id: 'next', group: 'SCOUTING', label: 'Next',
    renderCell: (p) => <span className="text-foreground font-medium text-[13px]">{p.next}</span>
  },
  { id: 'lead', group: 'SCOUTING', label: 'Lead', bgHeader: 'bg-secondary/30', bgCell: 'bg-secondary/30 group-hover:bg-secondary/80',
    renderCell: (p) => <span className="text-foreground font-medium text-[13px]">{p.lead}</span>
  }
];`

content = content.replace(/const defaultNonTargetColumns[\s\S]*?\];\n\nconst defaultTargetColumns[\s\S]*?\];/, newColsDef);

// Update positions
content = content.replace('const positions = ["ST", "LW", "RW", "CAM", "CM", "CDM", "CB", "GK"];', 'const positions = ["Strikers", "Wingers", "Midfielders", "Full Backs", "Centre Backs"];');

// Dashboard Widgets Imports
content = content.replace("import { Sidebar } from './components/Sidebar';", "import { Sidebar } from './components/Sidebar';\nimport { StatsCards, RegionalRankings } from './components/DashboardWidgets';");

// Use navigate for hooks inside component body
content = content.replace("const playersData = generatePlayers(isTarget ? 15 : 25, isTarget);", "const playersData = generatePlayers(isTarget ? 30 : 60, isTarget);");

content = content.replace(
  "const nonTargetColHook = useDynamicColumns(defaultNonTargetColumns);\n  const targetColHook = useDynamicColumns(defaultTargetColumns);",
  "const nonTargetColHook = useDynamicColumns(getNonTargetColumns(navigate));\n  const targetColHook = useDynamicColumns(getTargetColumns(navigate));"
);

content = content.replace(
  "const { columns, handleContextMenu, renderContextMenu } = isTarget ? targetColHook : nonTargetColHook;",
  "const { columns, customData, handleCellChange, handleContextMenu, renderContextMenu } = isTarget ? targetColHook : nonTargetColHook;"
);

// State for positionFilter
content = content.replace(
  "const [scopeFilter, setScopeFilter] = useState<'all' | 'in-scope'>('in-scope');",
  "const [scopeFilter, setScopeFilter] = useState<'all' | 'in-scope'>('in-scope');\n  const [positionFilter, setPositionFilter] = useState<string>('All');\n  const [showFilter, setShowFilter] = useState<string>('All players');\n  const [perfCount, setPerfCount] = useState(0);\n  const [prospectCount, setProspectCount] = useState(0);"
);

// Replace Tabs
content = content.replace(
  "useState<'players-in-scope' | 'top-ten' | 'combined-top-ten' | 'reserve' | 'short' | 'target'>('players-in-scope');",
  "useState<'players-in-scope' | 'top-ten' | 'reserve-list' | 'combined-top-ten' | 'long' | 'short' | 'target'>('players-in-scope');"
);

content = content.replace(
  /\{\s*id:\s*'players-in-scope',\s*label:\s*'Players in Scope'\s*\},[\s\S]*?\{\s*id:\s*'target',\s*label:\s*'Target'\s*\}/,
  `{ id: 'players-in-scope', label: 'Players in Scope' },
                    { id: 'top-ten', label: 'Top Ten' },
                    { id: 'reserve-list', label: 'Reserve List' },
                    { id: 'combined-top-ten', label: 'Combined Top Ten' },
                    { id: 'long', label: 'Long List' },
                    { id: 'short', label: 'Short' },
                    { id: 'target', label: 'Target' }`
);

// Replace Stats Cards & Regional Rankings inside activePage === 'dashboard'
const dashboardContentOld = `<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 w-full max-w-[1400px]">[\\s\\S]*?<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">`;
// wait, the old file has a bunch of complex logic for StatsCards inside. I'll use simple replace to strip out the old cards and put the new ones.
let dashboardWidgetReplace = content.indexOf('Welcome in Vanessa') > -1;
if(dashboardWidgetReplace) {
  content = content.replace(
    /<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 w-full max-w-\[1400px\]">[\s\S]*?\{!selectedCompetition \? \(/,
    `<StatsCards />
              <RegionalRankings />
            </div>
          )}

          {activePage === 'matches' && (
            <div className="flex flex-col h-full mt-4 space-y-8 pb-10">
               {!selectedCompetition ? (`
  );
}

// Replace filters section
content = content.replace(
  /<div className="mb-6 flex items-center space-x-3 text-\[13px\] overflow-x-auto whitespace-nowrap hide-scrollbar pb-2">[\s\S]*?<\/div>/,
  `<div className="flex flex-col space-y-4 mb-6 mt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6 overflow-x-auto hide-scrollbar pb-2">
                      {/* Show dropdown */}
                      <div className="relative inline-flex items-center space-x-2 px-4 py-2 bg-card border border-border rounded-full hover:border-primary hover:bg-secondary/50 transition-all cursor-pointer">
                        <span className="text-muted-foreground font-semibold text-sm">Show:</span>
                        <select 
                           className="appearance-none bg-transparent border-none text-foreground font-bold focus:outline-none cursor-pointer pr-5 text-sm"
                           value={showFilter}
                           onChange={(e) => setShowFilter(e.target.value)}
                        >
                          <option>All players</option>
                          <option>Raised</option>
                          <option>Can add</option>
                          <option>Can add - prospects</option>
                          <option>Can add - performance</option>
                          <option>All prospects</option>
                          <option>All performance</option>
                        </select>
                        <ChevronDown size={14} className="absolute right-3 text-muted-foreground pointer-events-none" />
                      </div>

                      {/* Position Radio buttons */}
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center space-x-2 cursor-pointer group">
                           <input type="radio" name="positionFilter" value="All" checked={positionFilter === 'All'} onChange={(e) => setPositionFilter(e.target.value)} className="form-radio text-primary focus:ring-primary h-4 w-4" />
                           <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">All</span>
                        </label>
                        {['Strikers', 'Wingers', 'Midfielders', 'Full Backs', 'Centre Backs'].map(pos => (
                           <label key={pos} className="flex items-center space-x-2 cursor-pointer group">
                              <input type="radio" name="positionFilter" value={pos} checked={positionFilter === pos} onChange={(e) => setPositionFilter(e.target.value)} className="form-radio text-primary focus:ring-primary h-4 w-4" />
                              <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{pos}</span>
                           </label>
                        ))}
                      </div>
                    </div>
                    
                    {/* Counters and Submit */}
                    <div className="flex items-center space-x-4 bg-card px-4 py-2 rounded-full border border-border shadow-sm shrink-0">
                       <span className="text-sm font-bold text-foreground">{perfCount}/10 <span className="text-muted-foreground font-medium">performance</span></span>
                       <div className="w-px h-4 bg-border"></div>
                       <span className="text-sm font-bold text-foreground">{prospectCount}/10 <span className="text-muted-foreground font-medium">prospects</span></span>
                       <button 
                         className="bg-primary text-primary-foreground px-5 py-1.5 rounded-full text-xs font-bold hover:bg-primary/90 transition-colors ml-2 disabled:opacity-50 disabled:cursor-not-allowed"
                         disabled={perfCount >= 10 && prospectCount >= 10}
                         onClick={() => {
                           if(perfCount < 10) setPerfCount(p => p + 1);
                           else if(prospectCount < 10) setProspectCount(p => p + 1);
                         }}
                       >
                         Submit to Top 10
                       </button>
                    </div>
                  </div>
                </div>`
);

// Replace Table Body mapping with Grouped Positions Mapping
let tableBodyOld = `<tbody className="bg-card font-body">
                        {playersData.map((player, rowIndex) => (
                          <tr key={player.id} className="border-b border-border hover:bg-secondary/50 transition-colors table-row-hover group">
                            {columns.map((col) => (
                              <td 
                                key={col.id} 
                                className={\`px-4 py-4 \${col.isSticky ? \\\`\${col.isSticky} z-20 bg-card group-hover:bg-secondary shadow-right\\\` : ''} \${col.borderRight ? 'border-r border-border' : ''} \${col.bgCell || ''} \${col.fontMono ? 'font-mono text-[13px]' : ''} \${col.align === 'center' ? 'text-center' : ''}\`}
                              >
                                {col.renderCell ? col.renderCell(player, rowIndex) : player[col.id]}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>`;

let tableBodyNew = `<tbody className="bg-card font-body">
                        {['Strikers', 'Wingers', 'Midfielders', 'Full Backs', 'Centre Backs'].map(posGroup => {
                           const posPlayers = playersData.filter(p => p.pos === posGroup && (positionFilter === 'All' || positionFilter === posGroup));
                           if (posPlayers.length === 0) return null;
                           
                           return (
                             <React.Fragment key={posGroup}>
                               <tr className="bg-secondary/40 border-b border-border">
                                 <td colSpan={columns.length} className="px-6 py-3 text-xs font-extrabold text-foreground uppercase tracking-widest sticky left-0 z-20">
                                   {posGroup} <span className="text-muted-foreground ml-2">({posPlayers.length})</span>
                                 </td>
                               </tr>
                               {posPlayers.map((player, rowIndex) => (
                                 <tr key={player.id} className="border-b border-border hover:bg-secondary/50 transition-colors table-row-hover group">
                                   {columns.map((col) => {
                                      const customVal = customData[player.id]?.[col.id] || '';
                                      return (
                                        <td 
                                          key={col.id} 
                                          className={\`px-4 py-4 \${col.isSticky ? \\\`\${col.isSticky} z-20 bg-card group-hover:bg-secondary shadow-right\\\` : ''} \${col.borderRight ? 'border-r border-border' : ''} \${col.bgCell || ''} \${col.fontMono ? 'font-mono text-[13px]' : ''} \${col.align === 'center' ? 'text-center' : ''}\`}
                                        >
                                          {col.renderCell ? col.renderCell(player, rowIndex, customVal, (val) => handleCellChange(player.id, col.id, val)) : player[col.id]}
                                        </td>
                                      )
                                   })}
                                 </tr>
                               ))}
                             </React.Fragment>
                           );
                        })}
                      </tbody>`;

content = content.replace(tableBodyOld, tableBodyNew);

fs.writeFileSync('pages/CountryScoutDashboard.tsx', content);
console.log("Rewrite completed.");
