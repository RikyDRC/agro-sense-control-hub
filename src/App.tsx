
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/devices" element={<ProtectedRoute><DevicesPage /></ProtectedRoute>} />
            <Route path="/map" element={<ProtectedRoute><MapPage /></ProtectedRoute>} />
            <Route path="/zones" element={<ProtectedRoute><ZonesPage /></ProtectedRoute>} />
            <Route path="/crops" element={<ProtectedRoute><CropsPage /></ProtectedRoute>} />
            <Route path="/weather" element={<ProtectedRoute><WeatherPage /></ProtectedRoute>} />
            <Route path="/automation" element={<ProtectedRoute><AutomationPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            <Route path="/connectivity" element={<ProtectedRoute><DeviceConnectivity /></ProtectedRoute>} />
            <Route path="/subscription/plans" element={<ProtectedRoute><SubscriptionPlansPage /></ProtectedRoute>} />
            <Route path="/subscription/success" element={<ProtectedRoute><SubscriptionSuccessPage /></ProtectedRoute>} />
            <Route 
              path="/admin/config" 
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <AdminConfigPage />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
