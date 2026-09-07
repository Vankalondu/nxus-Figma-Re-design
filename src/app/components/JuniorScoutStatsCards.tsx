import { Video, FileText, ClipboardList, CheckCircle } from 'lucide-react';

export function JuniorScoutStatsCards() {
  const stats = [
    {
      label: 'Raised players with no videos',
      value: '29',
      subtext: '+6 from last week',
      subtextColor: 'text-brand-primary',
      linkText: 'Review list',
      linkHref: '#',
      icon: Video,
      iconBg: 'bg-[var(--light-300)]',
      iconColor: 'text-brand-primary',
    },
    {
      label: 'Raised Players missing Basic Match entry',
      value: '18',
      subtext: '5 added today',
      subtextColor: 'text-brand-primary',
      linkText: 'Review List',
      linkHref: '#',
      icon: FileText,
      iconBg: 'bg-[var(--amber-50)]',
      iconColor: 'text-status-warning',
    },
    {
      label: 'Raised players missing detailed match entry',
      value: '14',
      subtext: '3 pending completion',
      subtextColor: 'text-muted',
      linkText: 'Review List',
      linkHref: '#',
      icon: ClipboardList,
      iconBg: 'bg-[var(--green-50)]',
      iconColor: 'text-status-success',
    },
    {
      label: 'Raised players submitted for review',
      value: '37',
      subtext: '+9 this week',
      subtextColor: 'text-brand-primary',
      linkText: 'View Report',
      linkHref: '#',
      icon: CheckCircle,
      iconBg: 'bg-[var(--red-50)]',
      iconColor: 'text-status-error',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-surface-card border border-default rounded-2xl p-6 hover:shadow-md transition-all"
        >
          <div className="flex items-start justify-between mb-3">
            <p className="text-body text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {stat.label}
            </p>
            <div className={`p-2 rounded-xl ${stat.iconBg} shrink-0 ml-3`}>
              <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
            </div>
          </div>
          <div className="text-[var(--navy-800)] text-4xl mb-2" style={{ fontFamily: "'Figtree', sans-serif", fontWeight: 700 }}>
            {stat.value}
          </div>
          <div className={`${stat.subtextColor} text-sm mb-3`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {stat.subtext}
          </div>
          <a
            href={stat.linkHref}
            className="text-brand-primary hover:text-brand-primary-hover transition-colors text-sm hover:underline"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 500 }}
          >
            {stat.linkText} →
          </a>
        </div>
      ))}
    </div>
  );
}