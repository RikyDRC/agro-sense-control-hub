import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { HelmetProvider } from 'react-helmet-async';

// Lazy load pages for better performance
const OptimizedLandingPage = lazy(() => import("./pages/OptimizedLandingPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const DevicesPage = lazy(() => import("./pages/DevicesPage"));
const ZonesPage = lazy(() => import("./pages/ZonesPage"));
const AutomationPage = lazy(() => import("./pages/AutomationPage"));
const CropsPage = lazy(() => import("./pages/CropsPage"));
const WeatherPage = lazy(() => import("./pages/WeatherPage"));
const MapPage = lazy(() => import("./pages/MapPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const SubscriptionPlansPage = lazy(() => import("./pages/SubscriptionPlansPage"));
const SubscriptionSuccessPage = lazy(() => import("./pages/SubscriptionSuccessPage"));
const SubscriptionPendingPage = lazy(() => import("./pages/SubscriptionPendingPage"));
const DeviceConnectivity = lazy(() => import("./pages/DeviceConnectivity"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Create a client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
      refetchOnWindowFocus: false,
      retry: 3,
    },
  },
});

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <Suspense fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
                </div>
              }>
                <Routes>
                  <Route path="/" element={<OptimizedLandingPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/devices" element={<DevicesPage />} />
                  <Route path="/zones" element={<ZonesPage />} />
                  <Route path="/automation" element={<AutomationPage />} />
                  <Route path="/crops" element={<CropsPage />} />
                  <Route path="/weather" element={<WeatherPage />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/subscription-plans" element={<SubscriptionPlansPage />} />
                  <Route path="/subscription-success" element={<SubscriptionSuccessPage />} />
                  <Route path="/subscription-pending" element={<SubscriptionPendingPage />} />
                  <Route path="/device-connectivity" element={<DeviceConnectivity />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
