import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router';
import { X, Eye, EyeOff, Camera } from 'lucide-react';
import { toast } from 'sonner';

// The one profile menu every top bar uses. It replaces the old per-dashboard
// role pill: the role now lives here under the name, and a role that can switch
// views (Senior Scout ↔ Head Scout) gets the switch inside the menu.
// Login is a mock, so Profile edits are kept in this browser only.

export interface ViewSwitch {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}

export interface ProfileInfo {
  name: string;
  role: string;
  avatar: string;
  email?: string;
  viewSwitch?: ViewSwitch;
  onLogout?: () => void;
}

const storeKey = (role: string) => `nxus:profile:${role.toLowerCase().replace(/\s+/g, '-')}`;
type Saved = { name?: string; email?: string; phone?: string; photo?: string };
const loadSaved = (role: string): Saved => {
  try { return JSON.parse(window.localStorage.getItem(storeKey(role)) || '{}'); } catch { return {}; }
};
const defaultEmail = (name: string) => `${name.toLowerCase().split(' ')[0]}@lighthousesports.com`;

export function ProfileMenu({ profile }: { profile: ProfileInfo }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState<'profile' | 'security' | null>(null);
  const [saved, setSaved] = useState<Saved>(() => loadSaved(profile.role));
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => { setSaved(loadSaved(profile.role)); }, [profile.role]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);

  const name = saved.name || profile.name;
  const avatar = saved.photo || profile.avatar;
  const logout = () => {
    setOpen(false);
    if (profile.onLogout) return profile.onLogout();
    sessionStorage.clear();
    navigate('/login');
  };
  const row = 'w-full text-left px-4 py-3 rounded-[16px] font-body text-[14px] font-bold transition-colors';

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)} aria-label="Open profile menu" aria-expanded={open}
        className="w-11 h-11 rounded-full overflow-hidden border-2 border-default cursor-pointer hover:ring-2 hover:ring-brand-primary transition-all shrink-0">
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      </button>

      {open && (
        <div role="menu" className="absolute right-0 mt-3 w-72 bg-surface-card rounded-[24px] shadow-[var(--shadow-xl)] border border-default z-50 overflow-hidden font-body">
          <div className="px-5 py-4 border-b border-default">
            <div className="text-[14px] text-body">Signed in as <span className="font-bold text-strong">{name}</span></div>
            <div className="text-[12px] text-muted font-medium mt-1">{profile.role}</div>
          </div>

          {profile.viewSwitch && (
            <div className="px-4 py-3 border-b border-default">
              <div className="text-[12px] text-muted font-medium mb-2">View as</div>
              <div className="flex p-1 bg-surface-accent rounded-full">
                {profile.viewSwitch.options.map(opt => {
                  const active = opt === profile.viewSwitch!.value;
                  return (
                    <button key={opt} onClick={() => { profile.viewSwitch!.onChange(opt); setOpen(false); }}
                      className={`flex-1 px-3 py-2 rounded-full text-[12px] font-bold transition-colors ${active ? 'bg-brand-primary text-on-brand shadow-sm' : 'text-body hover:text-strong'}`}>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="p-2">
            <button role="menuitem" onClick={() => { setOpen(false); setModal('profile'); }} className={row + ' text-strong hover:bg-surface-accent'}>Profile</button>
            <button role="menuitem" onClick={() => { setOpen(false); setModal('security'); }} className={row + ' text-strong hover:bg-surface-accent'}>Security</button>
          </div>
          <div className="p-2 border-t border-default">
            <button role="menuitem" onClick={logout} className={row + ' text-status-error hover:bg-status-error/5'}>Log out</button>
          </div>
        </div>
      )}

      {modal === 'profile' && (
        <ProfileModal role={profile.role} initial={{ name, email: saved.email || profile.email || defaultEmail(name), phone: saved.phone || '', photo: avatar }}
          onClose={() => setModal(null)}
          onSave={next => { window.localStorage.setItem(storeKey(profile.role), JSON.stringify(next)); setSaved(next); setModal(null); toast.success('Profile saved'); }} />
      )}
      {modal === 'security' && <SecurityModal onClose={() => setModal(null)} />}
    </div>
  );
}

// ── Pop-up shell: same backdrop, panel and header as Edit Columns ──
function Modal({ title, onClose, children, footer }: { title: string; onClose: () => void; children: React.ReactNode; footer: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return createPortal(
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink-midnight/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface-page rounded-[24px] w-full max-w-md max-h-[88vh] flex flex-col shadow-2xl border border-default overflow-hidden font-body">
        <div className="shrink-0 flex items-center justify-between gap-4 px-6 py-5 border-b border-default">
          <h2 className="font-heading font-semibold text-[20px] text-heading">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="w-9 h-9 rounded-full bg-surface-accent flex items-center justify-center text-body hover:text-link transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">{children}</div>
        <div className="shrink-0 flex justify-end gap-3 px-6 py-4 border-t border-default">{footer}</div>
      </div>
    </div>,
    document.body,
  );
}

const inputCls = 'w-full bg-surface-input border border-default rounded-[12px] px-4 py-3 text-[14px] text-strong placeholder:text-placeholder outline-none focus:border-focus transition-colors';
const labelCls = 'block text-[12px] font-bold text-body mb-2';
const primaryBtn = 'px-6 py-3 rounded-full bg-brand-primary text-on-brand font-bold text-[14px] hover:bg-brand-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
const secondaryBtn = 'px-6 py-3 rounded-full border-2 border-default text-body font-bold text-[14px] hover:border-brand-primary hover:text-strong transition-colors';

function ProfileModal({ role, initial, onClose, onSave }: { role: string; initial: Required<Saved>; onClose: () => void; onSave: (s: Saved) => void }) {
  const [form, setForm] = useState(initial);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = (k: keyof Saved) => (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [k]: e.target.value }));
  const pickPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, photo: String(reader.result) }));
    reader.readAsDataURL(file);
  };
  const valid = form.name.trim().length > 0 && /\S+@\S+\.\S+/.test(form.email);
  return (
    <Modal title="Profile" onClose={onClose}
      footer={<><button onClick={onClose} className={secondaryBtn}>Cancel</button><button disabled={!valid} onClick={() => onSave({ ...form, name: form.name.trim() })} className={primaryBtn}>Save changes</button></>}>
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-default shrink-0">
          <img src={form.photo} alt="" className="w-full h-full object-cover" />
        </div>
        <button onClick={() => fileRef.current?.click()} className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-accent text-strong font-bold text-[12px] hover:bg-surface-midtone transition-colors">
          <Camera size={14} />Change photo
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickPhoto} />
      </div>
      <div><label className={labelCls} htmlFor="pf-name">Full name</label><input id="pf-name" className={inputCls} value={form.name} onChange={set('name')} /></div>
      <div><label className={labelCls} htmlFor="pf-email">Email</label><input id="pf-email" type="email" className={inputCls} value={form.email} onChange={set('email')} /></div>
      <div><label className={labelCls} htmlFor="pf-phone">Phone</label><input id="pf-phone" type="tel" className={inputCls} placeholder="+254 700 000 000" value={form.phone} onChange={set('phone')} /></div>
      <div>
        <span className={labelCls}>Role</span>
        <div className="px-4 py-3 rounded-[12px] bg-surface-accent text-[14px] text-body">{role}</div>
        <p className="text-[12px] text-muted mt-2">Your role is set by your organisation and can't be changed here.</p>
      </div>
    </Modal>
  );
}

