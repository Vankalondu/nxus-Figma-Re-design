import { useState } from 'react';
import { OperationsHeader } from './OperationsHeader';
import { OperationsKPICards } from './OperationsKPICards';
import { ProvisionalPoolList } from './ProvisionalPoolList';
import { MissingFootageMatches } from './MissingFootageMatches';
import { ScoutQualityLeaderboard } from './ScoutQualityLeaderboard';
import { GlobalPulseDashboard } from './GlobalPulseDashboard';
import { VideoDepartmentDashboard } from './VideoDepartmentDashboard';

type DepartmentTab = 'global' | 'scouting' | 'video' | 'reviews';

export function OperationsDashboard() {
  const [activeTab, setActiveTab] = useState<DepartmentTab>('global');

  const tabs = [
    { id: 'global' as const, label: 'GLOBAL PULSE' },
    { id: 'scouting' as const, label: 'SCOUTING DEPT' },
    { id: 'video' as const, label: 'VIDEO & DATA DEPT' },
    { id: 'reviews' as const, label: 'FINAL REVIEWS' },
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Global Header */}
      <OperationsHeader />

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-[#0a0e1a] text-3xl mb-2" style={{ fontFamily: "'Figtree', sans-serif", fontWeight: 600 }}>
            Dashboard
          </h1>
          <p className="text-muted-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Welcome back, <span className="font-semibold text-[#0a0e1a]">Operations Officer</span>. Your weekly pipeline overview.
          </p>
        </div>

        {/* Department Navigation Tabs */}
        <div className="mb-8 bg-card border border-[#e8edf2] rounded-2xl p-2 inline-flex gap-2 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-3 rounded-xl text-sm font-bold tracking-wide transition-all ${
                activeTab === tab.id
                  ? 'bg-[#1E88E5] text-chalk shadow-sm'
                  : 'text-muted-foreground hover:text-[#0a0e1a] hover:bg-[#f8fafc]'
              }`}
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active View Content - Scouting Dept */}
        {activeTab === 'scouting' && (
          <div className="space-y-6">
            {/* Row 1: KPI Cards */}
            <OperationsKPICards />

            {/* Row 2: Provisional Pool & Missing Footage */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3">
                <ProvisionalPoolList />
              </div>
              <div className="lg:col-span-2">
                <MissingFootageMatches />
              </div>
            </div>

            {/* Row 3: Country & Regional Performance Leaderboard */}
            <div>
              <div className="mb-4">
                <h3 className="text-[#0a0e1a] text-xl font-semibold" style={{ fontFamily: "'Figtree', sans-serif" }}>
                  Country & Regional Performance
                </h3>
                <p className="text-muted-foreground text-sm mt-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  Track scout performance and Grade A player submissions by region
                </p>
              </div>
              <ScoutQualityLeaderboard />
            </div>
          </div>
        )}

        {/* Global Pulse Tab */}
        {activeTab === 'global' && <GlobalPulseDashboard />}

        {activeTab === 'video' && <VideoDepartmentDashboard />}

        {activeTab === 'reviews' && (
          <div className="bg-card border border-[#e8edf2] rounded-2xl p-12 text-center">
            <h3 className="text-[#0a0e1a] text-xl mb-2" style={{ fontFamily: "'Figtree', sans-serif", fontWeight: 600 }}>
              Final Reviews
            </h3>
            <p className="text-muted-foreground" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Senior scout review queue and grade conversion tracking.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}