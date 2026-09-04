import React, { useState } from 'react';
import { Search, ChevronDown, MoreVertical, Edit2, Trash2, ArrowRight, ArrowLeft, Plus, X, ArrowLeftRight, Settings } from 'lucide-react';
import { useNavigate } from 'react-router';

// MOCK DATA
const mockBodies = [
  { id: 1, name: 'FIFA', competitionsCount: 12 },
  { id: 2, name: 'UEFA', competitionsCount: 8 },
  { id: 3, name: 'CAF', competitionsCount: 5 },
  { id: 4, name: 'CONMEBOL', competitionsCount: 4 },
];

const mockCompetitions = [
  { id: 1, name: 'World Cup', category: 'National', body: 'FIFA' },
  { id: 2, name: 'Champions League', category: 'Club', body: 'UEFA' },
  { id: 3, name: 'AFCON', category: 'National', body: 'CAF' },
  { id: 4, name: 'Copa Libertadores', category: 'Club', body: 'CONMEBOL' },
];

const mockTeams = [
  { id: 1, parentTeamName: 'Manchester United', country: 'England', category: 'Club' },
  { id: 2, parentTeamName: 'Real Madrid', country: 'Spain', category: 'Club' },
  { id: 3, parentTeamName: 'Right to Dream', country: 'Ghana', category: 'Academy' },
  { id: 4, parentTeamName: 'Gor Mahia', country: 'Kenya', category: 'Club' },
];

const mockPlayers = [
  { id: 'p1', name: 'Marcus Rashford', position: 'LW', currentTeam: 'Manchester United', teamCountry: 'England', dob: '1997-10-31', age: 26, nationality: 'England' },
  { id: 'p2', name: 'Vinícius Júnior', position: 'LW', currentTeam: 'Real Madrid', teamCountry: 'Spain', dob: '2000-07-12', age: 23, nationality: 'Brazil' },
  { id: 'p3', name: 'Mohammed Kudus', position: 'AM', currentTeam: 'West Ham', teamCountry: 'England', dob: '2000-08-02', age: 23, nationality: 'Ghana' },
  { id: 'p4', name: 'Benson Omala', position: 'ST', currentTeam: 'Gor Mahia', teamCountry: 'Kenya', dob: '2001-10-02', age: 22, nationality: 'Kenya' },
];