function PasswordField({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (v: string) => void }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className={labelCls} htmlFor={id}>{label}</label>
      <div className="relative">
        <input id={id} type={show ? 'text' : 'password'} className={inputCls + ' pr-12'} value={value} onChange={e => onChange(e.target.value)} autoComplete="off" />
        <button type="button" onClick={() => setShow(s => !s)} aria-label={show ? 'Hide password' : 'Show password'}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-strong">
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}

function SecurityModal({ onClose }: { onClose: () => void }) {
  const [cur, setCur] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const longEnough = next.length >= 8;
  const matches = next.length > 0 && next === confirm;
  const valid = cur.length > 0 && longEnough && matches;
  const rule = (ok: boolean, text: string) => (
    <li className={`flex items-center gap-2 text-[12px] ${ok ? 'text-status-success-fg' : 'text-muted'}`}>
      <span className={`w-2 h-2 rounded-full ${ok ? 'bg-status-success' : 'bg-border-default'}`} />{text}
    </li>
  );
  return (
    <Modal title="Security" onClose={onClose}
      footer={<><button onClick={onClose} className={secondaryBtn}>Cancel</button><button disabled={!valid} onClick={() => { toast.success('Password updated'); onClose(); }} className={primaryBtn}>Update password</button></>}>
      <h3 className="font-heading font-semibold text-[16px] text-heading">Change password</h3>
      <PasswordField id="sec-cur" label="Current password" value={cur} onChange={setCur} />
      <PasswordField id="sec-new" label="New password" value={next} onChange={setNext} />
      <PasswordField id="sec-confirm" label="Confirm new password" value={confirm} onChange={setConfirm} />
      <ul className="flex flex-col gap-1">
        {rule(longEnough, 'At least 8 characters')}
        {rule(matches, 'Both new passwords match')}
      </ul>
      <div className="pt-4 border-t border-default">
        <h3 className="font-heading font-semibold text-[16px] text-heading">Other devices</h3>
        <p className="text-[14px] text-body mt-1 mb-3">Signed in somewhere you don't recognise? Sign out everywhere except this device.</p>
        <button onClick={() => toast.success('Signed out of other devices')} className={secondaryBtn}>Sign out of other devices</button>
      </div>
    </Modal>
  );
}
