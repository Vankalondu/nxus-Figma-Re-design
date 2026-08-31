import React, { useEffect, useState } from 'react';
import { X, Plus } from 'lucide-react';
import { PlayerColumn, GROUP_ORDER } from './playerColumns';

// ─── Preset persistence ───────────────────────────────────────────────────────────
// Saved column presets live in localStorage under this key as an array of
// { name, ids } records. Loading is guarded for SSR / malformed data.
const PRESETS_KEY = 'nxus.columnPresets';

interface ColumnPreset {
  name: string;
  ids: string[];
}

function loadPresets(): ColumnPreset[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(PRESETS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    // Keep only well-formed records.
    return parsed.filter(
      (p): p is ColumnPreset =>
        p && typeof p.name === 'string' && Array.isArray(p.ids),
    );
  } catch {
    return [];
  }
}

function savePresets(presets: ColumnPreset[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
  } catch {
    /* storage unavailable — ignore */
  }
}

// ─── Edit Columns Modal ───────────────────────────────────────────────────────────
// Lets the user pick which players-table columns are visible. Keeps a LOCAL draft of
// the visible set (seeded from `visible` each time it opens); Apply commits the draft,
// while the X / backdrop dismiss without committing.
export function EditColumnsModal({ open, columns, visible, onApply, onClose }: {
  open: boolean;
  columns: PlayerColumn[];               // the registry
  visible: Set<string>;                  // currently-visible ids
  onApply: (next: Set<string>) => void;  // called with the new set on Apply
  onClose: () => void;
}): JSX.Element | null {
  const [draft, setDraft] = useState<Set<string>>(new Set(visible));
  const [presets, setPresets] = useState<ColumnPreset[]>([]);
  const [presetName, setPresetName] = useState('');

  // Re-seed the draft from the incoming selection whenever the modal opens.
  useEffect(() => {
    if (open) setDraft(new Set(visible));
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load saved presets once on mount.
  useEffect(() => {
    setPresets(loadPresets());
  }, []);

  if (!open) return null;

  const toggle = (id: string) => {
    setDraft(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const apply = () => {
    onApply(new Set(draft));
    onClose();
  };

  // Point the draft at a preset's id set (does NOT auto-apply).
  const applyPreset = (preset: ColumnPreset) => {
    setDraft(new Set(preset.ids));
  };

  // Save the current draft under the typed name; overwrite if the name exists.
  const saveCurrentPreset = () => {
    const name = presetName.trim();
    if (!name) return;
    const ids = Array.from(draft);
    setPresets(prev => {
      const next = prev.filter(p => p.name !== name);
      next.push({ name, ids });
      savePresets(next);
      return next;
    });
    setPresetName('');
  };

  const deletePreset = (name: string) => {
    setPresets(prev => {
      const next = prev.filter(p => p.name !== name);
      savePresets(next);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      {/* Backdrop — click closes without applying */}
      <div className="absolute inset-0 bg-midnight/60 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-background rounded-[24px] max-w-5xl w-[92vw] max-h-[88vh] flex flex-col shadow-2xl border border-border overflow-hidden">
        {/* ── Header ── */}
        <div className="shrink-0 flex items-center justify-between gap-4 px-6 py-5 border-b border-border">
          <h2 className="font-heading font-black text-[20px] text-foreground">Edit Columns</h2>
          <button onClick={onClose} aria-label="Close"
            className="w-9 h-9 rounded-full bg-accent flex items-center justify-center text-muted-foreground hover:text-primary transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* ── Body ── */}
        {/* Masonry columns: groups flow into balanced columns so the tall GAME STATS
            group packs next to shorter groups without leaving large gaps. */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {/* Custom presets panel */}
            <div className="break-inside-avoid mb-4 inline-block w-full">
              <div className="bg-accent rounded-[16px] p-4 flex flex-col gap-3">
                <span className="font-heading font-bold text-micro uppercase tracking-widest text-muted-foreground">Custom Presets</span>

                {presets.length === 0 ? (
                  <p className="text-muted-foreground text-[14px] font-body">None saved yet.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {presets.map(preset => (
                      <div
                        key={preset.name}
                        className="group flex items-center gap-2 rounded-[12px] bg-card border border-border pl-4 pr-2 py-2 hover:border-primary transition-colors"
                      >
                        <button
                          onClick={() => applyPreset(preset)}
                          className="flex-1 min-w-0 text-left text-[14px] font-bold text-foreground truncate"
                          title={`Load "${preset.name}" (${preset.ids.length} columns)`}
                        >
                          {preset.name}
                          <span className="ml-2 font-body font-medium text-muted-foreground">{preset.ids.length}</span>
                        </button>
                        <button
                          onClick={() => deletePreset(preset.name)}
                          aria-label={`Delete preset ${preset.name}`}
                          className="shrink-0 w-6 h-6 rounded-full bg-accent flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="relative">
                  <input
                    type="text"
                    value={presetName}
                    onChange={e => setPresetName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); saveCurrentPreset(); } }}
                    placeholder="Save current as…"
                    className="w-full rounded-full bg-card border border-border pl-4 pr-11 py-2 text-[14px] font-body font-medium text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all"
                  />
                  <button aria-label="Save preset" onClick={saveCurrentPreset}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/80 transition-colors">
                    <Plus size={14} strokeWidth={3} />
                  </button>
                </div>
              </div>
            </div>

            {/* Column groups */}
            {GROUP_ORDER.map(group => {
              const groupCols = columns.filter(c => c.group === group);
              if (groupCols.length === 0) return null;
              return (
                <div key={group} className="break-inside-avoid mb-4 inline-block w-full">
                  <div className="flex flex-col gap-2">
                    <div className="bg-accent/60 rounded-[10px] px-4 py-2">
                      <span className="font-heading font-bold text-micro uppercase tracking-widest text-muted-foreground">{group}</span>
                    </div>
                    <div className="flex flex-col gap-2">
                      {groupCols.map(col => {
                        const selected = draft.has(col.id);
                        return (
                          <button
                            key={col.id}
                            onClick={() => toggle(col.id)}
                            aria-pressed={selected}
                            className={`w-full rounded-[12px] px-4 py-2 text-[14px] font-bold text-left transition-colors ${
                              selected
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-card border border-border text-foreground hover:border-primary'
                            }`}
                          >
                            {col.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 flex items-center justify-between gap-4 px-6 py-4 border-t border-border">
          <span className="text-muted-foreground text-[14px] font-bold font-body">{draft.size} columns selected</span>
          <button onClick={apply}
            className="bg-primary text-primary-foreground rounded-full px-6 py-3 font-body font-bold hover:bg-primary/80 transition-colors shadow-[var(--shadow-sm)]">
            Apply Column Selection
          </button>
        </div>
      </div>
    </div>
  );
}
