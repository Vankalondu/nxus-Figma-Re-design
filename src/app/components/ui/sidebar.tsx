import React, { useState } from 'react';
import { 
  Zap,
  LayoutGrid, 
  Users, 
  FileText, 
  Settings,
  ClipboardList,
  Sun,
  Moon,
  Menu,
  X
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { useTheme } from 'next-themes';

// ─── Role → base path mapping ─────────────────────────────────────────────────
// Each role has a dedicated base path. Sub-pages (players, matches, admin)
// are prefixed with that base so the correct dashboard component is always rendered.
function getRoleBasePath(): string {
  const role = sessionStorage.getItem('loginRole') || sessionStorage.getItem('userRole') || '';
  if (role === 'Lead Scout')   return '/lead-scout';
  if (role === 'Senior Scout') return '/senior-scout';
  if (role === 'Head Scout')   return '/head-scout';
  // Country Scout and anything else use the shared country-scout shell
  return '/country-scout';
}

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  const base = getRoleBasePath();
  const role = sessionStorage.getItem('loginRole') || sessionStorage.getItem('userRole') || '';
  const showReports = role === 'Senior Scout' || role === 'Lead Scout';

  // Build menu items using the role-aware base path
  // Reports only appears for Senior Scout and Lead Scout
  const mainMenuItems = [
    { icon: LayoutGrid,    label: 'Dashboard', path: base                    },
    { icon: Users,         label: 'Players',   path: `${base}/players`       },
    ...(showReports ? [{ icon: ClipboardList, label: 'Reports', path: `${base}/reports` }] : []),
    { icon: FileText,      label: 'Matches',   path: `${base}/matches`       },
    { icon: Settings,      label: 'Admin',     path: `${base}/admin`         },
  ];

  const isActive = (item: typeof mainMenuItems[0]) => {
    // Dashboard is active when on the base path exactly
    if (item.path === base) return location.pathname === base || location.pathname === '/';
    return location.pathname === item.path;
  };

  const handleNav = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  // Derive display name and role label from sessionStorage
  const displayName = sessionStorage.getItem('userName') || 'Scout';
  const displayRole = sessionStorage.getItem('loginRole') || sessionStorage.getItem('userRole') || 'Scout';

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-[80px] hover:w-[240px] transition-all duration-300 bg-[#F8FAFC] border-r border-[#D0E8E3] rounded-r-[40px] flex-col py-8 min-h-screen shrink-0 relative z-[100] group overflow-hidden shadow-[4px_0_24px_rgba(15,23,42,0.06)]">
        {/* Logo */}
        <div className="flex items-center gap-4 px-6 mb-12 w-[240px]">
          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#EBF9F6] border border-[#D0E8E3] shadow-sm shrink-0">
            <Zap size={20} className="text-[#0F172A]" fill="currentColor" />
          </div>
          <span className="font-heading font-extrabold text-[#0F172A] text-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">NXUS</span>
        </div>

        {/* Main Menu */}
        <nav className="flex-1 w-[240px] flex flex-col gap-2 px-3">
          {mainMenuItems.map((item, i) => {
            const active = isActive(item);
            return (
              <div key={i} className="relative w-full">
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full h-12 flex items-center rounded-[16px] transition-all px-3 ${
                    active
                      ? 'bg-[#0F172A] text-[#F8FAFC] shadow-sm'
                      : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#EBF9F6]'
                  }`}
                >
                  <div className="shrink-0 flex items-center justify-center w-6 ml-1">
                    <item.icon size={22} strokeWidth={active ? 2.5 : 2} />
                  </div>
                  <span className={`ml-4 font-body font-bold text-[14px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                    active ? 'text-[#F8FAFC]' : 'text-[#64748B] group-hover:text-[#0F172A]'
                  }`}>
                    {item.label}
                  </span>
                </button>
              </div>
            );
          })}
        </nav>

        {/* Bottom: Theme toggle + User */}
        <div className="mt-auto px-6 w-[240px] flex flex-col gap-6 pb-6">
          <button
            onClick={(e) => { e.stopPropagation(); setTheme(theme === 'dark' ? 'light' : 'dark'); }}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#EBF9F6] border border-[#D0E8E3] text-[#64748B] hover:text-[#0F172A] hover:bg-[#D0E8E3] transition-colors shrink-0"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <div className="cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-4">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces&q=80"
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-[#D0E8E3] object-cover shrink-0"
            />
            <div className="flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden whitespace-nowrap">
              <span className="font-body font-bold text-[14px] text-[#0F172A]">{displayName}</span>
              <span className="font-body text-[12px] font-semibold text-[#64748B]">{displayRole}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Mobile: Overlay Sidebar ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[200] flex">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-10 w-[280px] bg-[#F8FAFC] border-r border-[#D0E8E3] flex flex-col py-8 min-h-screen shadow-2xl">
            <div className="flex items-center justify-between px-6 mb-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-[#EBF9F6] border border-[#D0E8E3] shadow-sm">
                  <Zap size={20} className="text-[#0F172A]" fill="currentColor" />
                </div>
                <span className="font-heading font-extrabold text-[#0F172A] text-xl">NXUS</span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="w-8 h-8 rounded-full bg-[#EBF9F6] border border-[#D0E8E3] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <nav className="flex-1 flex flex-col gap-2 px-3">
              {mainMenuItems.map((item, i) => {
                const active = isActive(item);
                return (
                  <button key={i} onClick={() => handleNav(item.path)}
                    className={`w-full h-12 flex items-center rounded-[16px] transition-all px-3 gap-4 ${
                      active
                        ? 'bg-[#0F172A] text-[#F8FAFC] shadow-sm'
                        : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#EBF9F6]'
                    }`}
                  >
                    <item.icon size={20} strokeWidth={active ? 2.5 : 2} />
                    <span className="font-body font-bold text-[14px]">{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="mt-auto px-6 flex flex-col gap-6 pb-8">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-[#EBF9F6] border border-[#D0E8E3] text-[#64748B] hover:text-[#0F172A] hover:bg-[#D0E8E3] transition-colors"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <div className="flex items-center gap-3">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces&q=80"
                  alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-[#D0E8E3] object-cover"
                />
                <div>
                  <div className="font-body font-bold text-[14px] text-[#0F172A]">{displayName}</div>
                  <div className="font-body text-[12px] text-[#64748B]">{displayRole}</div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* ── Mobile: Bottom Nav ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-[150] bg-[#F8FAFC] border-t border-[#D0E8E3] flex items-center justify-around h-16 px-4 safe-area-bottom shadow-[0_-4px_16px_rgba(15,23,42,0.06)]">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex flex-col items-center gap-1 text-[#64748B] hover:text-[#0F172A] transition-colors"
        >
          <Menu size={20} />
          <span className="font-body text-[10px] font-bold uppercase tracking-wide">Menu</span>
        </button>
        {mainMenuItems.map((item, i) => {
          const active = isActive(item);
          return (
            <button key={i} onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 transition-colors ${
                active ? 'text-[#0F172A]' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              <item.icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span className="font-body text-[10px] font-bold uppercase tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="md:hidden h-16 fixed bottom-0 left-0 right-0 pointer-events-none" />
    </>
  );
}