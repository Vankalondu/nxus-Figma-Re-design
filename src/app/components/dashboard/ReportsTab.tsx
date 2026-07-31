import React from 'react';
import { Search, RefreshCw, User, Calendar, FileText, Eye, Star, Download } from 'lucide-react';
import { EditFormBlueprintModal } from '../EditFormBlueprintModal';
import { ChampionPodium, InlineSel, gradeToScore } from './shared';

export const ReportsTab = ({ onAddReport }: { onAddReport?: () => void }) => {
  const [refreshing, setRefreshing] = React.useState(false);
  const [search, setSearch] = React.useState('');
  const [fStatus, setFStatus] = React.useState<'all' | 'unread'>('all');
  const [fScout, setFScout] = React.useState('All');
  const [fGrade, setFGrade] = React.useState('All');
  const [fPos, setFPos] = React.useState('All');
  const [fRecency, setFRecency] = React.useState<'all' | 'month' | 'week'>('all');
  const [viewReport, setViewReport] = React.useState<any>(null);
  const [visibleCount, setVisibleCount] = React.useState(6);

  // status: 'unseen' (blue outline) · 'seen' (default) · 'opened' (faded)
  const [reports, setReports] = React.useState(() => {
    const base = [
      { id:'r1', player:'Kofi Mensah',   initials:'KM', pos:'ST',  plr:'A+', pog:'A',  nxt:'T', date:'Dec 14', daysAgo:3,  scout:'Mbugua', status:'unseen', notes:'' },
      { id:'r2', player:'David Conteh',  initials:'DC', pos:'LW',  plr:'A',  pog:'B',  nxt:'M', date:'Dec 12', daysAgo:5,  scout:'Tom',    status:'seen',   notes:'' },
      { id:'r3', player:'Amadou Sarr',   initials:'AS', pos:'CDM', plr:'B',  pog:'B',  nxt:'M', date:'Dec 10', daysAgo:7,  scout:'Tom',    status:'opened', notes:'' },
      { id:'r4', player:'Kazungu Nesta', initials:'KN', pos:'CM',  plr:'B',  pog:'B',  nxt:'M', date:'Dec 8',  daysAgo:9,  scout:'Nene',   status:'unseen', notes:'' },
      { id:'r5', player:'Francis Gomez', initials:'FG', pos:'RW',  plr:'A',  pog:'A',  nxt:'T', date:'Nov 28', daysAgo:19, scout:'Nene',   status:'opened', notes:'' },
      { id:'r6', player:'Abdul Moro',    initials:'AM', pos:'CM',  plr:'B',  pog:'A',  nxt:'T', date:'Nov 25', daysAgo:22, scout:'Mbugua', status:'seen',   notes:'' },
    ];
    const NAMES = ['Kwame Boateng','Yaw Owusu','Sory Camara','Ismael Toure','Cheikh Diop','Musa Kante','Prince Mensah','Daniel Osei','Emmanuel Adjei','Lamine Cisse','Joseph Njoroge','Wekesa Omondi','Baba Traore','Kofi Annan','Samuel Eto','Riyad Sane','Nabil Fassi','Omar Diallo','Karim Toure','Yusuf Bah'];
    const POS = ['ST','LW','RW','CM','CDM','CB','RB','GK']; const GR = ['A+','A','B+','B','C']; const SC = ['Mbugua','Tom','Nene','Brice','David']; const MO = ['Nov','Oct','Sep','Aug'];
    const gen = Array.from({ length: 651 }, (_, i) => {
      const nm = NAMES[i % NAMES.length];
      return { id:`g${i}`, player: nm, initials: nm.split(' ').map(w => w[0]).join(''), pos: POS[i%POS.length], plr: GR[i%GR.length], pog: GR[(i+2)%GR.length], nxt: i%2 ? 'M' : 'T', date: `${MO[i%MO.length]} ${1+(i%27)}`, daysAgo: 25+i, scout: SC[i%SC.length], status: i%7===0 ? 'unseen' : (i%3===0 ? 'opened' : 'seen'), notes:'' };
    });
    return [...base, ...gen];
  });
  const markOpened = (id: string) => setReports(prev => prev.map(r => r.id === id ? { ...r, status: 'opened' } : r));
  const openReport = (r: any) => { setViewReport(r); markOpened(r.id); };
  const scoutCounts = [
    { name: 'Mbugua', role: 'Senior Scout', count: 9 },
    { name: 'Tom',    role: 'Lead Scout',   count: 6 },
    { name: 'Nene',   role: 'Head Scout',   count: 4 },
  ];
  const scoutOpts = ['All', ...Array.from(new Set(reports.map(r => r.scout)))];
  const gradeOpts = ['All', ...Array.from(new Set(reports.map(r => r.plr)))];
  const posOpts   = ['All', ...Array.from(new Set(reports.map(r => r.pos)))];

  const unreadCount = reports.filter(r => r.status === 'unseen').length;
  const gradeACount = reports.filter(r => r.plr === 'A' || r.plr === 'A+').length;

  const q = search.trim().toLowerCase();
  const filtered = reports.filter(r =>
    (q === '' || r.player.toLowerCase().includes(q) || r.scout.toLowerCase().includes(q)) &&
    (fStatus === 'all' || r.status === 'unseen') &&
    (fScout === 'All' || r.scout === fScout) &&
    (fGrade === 'All' || r.plr === fGrade) &&
    (fPos === 'All' || r.pos === fPos) &&
    (fRecency === 'all' || (fRecency === 'week' ? r.daysAgo <= 7 : r.daysAgo <= 31))
  );
  const shown = filtered.slice(0, visibleCount);
  const remaining = filtered.length - shown.length;
  const activeFilters = [fStatus !== 'all', fScout !== 'All', fGrade !== 'All', fPos !== 'All', fRecency !== 'all'].filter(Boolean).length;
  const clearFilters = () => { setFStatus('all'); setFScout('All'); setFGrade('All'); setFPos('All'); setFRecency('all'); };

  const summaryStats = [
    { label: 'Total', value: reports.length.toString(), sub: 'All time', icon: FileText },
    { label: 'Unread', value: unreadCount.toString(), sub: 'Need review', icon: Eye },
    { label: 'Grade A/A+', value: gradeACount.toString(), sub: 'Top PLR', icon: Star },
    { label: 'This Month', value: reports.length.toString(), sub: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), icon: Calendar },
  ];
  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* KPI tiles (one row) + Champion (far right) */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 lg:items-stretch">
        {summaryStats.map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="lg:col-span-1 min-w-0 bg-card border border-border rounded-[20px] p-4 h-[135px] shadow-[var(--shadow-lg)] flex flex-col justify-between hover:-translate-y-1 hover:shadow-xl transition-all">
              <div className="flex items-center justify-between gap-2">
                <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground truncate">{stat.label}</span>
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><Icon size={16} className="text-primary" /></div>
              </div>
              <div className="font-heading font-extrabold text-[32px] text-foreground leading-none">{stat.value}</div>
              <span className="font-body text-[12px] text-muted-foreground font-medium">{stat.sub}</span>
            </div>
          );
        })}
        <div className="col-span-2 min-w-0"><ChampionPodium scouts={scoutCounts} /></div>
      </div>

      {/* Toolbar: search (left) · inline filters · Refresh + Add Report (right) */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search — outlined like the filters, wider */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search player or scout…"
            className="w-full bg-card/60 border border-primary/40 rounded-full pl-9 pr-3 py-2 font-body font-medium text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary hover:bg-card transition-colors" />
        </div>

        {/* Inline filters — always in view */}
        <InlineSel value={fStatus === 'all' ? 'All' : 'Unread'} onChange={v => setFStatus(v === 'Unread' ? 'unread' : 'all')} opts={['All', 'Unread']} allLabel="All reports" />
        <InlineSel value={fScout} onChange={setFScout} opts={scoutOpts} allLabel="All scouts" />
        <InlineSel value={fGrade} onChange={setFGrade} opts={gradeOpts} allLabel="All grades" />
        <InlineSel value={fPos} onChange={setFPos} opts={posOpts} allLabel="All positions" />
        <InlineSel value={fRecency === 'all' ? 'All' : fRecency === 'month' ? 'This month' : 'This week'} onChange={v => setFRecency(v === 'This week' ? 'week' : v === 'This month' ? 'month' : 'all')} opts={['All', 'This month', 'This week']} allLabel="All time" />
        {activeFilters > 0 && <button onClick={clearFilters} className="font-body text-[12px] font-bold text-primary hover:underline px-1 shrink-0">Clear</button>}

        <button onClick={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 600); }}
          className="ml-auto shrink-0 flex items-center gap-2 bg-transparent border border-primary text-foreground px-4 py-2 rounded-full font-body font-bold text-[13px] hover:bg-primary/10 transition-colors">
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />Refresh
        </button>
      </div>

      {/* Report cards */}
      {shown.length === 0 && (
        <div className="bg-card border border-border rounded-[20px] p-10 text-center font-body text-[14px] text-muted-foreground shadow-[var(--shadow-lg)]">
          No reports match your search or filters.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {shown.map(r => {
          const overall = Math.round((gradeToScore(r.plr) + gradeToScore(r.pog)) / 2);
          return (
          <div key={r.id}
            className={`bg-card rounded-[20px] border p-5 flex flex-col gap-3 hover:shadow-xl transition-all ${r.status === 'unseen' ? 'border-primary ring-2 ring-primary/40 shadow-md' : r.status === 'opened' ? 'border-border shadow-[var(--shadow-lg)] opacity-60' : 'border-border shadow-[var(--shadow-lg)]'}`}>
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-heading font-black text-[14px] shrink-0">{r.initials}</div>
                <div className="min-w-0">
                  <div className="font-heading font-bold text-[15px] text-foreground truncate">{r.player}</div>
                  <div className="flex items-center gap-1.5 font-body text-[12px] text-muted-foreground">
                    <span className="font-bold text-foreground">{r.pos}</span>
                    <span>·</span>
                    <User size={11} />{r.scout}
                    <span>·</span>
                    <Calendar size={11} />{r.date}
                  </div>
                </div>
              </div>
            </div>
            {/* Grade strip */}
            <div className="grid grid-cols-3 gap-2">
              {([['PLR', r.plr], ['POG', r.pog], ['NXT', r.nxt]] as const).map(([k, v]) => (
                <div key={k} className="bg-accent/50 rounded-[14px] py-2 text-center">
                  <div className="font-heading font-bold text-[16px] text-foreground leading-none">{v}</div>
                  <div className="font-heading font-bold text-[9px] uppercase tracking-widest text-muted-foreground mt-1">{k}</div>
                </div>
              ))}
            </div>
            {/* Overall score */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground">Overall</span>
                <span className="font-heading font-black text-[13px] text-foreground tabular-nums">{overall}</span>
              </div>
              <div className="h-2 bg-accent rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${overall}%` }} />
              </div>
            </div>
            {/* Footer */}
            <div className="flex items-center gap-2 pt-1">
              <button onClick={() => openReport(r)} className="flex-1 flex items-center justify-center gap-1.5 font-body font-bold text-[13px] border border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-full py-2 transition-colors"><Eye size={14} />View</button>
              <button className="flex-1 flex items-center justify-center gap-1.5 font-body font-bold text-[13px] border border-border text-muted-foreground hover:bg-accent hover:text-foreground hover:border-primary rounded-full py-2 transition-colors"><Download size={14} />Export</button>
            </div>
          </div>
          );
        })}
      </div>

      {remaining > 0 && (
        <button onClick={() => setVisibleCount(v => v + 9)} className="mx-auto flex items-center gap-2 bg-transparent border border-primary text-foreground px-6 py-2 rounded-full font-body font-bold text-[13px] hover:bg-primary/10 transition-colors">
          Load more ({remaining} remaining)
        </button>
      )}

      {viewReport && <EditFormBlueprintModal editTemplate={viewReport} onClose={() => setViewReport(null)} />}
    </div>
  );
};
