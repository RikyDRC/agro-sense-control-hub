
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
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
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

const App = () => (
  <>
    <TooltipProvider>
      <Toaster />
      <Sonner />
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
    </TooltipProvider>
  </>
);

export default App;
