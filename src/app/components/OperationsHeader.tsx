import { Search, Calendar, Plus, Bell } from 'lucide-react';
import { useState } from 'react';

export function OperationsHeader() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="bg-surface-card border-b border-[#e0e7ef] px-6 py-4">
      <div className="flex items-center gap-4 max-w-[1800px] mx-auto">
        {/* Search Bar */}
        <div className="flex-1 max-w-2xl relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#94a3b8]" />
          <input
            type="text"
            placeholder="Search players, teams, matches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[var(--light-50)] border border-[var(--light-200)] rounded-xl text-[var(--navy-800)] placeholder:text-[#94a3b8] focus:outline-none focus:ring-2 focus:ring-[#1E88E5]/20 focus:border-[#1E88E5] transition-all"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          />
        </div>

        {/* Date Picker */}
        <button className="flex items-center gap-2 px-4 py-3 bg-[var(--light-50)] border border-[var(--light-200)] rounded-xl hover:bg-[var(--light-100)] transition-all">
          <Calendar className="w-5 h-5 text-body" />
          <span className="text-[var(--navy-800)] font-medium" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            This Week
          </span>
        </button>

        {/* Add Player Button */}
        <button className="flex items-center gap-2 px-5 py-3 bg-[#1E88E5] text-on-brand rounded-xl hover:bg-[#1976D2] transition-all shadow-sm hover:shadow-md font-semibold">
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Add Player</span>
        </button>

        {/* Notification Bell */}
        <button className="relative p-3 hover:bg-[var(--light-50)] rounded-xl transition-all">
          <Bell className="w-5 h-5 text-body" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#E53935] rounded-full ring-2 ring-text-on-brand" />
        </button>
      </div>
    </div>
  );
}