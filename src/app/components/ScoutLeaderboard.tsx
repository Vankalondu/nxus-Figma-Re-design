import { Trophy, TrendingUp, Flame, Star, Award } from 'lucide-react';

export function ScoutLeaderboard() {
  const scouts = [
    {
      rank: 1,
      name: 'Sarah Thompson',
      initials: 'ST',
      score: 985,
      weeklyChange: '+125',
      trend: 'up',
      badge: 'hot',
      initialsColor: 'bg-gradient-to-br from-status-warning/70 to-status-warning',
      borderColor: 'border-status-warning/50',
    },
    {
      rank: 2,
      name: 'Marcus Johnson',
      initials: 'MJ',
      score: 892,
      weeklyChange: '+98',
      trend: 'up',
      badge: 'star',
      initialsColor: 'bg-gradient-to-br from-[var(--light-700)] to-[var(--navy-300)]',
      borderColor: 'border-[var(--light-700)]/50',
    },
    {
      rank: 3,
      name: 'Elena Rodriguez',
      initials: 'ER',
      score: 847,
      weeklyChange: '+87',
      trend: 'up',
      badge: 'rising',
      initialsColor: 'bg-gradient-to-br from-brand-primary to-brand-primary/80',
      borderColor: 'border-brand-primary/50',
    },
    {
      rank: 4,
      name: 'James Wilson',
      initials: 'JW',
      score: 756,
      weeklyChange: '+72',
      trend: 'up',
      badge: null,
      initialsColor: 'bg-gradient-to-br from-[var(--blue-300)] to-[var(--blue-600)]',
      borderColor: 'border-default',
    },
    {
      rank: 5,
      name: 'Aisha Patel',
      initials: 'AP',
      score: 723,
      weeklyChange: '+65',
      trend: 'up',
      badge: null,
      initialsColor: 'bg-gradient-to-br from-[var(--light-700)] to-[var(--navy-300)]',
      borderColor: 'border-default',
    },
    {
      rank: 6,
      name: 'David Chen',
      initials: 'DC',
      score: 689,
      weeklyChange: '+54',
      trend: 'up',
      badge: null,
      initialsColor: 'bg-gradient-to-br from-status-success/70 to-status-success',
      borderColor: 'border-default',
    },
  ];

  const getBadgeIcon = (badge: string | null) => {
    switch (badge) {
      case 'hot':
        return <Flame className="w-4 h-4 text-brand-primary" />;
      case 'star':
        return <Star className="w-4 h-4 text-status-warning" />;
      case 'rising':
        return <TrendingUp className="w-4 h-4 text-status-success" />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-[var(--navy-800)] border border-default rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-status-warning/10 rounded-lg">
            <Trophy className="w-6 h-6 text-status-warning" />
          </div>
          <div>
            <h2 className="text-on-brand text-xl font-semibold">Scout Leaderboard</h2>
            <p className="text-body text-sm">This week's top performers 🚀</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {scouts.map((scout) => (
          <div
            key={scout.name}
            className={`bg-[var(--blue-900)] border ${scout.borderColor} rounded-lg p-4 hover:border-brand-primary/50 transition-all hover:shadow-md hover:shadow-brand-primary/10`}
          >
            <div className="flex items-center gap-4">
              {/* Rank */}
              <div className="flex items-center justify-center w-8 h-8">
                {scout.rank <= 3 ? (
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                    scout.rank === 1 ? 'bg-status-warning/20 text-status-warning-fg' :
                    scout.rank === 2 ? 'bg-text-body/20 text-body' :
                    'bg-brand-primary/20 text-brand-primary'
                  } font-bold`}>
                    {scout.rank}
                  </div>
                ) : (
                  <span className="text-body font-semibold">{scout.rank}</span>
                )}
              </div>

              {/* Avatar */}
              <div className={`w-12 h-12 ${scout.initialsColor} rounded-lg flex items-center justify-center text-on-brand font-bold shadow-lg`}>
                {scout.initials}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-on-brand font-medium truncate">{scout.name}</h3>
                  {scout.badge && (
                    <div className="flex items-center">
                      {getBadgeIcon(scout.badge)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-status-success text-sm font-medium flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {scout.weeklyChange} this week
                  </span>
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <div className="text-on-brand text-2xl font-bold">{scout.score}</div>
                <div className="text-body text-xs">points</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-brand-primary/10 border border-brand-primary/30 rounded-lg">
        <div className="flex items-start gap-3">
          <Award className="w-5 h-5 text-brand-primary mt-0.5" />
          <div>
            <p className="text-brand-primary text-sm font-medium">Keep up the momentum!</p>
            <p className="text-brand-primary/70 text-xs mt-1">
              Complete your pending tasks to climb the leaderboard. Every video and match report counts! 💪
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}