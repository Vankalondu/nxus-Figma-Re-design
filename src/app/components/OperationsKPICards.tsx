import { TrendingUp, Globe, Users, Clock } from 'lucide-react';

export function OperationsKPICards() {
  const kpis = [
    {
      label: 'Discover Rate',
      value: '84%',
      trend: '+5%',
      trendPositive: true,
      icon: TrendingUp,
      iconBg: 'bg-[#E8F5E9]',
      iconColor: 'text-[#43A047]',
    },
    {
      label: 'Territory Coverage',
      value: '22/24',
      subtext: 'Countries Active',
      icon: Globe,
      iconBg: 'bg-[#E3F2FD]',
      iconColor: 'text-[#1E88E5]',
    },
    {
      label: 'Raised Player Throughput',
      value: '612',
      subtext: 'Total players raised this week',
      icon: Users,
      iconBg: 'bg-[#FFF9C4]',
      iconColor: 'text-[#F9A825]',
    },
    {
      label: 'Awaiting Head Scout Review',
      value: '14',
      subtext: 'Shortlists pending',
      icon: Clock,
      iconBg: 'bg-[#FCE4EC]',
      iconColor: 'text-[#E53935]',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="bg-card border border-[#e0e7ef] rounded-2xl p-6 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between mb-4">
            <p className="text-muted-foreground text-sm font-medium" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {kpi.label}
            </p>
            <div className={`p-2 rounded-xl ${kpi.iconBg} shrink-0 ml-3`}>
              <kpi.icon className={`w-5 h-5 ${kpi.iconColor}`} strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <div className="text-[#0a0e1a] text-4xl font-bold" style={{ fontFamily: "'Figtree', sans-serif" }}>
              {kpi.value}
            </div>
            {kpi.trend && (
              <div className={`flex items-center gap-1 ${kpi.trendPositive ? 'text-[#43A047]' : 'text-[#E53935]'} text-sm font-semibold`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <TrendingUp className="w-3.5 h-3.5" strokeWidth={2.5} />
                {kpi.trend}
              </div>
            )}
          </div>
          {kpi.subtext && (
            <div className="text-[#94a3b8] text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {kpi.subtext}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}