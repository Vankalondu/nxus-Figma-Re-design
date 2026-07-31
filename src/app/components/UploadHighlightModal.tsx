import React, { useState, useRef } from 'react';
import { X, Link2, UploadCloud, Film, Check } from 'lucide-react';
import { toast } from 'sonner';
import { addHighlight } from '../state/playerStore';

/** Upload a highlight for a player — paste a link OR drop/choose a file from the device. */
export function UploadHighlightModal({ playerId, playerName, onClose }: { playerId: string; playerName: string; onClose: () => void }) {
  const [mode, setMode] = useState<'link' | 'file'>('link');
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const canSubmit = title.trim().length > 0 && (mode === 'link' ? url.trim().length > 0 : !!file);

  const submit = () => {
    if (!canSubmit) return;
    addHighlight(playerId, {
      title: title.trim(),
      source: mode,
      url: mode === 'link' ? url.trim() : undefined,
      fileName: mode === 'file' ? file?.name : undefined,
      addedLabel: 'Just now',
    });
    toast.success(`Highlight uploaded for ${playerName}`);
    onClose();
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDrag(false);
    const f = e.dataTransfer.files?.[0];
    if (f) setFile(f);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[300] p-4" onClick={onClose}>
      <div className="bg-card rounded-[20px] shadow-2xl w-full max-w-md border border-border" onClick={e => e.stopPropagation()}>
        <div className="px-8 py-6 bg-primary rounded-t-[20px] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Film size={18} className="text-white" />
            <span className="font-heading font-semibold text-[16px] text-white">Upload highlight</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-card/10 flex items-center justify-center text-white/60 hover:text-white"><X size={16} /></button>
        </div>

        <div className="p-8 space-y-4">
          <div className="flex items-center gap-2 font-body text-[13px] text-muted-foreground">
            For <span className="font-bold text-foreground">{playerName}</span>
          </div>

          <div>
            <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Title</label>
            <input autoFocus type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. vs Gor Mahia — 2 goals"
              className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all" />
          </div>

          {/* mode toggle */}
          <div className="flex items-center gap-1 p-1 bg-card border border-border rounded-full w-full">
            {([['link', 'Paste link', Link2], ['file', 'Upload file', UploadCloud]] as const).map(([id, label, Icon]) => (
              <button key={id} onClick={() => setMode(id)}
                className={`flex-1 inline-flex items-center justify-center gap-1.5 font-body font-bold text-[12px] px-3 py-1.5 rounded-full transition-colors ${mode === id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                <Icon size={13} /> {label}
              </button>
            ))}
          </div>

          {mode === 'link' ? (
            <div>
              <label className="font-heading font-bold text-[10px] uppercase tracking-widest text-muted-foreground block mb-2">Video link</label>
              <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://…  (YouTube, Veo, Hudl…)"
                onKeyDown={e => { if (e.key === 'Enter') submit(); }}
                className="w-full bg-card border border-border rounded-xl px-4 py-2 font-body text-[14px] font-bold text-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring transition-all" />
            </div>
          ) : (
            <div
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className={`rounded-[16px] border-2 border-dashed p-6 flex flex-col items-center justify-center gap-2 text-center cursor-pointer transition-colors ${drag ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/60'}`}>
              <input ref={inputRef} type="file" accept="video/*" className="hidden"
                onChange={e => setFile(e.target.files?.[0] ?? null)} />
              {file ? (
                <div className="flex items-center gap-2 font-body font-bold text-[13px] text-foreground">
                  <Check size={15} className="text-primary" /> {file.name}
                </div>
              ) : (
                <>
                  <UploadCloud size={22} className="text-muted-foreground" />
                  <div className="font-body font-bold text-[13px] text-foreground">Drop a video here, or click to choose</div>
                  <div className="font-body text-[11px] text-muted-foreground">MP4, MOV — from your device</div>
                </>
              )}
            </div>
          )}

          <button onClick={submit} disabled={!canSubmit}
            className="w-full bg-primary border-2 border-primary text-white rounded-full py-3 font-body font-black text-[14px] hover:bg-primary/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            Upload highlight
          </button>
        </div>
      </div>
    </div>
  );
}
