import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ImagePlus, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { SegmentedToggle } from '../PlayersTableKit';
import { Pagination } from '../Pagination';
import { PhotoGrid, bestTile, photoPageShape, useBoxSize } from './PhotoGrid';
import { PhotoLightbox } from './PhotoLightbox';
import {
  PHOTO_TAGS, PhotoTag, PlayerPhoto, addPhoto, placeholderPhoto, removePhoto,
  setProfilePhoto, updatePhoto, usePhotos, useProfilePhoto,
} from '../../state/photoStore';

export const ACCEPTED_EXT = ['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif'];
export const MAX_BYTES = 10 * 1024 * 1024;

/** Why a file can't be added, or null when it can (P-CO20). */
export function rejectReason(file: { name: string; size: number }): string | null {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
  if (!ACCEPTED_EXT.includes(ext)) return 'Format not supported — use JPG, PNG, WebP or HEIC';
  if (file.size > MAX_BYTES) return 'Too large — 10 MB max';
  return null;
}

type Filter = 'All' | PhotoTag;

/**
 * Photo library tab on the player profile (P-CO20, D-19). Same for every account (P-L3).
 * The page of photos always fits the box without scrolling on desktop; fewer photos get
 * bigger squares; more than one page gets "Prev 1 2 … Next Last".
 */
