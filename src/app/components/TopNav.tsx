import React, { useState } from 'react';
import { Search, Bell, Calendar, FileText, Plus, Menu, X, Moon, Sun, UploadCloud } from 'lucide-react';
import { useTheme } from 'next-themes';
import { PlayerSearch } from './PlayerSearch';

// Shared top navigation bar. The parts that differ between dashboards
// (role pill / toggle, notification panel, profile menu) are passed as
// slots so each caller keeps its own state and behaviour; the common
// shell (search, dividers, bell, action buttons, avatar) lives here.
interface TopNavProps {
  rolePill: React.ReactNode;
  searchPlaceholder?: string;
  unreadCount?: number;
  notifOpen?: boolean;
  onNotifToggle?: () => void;
  notifPanel?: React.ReactNode;
  onThisWeek?: () => void;
  onAddReport?: () => void; // omit to hide the button (Country Scout)
  onAddPlayer?: () => void;
  onUploadVideo?: () => void; // uploader roles (primary); Video Manager (secondary)
  uploadVideoVariant?: 'primary' | 'secondary';
  avatarImg: string;
  profileOpen?: boolean;
  onProfileToggle?: () => void;
  profileMenu?: React.ReactNode;
  responsive?: boolean; // Country Scout uses md: breakpoints
  sticky?: boolean; // dashboards stick; the profile does not
}

export function TopNav({
  rolePill,
  searchPlaceholder = 'Search...',
  unreadCount = 0,
  notifOpen,
  onNotifToggle,
  notifPanel,
  onThisWeek,
  onAddReport,
  onAddPlayer,
  onUploadVideo,
  uploadVideoVariant = 'primary',
  avatarImg,
  profileOpen,
  onProfileToggle,
  profileMenu,
  responsive = false,
  sticky = true,
}: TopNavProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const mx = responsive ? 'mx-4 md:mx-8' : 'mx-8';
  const pl = responsive ? 'pl-2 md:pl-6' : 'pl-6';
  // On mobile: full search field is hidden (a search icon expands it instead),
  // dividers hidden, and secondary actions collapse so the bar always fits.
  const searchCls = responsive ? 'hidden md:flex w-24 lg:w-56' : 'flex w-64';
  const divCls = responsive ? 'hidden md:block' : 'block';
  const secondaryCls = responsive ? 'hidden md:flex' : 'flex';
  const btnText = responsive ? 'hidden lg:inline' : '';
  const btnPad = responsive ? 'px-3 lg:px-6' : 'px-6';
  const actionsGap = responsive ? 'gap-2 lg:gap-3' : 'gap-3';
  const bandPadX = responsive ? 'px-4 md:px-8' : 'px-8';

  return (
    <div className={(sticky ? 'sticky top-0 z-50 short:static short:top-auto short:z-auto bg-background ' : '') + bandPadX + ' pt-4 pb-2 short:pt-1 short:pb-1 shrink-0'}>
    <div className={'relative z-50 flex items-center justify-between gap-2 bg-card border border-border p-2 ' + pl + ' rounded-[20px] shadow-[var(--shadow-xl)]'}>
      {/* Hamburger — mobile only; opens the Sidebar drawer via a decoupled event */}
      {responsive && (
        <button onClick={() => window.dispatchEvent(new CustomEvent('nxus:open-menu'))} aria-label="Open menu"
          className="md:hidden w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-foreground shrink-0">
          <Menu size={18} />
        </button>
      )}

      {/* Player search — live dropdown; full field on desktop/tablet */}
      <PlayerSearch className={searchCls} />

      {/* Search — icon that expands on mobile */}
      {responsive && (
        <button onClick={() => setSearchOpen(true)} aria-label="Search"
          className="md:hidden w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground shrink-0">
          <Search size={18} />
        </button>
      )}

      <div className={'w-px h-8 bg-secondary ' + divCls} />
      {rolePill}
      <div className={'w-px h-8 bg-secondary ' + divCls} />

      <div className={'flex items-center shrink-0 ' + actionsGap}>
        <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme"
          className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors shadow-sm shrink-0">
          {theme === 'dark' ? <Sun size={16} className="text-foreground" /> : <Moon size={16} className="text-foreground" />}
        </button>
        <div className="relative">
          <button onClick={onNotifToggle} className="relative w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors shadow-sm">
            <Bell size={16} className="text-foreground" />
            {unreadCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full text-white text-micro font-black flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>
          {notifOpen && notifPanel}
        </div>

        {onThisWeek && (
          <button onClick={onThisWeek} className={secondaryCls + ' items-center gap-2 ' + btnPad + ' py-3 bg-transparent border-2 border-primary text-foreground hover:bg-primary/10 rounded-full font-body text-body-sm font-bold transition-colors'}>
            <Calendar size={15} strokeWidth={2.5} /><span className={btnText}>This Week</span>
          </button>
        )}

        {onAddReport && (
          <button onClick={onAddReport} className={secondaryCls + ' items-center gap-2 ' + btnPad + ' py-3 bg-transparent border-2 border-primary text-foreground hover:bg-primary/10 rounded-full font-body text-body-sm font-bold transition-colors'}>
            <FileText size={15} strokeWidth={2.5} /><span className={btnText}>Add Report</span>
          </button>
        )}

        {onUploadVideo && (
          <button onClick={onUploadVideo}
            className={(uploadVideoVariant === 'secondary' ? secondaryCls : 'flex') + ' items-center gap-2 ' + btnPad + ' py-3 rounded-full font-body text-body-sm font-bold transition-colors ' + (uploadVideoVariant === 'secondary' ? 'bg-transparent border-2 border-primary text-foreground hover:bg-primary/10' : 'bg-primary border-2 border-primary text-white hover:bg-primary/80 shadow-md')}>
            <UploadCloud size={15} strokeWidth={2.5} /><span className={btnText}>Upload Video</span>
          </button>
        )}

        {onAddPlayer && (
          <button onClick={onAddPlayer} className={'flex items-center gap-2 ' + btnPad + ' py-3 bg-primary border-2 border-primary text-white hover:bg-primary/80 rounded-full font-body text-body-sm font-bold transition-colors shadow-md'}>
            <Plus size={15} strokeWidth={3} /><span className={btnText}>Add Player</span>
          </button>
        )}

        <div className="relative">
          <button onClick={onProfileToggle} className="w-11 h-11 rounded-full overflow-hidden border-2 border-border cursor-pointer hover:ring-2 hover:ring-primary transition-all shrink-0">
            <img src={avatarImg} alt="User" className="w-full h-full object-cover" />
          </button>
          {profileOpen && profileMenu}
        </div>
      </div>

      {/* Mobile expanded search overlay */}
      {responsive && searchOpen && (
        <div className="md:hidden absolute inset-0 z-20 flex items-center gap-3 bg-card rounded-[20px] px-4">
          <PlayerSearch className="flex-1 min-w-0" autoFocus />
          <button onClick={() => setSearchOpen(false)} aria-label="Close search" className="shrink-0 text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>
      )}
    </div>
    </div>
  );
}
