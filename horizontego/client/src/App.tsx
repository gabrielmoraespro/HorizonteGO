import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LoadingSpinner } from "./components/LoadingSpinner";

// Eager load critical pages
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

// Lazy load secondary pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Checklist = lazy(() => import("./pages/Checklist"));
const Calculator = lazy(() => import("./pages/Calculator"));
const Jobs = lazy(() => import("./pages/Jobs"));
const Documents = lazy(() => import("./pages/Documents"));
const Security = lazy(() => import("./pages/Security"));
const Pricing = lazy(() => import("./pages/Pricing"));
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const PaymentCancel = lazy(() => import("./pages/PaymentCancel"));
const Admin = lazy(() => import("./pages/Admin"));
const Applications = lazy(() => import("./pages/Applications"));
const Professions = lazy(() => import("./pages/Professions"));
const Profile = lazy(() => import("./pages/Profile"));

function Router() {
  return (
    <Suspense fallback={<LoadingSpinner text="Carregando..." />}>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/dashboard"} component={Dashboard} />
        <Route path={"/checklist"} component={Checklist} />
        <Route path={"/calculator"} component={Calculator} />
        <Route path={"/jobs"} component={Jobs} />
        <Route path={"/documents"} component={Documents} />
        <Route path={"/security"} component={Security} />
        <Route path={"/pricing"} component={Pricing} />
        <Route path={"/payment/success"} component={PaymentSuccess} />
        <Route path={"/payment/cancel"} component={PaymentCancel} />
        <Route path={"/admin"} component={Admin} />
        <Route path={"/applications"} component={Applications} />
        <Route path={"/professions"} component={Professions} />
        <Route path={"/profile"} component={Profile} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              classNames: {
                success: "bg-emerald-50 text-emerald-900 border-emerald-200",
                error: "bg-red-50 text-red-900 border-red-200",
                warning: "bg-amber-50 text-amber-900 border-amber-200",
                info: "bg-blue-50 text-blue-900 border-blue-200",
              },
            }}
          />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
