// ─── Players-page table kit ──────────────────────────────────────────────────────
// The shared pieces of every Players page (Lead/Senior/Video in SeniorLeadPlayersPage,
// Country/Head inline in CountryScoutDashboard): page title, the one bounded card with
// its header strip (tabs · view toggle · Filters · Columns), the light label-above filter
// toolbar, the mobile filter sheet, the compact `rtable` group rows and row atoms.
// Change a piece here and every Players page follows.
import React, { useEffect, useState } from 'react';
import { ChevronDown, List, LayoutGrid, SlidersHorizontal, Columns3, Search, X, ArrowUp } from 'lucide-react';

// ─── Page title (folds away once the table scrolls — "focus mode") ───────────────
export const PlayersPageTitle = ({ first, icon, rest, subtitle, folded = false }: {
  first: React.ReactNode; icon: React.ReactNode; rest: React.ReactNode; subtitle: React.ReactNode; folded?: boolean;
}) => (
  <div className={`grid transition-[grid-template-rows,opacity] duration-200 motion-reduce:transition-none ${folded ? 'grid-rows-[0fr] opacity-0' : 'grid-rows-[1fr]'}`} aria-hidden={folded}>
    <div className="overflow-hidden">
      <div className="pt-2 pb-3">
        <h1 className="font-heading font-semibold text-[32px] tracking-tight text-heading flex items-center gap-4 leading-none">
          {first}
          <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center shadow-sm shrink-0">
            {icon}
          </div>
          {rest}
        </h1>
        <p className="font-body font-medium text-[15px] text-body mt-2 short:hidden">{subtitle}</p>
      </div>
    </div>
  </div>
);

// Focus mode: once the table scrolls past 40px the title folds; it returns only back at 0
// (the gap stops it flickering at the edge). A new tab or view starts at its top.
export const useFocusMode = (resetKeys: unknown[]) => {
  const [focused, setFocused] = useState(false);
  const onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const top = (e.target as HTMLElement).scrollTop;
    if (top > 40) setFocused(true);
    else if (top === 0) setFocused(false);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setFocused(false); }, resetKeys);
  return { focused, onScroll };
};

// ─── The one card: header strip + filter zone + table, bounded to the viewport ────
export const PlayersCard = ({ bounded, focused, onScrollCapture, children }: {
  bounded: boolean; focused: boolean; onScrollCapture?: (e: React.UIEvent<HTMLDivElement>) => void; children: React.ReactNode;
}) => (
  <div onScrollCapture={onScrollCapture}
    className={`bg-surface-card border border-default rounded-[24px] ${bounded ? `${focused ? 'h-[calc(100vh-114px)]' : 'h-[calc(100vh-204px)]'} transition-[height] duration-200 motion-reduce:transition-none flex flex-col overflow-hidden` : 'mb-6'}`}>
    {children}
  </div>
);

export const PlayersCardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2 flex-wrap px-4 py-3 border-b border-default rounded-t-[24px] bg-surface-card">
    {children}
  </div>
);

// Zone under the header strip (filter toolbar, info bars) — divided by a hairline.
export const PlayersCardZone = ({ className = '', children }: { className?: string; children: React.ReactNode }) => (
  <div className={`px-4 py-3 border-b border-default ${className}`}>{children}</div>
);

