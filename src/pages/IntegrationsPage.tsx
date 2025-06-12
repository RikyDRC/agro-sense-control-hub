
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Cloud, Smartphone, Database, Wifi, Sprout } from 'lucide-react';

const IntegrationsPage = () => {
  const integrations = [
    {
      name: "Weather APIs",
      description: "Connect with leading weather services for accurate forecasting",
      icon: <Cloud className="h-8 w-8" />,
      category: "Weather Services"
    },
    {
      name: "Mobile Apps",
      description: "iOS and Android apps for remote monitoring and control",
      icon: <Smartphone className="h-8 w-8" />,
      category: "Mobile"
    },
    {
      name: "Database Systems",
      description: "Export data to your existing database infrastructure",
      icon: <Database className="h-8 w-8" />,
      category: "Data Management"
    },
    {
      name: "IoT Platforms",
      description: "Compatible with major IoT platforms and protocols",
      icon: <Wifi className="h-8 w-8" />,
      category: "IoT"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
              <div className="flex items-center gap-3">
                <Sprout className="text-agro-green h-6 w-6" />
                <span className="text-lg font-bold text-agro-green">AgroSense Hub</span>
              </div>
            </div>
            <Button asChild className="bg-agro-green hover:bg-agro-green-dark">
              <Link to="/auth">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-agro-green-dark/5 via-white to-agro-green/5">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Powerful <span className="text-agro-green">Integrations</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect AgroSense Hub with your existing tools and services for a seamless farming experience.
          </p>
        </div>
      </section>

      {/* Integrations Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {integrations.map((integration, index) => (
              <Card key={index} className="p-8 hover:shadow-lg transition-shadow">
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-agro-green/10 rounded-lg text-agro-green">
                      {integration.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{integration.name}</h3>
                      <Badge variant="outline">{integration.category}</Badge>
                    </div>
                  </div>
                  <p className="text-gray-600">{integration.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* API Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Developer API</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Build custom integrations with our RESTful API. Access all your farm data programmatically.
          </p>
          <Button size="lg" className="bg-agro-green hover:bg-agro-green-dark" asChild>
            <Link to="/api-docs">View API Documentation</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default IntegrationsPage;
