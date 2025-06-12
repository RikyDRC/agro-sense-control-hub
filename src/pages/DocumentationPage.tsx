
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Book, Code, Settings, Users, Sprout } from 'lucide-react';

const DocumentationPage = () => {
  const docSections = [
    {
      title: "Getting Started",
      description: "Quick setup guide and basic configuration",
      icon: <Book className="h-6 w-6" />,
      items: ["Installation", "First Setup", "Basic Configuration", "Sensor Connection"]
    },
    {
      title: "API Reference",
      description: "Complete API documentation and examples",
      icon: <Code className="h-6 w-6" />,
      items: ["Authentication", "Endpoints", "Rate Limits", "Examples"]
    },
    {
      title: "Configuration",
      description: "Advanced settings and customization options",
      icon: <Settings className="h-6 w-6" />,
      items: ["Automation Rules", "Alert Settings", "User Management", "Integrations"]
    },
    {
      title: "Support",
      description: "Troubleshooting and support resources",
      icon: <Users className="h-6 w-6" />,
      items: ["FAQ", "Troubleshooting", "Contact Support", "Video Tutorials"]
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
            <span className="text-agro-green">Documentation</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to know about AgroSense Hub. From quick start guides to advanced API documentation.
          </p>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {docSections.map((section, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-agro-green/10 rounded-lg text-agro-green">
                      {section.icon}
                    </div>
                    <h3 className="text-xl font-semibold">{section.title}</h3>
                  </div>
                  <p className="text-gray-600 mb-4">{section.description}</p>
                  <ul className="space-y-2">
                    {section.items.map((item, itemIndex) => (
                      <li key={itemIndex}>
                        <Link to="#" className="text-agro-green hover:underline">
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Quick Links</h2>
            <p className="text-xl text-gray-600">Popular documentation sections</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="p-6 text-center">
              <CardContent>
                <h3 className="font-semibold mb-2">Quick Start Guide</h3>
                <p className="text-sm text-gray-600 mb-4">Get up and running in 5 minutes</p>
                <Button variant="outline" size="sm">Read Guide</Button>
              </CardContent>
            </Card>
            <Card className="p-6 text-center">
              <CardContent>
                <h3 className="font-semibold mb-2">API Reference</h3>
                <p className="text-sm text-gray-600 mb-4">Complete API documentation</p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/api-docs">View API</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="p-6 text-center">
              <CardContent>
                <h3 className="font-semibold mb-2">Video Tutorials</h3>
                <p className="text-sm text-gray-600 mb-4">Step-by-step video guides</p>
                <Button variant="outline" size="sm">Watch Videos</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DocumentationPage;
