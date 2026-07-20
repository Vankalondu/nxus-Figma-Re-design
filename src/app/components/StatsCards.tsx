import { Users, Film, Package, BarChart3 } from 'lucide-react';

export function StatsCards() {
  const stats = [
    {
      label: 'Raised players with missing packages',
      value: '47',
      subtext: '+8 from last week',
      subtextColor: 'text-[#1E88E5]',
      linkText: 'Upload package',
      linkHref: '#',
      icon: Package,
      iconBg: 'bg-[#E3F2FD]',
      iconColor: 'text-[#1E88E5]',
    },
    {
      label: 'Raised players with missing Full matches',
      value: '32',
      subtext: '+5 this week',
      subtextColor: 'text-[#1E88E5]',
      linkText: 'Upload Full Match',
      linkHref: '#',
      icon: Film,
      iconBg: 'bg-[#FFF9C4]',
      iconColor: 'text-[#F9A825]',
    },
    {
      label: 'Percentage of packages added this week',
      value: '72%',
      subtext: '18 pending review',
      subtextColor: 'text-[#666]',
      linkText: 'Review List',
      linkHref: '#',
      icon: BarChart3,
      iconBg: 'bg-[#E8F5E9]',
      iconColor: 'text-[#43A047]',
    },
    {
      label: 'Percentage of matches added this week',
      value: '58%',
      subtext: '12 upcoming',
      subtextColor: 'text-[#666]',
      linkText: 'Review List',
      linkHref: '#',
      icon: Users,
      iconBg: 'bg-[#FCE4EC]',
      iconColor: 'text-[#E53935]',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-card border border-[#e0e7ef] rounded-2xl p-6 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-[#333640] text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {stat.label}
            </p>
            <div className={`p-2 rounded-xl ${stat.iconBg} shrink-0 ml-3`}>
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
          </div>
          <div className="text-[#0a0e1a] text-4xl mb-2" style={{ fontFamily: "'Figtree', sans-serif", fontWeight: 700 }}>
            {stat.value}
          </div>
          <div className={`${stat.subtextColor} text-sm mb-3`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {stat.subtext}
          </div>
          <a
            href={stat.linkHref}
            className="text-[#1E88E5] hover:text-[#1565C0] transition-colors text-sm hover:underline"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500 }}
          >
            {stat.linkText} →
          </a>
        </div>
      ))}
    </div>
  );
}