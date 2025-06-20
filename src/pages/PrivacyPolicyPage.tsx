
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, Eye, Cookie, Mail } from 'lucide-react';

const PrivacyPolicyPage = () => {
  const { t } = useTranslation('privacy');

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
                <Shield className="h-6 w-6 text-green-600" />
                <h2 className="text-2xl font-semibold">{t('sections.overview.title')}</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">{t('sections.overview.content')}</p>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="h-6 w-6 text-green-600" />
                <h2 className="text-2xl font-semibold">{t('sections.dataCollection.title')}</h2>
              </div>
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">{t('sections.dataCollection.intro')}</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  {(t('sections.dataCollection.items', { returnObjects: true }) as string[]).map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Cookie className="h-6 w-6 text-green-600" />
                <h2 className="text-2xl font-semibold">{t('sections.cookies.title')}</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">{t('sections.cookies.content')}</p>
            </section>

            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Mail className="h-6 w-6 text-green-600" />
                <h2 className="text-2xl font-semibold">{t('sections.contact.title')}</h2>
              </div>
              <p className="text-muted-foreground leading-relaxed">{t('sections.contact.content')}</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
