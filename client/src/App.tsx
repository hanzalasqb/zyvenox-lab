import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import SiteShell from "./components/SiteShell";
import { AboutPage, ContactPage, Home, ProjectsPage, ServicesPage, SuccessPage } from "./pages/PublicPages";
import AdminPage from "./pages/AdminPage";
import ClientPortal from "./pages/ClientPortal";

function PublicRoute({ children, breadcrumbLabel }: { children: React.ReactNode; breadcrumbLabel?: string }) {
  return <SiteShell breadcrumbLabel={breadcrumbLabel}>{children}</SiteShell>;
}

function Router() {
  return <Switch>
    <Route path="/" component={() => <PublicRoute><Home /></PublicRoute>} />
    <Route path="/services" component={() => <PublicRoute breadcrumbLabel="Services"><ServicesPage /></PublicRoute>} />
    <Route path="/projects" component={() => <PublicRoute breadcrumbLabel="Projects"><ProjectsPage /></PublicRoute>} />
    <Route path="/success-rate" component={() => <PublicRoute breadcrumbLabel="Success rate"><SuccessPage /></PublicRoute>} />
    <Route path="/about" component={() => <PublicRoute breadcrumbLabel="About"><AboutPage /></PublicRoute>} />
    <Route path="/contact" component={() => <PublicRoute breadcrumbLabel="Contact"><ContactPage /></PublicRoute>} />
    <Route path="/portal" component={ClientPortal} />
    <Route path="/admin12-45" component={AdminPage} />
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="dark" switchable><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

export default App;
