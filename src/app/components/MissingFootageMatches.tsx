import { Video, ArrowRight, AlertCircle } from 'lucide-react';

interface Match {
  id: number;
  homeTeam: string;
  awayTeam: string;
  competition: string;
  date: string;
  raisedPlayers: string[];
}

const matchesWithMissingFootage: Match[] = [
  {
    id: 1,
    homeTeam: 'Barcelona B',
    awayTeam: 'Real Madrid C',
    competition: 'UEFA Youth League',
    date: 'March 8, 2026',
    raisedPlayers: ['Chibueze Nwosu', 'Aminu Tijani'],
  },
  {
    id: 2,
    homeTeam: 'Asante Kotoko U19',
    awayTeam: 'Hearts of Oak U19',
    competition: 'Ghana Premier League U19',
    date: 'March 9, 2026',
    raisedPlayers: ['Kofi Mensah', 'Yaw Acheampong'],
  },
  {
    id: 3,
    homeTeam: 'Esperance U20',
    awayTeam: 'JS Kabylie U20',
    competition: 'CAF Youth Champions League',
    date: 'March 10, 2026',
    raisedPlayers: ['Idrissa Ba'],
  },
  {
    id: 4,
    homeTeam: 'Enyimba U19',
    awayTeam: 'Rangers Int U19',
    competition: 'Nigeria Professional League U19',
    date: 'March 11, 2026',
    raisedPlayers: ['Obinna Eze', 'Adeola Bakare'],
  },
  {
    id: 5,
    homeTeam: 'Wydad Casablanca U20',
    awayTeam: 'Raja Casablanca U20',
    competition: 'Moroccan Youth Championship',
    date: 'March 12, 2026',
    raisedPlayers: ['Sadio Diop', 'Emmanuel Kone'],
  },
];

export function MissingFootageMatches() {
  return (
    <div className="bg-card border border-[#e0e7ef] rounded-2xl p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 pb-4 border-b border-[#e8edf2]">
        <div className="flex items-start gap-2">
          <Video className="w-5 h-5 text-[#E53935] mt-0.5" />
          <div>
            <h3 className="text-[#0a0e1a] font-semibold mb-1" style={{ fontFamily: "'Figtree', sans-serif" }}>
              Matches with Missing Talent Footage
            </h3>
            <p className="text-xs text-muted-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Raised players without match video
            </p>
          </div>
        </div>
      </div>

      {/* Matches List */}
      <div className="space-y-4 flex-1 overflow-y-auto">
        {matchesWithMissingFootage.map((match) => (
          <div
            key={match.id}
            className="group p-4 rounded-xl border border-[#e8edf2] hover:border-[#1E88E5]/40 hover:bg-[#f8fbff] transition-all cursor-pointer"
          >
            {/* Match Header */}
            <div className="mb-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1">
                  <div className="text-[#0a0e1a] font-semibold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {match.homeTeam} <span className="text-[#94a3b8] font-normal">vs</span> {match.awayTeam}
                  </div>
                  <div className="text-xs text-muted-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {match.competition}
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#94a3b8] group-hover:text-[#1E88E5] transition-colors shrink-0 mt-1" />
              </div>
              <div className="text-xs text-[#94a3b8] flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <span>📅</span>
                <span>{match.date}</span>
              </div>
            </div>

            {/* Raised Players Alert */}
            <div className="flex items-start gap-2 bg-[#FFF3E0] border border-[#FFB74D]/30 rounded-lg p-3">
              <AlertCircle className="w-4 h-4 text-[#F57C00] shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-xs font-semibold text-[#E65100] mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {match.raisedPlayers.length} Raised Player{match.raisedPlayers.length > 1 ? 's' : ''}
                </div>
                <div className="text-xs text-[#5D4037]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {match.raisedPlayers.join(', ')}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="pt-4 mt-4 border-t border-[#e8edf2]">
        <button className="text-[#1E88E5] text-sm hover:underline font-medium flex items-center gap-1 w-full justify-center"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <span>View All Missing Footage</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}