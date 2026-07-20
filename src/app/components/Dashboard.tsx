import { Outlet } from 'react-router';
import { Sidebar } from './Sidebar';
import { DashboardHeader } from './DashboardHeader';

export function Dashboard() {
  return (
    <div className="flex h-screen bg-background" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <DashboardHeader />
        <Outlet />
      </main>
    </div>
  );
}
