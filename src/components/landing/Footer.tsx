
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const { t } = useTranslation('landing');

  return (
    <footer className="bg-gray-900 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">{t('hero.title')}</h3>
            <p className="text-gray-400 mb-6 max-w-md">
              {t('hero.subtitle')}
            </p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.product')}</h3>
            <ul className="space-y-2">
              <li><Link to="/features" className="text-gray-400 hover:text-white transition-colors">{t('footer.features')}</Link></li>
              <li><Link to="/pricing" className="text-gray-400 hover:text-white transition-colors">{t('footer.pricing')}</Link></li>
              <li><Link to="/integrations" className="text-gray-400 hover:text-white transition-colors">{t('footer.integrations')}</Link></li>
              <li><Link to="/documentation" className="text-gray-400 hover:text-white transition-colors">{t('footer.documentation')}</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.company')}</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">{t('footer.about')}</Link></li>
              <li><Link to="/blog" className="text-gray-400 hover:text-white transition-colors">{t('footer.blog')}</Link></li>
              <li><Link to="/careers" className="text-gray-400 hover:text-white transition-colors">{t('footer.careers')}</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">{t('footer.contact')}</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 Smart Farm Platform. {t('footer.allRightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
