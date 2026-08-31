import { Moon, User } from 'lucide-react';
import { Input } from './ui/input';

export function Header() {
  return (
    <header className="border-b bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="text-2xl">NXUS</div>
          <nav className="flex gap-6">
            <a href="#" className="text-blue-600">Review</a>
            <a href="#" className="text-muted-foreground hover:text-foreground">Raise</a>
            <a href="#" className="text-muted-foreground hover:text-foreground">Insights</a>
            <a href="#" className="text-muted-foreground hover:text-foreground">Matches</a>
            <a href="#" className="text-muted-foreground hover:text-foreground">Videos</a>
            <a href="#" className="text-muted-foreground hover:text-foreground">Admin</a>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Input 
            type="text" 
            placeholder="Search players..." 
            className="w-64"
          />
          <button className="p-2 hover:bg-accent rounded-full">
            <Moon className="w-5 h-5" />
          </button>
          <button className="p-2 hover:bg-accent rounded-full relative">
            <User className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 bg-blue-500 text-chalk text-xs rounded-full w-4 h-4 flex items-center justify-center">5</span>
          </button>
        </div>
      </div>
    </header>
  );
}