import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { 
  ChevronDown, ArrowRight, Archive, UserCircle, Star, Bookmark, Trash2, ArrowUpRight
} from 'lucide-react';

// ─── Action Dropdown ──────────────────────────────────────────────────────────────
interface ActionItem { label: string; action: () => void; danger?: boolean; icon: React.ReactNode; }

const ActionDropdown = ({ playerId, items }: {
  playerId: string; items: ActionItem[];
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const primaryItem = items[0];
  const restItems = items.slice(1);

  if (!primaryItem) return null;

  return (
    <div className="flex items-center gap-0 relative">
      <button onClick={(e) => { e.stopPropagation(); primaryItem.action(); }} title={primaryItem.label}
        className={`w-7 h-7 rounded-l-lg flex items-center justify-center transition-all border border-r-0 bg-accent text-foreground hover:bg-primary/80 hover:text-primary-foreground border-border`}>
        {primaryItem.icon}
      </button>
      {restItems.length > 0 && (
        <div className="relative">
          <button onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
            className="w-5 h-7 rounded-r-lg bg-accent border border-border text-foreground hover:bg-primary/80 hover:text-primary-foreground flex items-center justify-center transition-all">
            <ChevronDown size={10} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
          {isOpen && (
            <div className="absolute top-full right-0 mt-1 z-[100] bg-card border border-border rounded-[12px] shadow-2xl min-w-[140px] overflow-hidden animate-fade-in">
              {restItems.map((item, i) => (
                <button key={i} onClick={(e) => { e.stopPropagation(); item.action(); setIsOpen(false); }}
                  className={`w-full text-left px-3 py-2 font-body text-[12px] font-bold flex items-center gap-2 transition-colors ${item.danger ? 'text-[#E05C4B] hover:bg-[#E05C4B]/10' : 'text-foreground hover:bg-accent'}`}>
                  {item.icon}{item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Card View Component ──────────────────────────────────────────────────────────
export const CardView = ({ 
  players, 
  archivedSet = new Set(), 
  archiveView = 'active', 
  flagMap = {}, 
  currentTab, 
  onReserve, 
  onShort, 
  onSendForward, 
  onArchive,
  onRaise
}: {
  players: any[]; 
  archivedSet?: Set<string>; 
  archiveView?: 'active' | 'audit';
  flagMap?: Record<string, string>; 
  currentTab: string;
  onReserve: (id: string) => void; 
  onShort: (id: string) => void;
  onSendForward: (id: string) => void; 
  onArchive: (id: string) => void;
  onRaise?: (id: string, name: string) => void;
}) => {
  const navigate = useNavigate();
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const toggleGroup = (key: string) => setCollapsedGroups(prev => ({ ...prev, [key]: !prev[key] }));

  const POS_ORDER = ['Strikers', 'Wingers', 'Midfielders', 'Full Backs', 'Centre Backs'];

  const display = useMemo(() => {
    if (archiveView === 'audit') return players.filter(p => archivedSet.has(p.id));
    return [...players.filter(p => !archivedSet.has(p.id)), ...players.filter(p => archivedSet.has(p.id))];
  }, [players, archivedSet, archiveView]);

  const grouped = useMemo(() => {
    const result: { pos: string; count: number; years: { yob: number; players: any[] }[]; isArchiveGroup?: boolean }[] = [];
    const active = archiveView === 'audit' ? display : display.filter(p => !archivedSet.has(p.id));

    for (const pos of POS_ORDER) {
      const posPlayers = active.filter(p => p.pos === pos);
      if (!posPlayers.length) continue;
      const yobMap = new Map<number, any[]>();
      for (const p of posPlayers) {
        const yob = p.yob || (2026 - p.age);
        if (!yobMap.has(yob)) yobMap.set(yob, []);
        yobMap.get(yob)!.push(p);
      }
      const years = [...yobMap.keys()].sort((a, b) => b - a).map(yob => ({ yob, players: yobMap.get(yob)! }));
      result.push({ pos, count: posPlayers.length, years });
    }

    if (archiveView === 'active') {
      const archived = display.filter(p => archivedSet.has(p.id));
      if (archived.length > 0) {
        result.push({ pos: 'Archived Players', count: archived.length, years: [{ yob: 0, players: archived }], isArchiveGroup: true });
      }
    }
    return result;
  }, [display, archivedSet, archiveView]);

  return (
    <div className="flex flex-col gap-10 pb-10">
      {grouped.map(({ pos, count, years, isArchiveGroup }) => {
        const posKey = isArchiveGroup ? '__archived__' : pos;
        const posCollapsed = collapsedGroups[posKey];

        return (
          <div key={posKey} className="flex flex-col gap-5">
            {/* Position header (STRIKERS …) */}
            <button
              onClick={() => toggleGroup(posKey)}
              className="flex items-center gap-3 w-full hover:opacity-70 transition-opacity group text-left"
            >
              <ChevronDown size={18} className={`text-[#061b2e] transition-transform shrink-0 ${posCollapsed ? '-rotate-90' : ''}`} />
              <span className="font-heading font-bold text-[16px] text-[#061b2e] uppercase tracking-wider whitespace-nowrap">
                {isArchiveGroup ? 'Archived Players' : pos}
              </span>
              <span className="font-body font-bold text-[12px] text-[#304151]/40 shrink-0">({count})</span>
              <div className="h-px bg-[rgba(0,0,0,0.08)] flex-1 ml-2" />
            </button>

            {!posCollapsed && years.map(({ yob, players: grpPlayers }) => {
              const groupKey = `${posKey}-${yob}`;
              const isCollapsed = collapsedGroups[groupKey];

              return (
                <div key={groupKey} className="flex flex-col gap-4">
                  {!isArchiveGroup && (
                    <div className="flex flex-col gap-1 w-full pl-1">
                      <button
                        onClick={() => toggleGroup(groupKey)}
                        className="flex items-center gap-2 w-fit hover:opacity-70 transition-opacity group text-left"
                      >
                        <ChevronDown size={14} className={`text-[#304151] transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                        <span className="font-heading font-bold text-[13px] text-[#304151] tracking-wider">
                          {yob}
                        </span>
                        <span className="text-[#304151]/40 font-body font-bold text-[11px] group-hover:text-primary transition-colors uppercase">
                          {isCollapsed ? `Show ${grpPlayers.length}` : 'Hide'}
                        </span>
                      </button>
                    </div>
                  )}

                  {!isCollapsed && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
                {grpPlayers.map(player => {
                  const isArchived = archivedSet.has(player.id);
                  const natCode = flagMap[player.nationality] || 'un';
                  
                  // Generic Action Builder
                  const getActions = () => {
                    if (isArchived) return [{ label: 'Restore', action: () => {}, icon: <ArrowUpRight size={12} /> }];
                    if (currentTab === 'players-in-scope') return [
                      { label: 'Top 10', action: () => onShort(player.id), icon: <Star size={12} /> },
                      { label: 'Reserve', action: () => onReserve(player.id), icon: <Bookmark size={12} /> },
                      { label: 'Raise', action: () => onRaise?.(player.id, player.name), icon: <ArrowUpRight size={12} /> }
                    ];
                    if (currentTab === 'top-10') return [
                      { label: 'Raise', action: () => onRaise?.(player.id, player.name), icon: <ArrowUpRight size={12} /> },
                      { label: 'Reserve', action: () => onReserve(player.id), icon: <Bookmark size={12} /> },
                      { label: 'Remove', action: () => onArchive(player.id), icon: <Trash2 size={12} />, danger: true }
                    ];
                    if (currentTab === 'reserve-list') return [
                      { label: 'Top 10', action: () => onShort(player.id), icon: <Star size={12} /> },
                      { label: 'Remove', action: () => onArchive(player.id), icon: <Trash2 size={12} />, danger: true }
                    ];
                    // Senior/Lead list tabs
                    return [
                      { label: 'Forward', action: () => onSendForward(player.id), icon: <ArrowRight size={12} /> },
                      { label: 'Profile', action: () => navigate(`/player/${player.id}`, { state: { player: { id: player.id, name: player.name, initials: player.initials, age: player.age, nationality: player.nationality, primaryPos: player.pos, currentTeam: player.team, matchVideos: player.matchVideos, highlightVideos: player.highlightVideos }, trail: [{ label: 'Players', path: window.location.pathname }] } }), icon: <UserCircle size={12} /> },
                      { label: 'Archive', action: () => onArchive(player.id), icon: <Archive size={12} />, danger: true }
                    ];
                  };

                  return (
                    <div key={player.id} className={`bg-[#f4faff] relative rounded-[32px] overflow-hidden border border-[#b4d7f6] shadow-[0px_8px_30px_0px_rgba(6,27,46,0.08)] transition-all hover:shadow-xl group w-full max-w-[380px] ${isArchived ? 'opacity-50' : ''}`}>
                      {isArchived && (
                        <div className="bg-muted-foreground/80 py-2 px-4 text-center">
                          <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-chalk">Archived – Not Visible to Scouts</span>
                        </div>
                      )}
                      <div className="p-[24.8px] flex flex-col gap-[16px]">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-[12px]">
                            <div className="bg-[#f0f7fd] drop-shadow-[0px_1px_1.5px_rgba(0,0,0,0.1),0px_1px_1px_rgba(0,0,0,0.1)] flex items-center justify-center size-[56px] rounded-full shrink-0 border border-[#b4d7f6] relative">
                              <p className="font-heading font-bold text-[#061b2e] text-[14px]">{player.initials}</p>
                            </div>
                            <div className="flex flex-col gap-[6px]">
                              <p onClick={() => navigate(`/player/${player.id}`, { state: { player: { id: player.id, name: player.name, initials: player.initials, age: player.age, nationality: player.nationality, primaryPos: player.pos, currentTeam: player.team, matchVideos: player.matchVideos, highlightVideos: player.highlightVideos }, trail: [{ label: 'Players', path: window.location.pathname }] } })} className="font-heading font-bold text-[#061b2e] text-[16px] hover:underline cursor-pointer truncate max-w-[140px] leading-tight">{player.name}</p>
                              <div className="flex gap-[6px] items-center">
                                <div className="bg-[#d2e7fa] px-[8px] py-[2px] rounded-[4px]">
                                  <p className="font-heading font-bold text-[#304151] text-[12px] whitespace-nowrap">{player.age}</p>
                                </div>
                                <div className="bg-[#d2e7fa] px-[8px] py-[2px] rounded-[4px]">
                                  <p className="font-heading font-bold text-[#304151] text-[12px] whitespace-nowrap">F{player.matchVideos}</p>
                                </div>
                                <div className="bg-[#d2e7fa] px-[8px] py-[2px] rounded-[4px]">
                                  <p className="font-heading font-bold text-[#304151] text-[12px] whitespace-nowrap">H{player.highlightVideos || 0}</p>
                                </div>
                                {player.dotColor && <div className={`w-2 h-2 rounded-full self-center ${player.dotColor}`} />}
                              </div>
                            </div>
                          </div>
                          <ActionDropdown playerId={player.id} items={getActions()} />
                        </div>

                        <div className="flex items-stretch gap-[10px] w-full">
                          <div className="relative bg-[#f4faff] border border-[#b4d7f6] rounded-[16px] px-[12px] py-[10px] flex-1 min-w-0 flex flex-col items-start justify-center">
                            <p className="font-heading font-bold text-[#304151] text-[10px] tracking-[0.5px] uppercase mb-[4px]">Team</p>
                            <div className="flex items-center gap-[6px] w-full min-w-0">
                              <p className="font-heading font-bold text-[#061b2e] text-[14px] truncate leading-tight min-w-0">{player.team || player.pTeam}</p>
                              <span className="size-[18px] rounded-full overflow-hidden border border-[#b4d7f6] shrink-0">
                                <img src={`https://flagcdn.com/w40/${natCode}.png`} alt={player.nationality} className="size-full object-cover" />
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-[14px] shrink-0">
                            <div className="flex flex-col items-center">
                              <p className="font-heading font-bold text-[#304151] text-[10px] tracking-[0.5px] uppercase mb-[2px]">APP</p>
                              <p className="font-mono font-bold text-[#061b2e] text-[16px] leading-[24px]">{player.app}</p>
                            </div>
                            <div className="flex flex-col items-center">
                              <p className="font-heading font-bold text-[#304151] text-[10px] tracking-[0.5px] uppercase mb-[2px]">G</p>
                              <p className="font-mono font-bold text-[#061b2e] text-[16px] leading-[24px]">{player.goals}</p>
                            </div>
                            <div className="flex flex-col items-center">
                              <p className="font-heading font-bold text-[#304151] text-[10px] tracking-[0.5px] uppercase mb-[2px]">A</p>
                              <p className="font-mono font-bold text-[#061b2e] text-[16px] leading-[24px]">{player.ass}</p>
                            </div>
                            <div className="flex flex-col items-center">
                              <p className="font-heading font-bold text-[#304151] text-[10px] tracking-[0.5px] uppercase mb-[2px]">SCOUTS</p>
                              <p className="font-mono font-bold text-[#061b2e] text-[16px] leading-[24px]">1</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
