
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import SubscriptionGate from "@/components/auth/SubscriptionGate";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import DevicesPage from "./pages/DevicesPage";
import MapPage from "./pages/MapPage";
import ZonesPage from "./pages/ZonesPage";
import CropsPage from "./pages/CropsPage";
import WeatherPage from "./pages/WeatherPage";
import AutomationPage from "./pages/AutomationPage";
import SettingsPage from "./pages/SettingsPage";
import SubscriptionPlansPage from "./pages/SubscriptionPlansPage";
import SubscriptionSuccessPage from "./pages/SubscriptionSuccessPage";
import AdminConfigPage from "./pages/AdminConfigPage";
import DeviceConnectivity from "./pages/DeviceConnectivity";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import FarmersManagementPage from "./pages/admin/FarmersManagementPage";
import PaymentGatewaysPage from "./pages/admin/PaymentGatewaysPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/subscription/plans" element={
              <ProtectedRoute>
                <SubscriptionPlansPage />
              </ProtectedRoute>
            } />
            
            {/* Protected and subscription-required routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <SubscriptionGate>
                  <Dashboard />
                </SubscriptionGate>
              </ProtectedRoute>
            } />
            <Route path="/devices" element={
              <ProtectedRoute>
                <SubscriptionGate>
                  <DevicesPage />
                </SubscriptionGate>
              </ProtectedRoute>
            } />
            <Route path="/map" element={
              <ProtectedRoute>
                <SubscriptionGate>
                  <MapPage />
                </SubscriptionGate>
              </ProtectedRoute>
            } />
            <Route path="/zones" element={
              <ProtectedRoute>
                <SubscriptionGate>
                  <ZonesPage />
                </SubscriptionGate>
              </ProtectedRoute>
            } />
            <Route path="/crops" element={
              <ProtectedRoute>
                <SubscriptionGate>
                  <CropsPage />
                </SubscriptionGate>
              </ProtectedRoute>
            } />
            <Route path="/weather" element={
              <ProtectedRoute>
                <SubscriptionGate>
                  <WeatherPage />
                </SubscriptionGate>
              </ProtectedRoute>
            } />
            <Route path="/automation" element={
              <ProtectedRoute>
                <SubscriptionGate>
                  <AutomationPage />
                </SubscriptionGate>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <SubscriptionGate>
                  <SettingsPage />
                </SubscriptionGate>
              </ProtectedRoute>
            } />
            <Route path="/connectivity" element={
              <ProtectedRoute>
                <SubscriptionGate>
                  <DeviceConnectivity />
                </SubscriptionGate>
              </ProtectedRoute>
            } />
            
            {/* Protected route with no subscription requirement */}
            <Route path="/subscription/success" element={
              <ProtectedRoute>
                <SubscriptionSuccessPage />
              </ProtectedRoute>
            } />
            
            {/* Admin only routes */}
            <Route 
              path="/admin/config" 
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <AdminConfigPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/farmers" 
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <FarmersManagementPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/payment-gateways" 
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <PaymentGatewaysPage />
                </ProtectedRoute>
              } 
            />
            
            {/* 404 page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
