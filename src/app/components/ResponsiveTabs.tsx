import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

// Shared tab bar: inline pill strip on desktop; active label + 'More ▾'
// dropdown on mobile so many-tab pages stay to one tidy row on phones.
export function ResponsiveTabs({ tabs, activeId, onSelect, className = '' }: {
  tabs: { id: string; label: string }[];
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const active = tabs.find(t => t.id === activeId);
  return (
    <div className={'flex items-center ' + className}>
      {/* Desktop: full inline strip */}
      <div className="hidden md:flex items-center gap-2 overflow-x-auto hide-scrollbar flex-nowrap pb-1">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => onSelect(tab.id)}
            className={`shrink-0 px-6 py-2 rounded-full font-body font-bold text-body-sm transition-colors border ${activeId === tab.id ? 'bg-primary text-primary-foreground border-primary shadow-sm' : 'bg-card text-muted-foreground border-border hover:border-primary hover:text-foreground'}`}>
            {tab.label}
          </button>
        ))}
      </div>
      {/* Mobile: active label + dropdown */}
      <div className="md:hidden relative">
        <button onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground font-body font-bold text-body-sm">
          <span className="truncate max-w-[180px]">{active?.label ?? 'Select'}</span>
          <ChevronDown size={14} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="absolute left-0 top-full mt-1 z-50 bg-card border border-border rounded-[16px] shadow-2xl overflow-hidden min-w-[200px] py-1">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => { onSelect(tab.id); setOpen(false); }}
                className={`w-full text-left px-4 py-2 font-body font-bold text-body-sm ${activeId === tab.id ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-accent'}`}>
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
