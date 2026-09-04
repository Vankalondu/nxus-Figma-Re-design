import { Moon, User } from 'lucide-react';
import { Input } from './ui/input';

export function Header() {
  return (
    <header className="border-b bg-surface-card px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="text-2xl">NXUS</div>
          <nav className="flex gap-6">
            <a href="#" className="text-brand-primary">Review</a>
            <a href="#" className="text-text-body hover:text-text-strong">Raise</a>
            <a href="#" className="text-text-body hover:text-text-strong">Insights</a>
            <a href="#" className="text-text-body hover:text-text-strong">Matches</a>
            <a href="#" className="text-text-body hover:text-text-strong">Videos</a>
            <a href="#" className="text-text-body hover:text-text-strong">Admin</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Input 
            type="text" 
            placeholder="Search players..." 
            className="w-64"
          />
          <button className="p-2 hover:bg-surface-accent rounded-full">
            <Moon className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-surface-accent rounded-full relative">
            <User className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-brand-primary text-text-on-brand text-xs rounded-full w-4 h-4 flex items-center justify-center">5</span>
          </button>
        </div>
      </div>
    </header>
  );
}