import { StatsCards } from './StatsCards';
import { VideoLeaderboard } from './VideoLeaderboard';
import { UpcomingMatches } from './UpcomingMatches';

export function VideoDashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-[#0a0e1a] mb-1" style={{ fontFamily: "'Figtree', sans-serif", fontWeight: 700 }}>
          Video Dashboard
        </h1>
        <p className="text-[#666]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Welcome back. Here's your video team overview.
        </p>
      </div>

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-8">
        <div className="lg:col-span-3">
          <VideoLeaderboard />
        </div>
        <div className="lg:col-span-2">
          <UpcomingMatches />
        </div>
      </div>
    </div>
  );
}
