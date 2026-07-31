import { RouterProvider, createBrowserRouter, Outlet, Navigate } from 'react-router';
import { ThemeProvider } from 'next-themes';
import LoginCredentials from './pages/LoginCredentials';
import LoginSuccess from './pages/LoginSuccess';
import CountryScoutDashboardPage from './pages/CountryScoutDashboard';
import HeadScoutDashboard from './pages/HeadScoutDashboard';
import SeniorScoutDashboard from './pages/SeniorScoutDashboard';
import LeadScoutDashboard from './pages/LeadScoutDashboard';
import VideoManagerDashboard from './pages/VideoManagerDashboard';
import PlayerProfile from './pages/PlayerProfile';
import AdminPage from './pages/AdminPage';
import { Toaster } from './components/ui/sonner';

function RootLayout() {
  return (
    <>
      <Outlet />
      <Toaster position="top-right" />
    </>
  );
}

function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-16 h-16 rounded-full bg-border flex items-center justify-center mb-4">
        <span style={{ fontSize: 28, color: '#7baac7' }}>404</span>
      </div>
      <h1 className="font-heading font-black text-[18px] text-foreground">Page not found</h1>
      <p className="font-body text-[14px] text-muted-foreground font-medium mt-2 max-w-xs text-center">
        The route you navigated to doesn't exist.
      </p>
      <button
        onClick={() => window.history.back()}
        className="mt-6 bg-primary border-2 border-primary text-white hover:bg-primary/80 rounded-full px-6 py-3 font-body font-bold text-[14px] transition-colors"
      >
        Go back
      </button>
    </div>
  );
}

function ErrorBoundaryPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <span style={{ fontSize: 24, color: '#EF4444' }}>!</span>
      </div>
      <h1 className="font-heading font-black text-[18px] text-foreground">Something went wrong</h1>
      <p className="font-body text-[14px] text-muted-foreground font-medium mt-2 max-w-xs text-center">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={() => (window.location.href = '/')}
        className="mt-6 bg-primary border-2 border-primary text-white hover:bg-primary/80 rounded-full px-6 py-3 font-body font-bold text-[14px] transition-colors"
      >
        Return to login
      </button>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    ErrorBoundary: ErrorBoundaryPage,
    children: [
      { index: true,           Component: LoginCredentials          },
      { path: 'login',         Component: LoginCredentials          },
      { path: 'choose-mode',   element: <Navigate to="/login-success" replace /> },
      { path: 'login-success', Component: LoginSuccess              },

      // Country Scout
      { path: 'country-scout',         Component: CountryScoutDashboardPage },
      { path: 'country-scout/players', Component: CountryScoutDashboardPage },
      { path: 'country-scout/matches', Component: CountryScoutDashboardPage },
      { path: 'country-scout/admin',   Component: CountryScoutDashboardPage },

      // Legacy bare paths
      { path: 'players',    Component: CountryScoutDashboardPage },
      { path: 'player/:id', Component: PlayerProfile             },
      { path: 'matches',    Component: CountryScoutDashboardPage },
      { path: 'admin',      Component: AdminPage                 },

      // Head Scout
      { path: 'head-scout',         Component: HeadScoutDashboard },
      { path: 'head-scout/players', Component: HeadScoutDashboard },
      { path: 'head-scout/matches', Component: HeadScoutDashboard },
      { path: 'head-scout/admin',   Component: HeadScoutDashboard },

      // Lead Scout
      { path: 'lead-scout',          Component: LeadScoutDashboard },
      { path: 'lead-scout/players',  Component: LeadScoutDashboard },
      { path: 'lead-scout/reports',  Component: LeadScoutDashboard },
      { path: 'lead-scout/matches',  Component: LeadScoutDashboard },
      { path: 'lead-scout/admin',    Component: LeadScoutDashboard },

      // Senior Scout
      { path: 'senior-scout',          Component: SeniorScoutDashboard },
      { path: 'senior-scout/players',  Component: SeniorScoutDashboard },
      { path: 'senior-scout/reports',  Component: SeniorScoutDashboard },
      { path: 'senior-scout/matches',  Component: SeniorScoutDashboard },
      { path: 'senior-scout/admin',    Component: SeniorScoutDashboard },
      { path: 'senior-scout/player/:id', Component: PlayerProfile },
      { path: 'lead-scout/player/:id',   Component: PlayerProfile },

      // Video Manager
      { path: 'video-manager',         Component: VideoManagerDashboard },
      { path: 'video-manager/players', Component: VideoManagerDashboard },
      { path: 'video-manager/matches', Component: VideoManagerDashboard },
      { path: 'video-manager/admin',   Component: VideoManagerDashboard },
      { path: 'video-manager/player/:id', Component: PlayerProfile },

      { path: '*', Component: NotFound },
    ],
  },
]);

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}