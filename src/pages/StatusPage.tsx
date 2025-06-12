
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, AlertTriangle, XCircle, Sprout } from 'lucide-react';

const StatusPage = () => {
  const services = [
    {
      name: "API Services",
      status: "operational",
      uptime: "99.9%",
      description: "All API endpoints are functioning normally"
    },
    {
      name: "Mobile App",
      status: "operational",
      uptime: "99.8%",
      description: "Mobile applications are running smoothly"
    },
    {
      name: "Dashboard",
      status: "operational",
      uptime: "99.9%",
      description: "Web dashboard is fully operational"
    },
    {
      name: "Sensor Data Processing",
      status: "degraded",
      uptime: "97.2%",
      description: "Minor delays in data processing (investigating)"
    },
    {
      name: "Email Notifications",
      status: "operational",
      uptime: "99.7%",
      description: "Email alerts and notifications are working"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'down':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return <Badge className="bg-green-100 text-green-800">Operational</Badge>;
      case 'degraded':
        return <Badge className="bg-yellow-100 text-yellow-800">Degraded</Badge>;
      case 'down':
        return <Badge className="bg-red-100 text-red-800">Down</Badge>;
      default:
        return <Badge className="bg-green-100 text-green-800">Operational</Badge>;
    }
  };

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
            System <span className="text-agro-green">Status</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real-time status of all AgroSense Hub services and systems.
          </p>
        </div>
      </section>

      {/* Overall Status */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Card className="max-w-4xl mx-auto p-8 text-center">
            <CardContent>
              <div className="flex items-center justify-center gap-3 mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <h2 className="text-2xl font-bold">All Systems Operational</h2>
              </div>
              <p className="text-gray-600">All major systems are running smoothly. Current uptime: 99.8%</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Service Status */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Service Status</h2>
            <div className="space-y-4">
              {services.map((service, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(service.status)}
                        <div>
                          <h3 className="font-semibold text-lg">{service.name}</h3>
                          <p className="text-gray-600 text-sm">{service.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(service.status)}
                        <div className="text-sm text-gray-500 mt-1">
                          Uptime: {service.uptime}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recent Incidents */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Recent Incidents</h2>
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <h3 className="text-lg font-semibold mb-2">No recent incidents</h3>
                  <p>All systems have been running smoothly with no major incidents in the last 30 days.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Subscribe to Updates */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Stay Updated</h2>
          <p className="text-xl text-gray-600 mb-8">Get notified about service updates and incidents</p>
          <Button size="lg" className="bg-agro-green hover:bg-agro-green-dark">
            Subscribe to Updates
          </Button>
        </div>
      </section>
    </div>
  );
};

export default StatusPage;
