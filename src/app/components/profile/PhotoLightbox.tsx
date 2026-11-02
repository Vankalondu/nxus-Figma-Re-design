import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X, Download } from 'lucide-react';
import { PlayerPhoto } from '../../state/photoStore';

/**
 * Full-size viewer (P-CO20): the uncropped photo as large as the screen allows, arrows,
 * keyboard (← → Esc), swipe on touch, "3 of 40", who uploaded it and when, Download.
 */
export const PhotoLightbox = ({ photos, index, onIndex, onClose }: {
  photos: PlayerPhoto[]; index: number; onIndex: (i: number) => void; onClose: () => void;
}) => {
  const photo = photos[index];
  const closeRef = useRef<HTMLButtonElement>(null);
  const touchX = useRef<number | null>(null);
  const count = photos.length;
  const prev = () => onIndex((index - 1 + count) % count);
  const next = () => onIndex((index + 1) % count);

  useEffect(() => { closeRef.current?.focus(); }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft' && count > 1) prev();
      else if (e.key === 'ArrowRight' && count > 1) next();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!photo) return null;
  const arrow = 'absolute top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-surface-card/90 backdrop-blur-md border border-default text-strong flex items-center justify-center shadow-[var(--shadow-lg)] hover:bg-surface-card transition-colors';
  // Portalled to <body>: an animated (transformed) ancestor would otherwise trap a fixed overlay.
  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={`Photo ${index + 1} of ${count}`}
      className="fixed inset-0 z-[300] bg-ink-midnight/90 backdrop-blur-sm flex flex-col"
      onClick={onClose}
      onTouchStart={e => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={e => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50 && count > 1) (dx > 0 ? prev : next)();
      }}>
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 shrink-0" onClick={e => e.stopPropagation()}>
        <div className="min-w-0">
          <div className="font-heading font-semibold text-[16px] text-on-brand">{index + 1} of {count}</div>
          <div className="font-body font-medium text-[12px] text-on-brand/70 truncate">
            {photo.tag ? photo.tag + ' · ' : ''}Uploaded by {photo.uploadedBy} · {photo.dateLabel}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a href={photo.src} download={photo.fileName}
            className="flex items-center gap-2 bg-surface-card text-strong rounded-full px-4 py-2 font-body font-bold text-[14px] hover:bg-surface-accent transition-colors">
            <Download size={15} /> Download
          </a>
          <button ref={closeRef} onClick={onClose} aria-label="Close viewer"
            className="w-10 h-10 rounded-full bg-surface-card/15 text-on-brand hover:bg-surface-card/25 flex items-center justify-center transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>
      <div className="relative flex-1 min-h-0 flex items-center justify-center px-4 sm:px-20 pb-6">
        <img src={photo.src} alt={photo.tag ?? 'Player photo'} onClick={e => e.stopPropagation()}
          className="w-full h-full object-contain" />
        {count > 1 && (
          <>
            <button onClick={e => { e.stopPropagation(); prev(); }} aria-label="Previous photo" className={arrow + ' left-2 sm:left-6'}><ChevronLeft size={22} /></button>
            <button onClick={e => { e.stopPropagation(); next(); }} aria-label="Next photo" className={arrow + ' right-2 sm:right-6'}><ChevronRight size={22} /></button>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
};
