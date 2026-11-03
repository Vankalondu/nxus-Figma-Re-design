import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ImagePlus, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { SegmentedToggle } from '../PlayersTableKit';
import { SECONDARY_BUTTON } from '../controlStyles';
import { PhotoGrid } from './PhotoGrid';
import { PhotoLightbox } from './PhotoLightbox';
import {
  PHOTO_TAGS, PhotoTag, PlayerPhoto, addPhoto, heicStandIn, removePhoto,
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
 * Photo library tab on the player profile (P-CO20, D-19, D-20). Same for every account (P-L3).
 * Square tiles of one fixed size (5 across on desktop, 4 on tablet, 2 on phone); about ten are
 * in view on a desktop screen and the grid scrolls for the rest — no pagination.
 */
export const PhotoLibrary = ({ playerId, uploaderName = 'You' }: { playerId: string; uploaderName?: string }) => {
  const photos = usePhotos(playerId);
  const profile = useProfilePhoto(playerId);
  const [filter, setFilter] = useState<Filter>('All');
  const [viewer, setViewer] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const shown = useMemo(() => filter === 'All' ? photos : photos.filter(p => p.tag === filter), [photos, filter]);

  useEffect(() => { setFilter('All'); }, [playerId]);

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
      const src = heic ? heicStandIn() : URL.createObjectURL(file);
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
    if (added) { setFilter('All'); toast.success(added === 1 ? 'Photo added' : `${added} photos added`); }
  };

  const onDelete = (p: PlayerPhoto) => {
    const undo = removePhoto(playerId, p.id);
    toast('Photo deleted', { duration: 5000, action: { label: 'Undo', onClick: undo } });
  };

  const AddButton = (
    <button onClick={() => inputRef.current?.click()} className={SECONDARY_BUTTON}>
      <ImagePlus size={15} strokeWidth={2.5} /> Add photos
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
          <SegmentedToggle<Filter> tone="filter" value={filter} onChange={setFilter}
            options={(['All', ...PHOTO_TAGS] as Filter[]).map(t => ({
              value: t,
              label: <>{t}<span className="ml-1 opacity-70 tabular-nums">{counts[t]}</span></>,
            }))} />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {photos.length > 0 && <p className="font-body font-medium type-caption text-muted max-lg:hidden">or drag photos here</p>}
          {AddButton}
        </div>
      </div>

      {photos.length === 0 ? (
        <div className="flex-1 min-h-[320px] flex flex-col items-center justify-center text-center gap-4 border-2 border-dashed border-default rounded-[20px] px-6 py-10">
          <span className="w-14 h-14 rounded-full bg-brand-primary/10 text-link flex items-center justify-center"><ImagePlus size={24} /></span>
          <p className="font-body font-medium type-body-sm text-body max-w-[360px]">No photos yet. Add headshots and match photos so scouts can identify this player.</p>
          {AddButton}
          <p className="font-body font-medium type-caption text-muted">JPG, PNG, WebP or HEIC · up to 10 MB each · or drag photos here</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar pb-2">
          {shown.length === 0
            ? <p className="font-body font-medium type-body-sm text-body py-6" aria-live="polite">No {filter.toLowerCase()} photos yet.</p>
            : (
              <PhotoGrid photos={shown} profileId={profile?.id}
                onOpen={p => setViewer(shown.indexOf(p))}
                onProfile={p => { setProfilePhoto(playerId, p.id); toast.success('Profile photo updated'); }}
                onTag={(p, t) => updatePhoto(playerId, p.id, { tag: t })}
                onDelete={onDelete} />
            )}
        </div>
      )}

      {dragging && (
        <div className="absolute inset-0 z-10 rounded-[20px] border-2 border-dashed border-brand-primary bg-surface-card/90 backdrop-blur-sm flex flex-col items-center justify-center gap-2 pointer-events-none">
          <Upload size={28} className="text-link" />
          <p className="font-heading font-semibold type-h6 text-heading">Drop photos to add them</p>
          <p className="font-body font-medium type-caption text-body">JPG, PNG, WebP or HEIC · up to 10 MB each</p>
        </div>
      )}

      {viewer !== null && shown[viewer] && (
        <PhotoLightbox photos={shown} index={viewer} onIndex={setViewer} onClose={() => setViewer(null)} />
      )}
    </div>
  );
};
