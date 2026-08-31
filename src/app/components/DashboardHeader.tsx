import { Search, Bell, Calendar, Plus } from 'lucide-react';

export function DashboardHeader() {
  return (
    <header className="bg-card/60 border-b border-border px-8 py-4 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9ca3af]" />
            <input
              type="text"
              placeholder="Search players, teams, matches..."
              className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2 text-[#333640] placeholder-[#9ca3af] focus:outline-none focus:border-[#1E88E5]"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-card text-[#333640] rounded-lg hover:bg-[#f0f4f8] transition-colors border border-border"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <Calendar className="w-4 h-4" />
            <span>This Week</span>
          </button>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1E88E5] text-chalk rounded-lg hover:bg-[#1976D2] transition-colors"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <Plus className="w-4 h-4" />
            <span>Add Player</span>
          </button>

          <button className="relative p-2 text-[#333640] hover:text-[#1E88E5] transition-colors">
            <Bell className="w-6 h-6" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#1E88E5] rounded-full" />
          </button>
        </div>
      </div>
    </header>
  );
}