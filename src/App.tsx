
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { HelmetProvider } from 'react-helmet-async';
import { Skeleton } from "@/components/ui/skeleton";
import "./App.css";

// Lazy load components for better performance
const LandingPage = lazy(() => import("./pages/LandingPage"));
const OptimizedLandingPage = lazy(() => import("./pages/OptimizedLandingPage"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AuthPage = lazy(() => import("./pages/AuthPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const DevicesPage = lazy(() => import("./pages/DevicesPage"));
const ZonesPage = lazy(() => import("./pages/ZonesPage"));
const AutomationPage = lazy(() => import("./pages/AutomationPage"));
const CropsPage = lazy(() => import("./pages/CropsPage"));
const MapPage = lazy(() => import("./pages/MapPage"));
const WeatherPage = lazy(() => import("./pages/WeatherPage"));
const DeviceConnectivity = lazy(() => import("./pages/DeviceConnectivity"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Create a client with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

const LoadingFallback = () => (
  <div className="min-h-screen bg-gray-50 p-4">
    <div className="max-w-7xl mx-auto space-y-6">
      <Skeleton className="h-16 w-full" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  </div>
);

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<OptimizedLandingPage />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/devices" element={<DevicesPage />} />
                  <Route path="/zones" element={<ZonesPage />} />
                  <Route path="/automation" element={<AutomationPage />} />
                  <Route path="/crops" element={<CropsPage />} />
                  <Route path="/map" element={<MapPage />} />
                  <Route path="/weather" element={<WeatherPage />} />
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
