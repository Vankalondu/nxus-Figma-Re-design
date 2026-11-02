import React, { useEffect, useRef, useState } from 'react';
import { MoreHorizontal, Star, Download, Trash2, Tag, Check } from 'lucide-react';
import { PHOTO_TAGS, PhotoTag, PlayerPhoto } from '../../state/photoStore';

/**
 * Columns by width (P-CO20, D-20): 5 across on desktop (about 10 photos in view at 1440×900),
 * 4 on tablet, 2 on phone. Every tile is the same size whatever the number of photos.
 */
export const PHOTO_GRID_COLS = 'grid-cols-2 sm:grid-cols-4 xl:grid-cols-5';

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
 * Square tiles that show the WHOLE photo (object-contain on a soft surface), all the same
 * size; the grid scrolls when there are more than fit (P-CO20, D-20).
 */
export const PhotoGrid = ({ photos, profileId, onOpen, onProfile, onTag, onDelete }: {
  photos: PlayerPhoto[]; profileId?: string;
  onOpen: (photo: PlayerPhoto) => void; onProfile: (p: PlayerPhoto) => void;
  onTag: (p: PlayerPhoto, t: PhotoTag) => void; onDelete: (p: PlayerPhoto) => void;
}) => {
  const [menuFor, setMenuFor] = useState<string | null>(null);
  // The menu opens leftwards from the tile's right edge unless that would run off-screen.
  const [menuLeft, setMenuLeft] = useState(false);
  return (
    <ul className={`grid ${PHOTO_GRID_COLS} gap-4 content-start`} aria-label="Photos">
      {photos.map(p => {
        const uploading = p.progress !== undefined;
        const isProfile = p.id === profileId;
        return (
          <li key={p.id} className="relative group aspect-square min-w-0">
            <button onClick={() => !uploading && onOpen(p)} disabled={uploading} aria-label={`Open ${p.tag ?? 'photo'} uploaded by ${p.uploadedBy}`}
              className="w-full h-full rounded-[20px] overflow-hidden bg-surface-accent border border-default shadow-[var(--shadow-lg)] hover:shadow-[var(--shadow-xl)] transition-shadow flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus">
              <img src={p.src} alt="" className={'w-full h-full object-contain ' + (uploading ? 'opacity-40' : '')} draggable={false} />
            </button>
            {isProfile && (
              <span className="absolute top-2 left-2 flex items-center gap-1 bg-brand-primary text-on-brand rounded-full px-2 py-1 font-body font-bold text-[10px] shadow-sm pointer-events-none">
                <Star size={11} fill="currentColor" /> Profile photo
              </span>
            )}
            {p.tag && !uploading && (
              <span className="absolute bottom-2 left-2 bg-surface-card/90 backdrop-blur-md text-strong rounded-full px-2 py-0.5 font-body font-bold text-[10px] shadow-sm pointer-events-none">{p.tag}</span>
            )}
            {uploading ? (
              <div className="absolute inset-x-3 bottom-3" role="progressbar" aria-valuenow={p.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Uploading ${p.fileName}`}>
                <div className="font-body font-bold text-[10px] text-strong mb-1 truncate">Uploading… {p.progress}%</div>
                <div className="h-1.5 rounded-full bg-border-default overflow-hidden"><div className="h-full bg-brand-primary rounded-full transition-[width]" style={{ width: p.progress + '%' }} /></div>
              </div>
            ) : (
              <button onClick={e => {
                e.stopPropagation();
                const li = (e.currentTarget as HTMLElement).closest('li');
                setMenuLeft(!!li && li.getBoundingClientRect().right < 240);
                setMenuFor(menuFor === p.id ? null : p.id);
              }} aria-label="Photo options" aria-haspopup="menu" aria-expanded={menuFor === p.id}
                className={'absolute top-2 right-2 w-8 h-8 rounded-full bg-surface-card/90 backdrop-blur-md border border-default text-strong flex items-center justify-center shadow-sm transition-opacity focus-visible:opacity-100 ' + (menuFor === p.id ? 'opacity-100' : 'opacity-100 lg:opacity-0 lg:group-hover:opacity-100')}>
                <MoreHorizontal size={16} />
              </button>
            )}
            {menuFor === p.id && (
              <TileMenu photo={p} isProfile={isProfile} alignLeft={menuLeft} onClose={() => setMenuFor(null)}
                onProfile={() => onProfile(p)} onTag={t => onTag(p, t)} onDelete={() => onDelete(p)} />
            )}
          </li>
        );
      })}
    </ul>
  );
};
