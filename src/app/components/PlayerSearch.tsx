import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Search, MoreVertical, Bookmark, Crosshair, Film } from 'lucide-react';
import { toast } from 'sonner';
import { ALL_GENERATED_PLAYERS } from './SeniorLeadPlayersPage';
import { setTier } from '../state/playerStore';
import { UploadHighlightModal } from './UploadHighlightModal';

// nationality codes on players are 3-letter; flagcdn uses 2-letter
const FLAG3TO2: Record<string, string> = {
  GAM: 'gm', NGA: 'ng', GHA: 'gh', CMR: 'cm', SEN: 'sn', CIV: 'ci', MLI: 'ml', BDI: 'bi',
};

/**
 * Global top-nav player search. Live dropdown: two-line rows (avatar + name / flag · team · age)
 * with a kebab (Add to shortlist / target). Whole row → player profile; kebab is carved out.
 */
export function PlayerSearch({ className = '', autoFocus = false }: { className?: string; autoFocus?: boolean }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [uploadFor, setUploadFor] = useState<{ id: string; name: string } | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  const q = query.trim().toLowerCase();
  const results = useMemo(() => {
    if (!q) return [];
    return ALL_GENERATED_PLAYERS.filter(p => p.name.toLowerCase().includes(q) || p.team.toLowerCase().includes(q));
  }, [q]);
  const shown = results.slice(0, 6);
  const showDropdown = open && q.length > 0;

  useEffect(() => { setActive(0); }, [q]);
  useEffect(() => {
    if (!showDropdown) return;
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) { setOpen(false); setMenuId(null); } };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [showDropdown]);

  const basePath = () => {
    const p = window.location.pathname;
    if (p.startsWith('/lead-scout')) return '/lead-scout';
    if (p.startsWith('/senior-scout')) return '/senior-scout';
    if (p.startsWith('/video-manager')) return '/video-manager';
    return '';
  };
  const openPlayer = (p: typeof ALL_GENERATED_PLAYERS[number]) => {
    setOpen(false); setMenuId(null);
    navigate(`${basePath()}/player/${p.id}`, { state: { player: {
      id: p.id, name: p.name, initials: p.initials, age: p.age, nationality: p.nationality,
      primaryPos: p.posAcronym, preferredFoot: p.foot, height: p.height, currentTeam: p.team,
      matchVideos: p.matchVideos, highlightVideos: p.highlightVideos,
    } } });
  };
  const addTo = (p: typeof ALL_GENERATED_PLAYERS[number], tier: 'short-list' | 'target-list') => {
    setMenuId(null); setOpen(false);
    setTier(p.id, tier);
    toast.success(`Added ${p.name} to ${tier === 'short-list' ? 'Short List' : 'Target List'}`);
  };
  const startUpload = (p: typeof ALL_GENERATED_PLAYERS[number]) => {
    setMenuId(null);
    setUploadFor({ id: p.id, name: p.name });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setOpen(false); setMenuId(null); return; }
    if (!showDropdown) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, shown.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (shown[active]) openPlayer(shown[active]); }
  };

  return (
    <div className={'relative ' + className} ref={ref}>
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
      <input
        type="text" value={query} autoFocus={autoFocus}
        onChange={e => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Find a player"
        role="combobox" aria-expanded={showDropdown} aria-autocomplete="list"
        className="w-full pl-9 pr-3 py-2 rounded-full bg-card border border-border font-body font-medium text-[13px] text-foreground placeholder:text-muted-foreground outline-none focus:border-primary transition-colors" />

      {showDropdown && (
        <div className="absolute left-0 top-full mt-2 w-full min-w-[320px] sm:min-w-[360px] max-h-[400px] overflow-y-auto bg-card border border-border rounded-[20px] shadow-2xl z-50 p-1.5" role="listbox">
          {shown.length === 0 && (
            <div className="px-4 py-6 text-center font-body text-[13px] text-muted-foreground">No players match “{query.trim()}”.</div>
          )}
          {shown.map((p, i) => {
            const flag = FLAG3TO2[p.nationality];
            return (
              <div key={p.id} role="option" aria-selected={i === active}
                onClick={() => openPlayer(p)} onMouseEnter={() => setActive(i)}
                className={`relative flex items-center gap-3 pl-2.5 pr-2 py-2 rounded-[14px] cursor-pointer transition-colors group ${i === active ? 'bg-accent' : 'hover:bg-accent'}`}>
                {/* avatar (initials chip) */}
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-heading font-black text-[12px] shrink-0">{p.initials}</div>
                {/* name + meta */}
                <div className="min-w-0 flex-1">
                  <div className={`font-body font-bold text-[14px] truncate transition-colors ${i === active ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}>{p.name}</div>
                  <div className="flex items-center gap-1.5 font-body text-[12px] text-muted-foreground min-w-0">
                    {flag && <img src={`https://flagcdn.com/w40/${flag}.png`} alt={p.country} className="w-4 h-3 rounded-[2px] object-cover shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />}
                    <span className="truncate">{p.team}</span>
                    <span className="shrink-0">·</span>
                    <span className="shrink-0">{p.age} yrs</span>
                  </div>
                </div>
                {/* kebab */}
                <div className="relative shrink-0">
                  <button type="button" aria-label={`Actions for ${p.name}`}
                    onClick={e => { e.stopPropagation(); setMenuId(menuId === p.id ? null : p.id); }}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-card border border-transparent hover:border-border transition-colors">
                    <MoreVertical size={16} />
                  </button>
                  {menuId === p.id && (
                    <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-card border border-border rounded-[14px] shadow-2xl py-1.5" onClick={e => e.stopPropagation()}>
                      <button type="button" onClick={() => addTo(p, 'short-list')}
                        className="w-full flex items-center gap-2.5 px-3 py-2 font-body font-bold text-[13px] text-foreground hover:bg-accent transition-colors">
                        <Bookmark size={14} className="text-primary" /> Add to shortlist
                      </button>
                      <button type="button" onClick={() => addTo(p, 'target-list')}
                        className="w-full flex items-center gap-2.5 px-3 py-2 font-body font-bold text-[13px] text-foreground hover:bg-accent transition-colors">
                        <Crosshair size={14} className="text-primary" /> Add to target
                      </button>
                      <button type="button" onClick={() => startUpload(p)}
                        className="w-full flex items-center gap-2.5 px-3 py-2 font-body font-bold text-[13px] text-foreground hover:bg-accent transition-colors">
                        <Film size={14} className="text-primary" /> Upload highlight
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {results.length > shown.length && (
            <div className="px-4 py-2 mt-0.5 border-t border-border font-body text-[12px] text-muted-foreground text-center">
              Showing {shown.length} of {results.length} — keep typing to narrow
            </div>
          )}
        </div>
      )}

      {uploadFor && (
        <UploadHighlightModal playerId={uploadFor.id} playerName={uploadFor.name} onClose={() => setUploadFor(null)} />
      )}
    </div>
  );
}
