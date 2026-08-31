import React, { useState } from 'react';
import { Upload, Play, Check, X } from 'lucide-react';
import { ALL_GENERATED_PLAYERS } from './SeniorLeadPlayersPage';
import { useTierMap, PipelineTier } from '../state/playerStore';
import { useVideoState, coverageStatus, setFullMatchAvailability } from '../state/videoStore';

const FLAG_MAP: Record<string, string> = { GAM: 'gm', NGA: 'ng', GHA: 'gh', CMR: 'cm', SEN: 'sn', CIV: 'ci', MLI: 'ml', BDI: 'bi' };
const hash = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
const jersey = (id: string) => (hash(id) % 30) + 1;

// tier → priority badge + list label
const TIER_PRIO: Record<PipelineTier, { n: number; cls: string; label: string }> = {
  'target-list': { n: 1, cls: 'bg-scout-red/15 text-scout-red',   label: 'Target' },
  'short-list':  { n: 2, cls: 'bg-scout-amber/15 text-scout-amber', label: 'Short' },
  'long-list':   { n: 3, cls: 'bg-primary/15 text-primary',       label: 'Long' },
};

// coverage status → slot appearance
const slotCls = (kind: 'filled' | 'progress' | 'missing' | 'na') =>
  kind === 'filled' ? 'bg-[#22d3ee]/15 text-[#145B99] border-[#22d3ee]/40'   // cyan = uploaded
  : kind === 'progress' ? 'bg-scout-amber/15 text-scout-amber border-scout-amber/30'
  : kind === 'na' ? 'bg-accent text-muted-foreground border-border'
  : 'bg-scout-red/15 text-scout-red border-scout-red/30';                     // red = missing