export const PhotoLibrary = ({ playerId, uploaderName = 'You' }: { playerId: string; uploaderName?: string }) => {
  const photos = usePhotos(playerId);
  const profile = useProfilePhoto(playerId);
  const [filter, setFilter] = useState<Filter>('All');
  const [page, setPage] = useState(1);
  const [viewer, setViewer] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [boxRef, box] = useBoxSize<HTMLDivElement>();

  const shown = useMemo(() => filter === 'All' ? photos : photos.filter(p => p.tag === filter), [photos, filter]);
  const { maxCols, maxRows } = photoPageShape(box.w);
  const perPage = maxCols * maxRows;
  const totalPages = Math.max(1, Math.ceil(shown.length / perPage));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * perPage;
  const pageItems = shown.slice(start, start + perPage);
  // Desktop fits the page inside the tab; smaller screens scroll, but a tile is still capped
  // at ~60% of the screen height so two photos sit side by side instead of stacking huge.
  const fitHeight = box.w >= 900 && box.h > 0;
  const capH = fitHeight ? box.h : Math.round(window.innerHeight * 0.6);
  // Size squares for a FULL page when there is more than one page, so tiles don't jump
  // between pages; with one page, size them for the photos actually there.
  const layoutCount = totalPages > 1 ? perPage : pageItems.length;
  const { cols, size } = bestTile(layoutCount, box.w, capH, maxCols, maxRows, true);

  useEffect(() => { setPage(1); }, [filter, playerId]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: photos.length };
    PHOTO_TAGS.forEach(t => { c[t] = photos.filter(p => p.tag === t).length; });
    return c;
  }, [photos]);

  const addFiles = (files: FileList | File[]) => {
    const list = Array.from(files);
    let added = 0;
    list.forEach((file, i) => {
      const reason = rejectReason(file);
      if (reason) { toast.error(`${file.name}: ${reason}`); return; }
      const heic = /\.(heic|heif)$/i.test(file.name);
      // Browsers can't draw HEIC; the real upload converts it to JPG on the server.
      const src = heic ? placeholderPhoto(photos.length + i).src : URL.createObjectURL(file);
      const id = addPhoto(playerId, {
        src, ratio: 1, uploadedBy: uploaderName, dateLabel: 'Just now', fileName: file.name, progress: 0,
      });
      added++;
      if (!heic) {
        const img = new Image();
        img.onload = () => updatePhoto(playerId, id, { ratio: img.naturalWidth / Math.max(1, img.naturalHeight) });
        img.src = src;
      }
      let pct = 0;
      const t = window.setInterval(() => {
        pct = Math.min(100, pct + 20 + Math.round(Math.random() * 15));
        if (pct >= 100) { window.clearInterval(t); updatePhoto(playerId, id, { progress: undefined }); }
        else updatePhoto(playerId, id, { progress: pct });
      }, 220);
    });
    if (added) { setFilter('All'); setPage(1); toast.success(added === 1 ? 'Photo added' : `${added} photos added`); }
  };

  const onDelete = (p: PlayerPhoto) => {
    const undo = removePhoto(playerId, p.id);
    toast('Photo deleted', { duration: 5000, action: { label: 'Undo', onClick: undo } });
  };

  const AddButton = (
    <button onClick={() => inputRef.current?.click()}
      className="flex items-center gap-2 bg-brand-primary border-2 border-brand-primary text-on-brand hover:bg-brand-primary/80 rounded-full px-5 py-2 font-body font-bold text-[14px] transition-colors shadow-[var(--shadow-md)] shrink-0">
      <ImagePlus size={16} /> Add photos
    </button>
  );

  return (
    <div className="h-full flex flex-col gap-4 animate-fade-in relative"
      onDragOver={e => { if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); setDragging(true); } }}
      onDragLeave={e => { if (e.currentTarget === e.target) setDragging(false); }}
      onDrop={e => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files); }}>
      <input ref={inputRef} type="file" multiple hidden accept=".jpg,.jpeg,.png,.webp,.heic,.heif"
        onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }} data-testid="photo-input" />

      <div className="flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="overflow-x-auto hide-scrollbar max-w-full">
          <SegmentedToggle<Filter> value={filter} onChange={setFilter}
            options={(['All', ...PHOTO_TAGS] as Filter[]).map(t => ({
              value: t,
              label: <>{t}<span className="ml-1 opacity-70 tabular-nums">{counts[t]}</span></>,
            }))} />
        </div>
        {AddButton}
      </div>

      {photos.length === 0 ? (
        <div className="flex-1 min-h-[320px] flex flex-col items-center justify-center text-center gap-4 border-2 border-dashed border-default rounded-[20px] px-6 py-10">
          <span className="w-14 h-14 rounded-full bg-brand-primary/10 text-link flex items-center justify-center"><ImagePlus size={24} /></span>
          <p className="font-body font-medium text-[14px] text-body max-w-[360px]">No photos yet. Add headshots and match photos so scouts can identify this player.</p>
          {AddButton}
          <p className="font-body font-medium text-[12px] text-muted">JPG, PNG, WebP or HEIC · up to 10 MB each · or drag photos here</p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between gap-3 shrink-0">
            <p className="font-body font-medium text-[12px] text-body" aria-live="polite">
              {shown.length === 0 ? `No ${filter.toLowerCase()} photos yet`
                : `Showing ${start + 1}–${start + pageItems.length} of ${shown.length} ${shown.length === 1 ? 'photo' : 'photos'}`}
            </p>
            <p className="font-body font-medium text-[12px] text-muted max-sm:hidden">Drag photos here to add them</p>
          </div>
          <div ref={boxRef} className="flex-1 min-h-0 max-lg:min-h-[320px]">
            {size > 0 && (
              <PhotoGrid photos={pageItems} cols={cols} size={size} profileId={profile?.id}
                onOpen={p => setViewer(shown.indexOf(p))}
                onProfile={p => { setProfilePhoto(playerId, p.id); toast.success('Profile photo updated'); }}
                onTag={(p, t) => updatePhoto(playerId, p.id, { tag: t })}
                onDelete={onDelete} />
            )}
          </div>
          <Pagination page={safePage} totalPages={totalPages} onPage={setPage} showLast />
        </>
      )}

      {dragging && (
        <div className="absolute inset-0 z-10 rounded-[20px] border-2 border-dashed border-brand-primary bg-surface-card/90 backdrop-blur-sm flex flex-col items-center justify-center gap-2 pointer-events-none">
          <Upload size={28} className="text-link" />
          <p className="font-heading font-semibold text-[20px] text-heading">Drop photos to add them</p>
          <p className="font-body font-medium text-[12px] text-body">JPG, PNG, WebP or HEIC · up to 10 MB each</p>
        </div>
      )}

      {viewer !== null && shown[viewer] && (
        <PhotoLightbox photos={shown} index={viewer} onIndex={setViewer} onClose={() => setViewer(null)} />
      )}
    </div>
  );
};
