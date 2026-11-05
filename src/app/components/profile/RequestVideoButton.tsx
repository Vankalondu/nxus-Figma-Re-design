import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { ChevronDown, Video } from 'lucide-react';
import { toast } from 'sonner';
import { currentBase, meFor } from '../../data/people';
import { addTasks, isoDay, videoManagerFor } from '../../state/taskStore';

export const VIDEO_KINDS = [
  { id: 'package', label: 'Package' },
  { id: 'full match', label: 'Full match' },
  { id: 'both', label: 'Both' },
] as const;

/**
 * "Request video" on the profile's Videos & Highlights tab (P-CO28, D-27). Pick Package, Full
 * match or Both: the request goes straight to the account's Video Manager as a task (on their
 * board and in your "Assigned by me"), and a toast confirms who has it. No form to fill.
 */
export const RequestVideoButton = ({ player }: { player: { id: string; name: string } }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const base = currentBase(pathname);
  const [open, setOpen] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    wrap.current?.querySelector<HTMLButtonElement>('[role="menuitem"]')?.focus();
    const off = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); trigger.current?.focus(); } };
    document.addEventListener('mousedown', off);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', off); document.removeEventListener('keydown', esc); };
  }, [open]);

  const send = (kind: typeof VIDEO_KINDS[number]) => {
    setOpen(false);
    const vm = videoManagerFor(base);
    const me = meFor(base).name;
    addTasks(base, [{
      title: `Video request (${kind.id}): ${player.name}`,
      notes: `${me} requested ${kind.id} footage for ${player.name}.`,
      type: 'video-request', priority: 'Medium', createdBy: me, assignee: vm.name, due: isoDay(3),
      playerId: player.id, playerName: player.name,
    }]);
    toast.success(`Video request sent to ${vm.name}`, {
      description: `${kind.label} · ${player.name}`,
      action: { label: 'Open tasks', onClick: () => navigate(`${base || '/country-scout'}?tab=tasks`) },
    });
  };

  // Arrow keys move between the three options.
  const onMenuKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const items = [...(wrap.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? [])];
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    items[(i + (e.key === 'ArrowDown' ? 1 : items.length - 1)) % items.length]?.focus();
  };

  return (
    <div ref={wrap} className="relative shrink-0">
      <button ref={trigger} onClick={() => setOpen(o => !o)} aria-haspopup="menu" aria-expanded={open}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary border border-brand-primary text-on-brand hover:bg-brand-primary/80 font-body font-bold type-caption shadow-sm transition-colors whitespace-nowrap">
        <Video size={14} /> Request video <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div role="menu" aria-label="Request video" onKeyDown={onMenuKey}
          className="absolute right-0 top-full mt-1 z-40 min-w-[180px] bg-surface-card border border-default rounded-[16px] shadow-2xl py-1">
          <p className="px-3 pt-1 pb-1 font-heading font-bold type-micro uppercase tracking-widest text-muted">What footage?</p>
          {VIDEO_KINDS.map(k => (
            <button key={k.id} role="menuitem" onClick={() => send(k)}
              className="w-full text-left px-3 py-2 font-body font-bold type-body-sm text-strong hover:bg-surface-accent focus-visible:bg-surface-accent focus-visible:outline-none">
              {k.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
