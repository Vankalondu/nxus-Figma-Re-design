import React, { useState, useEffect } from 'react';
import {
  Zap,
  LayoutGrid,
  Users,
  FileText,
  Settings,
  ClipboardList,
  Sun,
  Moon,
  X
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { useTheme } from 'next-themes';

// ─── Role → base path mapping ─────────────────────────────────────────────────
function getRoleBasePath(): string {
  const role = sessionStorage.getItem('loginRole') || sessionStorage.getItem('userRole') || '';
  if (role === 'Lead Scout')   return '/lead-scout';
  if (role === 'Senior Scout') return '/senior-scout';
  if (role === 'Head Scout')   return '/head-scout';
  return '/country-scout';
}

interface SidebarProps {
  // Quick actions shown in the mobile drawer (e.g. This Week, Add Report) —
  // on desktop these live in the top bar, so the drawer is mobile-only anyway.
  actions?: { label: string; icon: React.ElementType; onClick: () => void }[];
}

export function Sidebar({ actions = [] }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  // The hamburger lives in TopNav; it opens this drawer via a decoupled event
  // so we don't have to thread open-state through every dashboard shell.
  useEffect(() => {
    const open = () => setMobileOpen(true);
    window.addEventListener('nxus:open-menu', open);
    return () => window.removeEventListener('nxus:open-menu', open);
  }, []);

  const base = getRoleBasePath();
  const role = sessionStorage.getItem('loginRole') || sessionStorage.getItem('userRole') || '';

  const mainMenuItems = [
    { icon: LayoutGrid,    label: 'Dashboard', path: base                    },
    { icon: Users,         label: 'Players',   path: `${base}/players`       },
    { icon: FileText,      label: 'Matches',   path: `${base}/matches`       },
    { icon: Settings,      label: 'Admin',     path: `${base}/admin`         },
  ];

  const isActive = (item: typeof mainMenuItems[0]) => {
    if (item.path === base) return location.pathname === base || location.pathname === '/';
    return location.pathname === item.path;
  };

  const handleNav = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const displayName = sessionStorage.getItem('userName') || 'Scout';
  const displayRole = sessionStorage.getItem('loginRole') || sessionStorage.getItem('userRole') || 'Scout';

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-[76px] hover:w-[232px] transition-all duration-300 bg-card rounded-r-[24px] border-r border-border flex-col py-6 h-screen sticky top-0 shrink-0 z-[100] group overflow-hidden shadow-[var(--shadow-sidebar)]">
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 mb-8 w-[232px]">
          <div className="w-9 h-9 flex items-center justify-center rounded-[12px] bg-accent shadow-sm shrink-0">
            <Zap size={18} className="text-primary" fill="currentColor" />
          </div>
          <span className="font-heading font-bold text-foreground text-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">NXUS</span>
        </div>

        {/* Main Menu */}
        <nav className="flex-1 w-[232px] flex flex-col gap-2 px-3">
          {mainMenuItems.map((item, i) => {
            const active = isActive(item);
            return (
              <button
                key={i}
                onClick={() => navigate(item.path)}
                className={`w-full h-11 flex items-center rounded-[14px] transition-all px-2 ${
                  active
                    ? 'border-l-[3px] border-primary bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <div className="shrink-0 flex items-center justify-center w-6 ml-0.5">
                  <item.icon size={20} strokeWidth={active ? 2.5 : 2} />
                </div>
                <span className={`ml-4 font-body font-bold text-[14px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Bottom: Theme toggle + User */}
        <div className="mt-auto px-5 w-[232px] flex flex-col gap-4 pb-4">
          <button
            onClick={(e) => { e.stopPropagation(); setTheme(theme === 'dark' ? 'light' : 'dark'); }}
            className="w-9 h-9 rounded-[12px] flex items-center justify-center bg-accent text-muted-foreground hover:text-foreground hover:bg-border transition-colors shrink-0"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-4">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces&q=80"
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-border object-cover shrink-0"
            />
            <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden whitespace-nowrap">
              <span className="font-body font-bold text-[14px] text-foreground">{displayName}</span>
              <span className="font-body text-[12px] font-semibold text-muted-foreground">{displayRole}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Mobile: Overlay Sidebar ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[200] flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-10 w-[280px] bg-card border-r border-border flex flex-col py-8 min-h-screen shadow-[4px_0_24px_rgba(6,27,46,0.12)]">
            <div className="flex items-center justify-between px-6 mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-accent shadow-sm">
                  <Zap size={20} className="text-primary" fill="currentColor" />
                </div>
                <span className="font-heading font-extrabold text-foreground text-xl">NXUS</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-border transition-colors">
                <X size={16} />
              </button>
            </div>
            <nav className="flex-1 flex flex-col gap-2 px-3">
              {mainMenuItems.map((item, i) => {
                const active = isActive(item);
                return (
                  <button key={i} onClick={() => handleNav(item.path)}
                    className={`w-full h-11 flex items-center rounded-[14px] transition-all px-3 gap-4 ${
                      active
                        ? 'border-l-[3px] border-primary bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  >
                    <item.icon size={20} strokeWidth={active ? 2.5 : 2} />
                    <span className="font-body font-bold text-[14px]">{item.label}</span>
                  </button>
                );
              })}
              {actions.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border flex flex-col gap-2">
                  <span className="px-3 mb-1 font-heading font-bold text-micro uppercase tracking-widest text-muted-foreground">Quick Actions</span>
                  {actions.map((a, i) => (
                    <button key={i} onClick={() => { a.onClick(); setMobileOpen(false); }}
                      className="w-full h-11 flex items-center rounded-[14px] px-3 gap-4 text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
                      <a.icon size={20} />
                      <span className="font-body font-bold text-[14px]">{a.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </nav>
            <div className="mt-auto px-6 flex flex-col gap-6 pb-8">
              <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-accent text-muted-foreground hover:text-foreground hover:bg-border transition-colors">
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <div className="flex items-center gap-3">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces&q=80"
                  alt="Profile" className="w-10 h-10 rounded-full border-2 border-border object-cover" />
                <div>
                  <div className="font-body font-bold text-[14px] text-foreground">{displayName}</div>
                  <div className="font-body text-[12px] text-muted-foreground">{displayRole}</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

    </>
  );
}