
import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SubscriptionGate from '@/components/auth/SubscriptionGate';

// Import pages
import LandingPage from '@/pages/LandingPage';
import AuthPage from '@/pages/AuthPage';
import Dashboard from '@/pages/Dashboard';
import DevicesPage from '@/pages/DevicesPage';
import ZonesPage from '@/pages/ZonesPage';
import AutomationPage from '@/pages/AutomationPage';
import CropsPage from '@/pages/CropsPage';
import WeatherPage from '@/pages/WeatherPage';
import MapPage from '@/pages/MapPage';
import SettingsPage from '@/pages/SettingsPage';
import DeviceConnectivity from '@/pages/DeviceConnectivity';
import NotFound from '@/pages/NotFound';

// Import admin pages
import FarmersManagementPage from '@/pages/admin/FarmersManagementPage';
import ContactSubmissionsPage from '@/pages/admin/ContactSubmissionsPage';
import BroadcastMessagesPage from '@/pages/admin/BroadcastMessagesPage';
import AdminConfigPage from '@/pages/AdminConfigPage';
import PaymentGatewaysPage from '@/pages/admin/PaymentGatewaysPage';

// Import other pages
import PricingPage from '@/pages/PricingPage';
import FeaturesPage from '@/pages/FeaturesPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import ContactFormPage from '@/pages/ContactFormPage';
import SubscriptionPlansPage from '@/pages/SubscriptionPlansPage';
import SubscriptionSuccessPage from '@/pages/SubscriptionSuccessPage';
import SubscriptionPendingPage from '@/pages/SubscriptionPendingPage';
import BlogPage from '@/pages/BlogPage';
import DocumentationPage from '@/pages/DocumentationPage';
import ApiDocsPage from '@/pages/ApiDocsPage';
import HelpCenterPage from '@/pages/HelpCenterPage';
import CommunityPage from '@/pages/CommunityPage';
import IntegrationsPage from '@/pages/IntegrationsPage';
import StatusPage from '@/pages/StatusPage';
import CareersPage from '@/pages/CareersPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/features" element={<FeaturesPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/contact-form" element={<ContactFormPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/documentation" element={<DocumentationPage />} />
                  <Route path="/api-docs" element={<ApiDocsPage />} />
                  <Route path="/help" element={<HelpCenterPage />} />
                  <Route path="/community" element={<CommunityPage />} />
                  <Route path="/integrations" element={<IntegrationsPage />} />
                  <Route path="/status" element={<StatusPage />} />
                  <Route path="/careers" element={<CareersPage />} />
                  
                  {/* Subscription routes */}
                  <Route path="/subscription/plans" element={<SubscriptionPlansPage />} />
                  <Route path="/subscription/success" element={<SubscriptionSuccessPage />} />
                  <Route path="/subscription/pending" element={<SubscriptionPendingPage />} />

                  {/* Protected routes */}
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

                  {/* Admin routes */}
                  <Route path="/admin/farmers" element={
                    <ProtectedRoute requireAdmin>
                      <FarmersManagementPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/admin/contact-submissions" element={
                    <ProtectedRoute requireAdmin>
                      <ContactSubmissionsPage />
                    </ProtectedRoute>
                  } />

                  <Route path="/admin/broadcast-messages" element={
                    <ProtectedRoute requireAdmin>
                      <BroadcastMessagesPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/admin/config" element={
                    <ProtectedRoute requireSuperAdmin>
                      <AdminConfigPage />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/admin/payments" element={
                    <ProtectedRoute requireSuperAdmin>
                      <PaymentGatewaysPage />
                    </ProtectedRoute>
                  } />
                  
                  {/* 404 route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <Toaster />
              <Sonner />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
