import { Trophy, TrendingUp, Flame, Star, Award, ArrowRight } from 'lucide-react';

export function VideoLeaderboard() {
  const editors = [
    {
      rank: 1,
      name: 'Kwame Asante',
      initials: 'KA',
      packagesPercent: 95,
      matchesPercent: 88,
      score: 91,
      weeklyChange: '+12%',
      trend: 'up',
      badge: 'hot',
      initialsColor: 'bg-[#1E88E5]',
    },
    {
      rank: 2,
      name: 'Amara Diallo',
      initials: 'AD',
      packagesPercent: 89,
      matchesPercent: 85,
      score: 87,
      weeklyChange: '+9%',
      trend: 'up',
      badge: 'star',
      initialsColor: 'bg-[#1E88E5]',
    },
    {
      rank: 3,
      name: 'Chidi Okafor',
      initials: 'CO',
      packagesPercent: 82,
      matchesPercent: 84,
      score: 83,
      weeklyChange: '+7%',
      trend: 'up',
      badge: 'rising',
      initialsColor: 'bg-[#1E88E5]',
    },
    {
      rank: 4,
      name: 'Fatou Mensah',
      initials: 'FM',
      packagesPercent: 78,
      matchesPercent: 76,
      score: 77,
      weeklyChange: '+5%',
      trend: 'up',
      badge: null,
      initialsColor: 'bg-[#1E88E5]',
    },
    {
      rank: 5,
      name: 'Tendai Moyo',
      initials: 'TM',
      packagesPercent: 71,
      matchesPercent: 73,
      score: 72,
      weeklyChange: '+4%',
      trend: 'up',
      badge: null,
      initialsColor: 'bg-[#1E88E5]',
    },
    {
      rank: 6,
      name: 'Ngozi Adeyemi',
      initials: 'NA',
      packagesPercent: 65,
      matchesPercent: 68,
      score: 66,
      weeklyChange: '+3%',
      trend: 'up',
      badge: null,
      initialsColor: 'bg-[#1E88E5]',
    },
  ];

  const getBadgeIcon = (badge: string | null) => {
    switch (badge) {
      case 'hot':
        return <Flame className="w-4 h-4 text-[#FF6D00]" />;
      case 'star':
        return <Star className="w-4 h-4 text-[#F9A825]" />;
      case 'rising':
        return <TrendingUp className="w-4 h-4 text-[#43A047]" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-card border border-[#e0e7ef] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[#0a0e1a]" style={{ fontFamily: "'Figtree', sans-serif", fontWeight: 600 }}>
          Video Uploader/Editor Leaderboard
        </h2>
        <button className="flex items-center gap-1 text-[#999] hover:text-[#1E88E5] transition-colors text-sm"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <span>View All</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-3">
        {editors.map((editor) => (
          <div
            key={editor.name}
            className="bg-card border border-[#e8edf2] rounded-xl p-4 hover:border-[#1E88E5]/30 transition-all hover:shadow-sm flex items-center gap-4"
          >
            {/* Avatar with initials */}
            <div className={`w-11 h-11 ${editor.initialsColor} rounded-xl flex items-center justify-center text-chalk shrink-0`}
              style={{ fontFamily: "'Figtree', sans-serif", fontWeight: 700 }}>
              {editor.initials}
            </div>

            {/* Name and status dot */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-[#0a0e1a] truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 600 }}>
                  {editor.name}
                </h3>
                <span className="w-2 h-2 rounded-full bg-[#43A047] shrink-0" />
                {editor.badge && getBadgeIcon(editor.badge)}
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[#999] text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Pkg: {editor.packagesPercent}%
                </span>
                <span className="text-[#999] text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Match: {editor.matchesPercent}%
                </span>
              </div>
            </div>

            {/* Score and trend */}
            <div className="text-right shrink-0">
              <div className="text-[#0a0e1a] text-2xl" style={{ fontFamily: "'Figtree', sans-serif", fontWeight: 700 }}>
                {editor.score}%
              </div>
              <div className="flex items-center gap-1 justify-end">
                <TrendingUp className="w-3 h-3 text-[#43A047]" />
                <span className="text-[#43A047] text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {editor.weeklyChange}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}