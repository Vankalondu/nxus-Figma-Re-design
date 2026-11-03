import { RouterProvider, createBrowserRouter, Outlet, Navigate } from 'react-router';
import { ThemeProvider } from 'next-themes';
import LoginCredentials from './pages/LoginCredentials';
import LoginSuccess from './pages/LoginSuccess';
import CountryScoutDashboardPage from './pages/CountryScoutDashboard';
import HeadScoutDashboard from './pages/HeadScoutDashboard';
import SeniorScoutDashboard from './pages/SeniorScoutDashboard';
import LeadScoutDashboard from './pages/LeadScoutDashboard';
import VideoManagerDashboard from './pages/VideoManagerDashboard';
import UploaderDashboard from './pages/UploaderDashboard';
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-page">
      <div className="w-16 h-16 rounded-full bg-border-default flex items-center justify-center mb-4">
        <span className="type-h4" style={{ color: 'var(--text-body)' }}>404</span>
      </div>
      <h1 className="font-heading font-black type-h6 text-heading">Page not found</h1>
      <p className="font-body type-body-sm text-body font-medium mt-2 max-w-xs text-center">
        The route you navigated to doesn't exist.
      </p>
      <button
        onClick={() => window.history.back()}
        className="mt-6 bg-brand-primary border-2 border-brand-primary text-on-brand hover:bg-brand-primary/80 rounded-full px-6 py-3 font-body font-bold type-body-sm transition-colors"
      >
        Go back
      </button>
    </div>
  );
}

function TokensRedirect() {
  // A full page load, not a router navigation: Storybook is a separate static site.
  window.location.replace('/storybook/?path=/docs/guides-design-tokens--docs');
  return null;
}

function ErrorBoundaryPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-surface-page">
      <div className="w-16 h-16 rounded-full bg-status-error/10 flex items-center justify-center mb-4">
        <span className="type-h5" style={{ color: 'var(--status-error)' }}>!</span>
      </div>
      <h1 className="font-heading font-black type-h6 text-heading">Something went wrong</h1>
      <p className="font-body type-body-sm text-body font-medium mt-2 max-w-xs text-center">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={() => (window.location.href = '/')}
        className="mt-6 bg-brand-primary border-2 border-brand-primary text-on-brand hover:bg-brand-primary/80 rounded-full px-6 py-3 font-body font-bold type-body-sm transition-colors"
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
      // Token downloads moved into Storybook (Guides/Design Tokens). Kept as a redirect
      // because /tokens was already shared as the address.
      { path: 'tokens',        Component: TokensRedirect            },

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
      // Every account keeps its own route prefix on the profile (P-CO24, D-20).
      { path: 'country-scout/player/:id', Component: PlayerProfile },
      { path: 'head-scout/player/:id',    Component: PlayerProfile },
      { path: 'package-uploader/player/:id',    Component: PlayerProfile },
      { path: 'full-match-uploader/player/:id', Component: PlayerProfile },
      { path: 'lead-scout/player/:id',   Component: PlayerProfile },

      // Video Manager
      { path: 'video-manager',         Component: VideoManagerDashboard },
      { path: 'video-manager/players', Component: VideoManagerDashboard },
      { path: 'video-manager/matches', Component: VideoManagerDashboard },
      { path: 'video-manager/admin',   Component: VideoManagerDashboard },
      { path: 'video-manager/player/:id', Component: PlayerProfile },

      // Package Uploader
      { path: 'package-uploader',         Component: UploaderDashboard },
      { path: 'package-uploader/players', Component: UploaderDashboard },
      { path: 'package-uploader/matches', Component: UploaderDashboard },
      { path: 'package-uploader/admin',   Component: UploaderDashboard },

      // Full Match Uploader
      { path: 'full-match-uploader',         Component: UploaderDashboard },
      { path: 'full-match-uploader/players', Component: UploaderDashboard },
      { path: 'full-match-uploader/matches', Component: UploaderDashboard },
      { path: 'full-match-uploader/admin',   Component: UploaderDashboard },

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