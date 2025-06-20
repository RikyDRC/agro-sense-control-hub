
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Droplets, Smartphone, BarChart3, Shield, Clock, Zap } from 'lucide-react';
import { OptimizedImage } from '@/components/OptimizedImage';

const Features: React.FC = () => {
  const { t } = useTranslation('landing');

  const features = [
    {
      icon: <Droplets className="h-8 w-8 text-green-600" />,
      title: t('features.smartIrrigation.title'),
      description: t('features.smartIrrigation.description')
    },
    {
      icon: <Smartphone className="h-8 w-8 text-green-600" />,
      title: t('features.mobileControl.title'),
      description: t('features.mobileControl.description')
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-green-600" />,
      title: t('features.analytics.title'),
      description: t('features.analytics.description')
    },
    {
      icon: <Shield className="h-8 w-8 text-green-600" />,
      title: t('features.security.title'),
      description: t('features.security.description')
    },
    {
      icon: <Clock className="h-8 w-8 text-green-600" />,
      title: t('features.automation.title'),
      description: t('features.automation.description')
    },
    {
      icon: <Zap className="h-8 w-8 text-green-600" />,
      title: t('features.efficiency.title'),
      description: t('features.efficiency.description')
    }
  ];

  return (
    <section id="features" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('features.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
