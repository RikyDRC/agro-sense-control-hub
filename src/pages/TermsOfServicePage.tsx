
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Users, Shield, AlertTriangle } from 'lucide-react';

const TermsOfServicePage = () => {
  const { t } = useTranslation('terms');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                {t('backToHome')}
              </Link>
            </Button>
            <h1 className="text-4xl font-bold text-foreground mb-4">{t('title')}</h1>
            <p className="text-muted-foreground text-lg">{t('lastUpdated')}</p>
          </div>

          {/* Content */}
          <div className="prose prose-gray max-w-none">
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-6 w-6 text-green-600" />
                <h2 className="text-2xl font-semibold">{t('sections.acceptance.title')}</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">{t('sections.acceptance.content')}</p>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-6 w-6 text-green-600" />
                <h2 className="text-2xl font-semibold">{t('sections.userAccounts.title')}</h2>
              </div>
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">{t('sections.userAccounts.intro')}</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {(t('sections.userAccounts.items', { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-green-600" />
                <h2 className="text-2xl font-semibold">{t('sections.serviceUse.title')}</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">{t('sections.serviceUse.content')}</p>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="h-6 w-6 text-green-600" />
                <h2 className="text-2xl font-semibold">{t('sections.liability.title')}</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">{t('sections.liability.content')}</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfServicePage;
