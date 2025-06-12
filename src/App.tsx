
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { SubscriptionGate } from '@/components/auth/SubscriptionGate';

// Pages
import Index from '@/pages/Index';
import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/AuthPage';
import Dashboard from '@/pages/Dashboard';
import DevicesPage from '@/pages/DevicesPage';
import ZonesPage from '@/pages/ZonesPage';
import AutomationPage from '@/pages/AutomationPage';
import MapPage from '@/pages/MapPage';
import WeatherPage from '@/pages/WeatherPage';
import CropsPage from '@/pages/CropsPage';
import SettingsPage from '@/pages/SettingsPage';
import DeviceConnectivity from '@/pages/DeviceConnectivity';
import SubscriptionPlansPage from '@/pages/SubscriptionPlansPage';
import SubscriptionSuccessPage from '@/pages/SubscriptionSuccessPage';
import SubscriptionPendingPage from '@/pages/SubscriptionPendingPage';
import AdminConfigPage from '@/pages/AdminConfigPage';
import FarmersManagementPage from '@/pages/admin/FarmersManagementPage';
import ContactSubmissionsPage from '@/pages/admin/ContactSubmissionsPage';
import PaymentGatewaysPage from '@/pages/admin/PaymentGatewaysPage';
import ContactFormPage from '@/pages/ContactFormPage';
import NotFound from '@/pages/NotFound';

// New landing pages
import FeaturesPage from '@/pages/FeaturesPage';
import PricingPage from '@/pages/PricingPage';
import AboutPage from '@/pages/AboutPage';
import IntegrationsPage from '@/pages/IntegrationsPage';
import DocumentationPage from '@/pages/DocumentationPage';
import BlogPage from '@/pages/BlogPage';
import CareersPage from '@/pages/CareersPage';
import ContactPage from '@/pages/ContactPage';
import HelpCenterPage from '@/pages/HelpCenterPage';
import CommunityPage from '@/pages/CommunityPage';
import StatusPage from '@/pages/StatusPage';
import ApiDocsPage from '@/pages/ApiDocsPage';

// Initialize i18n
import '@/i18n/config';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-background">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/integrations" element={<IntegrationsPage />} />
              <Route path="/documentation" element={<DocumentationPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/careers" element={<CareersPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/help-center" element={<HelpCenterPage />} />
              <Route path="/community" element={<CommunityPage />} />
              <Route path="/status" element={<StatusPage />} />
              <Route path="/api-docs" element={<ApiDocsPage />} />
              
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/contact-form" element={<ContactFormPage />} />
              
              {/* Subscription routes */}
              <Route path="/subscription/plans" element={<SubscriptionPlansPage />} />
              <Route path="/subscription/success" element={<SubscriptionSuccessPage />} />
              <Route path="/subscription/pending" element={<SubscriptionPendingPage />} />
              
              {/* Protected routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <SubscriptionGate>
                      <Dashboard />
                    </SubscriptionGate>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/devices" 
                element={
                  <ProtectedRoute>
                    <SubscriptionGate>
                      <DevicesPage />
                    </SubscriptionGate>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/zones" 
                element={
                  <ProtectedRoute>
                    <SubscriptionGate>
                      <ZonesPage />
                    </SubscriptionGate>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/automation" 
                element={
                  <ProtectedRoute>
                    <SubscriptionGate>
                      <AutomationPage />
                    </SubscriptionGate>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/map" 
                element={
                  <ProtectedRoute>
                    <SubscriptionGate>
                      <MapPage />
                    </SubscriptionGate>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/weather" 
                element={
                  <ProtectedRoute>
                    <SubscriptionGate>
                      <WeatherPage />
                    </SubscriptionGate>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/crops" 
                element={
                  <ProtectedRoute>
                    <SubscriptionGate>
                      <CropsPage />
                    </SubscriptionGate>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/device-connectivity" 
                element={
                  <ProtectedRoute>
                    <SubscriptionGate>
                      <DeviceConnectivity />
                    </SubscriptionGate>
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin routes */}
              <Route 
                path="/admin" 
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminConfigPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/farmers" 
                element={
                  <ProtectedRoute requireAdmin>
                    <FarmersManagementPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/contact-submissions" 
                element={
                  <ProtectedRoute requireAdmin>
                    <ContactSubmissionsPage />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/admin/payment-gateways" 
                element={
                  <ProtectedRoute requireAdmin>
                    <PaymentGatewaysPage />
                  </ProtectedRoute>
                } 
              />
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
