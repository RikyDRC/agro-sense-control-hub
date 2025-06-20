
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CallToAction: React.FC = () => {
  const { t } = useTranslation('landing');

  return (
    <section className="py-24 bg-green-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          {t('cta.title')}
        </h2>
        <p className="text-xl text-green-100 mb-8 max-w-3xl mx-auto">
          {t('cta.subtitle')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            asChild
            size="lg" 
            className="bg-white text-green-600 hover:bg-gray-100"
          >
            <Link to="/auth">
              {t('cta.getStarted')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button 
            asChild
            variant="outline" 
            size="lg" 
            className="border-white text-white hover:bg-white hover:text-green-600"
          >
            <Link to="/contact">
              {t('cta.contactSales')}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