// ─── Header-strip controls ─────────────────────────────────────────────────────────
export const TabPill = ({ active, count, className = '', children, ...rest }: {
  active: boolean; count?: number | null; className?: string; children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button {...rest}
    className={`flex items-center gap-2 px-4 py-2 rounded-full font-body font-bold type-body-sm transition-colors border whitespace-nowrap ${className} ${active ? 'bg-brand-primary text-on-brand border-brand-primary shadow-sm' : 'bg-surface-card text-body border-default hover:border-brand-primary hover:text-strong'}`}>
    {children}
    {count != null && count > 0 && (
      <span className={`font-body type-micro font-black px-2 py-0.5 rounded-full ${active ? 'bg-surface-card/20 text-on-brand' : 'bg-brand-primary/15 text-strong'}`}>{count}</span>
    )}
  </button>
);

// Mobile: the active tab as a pill; its menu lists the tabs (rows supplied by the page).
export const MobileTabMenu = ({ label, open, onToggle, children }: {
  label: React.ReactNode; open: boolean; onToggle: () => void; children: React.ReactNode;
}) => (
  <div className="md:hidden relative">
    <button onClick={onToggle}
      className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary text-on-brand font-body font-bold type-body-sm">
      <span className="truncate max-w-[160px]">{label}</span>
      <ChevronDown size={14} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
    {open && (
      <div className="absolute left-0 top-full mt-1 z-50 bg-surface-card border border-default rounded-[16px] shadow-2xl overflow-hidden min-w-[200px] py-1">
        {children}
      </div>
    )}
  </div>
);

export const ViewModeToggle = ({ value, onChange }: { value: 'table' | 'card'; onChange: (v: 'table' | 'card') => void }) => (
  <div className="flex items-center bg-surface-accent rounded-full p-1 gap-1 shrink-0">
    <button onClick={() => onChange('table')} title="Table View"
      className={`p-2 rounded-full flex items-center justify-center transition-colors ${value === 'table' ? 'bg-brand-primary text-on-brand shadow-sm' : 'text-body hover:text-strong'}`}>
      <List size={14} />
    </button>
    <button onClick={() => onChange('card')} title="Card View"
      className={`p-2 rounded-full flex items-center justify-center transition-colors ${value === 'card' ? 'bg-brand-primary text-on-brand shadow-sm' : 'text-body hover:text-strong'}`}>
      <LayoutGrid size={14} />
    </button>
  </div>
);

// Desktop: toggles the inline filter toolbar (visible by default).
export const FiltersButton = ({ active, onClick }: { active: boolean; onClick: () => void }) => (
  <button onClick={onClick}
    className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-full font-body font-bold type-body-sm border shrink-0 transition-colors ${active ? 'bg-brand-primary text-on-brand border-brand-primary shadow-sm' : 'bg-surface-card text-body border-default hover:border-brand-primary hover:text-strong'}`}>
    <SlidersHorizontal size={14} /> Filters
  </button>
);

// Mobile: opens the filter bottom-sheet.
export const MobileFiltersButton = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick}
    className="md:hidden flex items-center gap-2 px-4 py-2 rounded-full font-body font-bold type-body-sm border border-default bg-surface-card text-body shrink-0">
    <SlidersHorizontal size={14} /> Filters
  </button>
);

export const ColumnsButton = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} aria-label="Columns"
    className="flex items-center gap-2 px-4 py-2 rounded-full font-body font-bold type-body-sm border border-default bg-surface-card text-body hover:border-brand-primary hover:text-body shrink-0 transition-colors">
    <Columns3 size={14} /> <span className="hidden sm:inline">Columns</span>
  </button>
);

// ─── Filter toolbar primitives (light, label-above) ────────────────────────────────
const FIELD_LABEL = 'font-heading font-bold text-[9px] uppercase tracking-wider text-muted px-1';

// Label-above dropdown. `openKey`/`setOpenKey` let a toolbar keep only one menu open.
export const LLSelect = ({ label, value, setValue, options, openKey, setOpenKey }: {
  label: string; value: string; setValue: (v: string) => void; options: string[];
  openKey: string | null; setOpenKey: (k: string | null) => void;
}) => {
  const open = openKey === label;
  return (
    <div className="flex flex-col gap-0.5 shrink-0" data-llselect>
      <span className={FIELD_LABEL}>{label}</span>
      <div className="relative">
        <button onClick={() => setOpenKey(open ? null : label)}
          className="flex items-center gap-2 px-3 py-2 rounded-full bg-surface-card border border-default font-body font-bold text-[12px] text-body hover:border-brand-primary transition-colors whitespace-nowrap">
          <span>{value === 'All' ? 'All' : value}</span>
          <ChevronDown size={12} className={`text-body transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="absolute left-0 top-full mt-1 z-50 bg-surface-card border border-default rounded-[16px] shadow-2xl py-2 min-w-[150px] max-h-[280px] overflow-y-auto">
            {['All', ...options].map(opt => (
              <button key={opt} onClick={() => { setValue(opt); setOpenKey(null); }}
                className={`w-full text-left px-4 py-1.5 font-body font-bold text-[12px] transition-colors ${value === opt ? 'bg-surface-accent text-strong' : 'text-strong hover:bg-surface-accent'}`}>{opt}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Label-above min–max number pair (Age, Height).
export const RangePair = ({ label, minV, setMin, maxV, setMax }: {
  label: string; minV: string; setMin: (v: string) => void; maxV: string; setMax: (v: string) => void;
}) => {
  const num = 'w-16 px-2 py-2 rounded-full bg-surface-card border border-default font-body font-bold text-[12px] text-body placeholder:text-placeholder outline-none focus:border-brand-primary transition-colors';
  return (
    <div className="flex flex-col gap-0.5 shrink-0">
      <span className={FIELD_LABEL}>{label}</span>
      <div className="flex items-center gap-1">
        <input type="number" value={minV} onChange={e => setMin(e.target.value)} placeholder="min" aria-label={`${label} min`} className={num} />
        <span className="text-muted text-[12px]">–</span>
        <input type="number" value={maxV} onChange={e => setMax(e.target.value)} placeholder="max" aria-label={`${label} max`} className={num} />
      </div>
    </div>
  );
};

// Segmented pill toggle (Active / Archive, method filter, …).
export function SegmentedToggle<T extends string>({ options, value, onChange }: {
  options: { value: T; label: string }[]; value: T; onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center bg-surface-card border border-default rounded-full p-1 gap-1 shrink-0">
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 rounded-full font-body font-bold text-[12px] transition-colors whitespace-nowrap ${value === o.value ? 'bg-brand-primary text-on-brand shadow-sm' : 'text-body hover:text-strong'}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

// "Look for a player" name search.
export const PlayerSearchBox = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
  <div className="relative">
    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-body pointer-events-none" />
    <input value={value} onChange={e => onChange(e.target.value)} placeholder="Look for a player" aria-label="Look for a player"
      className="pl-9 pr-3 py-2 rounded-full bg-surface-card border border-default font-body font-medium text-[13px] text-body placeholder:text-placeholder outline-none focus:border-brand-primary transition-colors w-[220px]" />
  </div>
);

// Mobile filters — a bottom-sheet that slides up over a dimmed page.
export const MobileFilterSheet = ({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) => {
  if (!open) return null;
  return (
    <div className="md:hidden fixed inset-0 z-[200] flex flex-col justify-end">
      <div className="absolute inset-0 bg-ink-midnight/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 bg-surface-page rounded-t-[24px] max-h-[80vh] overflow-y-auto p-4 pb-8 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <span className="font-heading font-bold type-body-lg text-body">Filters</span>
          <button onClick={onClose} aria-label="Close filters" className="w-8 h-8 rounded-full bg-surface-accent flex items-center justify-center text-body hover:text-strong"><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
};

// ─── Table group rows (sticky under the thead; offsets from --tbl-head-h / --tbl-group-h) ──
// Pass `onToggle` to make the position band collapse its rows.
export const PosHeader = ({ pos, count, colSpan, collapsed, onToggle }: {
  pos: string; count: number; colSpan: number; collapsed?: boolean; onToggle?: () => void;
}) => {
  const label = (
    <span className="inline-flex items-center gap-2">
      {onToggle && <ChevronDown size={14} className={`text-on-brand transition-transform ${collapsed ? '-rotate-90' : ''}`} />}
      <span className="font-heading font-bold text-[11px] tracking-widest uppercase text-on-brand">{pos}</span>
      <span className="inline-flex items-center justify-center bg-text-on-brand/20 rounded-full px-[6px] py-[2px] font-heading font-bold text-[10px] leading-none text-on-brand">{count}</span>
    </span>
  );
  return (
    <tr className="bg-brand-primary">
      {/* The td itself is the toggle so the band keeps the exact --tbl-group-h height */}
      <td colSpan={colSpan} className={`py-2 px-4 sticky top-[var(--tbl-head-h)] z-30 bg-brand-primary${onToggle ? ' cursor-pointer' : ''}`}
        {...(onToggle ? {
          onClick: onToggle, role: 'button', tabIndex: 0, 'aria-expanded': !collapsed,
          onKeyDown: (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle(); } },
        } : {})}>
        {label}
      </td>
    </tr>
  );
};

export const YobHeader = ({ yob, colSpan }: { yob: number; colSpan: number }) => (
  <tr className="border-t border-default">
    <td colSpan={colSpan} className="py-2 px-4 bg-surface-accent sticky top-[calc(var(--tbl-head-h)+var(--tbl-group-h))] z-30">
      <span className="font-heading font-bold text-[11px] tracking-widest uppercase text-link">{yob}</span>
    </td>
  </tr>
);

// ─── Row atoms ─────────────────────────────────────────────────────────────────────
// Small inline flag shown next to the age/status in the Player ID cell
export const FlagBadge = ({ code, label }: { code: string; label: string }) => (
  <span className="w-4 h-4 rounded-full overflow-hidden border border-default bg-surface-accent shrink-0">
    <img src={`https://flagcdn.com/w40/${code}.png`} alt={label} className="w-full h-full object-cover"
      onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
  </span>
);

// Player avatar — tall enough to span the name line and the age/status/flag line under it
// (Figma 728:16521). The player photo replaces the initials once players have one.
export const PlayerAvatar = ({ initials, photo }: { initials: string; photo?: string }) => (
  <div className="w-9 h-9 rounded-xl bg-surface-accent border border-default text-strong flex items-center justify-center font-body font-bold text-[12px] shrink-0 overflow-hidden">
    {photo ? <img src={photo} alt="" className="w-full h-full object-cover" /> : initials}
  </div>
);

export interface ActionItem { label: string; action: () => void; danger?: boolean; icon: React.ReactNode; }

// Inline action icons — every action shown as its own round button inside one pill
export const ActionButtons = ({ items }: { items: ActionItem[] }) => {
  if (!items.length) return null;
  return (
    <div className="inline-flex items-center justify-center rounded-full bg-surface-accent border border-default">
      {items.map((item, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="w-px h-4 bg-border-default/70 self-center shrink-0" />}
          <button onClick={(e) => { e.stopPropagation(); item.action(); }} title={item.label} aria-label={item.label}
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors shrink-0 ${
              item.label === 'Restore'
                ? 'text-status-success hover:bg-status-success hover:text-on-brand'
                : 'text-strong hover:bg-brand-primary hover:text-on-brand'
            }`}>
            {item.icon}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

// ─── Back-to-top (inner scroll box) ────────────────────────────────────────────────
export const useShowBackToTop = (ref: React.RefObject<HTMLElement | null>, dep: unknown) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => setShow(el.scrollTop > 400);
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [dep, ref]);
  return show;
};

export const BackToTopButton = ({ show, onClick }: { show: boolean; onClick: () => void }) => show ? (
  <button onClick={onClick}
    className="fixed bottom-6 right-6 z-[60] flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary text-on-brand shadow-lg font-body font-bold text-[13px] hover:bg-brand-primary/90 transition-colors">
    <ArrowUp size={14} /> Top
  </button>
) : null;