export function VideoTrackerGrid({ mode, canPkg = false, canFm = false, onUpload }: {
  mode: 'uploader' | 'manager';
  canPkg?: boolean;   // this role can attach packages
  canFm?: boolean;    // this role can attach / set full-match availability
  onUpload?: (playerName: string) => void;
}) {
  const tierMap = useTierMap();
  const vstate = useVideoState();
  const [tier, setTier] = useState<'all' | PipelineTier>('all');
  const [onlyMissing, setOnlyMissing] = useState(mode === 'manager');
  const [search, setSearch] = useState('');
  const [playing, setPlaying] = useState<{ name: string; label: string } | null>(null);

  const q = search.trim().toLowerCase();
  const rows = ALL_GENERATED_PLAYERS
    .filter(p => { const t = tierMap.get(p.id); return t && (tier === 'all' || t === tier); })
    .filter(p => q === '' || p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q))
    .map(p => ({ p, tier: tierMap.get(p.id) as PipelineTier, pkg: coverageStatus(vstate, p.id, 'package'), fm: coverageStatus(vstate, p.id, 'full-match') }))
    .filter(r => !onlyMissing || r.pkg !== 'has-video' || (r.fm !== 'has-video' && r.fm !== 'not-available'))
    .sort((a, b) => TIER_PRIO[a.tier].n - TIER_PRIO[b.tier].n);

  const fmSlots = (id: string, fm: string) => {
    if (fm === 'not-available') return [{ label: 'N/A', kind: 'na' as const }];
    const filled = fm === 'has-video' ? 1 + (hash(id) % 2) : 0; // deterministic mock count
    return [0, 1, 2].map(i => i < filled ? { label: `FM${i + 1}`, kind: 'filled' as const } : { label: fm === 'assigned' ? '·' : '—', kind: fm === 'assigned' ? 'progress' as const : 'missing' as const });
  };
  const pkgSlot = (s: string) => s === 'has-video' ? { label: 'PKG', kind: 'filled' as const } : s === 'in-progress' ? { label: '·', kind: 'progress' as const } : s === 'assigned' ? { label: '·', kind: 'progress' as const } : { label: '—', kind: 'missing' as const };

  const Slot = ({ label, kind, onClick }: { label: string; kind: 'filled' | 'progress' | 'missing' | 'na'; onClick?: () => void }) => (
    <button onClick={onClick} disabled={!onClick} className={`w-11 h-8 rounded-[8px] border font-heading font-black text-[10px] inline-flex items-center justify-center ${slotCls(kind)} ${onClick ? 'hover:opacity-80 cursor-pointer' : 'cursor-default'}`}>
      {kind === 'filled' ? <Play size={11} /> : label}
    </button>
  );

  return (
    <div className="flex flex-col gap-4 pb-8">
      {/* toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 p-1 bg-card border border-border rounded-full shrink-0">
          {([['all', 'All'], ['target-list', 'Target'], ['short-list', 'Short'], ['long-list', 'Long']] as const).map(([id, l]) => (
            <button key={id} onClick={() => setTier(id)} className={`font-body font-bold text-[12px] px-3 py-1.5 rounded-full transition-colors ${tier === id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{l}</button>
          ))}
        </div>
        <button onClick={() => setOnlyMissing(m => !m)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-body font-bold text-[12px] border transition-colors ${onlyMissing ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-muted-foreground hover:text-foreground'}`}>Needs video only</button>
        <div className="relative flex-1 min-w-[180px] max-w-xs ml-auto">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search player or team…"
            className="w-full bg-card/60 border border-primary/40 rounded-full px-4 py-2 font-body font-medium text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary hover:bg-card transition-colors" />
        </div>
      </div>

      <div className="bg-card rounded-[20px] border border-border shadow-[var(--shadow-lg)] overflow-x-auto">
        <table className="w-full min-w-[960px]">
          <thead>
            <tr className="bg-accent/40">
              {['#', 'List', 'Player', 'Pos', 'Year', 'Age', 'DOB', 'Team', 'Nat', 'JRSY', 'PKG', 'FM1', 'FM2', 'FM3', ...(canFm ? ['FM avail.'] : [])].map((h, i) => (
                <th key={i} className="px-3 py-2.5 text-left font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={16} className="px-4 py-10 text-center font-body text-[14px] text-muted-foreground">No players match.</td></tr>}
            {rows.map(({ p, tier: tr, pkg, fm }) => {
              const prio = TIER_PRIO[tr];
              const slots = fmSlots(p.id, fm);
              const ps = pkgSlot(pkg);
              const code = FLAG_MAP[p.nationality];
              return (
                <tr key={p.id} className="border-t border-border hover:bg-accent/50 transition-colors">
                  <td className="px-3 py-2.5"><span className={`w-6 h-6 rounded-full inline-flex items-center justify-center font-heading font-black text-[11px] ${prio.cls}`}>{prio.n}</span></td>
                  <td className="px-3 py-2.5"><span className={`inline-flex items-center px-2 py-0.5 rounded-full font-body font-black text-[10px] ${prio.cls}`}>{prio.label}</span></td>
                  <td className="px-3 py-2.5 font-body font-bold text-[13px] text-foreground whitespace-nowrap">{p.name}</td>
                  <td className="px-3 py-2.5 font-body font-bold text-[12px] text-foreground">{p.posAcronym}</td>
                  <td className="px-3 py-2.5 font-body text-[12px] text-muted-foreground tabular-nums">{p.yob}</td>
                  <td className="px-3 py-2.5 font-body text-[12px] text-muted-foreground tabular-nums">{p.age}</td>
                  <td className="px-3 py-2.5 font-body text-[12px] text-muted-foreground tabular-nums whitespace-nowrap">{p.dob}</td>
                  <td className="px-3 py-2.5 font-body text-[12px] text-muted-foreground truncate max-w-[120px]">{p.team}</td>
                  <td className="px-3 py-2.5">{code && <img src={`https://flagcdn.com/w40/${code}.png`} alt={p.country} className="w-4 h-3 rounded-[2px] object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}</td>
                  <td className="px-3 py-2.5 font-mono font-bold text-[12px] text-foreground tabular-nums">{jersey(p.id)}</td>
                  <td className="px-3 py-2.5"><Slot label={ps.label} kind={ps.kind} onClick={ps.kind === 'filled' ? () => setPlaying({ name: p.name, label: 'Package' }) : canPkg && pkg !== 'has-video' ? () => onUpload?.(p.name) : undefined} /></td>
                  {slots.slice(0, 3).map((s, i) => (
                    <td key={i} className="px-3 py-2.5"><Slot label={s.label} kind={s.kind} onClick={s.kind === 'filled' ? () => setPlaying({ name: p.name, label: s.label }) : canFm && s.kind === 'missing' ? () => onUpload?.(p.name) : undefined} /></td>
                  ))}
                  {slots.length === 1 && [0, 1].map(i => <td key={`e${i}`} className="px-3 py-2.5"><Slot label="—" kind="na" /></td>)}
                  {canFm && (
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setFullMatchAvailability(p.id, 'available')} className={`px-2 py-1 rounded-full font-body font-bold text-[11px] border ${fm === 'has-video' ? 'bg-scout-green/15 text-scout-green border-scout-green/30' : 'bg-card border-border text-muted-foreground hover:text-foreground'}`}>Avail</button>
                        <button onClick={() => setFullMatchAvailability(p.id, 'not-available')} className={`px-2 py-1 rounded-full font-body font-bold text-[11px] border ${fm === 'not-available' ? 'bg-accent text-foreground border-border' : 'bg-card border-border text-muted-foreground hover:text-foreground'}`}>N/A</button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="font-body text-[12px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5 mr-4"><span className="w-3 h-3 rounded-[4px] bg-[#22d3ee]/40" /> Uploaded</span>
        <span className="inline-flex items-center gap-1.5 mr-4"><span className="w-3 h-3 rounded-[4px] bg-scout-amber/40" /> In progress</span>
        <span className="inline-flex items-center gap-1.5 mr-4"><span className="w-3 h-3 rounded-[4px] bg-scout-red/40" /> Missing</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 rounded-[4px] bg-accent border border-border" /> N/A</span>
      </p>

      {playing && (
        <div className="fixed inset-0 bg-midnight/60 backdrop-blur-sm flex items-center justify-center z-[300] p-4" onClick={() => setPlaying(null)}>
          <div className="bg-card rounded-[20px] shadow-2xl w-full max-w-2xl border border-border overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="relative aspect-video bg-gradient-to-br from-[#061b2e] to-[#0a2d4c] flex items-center justify-center">
              <span className="w-16 h-16 rounded-full bg-card/90 flex items-center justify-center shadow-lg"><Play size={28} className="text-primary ml-1" /></span>
              <button onClick={() => setPlaying(null)} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-card/20 text-chalk flex items-center justify-center hover:bg-card/40"><X size={18} /></button>
            </div>
            <div className="p-6">
              <h3 className="font-heading font-bold text-[18px] text-foreground">{playing.name}</h3>
              <p className="font-body text-[13px] text-muted-foreground mt-0.5">{playing.label} · video</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
