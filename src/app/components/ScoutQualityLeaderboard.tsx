import { useState } from 'react';
import { TrendingUp, Flame, Star, ArrowRight, Crown, Trophy, MapPin, Globe, Award } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface Scout {
  name: string;
  initials: string;
  gradeA: number;
  gradeB: number;
  gradeC: number;
  weeklyChange: string;
  badge?: string | null;
  rank?: number;
}

interface CountryData {
  id: string;
  name: string;
  flag: string;
  headScout: Scout;
  countryScouts: Scout[];
}

const leaderboardData: CountryData[] = [
  {
    id: 'nigeria',
    name: 'Nigeria',
    flag: '🇳🇬',
    headScout: {
      name: 'Chidi Okafor',
      initials: 'CO',
      gradeA: 45,
      gradeB: 32,
      gradeC: 15,
      weeklyChange: '+12',
      badge: 'star',
    },
    countryScouts: [
      { name: 'Ngozi Adeyemi', initials: 'NA', gradeA: 20, gradeB: 15, gradeC: 5, weeklyChange: '+4', rank: 1, badge: 'hot' },
      { name: 'Emeka Uzo', initials: 'EU', gradeA: 15, gradeB: 10, gradeC: 6, weeklyChange: '+5', rank: 2, badge: 'rising' },
      { name: 'Bayo Onana', initials: 'BO', gradeA: 10, gradeB: 7, gradeC: 4, weeklyChange: '+3', rank: 3, badge: null },
      { name: 'Adaobi Eze', initials: 'AE', gradeA: 8, gradeB: 5, gradeC: 3, weeklyChange: '+1', rank: 4, badge: null },
    ]
  },
  {
    id: 'ghana',
    name: 'Ghana',
    flag: '🇬🇭',
    headScout: {
      name: 'Kwame Asante',
      initials: 'KA',
      gradeA: 38,
      gradeB: 28,
      gradeC: 12,
      weeklyChange: '+8',
      badge: 'hot',
    },
    countryScouts: [
      { name: 'Fatou Mensah', initials: 'FM', gradeA: 18, gradeB: 12, gradeC: 6, weeklyChange: '+3', rank: 1, badge: 'rising' },
      { name: 'Kofi Mensah', initials: 'KM', gradeA: 12, gradeB: 10, gradeC: 4, weeklyChange: '+2', rank: 2, badge: null },
      { name: 'Ama Osei', initials: 'AO', gradeA: 8, gradeB: 6, gradeC: 2, weeklyChange: '+3', rank: 3, badge: null },
    ]
  },
  {
    id: 'senegal',
    name: 'Senegal',
    flag: '🇸🇳',
    headScout: {
      name: 'Amara Diallo',
      initials: 'AD',
      gradeA: 35,
      gradeB: 25,
      gradeC: 10,
      weeklyChange: '+9',
      badge: 'star',
    },
    countryScouts: [
      { name: 'Moussa Sow', initials: 'MS', gradeA: 16, gradeB: 12, gradeC: 5, weeklyChange: '+4', rank: 1, badge: 'hot' },
      { name: 'Sadio Fall', initials: 'SF', gradeA: 11, gradeB: 8, gradeC: 3, weeklyChange: '+3', rank: 2, badge: null },
      { name: 'Oumar Diop', initials: 'OD', gradeA: 8, gradeB: 5, gradeC: 2, weeklyChange: '+2', rank: 3, badge: null },
    ]
  },
  {
    id: 'ivory_coast',
    name: 'Ivory Coast',
    flag: '🇨🇮',
    headScout: {
      name: 'Didier Bamba',
      initials: 'DB',
      gradeA: 30,
      gradeB: 20,
      gradeC: 8,
      weeklyChange: '+6',
      badge: null,
    },
    countryScouts: [
      { name: 'Yaya Sanogo', initials: 'YS', gradeA: 14, gradeB: 9, gradeC: 4, weeklyChange: '+2', rank: 1, badge: 'rising' },
      { name: 'Eric Konan', initials: 'EK', gradeA: 10, gradeB: 7, gradeC: 3, weeklyChange: '+2', rank: 2, badge: null },
      { name: 'Franck Kessie', initials: 'FK', gradeA: 6, gradeB: 4, gradeC: 1, weeklyChange: '+2', rank: 3, badge: null },
    ]
  }
];

