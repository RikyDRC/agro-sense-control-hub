
import React, { lazy } from 'react';
import { SEOHead } from '@/components/SEOHead';
import { LazyComponent } from '@/components/LazyComponent';
import HeroSection from '@/components/landing/HeroSection';

// Lazy load components for better performance
const Features = lazy(() => import('@/components/landing/Features'));
const Pricing = lazy(() => import('@/components/landing/Pricing'));
const Testimonials = lazy(() => import('@/components/landing/Testimonials'));
const CallToAction = lazy(() => import('@/components/landing/CallToAction'));
const Footer = lazy(() => import('@/components/landing/Footer'));

const OptimizedLandingPage: React.FC = () => {
  return (
    <>
      <SEOHead 
        title="Smart Farm Management Platform - Advanced Irrigation & IoT Solutions"
        description="Transform your farming with our AI-powered irrigation management system. Real-time monitoring, automated controls, and smart analytics for maximum crop yield."
        keywords="smart farming, precision agriculture, irrigation automation, IoT sensors, farm management software, agricultural technology"
      />
      
      <main className="min-h-screen">
        {/* Hero section loads immediately */}
        <HeroSection />
        
        {/* Other sections load lazily */}
        <LazyComponent>
          <Features />
        </LazyComponent>
        
        <LazyComponent>
          <Pricing />
        </LazyComponent>
        
        <LazyComponent>
          <Testimonials />
        </LazyComponent>
        
        <LazyComponent>
          <CallToAction />
        </LazyComponent>
        
        <LazyComponent>
          <Footer />
        </LazyComponent>
      </main>
    </>
  );
};

export default OptimizedLandingPage;
