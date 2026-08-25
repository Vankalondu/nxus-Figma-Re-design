import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface TabItem {
  id: string;
  label: string;
  count?: number;              // optional badge shown after the label
  countTone?: 'muted' | 'red'; // 'red' = attention (e.g. approvals); default muted
}

// Shared tab bar: inline pill strip on desktop; active label + 'More ▾'
// dropdown on mobile so many-tab pages stay to one tidy row on phones.
export function ResponsiveTabs({ tabs, activeId, onSelect, className = '' }: {
  tabs: TabItem[];
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const active = tabs.find(t => t.id === activeId);

  const badge = (tab: TabItem, activeTab: boolean) => {
    if (tab.count == null || tab.count <= 0) return null;
    const red = tab.countTone === 'red';
    const cls = activeTab
      ? 'bg-card/20 text-primary-foreground'
      : red
        ? 'bg-scout-red/15 text-scout-red'
        : 'bg-primary/15 text-foreground';
    return <span className={`ml-1.5 font-body text-micro font-black px-1.5 py-0.5 rounded-full tabular-nums ${cls}`}>{tab.count}</span>;
  };

  return (
    <div className={'flex items-center ' + className}>
      {/* Desktop: full inline strip */}
      <div className="hidden md:flex items-center gap-2 overflow-x-auto hide-scrollbar flex-nowrap pb-1">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => onSelect(tab.id)}
            className={`shrink-0 inline-flex items-center px-6 py-2 rounded-full font-body font-bold text-body-sm transition-colors border ${activeId === tab.id ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-card text-muted-foreground border-border hover:border-primary hover:text-foreground'}`}>
            {tab.label}{badge(tab, activeId === tab.id)}
          </button>
        ))}
      </div>
      {/* Mobile: active label + dropdown */}
      <div className="md:hidden relative">
        <button onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground font-body font-bold text-body-sm">
          <span className="truncate max-w-[180px]">{active?.label ?? 'Select'}</span>
          {active && badge(active, true)}
          <ChevronDown size={14} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="absolute left-0 top-full mt-1 z-50 bg-card border border-border rounded-[16px] shadow-2xl overflow-hidden min-w-[200px] py-1">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => { onSelect(tab.id); setOpen(false); }}
                className={`w-full text-left px-4 py-2 font-body font-bold text-body-sm inline-flex items-center ${activeId === tab.id ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-accent'}`}>
                {tab.label}{badge(tab, false)}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
