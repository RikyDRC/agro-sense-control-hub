
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Sprout } from 'lucide-react';

const HeroSection = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('landing');
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
      <div className="bg-gradient-to-br from-green-600/80 to-green-400/80 absolute inset-0 z-0" />
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-30" 
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1740&q=80')" 
        }}
      />
      
      <div className="relative z-10 px-4 py-24 md:py-32 lg:py-40 max-w-6xl mx-auto text-center">
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-xl">
            <Sprout className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
            Irrify
          </h1>
        </div>
        
        <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
          {t('hero.subtitle')}
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
          <Button 
            size="lg" 
            className="bg-white text-green-600 hover:bg-white/90 text-lg px-8"
            onClick={handleGetStarted}
          >
            {t('hero.getStarted')}
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
            {t('hero.seeDemo')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
