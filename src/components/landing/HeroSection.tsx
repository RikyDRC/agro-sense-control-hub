
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const HeroSection = () => {
  const navigate = useNavigate();
  const { user, subscription } = useAuth();

  const handleGetStarted = () => {
    if (user) {
      if (subscription && subscription.status === 'active') {
        // If user is logged in and has active subscription, go to dashboard
        navigate('/dashboard');
      } else {
        // If user is logged in but no active subscription, go to subscription plans
        navigate('/subscription/plans');
      }
    } else {
      // If not logged in, go to auth page
      navigate('/auth');
    }
  };

  return (
    <div className="relative overflow-hidden">
      <div className="bg-gradient-to-br from-agro-green-dark/80 to-agro-green-light/80 absolute inset-0 z-0" />
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-30" 
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80')" 
        }}
      />
      
      <div className="relative z-10 px-4 py-24 md:py-32 lg:py-40 max-w-6xl mx-auto text-center">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
          Grow Smarter with IoT-Powered Farming
        </h1>
        
        <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          Our intelligent irrigation system uses IoT sensors to maximize crop yields while minimizing water usage. Take control of your farm from anywhere.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Button 
            size="lg" 
            className="bg-white text-agro-green-dark hover:bg-white/90 text-lg px-8"
            onClick={handleGetStarted}
          >
            Get Started
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="border-white text-white hover:bg-white/20 hover:text-white text-lg px-8"
            onClick={() => {
              const demoSection = document.getElementById('dashboard-preview');
              demoSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            See Demo
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
