import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  ChevronDown, ArrowRight, ArrowLeft, Archive, UserCircle, Star, Bookmark, Trash2, ArrowUpRight
} from 'lucide-react';

// ─── Grouped action buttons (single pill, all actions inline) ─────────────────────
interface ActionItem { label: string; action: () => void; danger?: boolean; icon: React.ReactNode; }

const ActionGroup = ({ items }: { items: ActionItem[] }) => {
  if (!items.length) return null;
  return (
    <div className="inline-flex items-center rounded-full bg-[#e9f3fd] border border-[#b4d7f6] p-0.5 shrink-0">
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="w-px h-4 bg-[#b4d7f6] self-center shrink-0" />}
          <button onClick={(e) => { e.stopPropagation(); item.action(); }} title={item.label}
            className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
              item.label === 'Restore'
                ? 'text-scout-green hover:bg-scout-green hover:text-chalk'
                : 'text-[#061b2e] hover:bg-primary hover:text-chalk'
            }`}>
            {item.icon}
          </button>
        </React.Fragment>
      ))}
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
  onSendBackward,
  onRestore,
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
  onSendBackward?: (id: string) => void;
  onRestore?: (id: string) => void;
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
              className="sticky top-0 z-20 bg-[#f4faff] -mx-4 px-4 py-2 flex items-center gap-3 w-full hover:opacity-70 transition-opacity group text-left"
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
                    <div className="sticky top-[40px] z-10 bg-[#f4faff] -mx-4 px-4 py-1 flex flex-col gap-1 w-full">
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 animate-fade-in">
                {grpPlayers.map(player => {
                  const isArchived = archivedSet.has(player.id);
                  const natCode = flagMap[player.nationality] || 'un';
                  
                  // Generic Action Builder
                  const getActions = () => {
                    if (isArchived) return [{ label: 'Restore', action: () => onRestore?.(player.id), icon: <ArrowUpRight size={12} /> }];
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
                    // Senior/Lead list tabs — mirror the table action sets per tab
                    if (currentTab === 'database') return [
                      { label: 'Forward', action: () => onSendForward(player.id), icon: <ArrowRight size={12} /> },
                    ];
                    if (currentTab === 'long-list') return [
                      { label: 'Forward', action: () => onSendForward(player.id), icon: <ArrowRight size={12} /> },
                      { label: 'Archive', action: () => onArchive(player.id), icon: <Archive size={12} />, danger: true },
                    ];
                    if (currentTab === 'short-list') return [
                      { label: 'Forward', action: () => onSendForward(player.id), icon: <ArrowRight size={12} /> },
                      { label: 'Back',    action: () => onSendBackward?.(player.id), icon: <ArrowLeft size={12} /> },
                      { label: 'Archive', action: () => onArchive(player.id), icon: <Archive size={12} />, danger: true },
                    ];
                    if (currentTab === 'target-list') return [
                      { label: 'Back',    action: () => onSendBackward?.(player.id), icon: <ArrowLeft size={12} /> },
                      { label: 'Archive', action: () => onArchive(player.id), icon: <Archive size={12} />, danger: true },
                    ];
                    return [
                      { label: 'Forward', action: () => onSendForward(player.id), icon: <ArrowRight size={12} /> },
                    ];
                  };

                  return (
                    <div key={player.id} className={`bg-[#f4faff] relative rounded-[32px] overflow-hidden border border-[#b4d7f6] shadow-[0px_8px_30px_0px_rgba(6,27,46,0.08)] transition-all hover:shadow-xl group w-full max-w-none ${isArchived ? 'opacity-50' : ''}`}>
                      {isArchived && (
                        <div className="bg-muted-foreground/80 py-2 px-4 text-center">
                          <span className="font-heading font-bold text-[10px] uppercase tracking-widest text-chalk">Archived – Not Visible to Scouts</span>
                        </div>
                      )}
                      <div className="p-[16px] flex flex-col gap-[10px]">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-[10px] min-w-0 flex-1">
                            <div className="bg-[#f0f7fd] drop-shadow-[0px_1px_1.5px_rgba(0,0,0,0.1),0px_1px_1px_rgba(0,0,0,0.1)] flex items-center justify-center size-[44px] rounded-full shrink-0 border border-[#b4d7f6] relative">
                              <p className="font-heading font-bold text-[#061b2e] text-[12px]">{player.initials}</p>
                              <span className={`absolute bottom-0 right-0 w-[13px] h-[13px] rounded-full border-2 border-[#f4faff] ${player.scouted ? 'bg-[#3A8C6A]' : 'bg-[#E05C4B]'}`} title={player.scouted ? 'Scouted' : 'Unscouted'} />
                            </div>
                            <div className="flex flex-col gap-[6px] min-w-0">
                              <div className="flex items-center gap-[6px] min-w-0">
                                <p onClick={() => navigate(`/player/${player.id}`, { state: { player: { id: player.id, name: player.name, initials: player.initials, age: player.age, nationality: player.nationality, primaryPos: player.pos, currentTeam: player.team, matchVideos: player.matchVideos, highlightVideos: player.highlightVideos }, trail: [{ label: 'Players', path: window.location.pathname }] } })} className="font-heading font-bold text-[#061b2e] text-[15px] hover:underline cursor-pointer leading-tight truncate min-w-0">{player.name}</p>
                                <span className="size-[16px] rounded-full overflow-hidden border border-[#b4d7f6] shrink-0">
                                  <img src={`https://flagcdn.com/w40/${natCode}.png`} alt={player.nationality} className="size-full object-cover" />
                                </span>
                                {player.dotColor && <div className={`w-2 h-2 rounded-full shrink-0 ${player.dotColor}`} />}
                              </div>
                              <div className="flex gap-[6px] items-center flex-wrap">
                                <div className="bg-[#d2e7fa] px-[8px] py-[2px] rounded-[4px]">
                                  <p className="font-heading font-bold text-[#304151] text-[12px] whitespace-nowrap">{player.age}</p>
                                </div>
                                <div className="bg-[#d2e7fa] px-[8px] py-[2px] rounded-[4px]">
                                  <p className="font-heading font-bold text-[#304151] text-[12px] whitespace-nowrap">F{player.matchVideos}</p>
                                </div>
                                <div className="bg-[#d2e7fa] px-[8px] py-[2px] rounded-[4px]">
                                  <p className="font-heading font-bold text-[#304151] text-[12px] whitespace-nowrap">H{player.highlightVideos || 0}</p>
                                </div>
                                <div className="bg-[#d2e7fa] px-[8px] py-[2px] rounded-[4px]">
                                  <p className="font-heading font-bold text-[#304151] text-[12px] whitespace-nowrap">{player.foot === 'Left' ? 'LF' : player.foot === 'Right' ? 'RF' : 'LF/RF'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <ActionGroup items={getActions()} />
                        </div>

                        <div className="flex items-stretch gap-[10px] w-full">
                          <div className="relative bg-[#f4faff] border border-[#b4d7f6] rounded-[16px] px-[12px] py-[7px] flex-1 min-w-0 flex items-center gap-[10px]">
                            <div className="flex flex-col items-start min-w-0 flex-1">
                              <p className="font-heading font-bold text-[#304151] text-[10px] tracking-[0.5px] uppercase mb-[4px]">Team</p>
                              <p className="font-heading font-bold text-[#061b2e] text-[14px] leading-tight truncate w-full">{player.team || player.pTeam}</p>
                            </div>
                            <div className="w-px self-stretch bg-[#b4d7f6] shrink-0" />
                            <div className="flex flex-col items-center shrink-0">
                              <p className="font-heading font-bold text-[#304151] text-[10px] tracking-[0.5px] uppercase mb-[4px]">Pos</p>
                              <p className="font-heading font-bold text-[#061b2e] text-[14px] leading-tight whitespace-nowrap">{player.posAcronym || player.pos}</p>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-[14px] shrink-0">
                            <div className="flex flex-col items-center">
                              <p className="font-heading font-bold text-[#304151] text-[10px] tracking-[0.5px] uppercase mb-[2px]">APP</p>
                              <p className="font-mono font-bold text-[#061b2e] text-[15px] leading-[18px]">{player.app}</p>
                            </div>
                            <div className="flex flex-col items-center">
                              <p className="font-heading font-bold text-[#304151] text-[10px] tracking-[0.5px] uppercase mb-[2px]">G</p>
                              <p className="font-mono font-bold text-[#061b2e] text-[15px] leading-[18px]">{player.goals}</p>
                            </div>
                            <div className="flex flex-col items-center">
                              <p className="font-heading font-bold text-[#304151] text-[10px] tracking-[0.5px] uppercase mb-[2px]">A</p>
                              <p className="font-mono font-bold text-[#061b2e] text-[15px] leading-[18px]">{player.ass}</p>
                            </div>
                            <div className="flex flex-col items-center">
                              <p className="font-heading font-bold text-[#304151] text-[10px] tracking-[0.5px] uppercase mb-[2px]">SCOUTS</p>
                              <p className="font-mono font-bold text-[#061b2e] text-[15px] leading-[18px]">1</p>
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
