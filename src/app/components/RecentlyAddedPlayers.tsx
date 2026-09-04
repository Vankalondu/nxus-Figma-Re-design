import { ArrowRight } from 'lucide-react';

export function RecentlyAddedPlayers() {
  const players = [
    {
      initials: 'MR',
      name: 'Marcus Rashford Jr.',
      team: 'Manchester United U21',
      status: 'online',
      position: 'LW',
      age: 18,
      country: 'England',
      initialsColor: 'bg-brand-primary',
    },
    {
      initials: 'LY',
      name: 'Lamine Yamal',
      team: 'FC Barcelona B',
      status: 'online',
      position: 'RW',
      age: 17,
      country: 'Spain',
      initialsColor: 'bg-brand-primary',
    },
    {
      initials: 'EF',
      name: 'Endrick Felipe',
      team: 'Real Madrid Castilla',
      status: 'offline',
      position: 'ST',
      age: 18,
      country: 'Brazil',
      initialsColor: 'bg-brand-primary',
    },
    {
      initials: 'WZ',
      name: 'Warren Zaire-Emery',
      team: 'Paris Saint-Germain',
      status: 'online',
      position: 'CM',
      age: 18,
      country: 'France',
      initialsColor: 'bg-brand-primary',
    },
  ];

  return (
    <div className="bg-[#0F1419] border border-border-default rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-text-on-brand text-xl font-semibold">Recently Added Players</h2>
        <button className="flex items-center gap-2 text-text-body hover:text-text-on-brand transition-colors">
          <span className="text-sm">View All</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {players.map((player) => (
          <div
            key={player.name}
            className="bg-[#0a2d4c] border border-border-default rounded-lg p-4 hover:border-[#1971bf] transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="relative">
                <div className={`w-12 h-12 ${player.initialsColor} rounded-lg flex items-center justify-center text-text-on-brand font-semibold`}>
                  {player.initials}
                </div>
                <div
                  className={`absolute -bottom-1 -right-1 w-3 h-3 ${
                    player.status === 'online' ? 'bg-status-success' : 'bg-[#596774]'
                  } border-2 border-[#0a2d4c] rounded-full`}
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-text-on-brand font-medium truncate">{player.name}</h3>
                <p className="text-text-body text-sm truncate">{player.team}</p>
                
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 ${
                      player.status === 'online' ? 'bg-status-success/10 text-status-success-fg' : 'bg-surface-canvas text-text-body'
                    } rounded text-xs font-medium`}>
                      {player.position}
                    </span>
                  </div>
                  <span className="text-text-body text-sm">Age {player.age}</span>
                  <span className="text-text-body text-sm">{player.country}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}