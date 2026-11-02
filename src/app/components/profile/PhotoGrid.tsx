import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { MoreHorizontal, Star, Download, Trash2, Tag, Check } from 'lucide-react';
import { PHOTO_TAGS, PhotoTag, PlayerPhoto } from '../../state/photoStore';

/** Columns × rows per page, by width tier (P-CO20). */
export const photoPageShape = (width: number) =>
  width >= 900 ? { maxCols: 6, maxRows: 2 } : width >= 560 ? { maxCols: 4, maxRows: 2 } : { maxCols: 2, maxRows: 3 };

const GAP = 16;

/**
 * Picks the column count that gives the BIGGEST square for this many photos, inside the
 * box. Few photos → few columns → large squares; a full page → up to 6 across. The height
 * only binds when `fitHeight` is on (desktop), so a phone simply scrolls.
 */
export function bestTile(n: number, w: number, h: number, maxCols: number, maxRows: number, fitHeight: boolean) {
  let best = { cols: 1, size: 0 };
  for (let cols = 1; cols <= Math.min(maxCols, Math.max(1, n)); cols++) {
    const rows = Math.ceil(n / cols);
    if (rows > maxRows) continue;
    const byW = (w - GAP * (cols - 1)) / cols;
    const byH = fitHeight ? (h - GAP * (rows - 1)) / rows : Infinity;
    const size = Math.floor(Math.min(byW, byH));
    if (size > best.size) best = { cols, size };
  }
  return best;
}

export const useBoxSize = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
};

const TileMenu = ({ photo, isProfile, alignLeft, onProfile, onTag, onDelete, onClose }: {
  photo: PlayerPhoto; alignLeft: boolean; isProfile: boolean; onProfile: () => void; onTag: (t: PhotoTag) => void; onDelete: () => void; onClose: () => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const away = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose(); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', away); document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', esc); };
  }, [onClose]);
  const item = 'w-full flex items-center gap-2 px-3 py-2 rounded-xl font-body font-bold text-[12px] text-body hover:bg-surface-accent hover:text-strong text-left';
  return (
    <div ref={ref} role="menu" onClick={e => e.stopPropagation()}
      className={(alignLeft ? "left-2" : "right-2") + " absolute top-11 z-20 w-52 bg-surface-card border border-default rounded-2xl shadow-[var(--shadow-2xl)] p-1.5"}>
      <button role="menuitem" className={item} disabled={isProfile} onClick={() => { onProfile(); onClose(); }}>
        <Star size={14} /> {isProfile ? 'Profile photo' : 'Set as profile photo'}
      </button>
      <div className="px-3 pt-2 pb-1 font-heading font-bold text-[10px] uppercase tracking-widest text-muted flex items-center gap-1"><Tag size={11} /> Tag</div>
      {PHOTO_TAGS.map(t => (
        <button key={t} role="menuitemradio" aria-checked={photo.tag === t} className={item} onClick={() => { onTag(t); onClose(); }}>
          <span className="w-3.5">{photo.tag === t && <Check size={13} className="text-link" />}</span>{t}
        </button>
      ))}
      <div className="my-1 border-t border-default" />
      <a role="menuitem" href={photo.src} download={photo.fileName} className={item} onClick={onClose}><Download size={14} /> Download</a>
      <button role="menuitem" className={item + ' hover:text-status-error'} onClick={() => { onDelete(); onClose(); }}><Trash2 size={14} /> Delete</button>
    </div>
  );
};

/**
 * Square tiles that show the WHOLE photo (object-contain on a soft surface), sized by
 * `bestTile` so the page fills the box without scrolling (P-CO20).
 */
export const PhotoGrid = ({ photos, cols, size, profileId, onOpen, onProfile, onTag, onDelete }: {
  photos: PlayerPhoto[]; cols: number; size: number; profileId?: string;
  onOpen: (photo: PlayerPhoto) => void; onProfile: (p: PlayerPhoto) => void;
  onTag: (p: PlayerPhoto, t: PhotoTag) => void; onDelete: (p: PlayerPhoto) => void;
}) => {
  const [menuFor, setMenuFor] = useState<string | null>(null);
  return (
    <ul className="grid justify-center content-start" style={{ gap: GAP, gridTemplateColumns: `repeat(${cols}, ${size}px)` }} aria-label="Photos">
      {photos.map((p, i) => {
        const uploading = p.progress !== undefined;
        const isProfile = p.id === profileId;
        return (
          <li key={p.id} className="relative group" style={{ width: size, height: size }}>
            <button onClick={() => !uploading && onOpen(p)} disabled={uploading} aria-label={`Open ${p.tag ?? 'photo'} uploaded by ${p.uploadedBy}`}
              className="w-full h-full rounded-[20px] overflow-hidden bg-surface-accent border border-default shadow-[var(--shadow-lg)] hover:shadow-[var(--shadow-xl)] transition-shadow flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus">
              <img src={p.src} alt="" className={'w-full h-full object-contain ' + (uploading ? 'opacity-40' : '')} draggable={false} />
            </button>
            {isProfile && (
              <span className="absolute top-2 left-2 flex items-center gap-1 bg-brand-primary text-on-brand rounded-full px-2 py-1 font-body font-bold text-[10px] shadow-sm pointer-events-none">
                <Star size={11} fill="currentColor" /> Profile photo
              </span>
            )}
            {p.tag && !uploading && size >= 120 && (
              <span className="absolute bottom-2 left-2 bg-surface-card/90 backdrop-blur-md text-strong rounded-full px-2 py-0.5 font-body font-bold text-[10px] shadow-sm pointer-events-none">{p.tag}</span>
            )}
            {uploading ? (
              <div className="absolute inset-x-3 bottom-3" role="progressbar" aria-valuenow={p.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Uploading ${p.fileName}`}>
                <div className="font-body font-bold text-[10px] text-strong mb-1 truncate">Uploading… {p.progress}%</div>
                <div className="h-1.5 rounded-full bg-border-default overflow-hidden"><div className="h-full bg-brand-primary rounded-full transition-[width]" style={{ width: p.progress + '%' }} /></div>
              </div>
            ) : (
              <button onClick={e => { e.stopPropagation(); setMenuFor(menuFor === p.id ? null : p.id); }} aria-label="Photo options" aria-haspopup="menu" aria-expanded={menuFor === p.id}
                className={'absolute top-2 right-2 w-8 h-8 rounded-full bg-surface-card/90 backdrop-blur-md border border-default text-strong flex items-center justify-center shadow-sm transition-opacity focus-visible:opacity-100 ' + (menuFor === p.id ? 'opacity-100' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100')}>
                <MoreHorizontal size={16} />
              </button>
            )}
            {menuFor === p.id && (
              <TileMenu photo={p} isProfile={isProfile} alignLeft={i % cols === 0} onClose={() => setMenuFor(null)}
                onProfile={() => onProfile(p)} onTag={t => onTag(p, t)} onDelete={() => onDelete(p)} />
            )}
          </li>
        );
      })}
    </ul>
  );
};
