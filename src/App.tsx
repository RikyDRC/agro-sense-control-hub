

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import pages
import Index from '@/pages/LandingPage';
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
import FarmersManagementPage from '@/pages/admin/FarmersManagementPage';
import ContactSubmissionsPage from '@/pages/admin/ContactSubmissionsPage';
import BroadcastMessagesPage from '@/pages/admin/BroadcastMessagesPage';
import PaymentGatewaysPage from '@/pages/admin/PaymentGatewaysPage';
import NotFound from '@/pages/NotFound';
import FeaturesPage from '@/pages/FeaturesPage';
import PricingPage from '@/pages/PricingPage';
import AboutPage from '@/pages/AboutPage';
import BlogPage from '@/pages/BlogPage';
import CareersPage from '@/pages/CareersPage';
import ContactPage from '@/pages/ContactPage';
import IntegrationsPage from '@/pages/IntegrationsPage';
import DocumentationPage from '@/pages/DocumentationPage';
import HelpCenterPage from '@/pages/HelpCenterPage';
import CommunityPage from '@/pages/CommunityPage';
import StatusPage from '@/pages/StatusPage';
import ApiDocsPage from '@/pages/ApiDocsPage';
import SubscriptionPlansPage from '@/pages/SubscriptionPlansPage';
import SubscriptionSuccessPage from '@/pages/SubscriptionSuccessPage';
import SubscriptionPendingPage from '@/pages/SubscriptionPendingPage';

// Import contexts
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Create a query client
const queryClient = new QueryClient();

import PlatformPagesPage from '@/pages/admin/PlatformPagesPage';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/integrations" element={<IntegrationsPage />} />
            <Route path="/documentation" element={<DocumentationPage />} />
            <Route path="/help-center" element={<HelpCenterPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/status" element={<StatusPage />} />
            <Route path="/api-docs" element={<ApiDocsPage />} />
            <Route path="/subscription-plans" element={<SubscriptionPlansPage />} />
            <Route path="/subscription-success" element={<SubscriptionSuccessPage />} />
            <Route path="/subscription-pending" element={<SubscriptionPendingPage />} />

            {/* Protected routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/devices"
              element={
                <ProtectedRoute>
                  <DevicesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/zones"
              element={
                <ProtectedRoute>
                  <ZonesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/automation"
              element={
                <ProtectedRoute>
                  <AutomationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/crops"
              element={
                <ProtectedRoute>
                  <CropsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/weather"
              element={
                <ProtectedRoute>
                  <WeatherPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/map"
              element={
                <ProtectedRoute>
                  <MapPage />
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
                  <DeviceConnectivity />
                </ProtectedRoute>
              }
            />

            {/* Admin routes */}
            <Route
              path="/admin/farmers"
              element={
                <ProtectedRoute>
                  <FarmersManagementPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/contact-submissions"
              element={
                <ProtectedRoute>
                  <ContactSubmissionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/broadcast-messages"
              element={
                <ProtectedRoute>
                  <BroadcastMessagesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/pages"
              element={
                <ProtectedRoute>
                  <PlatformPagesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/payments"
              element={
                <ProtectedRoute>
                  <PaymentGatewaysPage />
                </ProtectedRoute>
              }
            />

            {/* Catch all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