export function ScoutQualityLeaderboard() {
  const [activeCountryId, setActiveCountryId] = useState(leaderboardData[0].id);

  const activeData = leaderboardData.find(c => c.id === activeCountryId) || leaderboardData[0];

  const getBadgeIcon = (badge?: string | null) => {
    switch (badge) {
      case 'hot':
        return <Flame className="w-3.5 h-3.5 text-[#FF6D00]" />;
      case 'star':
        return <Star className="w-3.5 h-3.5 text-status-warning" fill="#F9A825" />;
      case 'rising':
        return <TrendingUp className="w-3.5 h-3.5 text-status-success" />;
      default:
        return null;
    }
  };

  const getBadgeLabel = (badge?: string | null) => {
    switch (badge) {
      case 'hot':
        return 'Top Performer';
      case 'star':
        return 'Elite Scout';
      case 'rising':
        return 'Rising Star';
      default:
        return null;
    }
  };

  const ScoutRow = ({ scout, isHeadScout = false }: { scout: Scout, isHeadScout?: boolean }) => {
    const totalPlayers = scout.gradeA + scout.gradeB + scout.gradeC;
    
    return (
      <TooltipProvider delayDuration={200}>
        <div className={`group bg-surface-card border ${
          isHeadScout 
            ? 'border-brand-primary/30 bg-gradient-to-r from-surface-accent to-surface-card' 
            : 'border-[var(--light-200)]'
        } rounded-xl p-4 hover:border-brand-primary/50 transition-all hover:shadow-sm flex items-center gap-4`}>
          
          {/* Rank or Crown */}
          <div className="shrink-0">
            {isHeadScout ? (
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-[var(--amber-50)] to-[var(--amber-100)] text-status-warning" title="Head Scout">
                <Crown size={18} strokeWidth={2.5} />
              </div>
            ) : (
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-[var(--light-50)] to-[var(--light-100)] text-body font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {scout.rank}
              </div>
            )}
          </div>

          {/* Avatar & Info */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-on-brand shrink-0 shadow-sm ${
              isHeadScout 
                ? 'bg-gradient-to-br from-[var(--blue-700)] to-brand-primary-hover' 
                : 'bg-gradient-to-br from-brand-primary to-[var(--blue-600)]'
            }`} style={{ fontFamily: "'Figtree', sans-serif", fontWeight: 700 }}>
              {scout.initials}
            </div>

            {/* Name and Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-[var(--navy-800)] truncate font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {scout.name}
                </h3>
                {scout.badge && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="shrink-0">
                        {getBadgeIcon(scout.badge)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="text-xs">
                      <p>{getBadgeLabel(scout.badge)}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
              
              {/* Simplified metrics - primary metric shown, full breakdown on hover */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-2 cursor-help">
                    <div className="flex items-center gap-2">
                      <Award className="w-3.5 h-3.5 text-status-success" />
                      <span className="text-status-success font-semibold text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                        {scout.gradeA} Grade A
                      </span>
                    </div>
                    <span className="text-muted text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      • {totalPlayers} total
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="p-3">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Player Quality Breakdown</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-status-success" />
                      <span className="text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Grade A: <strong>{scout.gradeA}</strong> players</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-brand-primary" />
                      <span className="text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Grade B: <strong>{scout.gradeB}</strong> players</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-status-error" />
                      <span className="text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Grade C: <strong>{scout.gradeC}</strong> players</span>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>

          {/* Score Section - Simplified and clearer */}
          <div className="text-right shrink-0 pl-3 border-l border-[var(--light-200)]">
            <div className="flex items-baseline gap-1 justify-end mb-0.5">
              <span className="text-[var(--navy-800)] text-3xl font-bold tracking-tight" style={{ fontFamily: "'Figtree', sans-serif" }}>
                {scout.gradeA}
              </span>
            </div>
            <div className="flex items-center gap-1 justify-end">
              <TrendingUp className="w-3 h-3 text-status-success" strokeWidth={2.5} />
              <span className="text-status-success text-xs font-medium" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {scout.weeklyChange}
              </span>
            </div>
          </div>
        </div>
      </TooltipProvider>
    );
  };

  return (
    <div className="bg-surface-card border border-default rounded-2xl flex flex-col md:flex-row overflow-hidden h-full min-h-[500px] shadow-sm">
      {/* Left Pane - Countries */}
      <div className="w-full md:w-1/3 xl:w-[35%] border-b md:border-b-0 md:border-r border-default bg-[var(--light-50)] flex flex-col shrink-0">
        <div className="p-5 border-b border-default flex items-center gap-2 bg-surface-card">
          <Globe className="w-5 h-5 text-brand-primary" />
          <h2 className="text-[var(--navy-800)]" style={{ fontFamily: "'Figtree', sans-serif", fontWeight: 600 }}>
            Regions
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {leaderboardData.map(country => {
            const totalGradeA = country.headScout.gradeA + country.countryScouts.reduce((sum, scout) => sum + scout.gradeA, 0);
            
            return (
              <button
                key={country.id}
                onClick={() => setActiveCountryId(country.id)}
                className={`w-full text-left p-4 rounded-xl transition-all relative group ${
                  activeCountryId === country.id 
                    ? 'bg-surface-card shadow-sm border border-brand-primary ring-1 ring-brand-primary/10' 
                    : 'hover:bg-surface-card/60 border border-transparent hover:border-[var(--light-200)]'
                }`}
              >
                {activeCountryId === country.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-brand-primary rounded-r-full" />
                )}
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl leading-none">{country.flag}</span>
                    <span className="font-semibold text-[var(--navy-800)]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {country.name}
                    </span>
                  </div>
                  <div className="bg-[var(--green-50)] text-[var(--green-700)] px-2 py-0.5 rounded-md text-xs font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {totalGradeA}
                  </div>
                </div>
                <div className="text-xs text-body flex items-center gap-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  <Crown className="w-3 h-3 text-muted shrink-0" />
                  <span className="truncate">{country.headScout.name}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Right Pane - Scouts */}
      <div className="w-full md:w-2/3 xl:w-[65%] flex flex-col bg-surface-card">
        <div className="p-5 border-b border-default flex items-center justify-between bg-gradient-to-b from-[var(--light-50)] to-text-on-brand">
          <div className="flex items-center gap-2">
            <span className="text-2xl leading-none">{activeData.flag}</span>
            <h2 className="text-[var(--navy-800)]" style={{ fontFamily: "'Figtree', sans-serif", fontWeight: 600 }}>
              {activeData.name} Rankings
            </h2>
          </div>
          <button className="text-brand-primary text-sm hover:underline font-medium flex items-center gap-1 transition-all"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto space-y-8 flex-1 bg-surface-card">
          
          {/* Head Scout Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-4 h-4 text-status-warning" />
              <h3 className="text-xs uppercase tracking-wider text-muted font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Head Scout
              </h3>
            </div>
            <ScoutRow scout={activeData.headScout} isHeadScout={true} />
          </div>
          
          {/* Country Scouts Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-primary" />
                <h3 className="text-xs uppercase tracking-wider text-muted font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Country Scouts
                </h3>
              </div>
              <div className="text-xs text-muted" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Sorted by Grade A players
              </div>
            </div>

            <div className="space-y-3">
              {activeData.countryScouts.map(scout => (
                <ScoutRow key={scout.name} scout={scout} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}