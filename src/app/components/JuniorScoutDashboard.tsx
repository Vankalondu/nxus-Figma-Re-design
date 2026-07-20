import { JuniorScoutStatsCards } from './JuniorScoutStatsCards';
import { ScoutQualityLeaderboard } from './ScoutQualityLeaderboard';
import { UpcomingMatches } from './UpcomingMatches';

export function JuniorScoutDashboard() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-[#0a0e1a] mb-1" style={{ fontFamily: "'Figtree', sans-serif", fontWeight: 700 }}>
          Junior Scout Dashboard
        </h1>
        <p className="text-[#666]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Welcome back. Here's your scouting overview.
        </p>
      </div>

      <JuniorScoutStatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-8">
        <div className="lg:col-span-3">
          <ScoutQualityLeaderboard />
        </div>
        <div className="lg:col-span-2">
          <UpcomingMatches />
        </div>
      </div>
    </div>
  );
}
