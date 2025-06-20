
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Pricing: React.FC = () => {
  const { t } = useTranslation('landing');

  const plans = [
    {
      name: t('pricing.basic.name'),
      price: t('pricing.basic.price'),
      description: t('pricing.basic.description'),
      features: [
        t('pricing.basic.features.0'),
        t('pricing.basic.features.1'),
        t('pricing.basic.features.2'),
        t('pricing.basic.features.3')
      ],
      popular: false
    },
    {
      name: t('pricing.pro.name'),
      price: t('pricing.pro.price'),
      description: t('pricing.pro.description'),
      features: [
        t('pricing.pro.features.0'),
        t('pricing.pro.features.1'),
        t('pricing.pro.features.2'),
        t('pricing.pro.features.3'),
        t('pricing.pro.features.4')
      ],
      popular: true
    },
    {
      name: t('pricing.enterprise.name'),
      price: t('pricing.enterprise.price'),
      description: t('pricing.enterprise.description'),
      features: [
        t('pricing.enterprise.features.0'),
        t('pricing.enterprise.features.1'),
        t('pricing.enterprise.features.2'),
        t('pricing.enterprise.features.3'),
        t('pricing.enterprise.features.4')
      ],
      popular: false
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('pricing.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('pricing.subtitle')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`relative bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${
                plan.popular ? 'border-2 border-green-500 scale-105' : 'border border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    {t('pricing.popular')}
                  </span>
                </div>
              )}
              
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold text-green-600 mb-2">{plan.price}</div>
                <p className="text-gray-600">{plan.description}</p>
              </div>
              
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <Button 
                className={`w-full ${
                  plan.popular 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-gray-900 hover:bg-gray-800'
                }`}
              >
                {t('pricing.getStarted')}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
