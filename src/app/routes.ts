import { createBrowserRouter } from "react-router";
import LoginDepartment from "./pages/LoginDepartment";
import LoginCredentials from "./pages/LoginCredentials";
import LoginSuccess from "./pages/LoginSuccess";
import CountryScoutDashboardPage from "./pages/CountryScoutDashboard";
import HeadScoutDashboard from "./pages/HeadScoutDashboard";
import SeniorScoutDashboard from "./pages/SeniorScoutDashboard";
import LeadScoutDashboard from "./pages/LeadScoutDashboard";
import PlayerProfile from "./pages/PlayerProfile";
import AdminPage from "./pages/AdminPage";

export const router = createBrowserRouter([
  { path: "/",               Component: LoginCredentials          },
  { path: "/login",          Component: LoginCredentials          },
  { path: "/choose-mode",    Component: LoginDepartment           },
  { path: "/login-success",  Component: LoginSuccess              },
  { path: "/country-scout",  Component: CountryScoutDashboardPage },
  { path: "/players",        Component: CountryScoutDashboardPage },
  { path: "/player/:id",     Component: PlayerProfile             },
  { path: "/matches",        Component: CountryScoutDashboardPage },
  { path: "/admin",          Component: CountryScoutDashboardPage },
  { path: "/head-scout",     Component: HeadScoutDashboard        },
  // Lead Scout — own dashboard, sub-pages prefixed
  { path: "/lead-scout",          Component: LeadScoutDashboard   },
  { path: "/lead-scout/players",  Component: LeadScoutDashboard   },
  { path: "/lead-scout/matches",  Component: LeadScoutDashboard   },
  { path: "/lead-scout/admin",    Component: LeadScoutDashboard   },
  // Senior Scout — own dashboard, sub-pages prefixed
  { path: "/senior-scout",          Component: SeniorScoutDashboard },
  { path: "/senior-scout/players",  Component: SeniorScoutDashboard },
  { path: "/senior-scout/matches",  Component: SeniorScoutDashboard },
  { path: "/senior-scout/admin",    Component: SeniorScoutDashboard },
]);