export function AdminView() {
  const [activeTab, setActiveTab] = useState<'bodies' | 'competitions' | 'teams' | 'players' | 'transfers'>('bodies');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const navigate = useNavigate();

  // Transfers specific state
  const [transferParentTeam, setTransferParentTeam] = useState('Manchester United');
  const [transferSpecificTeam, setTransferSpecificTeam] = useState('Senior');
  const [teamRoster, setTeamRoster] = useState<typeof mockPlayers>(mockPlayers.slice(0, 1));
  const [availablePlayers, setAvailablePlayers] = useState<typeof mockPlayers>(mockPlayers.slice(1));
  const [dragOver, setDragOver] = useState<null | 'available' | 'roster'>(null);

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveMenu(activeMenu === id ? null : id);
  };

  const closeMenu = () => setActiveMenu(null);

  // Tab subtitles
  const tabSubtitles: Record<typeof activeTab, string> = {
    bodies:       'Manage governing bodies and their affiliated competitions.',
    competitions: 'Manage competition entries, categories, and affiliated bodies.',
    teams:        'Manage parent teams, academies, and club data.',
    players:      'Manage player records across all registered teams.',
    transfers:    'Move players between teams and manage squad rosters.',
  };

  const ActionMenu = ({ id }: { id: string }) => (
    <div className="flex items-center justify-end gap-2">
      <button title="Edit" className="w-8 h-8 rounded-full bg-surface-accent flex items-center justify-center text-text-body hover:text-brand-primary transition-colors">
        <Edit2 size={14} />
      </button>
      <button title="Delete" className="w-8 h-8 rounded-full bg-surface-accent flex items-center justify-center text-text-body hover:text-status-error transition-colors">
        <Trash2 size={14} />
      </button>
    </div>
  );

  const handleTransferToTeam = (player: typeof mockPlayers[0]) => {
    setAvailablePlayers(prev => prev.filter(p => p.id !== player.id));
    setTeamRoster(prev => [...prev, player]);
  };

  const handleRemoveFromTeam = (player: typeof mockPlayers[0]) => {
    setTeamRoster(prev => prev.filter(p => p.id !== player.id));
    setAvailablePlayers(prev => [...prev, player]);
  };

  const handleDrop = (zone: 'available' | 'roster') => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;
    if (zone === 'roster') {
      const p = availablePlayers.find(x => String(x.id) === id);
      if (p) handleTransferToTeam(p);
    } else {
      const p = teamRoster.find(x => String(x.id) === id);
      if (p) handleRemoveFromTeam(p);
    }
  };

  return (
    <div className="flex flex-col h-full" onClick={closeMenu}>
      {/* ── Page Header — Qaza signature pattern ── */}
      <div className="pt-6 mb-3 flex flex-col justify-center shrink-0">
        <h1 className="font-heading font-semibold type-h3 tracking-tight text-text-heading flex items-center gap-4 leading-none">
          Admin
          <span className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center shadow-sm shrink-0">
            <Settings size={28} className="text-text-on-brand" />
          </span>
          Panel
        </h1>
        <p className="font-body font-medium text-[15px] text-text-body mt-2 short:hidden">
          {tabSubtitles[activeTab]}
        </p>
      </div>

      {/* ── Tab row ── */}
      <div className="flex items-center gap-2 mt-8 mb-6 flex-wrap">
        {[
          { id: 'bodies',       label: 'Bodies'       },
          { id: 'competitions', label: 'Competitions' },
          { id: 'teams',        label: 'Teams'        },
          { id: 'players',      label: 'Players'      },
          { id: 'transfers',    label: 'Transfers'    },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 py-2 rounded-full font-body font-bold text-[14px] transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-brand-primary text-text-inverse shadow-sm border border-brand-primary'
                : 'bg-surface-card text-text-body border border-text-on-brand hover:border-brand-primary hover:text-text-heading'
            }`}
          >
            {tab.label}
          </button>
        ))}

        {/* Action Corner */}
        {['bodies', 'competitions', 'teams'].includes(activeTab) && (
          <button className="ml-auto flex items-center space-x-2 px-6 py-3 bg-transparent border-2 border-brand-primary text-text-heading hover:bg-brand-primary/10 rounded-full font-body font-bold text-[14px] shadow-sm transition-all">
            <Plus size={16} strokeWidth={3} />
            <span>Add New {activeTab === 'bodies' ? 'Body' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1)}</span>
          </button>
        )}
      </div>

      {/* Horizontal Filter Bar */}
      <div className="flex items-center justify-between bg-surface-card/60 backdrop-blur-md border border-border-default p-4 rounded-[100px] shadow-sm mb-8">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-body" size={18} />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-3 bg-surface-card border border-border-default rounded-xl font-body font-bold text-[14px] text-text-heading focus:outline-none focus:ring-2 focus:ring-border-focus/20 focus:border-border-focus transition-all shadow-sm placeholder:text-text-body"
          />
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative inline-flex items-center space-x-2 px-5 py-2 bg-surface-card border border-border-default rounded-[100px] hover:border-brand-primary hover:bg-brand-primary/5 transition-all cursor-pointer group shadow-sm">
            <span className="text-text-body font-body font-bold text-[14px]">Sort By:</span>
            <select className="appearance-none bg-transparent border-none text-text-heading font-body font-bold text-[14px] focus:outline-none cursor-pointer pr-5">
              <option>Name (A-Z)</option>
              <option>Recently Added</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 text-text-body pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Transfers View */}
      {activeTab === 'transfers' && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex items-center gap-2 mb-4 text-text-body">
            <ArrowLeftRight size={14} className="text-brand-primary shrink-0" />
            <p className="font-body text-[12px] font-medium">Click the arrow to transfer a player to the selected team; click the X on the roster to remove one.</p>
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="relative inline-flex items-center space-x-2 px-4 py-2 bg-surface-card border border-border-default rounded-xl cursor-pointer flex-1 shadow-sm">
              <span className="font-body font-bold text-[12px] text-text-body uppercase tracking-wider">Parent Team:</span>
              <select
                className="appearance-none bg-transparent border-none text-text-heading font-body font-bold text-[14px] focus:outline-none cursor-pointer w-full pr-6"
                value={transferParentTeam}
                onChange={(e) => setTransferParentTeam(e.target.value)}
              >
                <option>Manchester United</option>
                <option>Real Madrid</option>
                <option>Gor Mahia</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 text-text-body pointer-events-none" />
            </div>
            <div className="relative inline-flex items-center space-x-2 px-4 py-2 bg-surface-card border border-border-default rounded-xl cursor-pointer flex-1 shadow-sm">
              <span className="font-body font-bold text-[12px] text-text-body uppercase tracking-wider">Specific Team:</span>
              <select
                className="appearance-none bg-transparent border-none text-text-heading font-body font-bold text-[14px] focus:outline-none cursor-pointer w-full pr-6"
                value={transferSpecificTeam}
                onChange={(e) => setTransferSpecificTeam(e.target.value)}
              >
                <option>Senior</option>
                <option>U21</option>
                <option>U18</option>
              </select>
              <ChevronDown size={14} className="absolute right-3 text-text-body pointer-events-none" />
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-6 min-h-0 overflow-hidden">
            {/* Available Players — drag source */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver('available'); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={handleDrop('available')}
              className={`bg-surface-card/80 backdrop-blur-md border rounded-[16px] shadow-sm flex flex-col overflow-hidden transition-colors ${dragOver === 'available' ? 'border-brand-primary ring-2 ring-brand-primary/30 bg-brand-primary/5' : 'border-border-default'}`}
            >
              <div className="px-4 py-3 border-b border-border-default flex items-center gap-2 shrink-0">
                <h3 className="font-heading font-semibold text-[16px] text-text-heading">Available Players</h3>
                <span className="bg-brand-primary/10 text-brand-primary font-heading font-bold text-[12px] px-2 py-0.5 rounded-full">{availablePlayers.length}</span>
              </div>
              <div className="flex-1 overflow-auto hide-scrollbar p-3 flex flex-col gap-2">
                {availablePlayers.map((player) => (
                  <div key={player.id} draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', String(player.id))}
                    className="flex items-center justify-between gap-2 bg-surface-card border border-border-default rounded-[12px] px-3 py-2 shadow-sm cursor-grab active:cursor-grabbing hover:border-brand-primary/40 hover:shadow-md transition-all">
                    <div className="min-w-0">
                      <div className="font-body font-bold text-[14px] text-text-heading truncate">{player.name}</div>
                      <div className="font-body font-medium text-[12px] text-text-body">{player.position}</div>
                    </div>
                    <button onClick={() => handleTransferToTeam(player)} title="Transfer to Team" className="w-8 h-8 rounded-full bg-brand-primary/10 text-brand-primary inline-flex items-center justify-center hover:bg-brand-primary hover:text-text-on-brand transition-colors shrink-0"><ArrowRight size={14} /></button>
                  </div>
                ))}
                {availablePlayers.length === 0 && (
                  <div className="flex-1 flex items-center justify-center text-center font-body text-[14px] text-text-body font-medium py-8">No available players.</div>
                )}
              </div>
            </div>

            {/* Team Roster — drop target */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver('roster'); }}
              onDragLeave={() => setDragOver(null)}
              onDrop={handleDrop('roster')}
              className={`bg-surface-card/80 backdrop-blur-md border rounded-[16px] shadow-sm flex flex-col overflow-hidden transition-colors ${dragOver === 'roster' ? 'border-brand-primary ring-2 ring-brand-primary/30 bg-brand-primary/5' : 'border-border-default'}`}
            >
              <div className="px-4 py-3 border-b border-border-default flex items-center gap-2 shrink-0">
                <h3 className="font-heading font-semibold text-[16px] text-text-heading truncate">{transferParentTeam} {transferSpecificTeam} Roster</h3>
                <span className="bg-brand-primary/10 text-brand-primary font-heading font-bold text-[12px] px-2 py-0.5 rounded-full shrink-0">{teamRoster.length}</span>
              </div>
              <div className="flex-1 overflow-auto hide-scrollbar p-3 flex flex-col gap-2">
                {teamRoster.map((player) => (
                  <div key={player.id} draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', String(player.id))}
                    className="flex items-center justify-between gap-2 bg-surface-card border border-border-default rounded-[12px] px-3 py-2 shadow-sm cursor-grab active:cursor-grabbing hover:border-brand-primary/40 hover:shadow-md transition-all">
                    <div className="min-w-0">
                      <div className="font-body font-bold text-[14px] text-text-heading truncate">{player.name}</div>
                      <div className="font-body font-medium text-[12px] text-text-body">{player.position}</div>
                    </div>
                    <button onClick={() => handleRemoveFromTeam(player)} title="Remove from Team" className="w-8 h-8 rounded-full bg-status-error/10 text-status-error inline-flex items-center justify-center hover:bg-status-error hover:text-text-on-brand transition-colors shrink-0"><X size={14} /></button>
                  </div>
                ))}
                {teamRoster.length === 0 && (
                  <div className="flex-1 flex items-center justify-center text-center font-body text-[14px] text-text-body font-medium py-8">Drag players here, or use the arrow button.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tables for other Tabs */}
      {activeTab !== 'transfers' && (
        <div className="bg-surface-card rounded-[32px] shadow-[var(--shadow-lg)] border border-border-default flex-1 overflow-hidden flex flex-col p-2">
          <div className="flex-1 overflow-auto hide-scrollbar rounded-[24px]">
            <table className="w-full text-left whitespace-nowrap border-collapse min-w-max">
              <thead className="bg-surface-card/90 sticky top-0 z-30">
                <tr className="font-heading font-bold text-[10px] text-text-body uppercase tracking-widest border-b border-border-default">
                  {/* Bodies Columns */}
                  {activeTab === 'bodies' && (
                    <>
                      <th className="px-6 py-4">No.</th>
                      <th className="px-6 py-4">Body Name</th>
                      <th className="px-6 py-4">Total Competitions</th>
                      <th className="px-6 py-4 text-center w-16">Action</th>
                    </>
                  )}
                  {/* Competitions Columns */}
                  {activeTab === 'competitions' && (
                    <>
                      <th className="px-6 py-4">No.</th>
                      <th className="px-6 py-4">Competition Name</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Affiliated Body</th>
                      <th className="px-6 py-4 text-center w-16">Action</th>
                    </>
                  )}
                  {/* Teams Columns */}
                  {activeTab === 'teams' && (
                    <>
                      <th className="px-6 py-4">No.</th>
                      <th className="px-6 py-4">Parent Team Name</th>
                      <th className="px-6 py-4">Country</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4 text-center w-16">Action</th>
                    </>
                  )}
                  {/* Players Columns */}
                  {activeTab === 'players' && (
                    <>
                      <th className="px-6 py-4">No.</th>
                      <th className="px-6 py-4">Name</th>
                      <th className="px-6 py-4">Position</th>
                      <th className="px-6 py-4">Current Team</th>
                      <th className="px-6 py-4">Team Country</th>
                      <th className="px-6 py-4">DOB</th>
                      <th className="px-6 py-4">Age</th>
                      <th className="px-6 py-4">Nationality</th>
                      <th className="px-6 py-4 text-center w-16">Action</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-surface-card font-body">
                {activeTab === 'bodies' && mockBodies.map((body, i) => (
                  <tr key={body.id} className="border-b border-border-default hover:bg-surface-accent transition-colors group">
                    <td className="px-6 py-3 font-mono font-bold text-[14px] text-text-body">{i + 1}</td>
                    <td className="px-6 py-3 font-body font-bold text-[14px] text-text-heading">{body.name}</td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center justify-center bg-surface-card text-text-heading font-body font-bold text-[12px] px-3 py-1 rounded-full">
                        {body.competitionsCount}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <ActionMenu id={`body-${body.id}`} />
                    </td>
                  </tr>
                ))}

                {activeTab === 'competitions' && mockCompetitions.map((comp, i) => (
                  <tr key={comp.id} className="border-b border-border-default hover:bg-surface-accent transition-colors group">
                    <td className="px-6 py-3 font-mono font-bold text-[14px] text-text-body">{i + 1}</td>
                    <td className="px-6 py-3 font-body font-bold text-[14px] text-text-heading">{comp.name}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded font-heading font-bold text-[10px] uppercase tracking-widest ${
                        comp.category === 'National' ? 'bg-brand-primary/10 text-text-heading' : 'bg-status-success/10 text-status-success-fg'
                      }`}>
                        {comp.category}
                      </span>
                    </td>
                    <td className="px-6 py-3 font-body text-[14px] font-semibold text-text-body">{comp.body}</td>
                    <td className="px-6 py-3 text-center">
                      <ActionMenu id={`comp-${comp.id}`} />
                    </td>
                  </tr>
                ))}

                {activeTab === 'teams' && mockTeams.map((team, i) => (
                  <tr key={team.id} className="border-b border-border-default hover:bg-surface-accent transition-colors group">
                    <td className="px-6 py-3 font-mono font-bold text-[14px] text-text-body">{i + 1}</td>
                    <td className="px-6 py-3 font-body font-bold text-[14px] text-text-heading">{team.parentTeamName}</td>
                    <td className="px-6 py-3 font-body text-[14px] font-semibold text-text-body">{team.country}</td>
                    <td className="px-6 py-3 font-body text-[14px] font-semibold text-text-body">{team.category}</td>
                    <td className="px-6 py-3 text-center">
                      <ActionMenu id={`team-${team.id}`} />
                    </td>
                  </tr>
                ))}

                {activeTab === 'players' && mockPlayers.map((player, i) => (
                  <tr key={player.id} className="border-b border-border-default hover:bg-surface-accent transition-colors group">
                    <td className="px-6 py-3 font-mono font-bold text-[14px] text-text-body">{i + 1}</td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => navigate(`/player/${player.id}`, { state: { fromAdmin: true, player: { id: player.id, name: player.name, initials: player.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase(), age: player.age, dob: player.dob, nationality: player.nationality, primaryPos: player.position, currentTeam: player.currentTeam }, trail: [{ label: 'Admin', path: window.location.pathname }] } })}
                        className="font-body font-bold text-[14px] text-text-heading hover:underline transition-all flex items-center gap-2 group/link"
                      >
                        {player.name}
                        <ArrowRight size={12} className="opacity-0 group-hover/link:opacity-100 transition-opacity -translate-x-2 group-hover/link:translate-x-0" />
                      </button>
                    </td>
                    <td className="px-6 py-3 font-heading font-bold text-[10px] uppercase tracking-widest text-text-heading">{player.position}</td>
                    <td className="px-6 py-3 font-body text-[14px] font-semibold text-text-body">{player.currentTeam}</td>
                    <td className="px-6 py-3 font-body text-[14px] font-semibold text-text-body">{player.teamCountry}</td>
                    <td className="px-6 py-3 font-body text-[14px] font-semibold text-text-body">{player.dob}</td>
                    <td className="px-6 py-3 font-mono font-bold text-[14px] text-text-body">{player.age}</td>
                    <td className="px-6 py-3 font-body text-[14px] font-semibold text-text-body">{player.nationality}</td>
                    <td className="px-6 py-3 text-center">
                      <ActionMenu id={`player-${player.id}`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}