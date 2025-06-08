
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import SubscriptionGate from "@/components/auth/SubscriptionGate";

// Pages
import Index from "./pages/Index";
import LandingPage from "./pages/LandingPage";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import DevicesPage from "./pages/DevicesPage";
import ZonesPage from "./pages/ZonesPage";
import AutomationPage from "./pages/AutomationPage";
import CropsPage from "./pages/CropsPage";
import WeatherPage from "./pages/WeatherPage";
import MapPage from "./pages/MapPage";
import SettingsPage from "./pages/SettingsPage";
import DeviceConnectivity from "./pages/DeviceConnectivity";
import SubscriptionPlansPage from "./pages/SubscriptionPlansPage";
import SubscriptionSuccessPage from "./pages/SubscriptionSuccessPage";
import ContactFormPage from "./pages/ContactFormPage";
import SubscriptionPendingPage from "./pages/SubscriptionPendingPage";
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminConfigPage from "./pages/AdminConfigPage";
import FarmersManagementPage from "./pages/admin/FarmersManagementPage";
import PaymentGatewaysPage from "./pages/admin/PaymentGatewaysPage";
import ContactSubmissionsPage from "./pages/admin/ContactSubmissionsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/subscription/plans" element={<SubscriptionPlansPage />} />
            <Route path="/subscription/success" element={<SubscriptionSuccessPage />} />
            
            {/* Protected routes that require authentication */}
            <Route path="/contact" element={
              <ProtectedRoute>
                <ContactFormPage />
              </ProtectedRoute>
            } />
            <Route path="/subscription/pending" element={
              <ProtectedRoute>
                <SubscriptionPendingPage />
              </ProtectedRoute>
            } />
            
            {/* Protected routes that require authentication AND subscription */}
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
            <Route path="/zones" element={
              <ProtectedRoute>
                <SubscriptionGate>
                  <ZonesPage />
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
            <Route path="/map" element={
              <ProtectedRoute>
                <SubscriptionGate>
                  <MapPage />
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
            <Route path="/device-connectivity" element={
              <ProtectedRoute>
                <SubscriptionGate>
                  <DeviceConnectivity />
                </SubscriptionGate>
              </ProtectedRoute>
            } />

            {/* Admin-only routes */}
            <Route path="/admin/config" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <AdminConfigPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/farmers" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                <FarmersManagementPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/payments" element={
              <ProtectedRoute allowedRoles={['super_admin']}>
                <PaymentGatewaysPage />
              </ProtectedRoute>
            } />
            <Route path="/admin/contact-submissions" element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                <ContactSubmissionsPage />
              </ProtectedRoute>
            } />

            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
