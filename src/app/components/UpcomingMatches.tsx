import { ArrowRight } from 'lucide-react';

export function UpcomingMatches() {
  const matches = [
    {
      league: 'African Games U20',
      date: 'Mar 8, 2026',
      homeTeam: 'Ghana Academy',
      homeLabel: 'HOME',
      awayTeam: 'Nigeria Youth FC',
      awayLabel: 'AWAY',
    },
    {
      league: 'CAF Youth Champions',
      date: 'Mar 12, 2026',
      homeTeam: 'Senegal Academy',
      homeLabel: 'HOME',
      awayTeam: 'Cameroon Stars U19',
      awayLabel: 'AWAY',
    },
    {
      league: 'African Games Competition',
      date: 'Mar 15, 2026',
      homeTeam: 'South Africa Academy',
      homeLabel: 'HOME',
      awayTeam: 'Ivory Coast U20',
      awayLabel: 'AWAY',
    },
  ];

  return (
    <div className="bg-card border border-[#e0e7ef] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[#0a0e1a]" style={{ fontFamily: "'Figtree', sans-serif", fontWeight: 600 }}>
          Upcoming Matches
        </h2>
        <button className="flex items-center gap-1 text-[#999] hover:text-[#1E88E5] transition-colors text-sm"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <span>View All</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {matches.map((match, index) => (
          <div
            key={index}
            className="border border-[#e8edf2] rounded-xl p-4 hover:border-[#1E88E5]/30 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[#666] text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {match.league}
              </span>
              <span className="text-[#1E88E5] text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500 }}>
                {match.date}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[#0a0e1a] text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {match.homeTeam}
                </span>
                <span className="text-[#1E88E5] text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>
                  {match.homeLabel}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#0a0e1a] text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {match.awayTeam}
                </span>
                <span className="text-[#666] text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500 }}>
                  {match.awayLabel}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}