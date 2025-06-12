
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Code, Book, Key, Database, Sprout } from 'lucide-react';

const ApiDocsPage = () => {
  const endpoints = [
    {
      method: "GET",
      endpoint: "/api/v1/sensors",
      description: "Retrieve all sensor data",
      parameters: ["farm_id", "limit", "offset"]
    },
    {
      method: "POST",
      endpoint: "/api/v1/irrigation",
      description: "Trigger irrigation system",
      parameters: ["zone_id", "duration", "flow_rate"]
    },
    {
      method: "GET",
      endpoint: "/api/v1/weather",
      description: "Get weather forecast data",
      parameters: ["location", "days"]
    },
    {
      method: "PUT",
      endpoint: "/api/v1/automation",
      description: "Update automation rules",
      parameters: ["rule_id", "conditions", "actions"]
    }
  ];

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-blue-100 text-blue-800';
      case 'POST':
        return 'bg-green-100 text-green-800';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800';
      case 'DELETE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
              <Link to="/auth">Get API Key</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-agro-green-dark/5 via-white to-agro-green/5">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            API <span className="text-agro-green">Documentation</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Integrate AgroSense Hub data and controls into your applications with our RESTful API.
          </p>
        </div>
      </section>

      {/* Getting Started */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Getting Started</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <Card className="p-6 text-center">
                <CardContent>
                  <Key className="h-12 w-12 text-agro-green mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Get API Key</h3>
                  <p className="text-sm text-gray-600">Create an account and generate your API key</p>
                </CardContent>
              </Card>
              <Card className="p-6 text-center">
                <CardContent>
                  <Code className="h-12 w-12 text-agro-green mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Make Requests</h3>
                  <p className="text-sm text-gray-600">Use your API key to authenticate requests</p>
                </CardContent>
              </Card>
              <Card className="p-6 text-center">
                <CardContent>
                  <Database className="h-12 w-12 text-agro-green mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Access Data</h3>
                  <p className="text-sm text-gray-600">Retrieve sensor data and control systems</p>
                </CardContent>
              </Card>
            </div>

            {/* Authentication */}
            <Card className="p-6 mb-8">
              <CardContent>
                <h3 className="text-xl font-semibold mb-4">Authentication</h3>
                <p className="text-gray-600 mb-4">
                  All API requests require authentication using an API key. Include your API key in the Authorization header:
                </p>
                <div className="bg-gray-100 p-4 rounded-lg font-mono text-sm">
                  curl -H "Authorization: Bearer YOUR_API_KEY" \<br />
                  &nbsp;&nbsp;&nbsp;&nbsp;https://api.agrosensehub.com/v1/sensors
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* API Endpoints */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">API Endpoints</h2>
            <div className="space-y-4">
              {endpoints.map((endpoint, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <Badge className={getMethodColor(endpoint.method)}>
                        {endpoint.method}
                      </Badge>
                      <div className="flex-1">
                        <h3 className="font-mono text-lg font-semibold mb-2">{endpoint.endpoint}</h3>
                        <p className="text-gray-600 mb-3">{endpoint.description}</p>
                        <div>
                          <h4 className="font-semibold text-sm mb-2">Parameters:</h4>
                          <div className="flex flex-wrap gap-2">
                            {endpoint.parameters.map((param, paramIndex) => (
                              <Badge key={paramIndex} variant="outline">
                                {param}
                              </Badge>
                            ))}
                          </div>
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

      {/* Rate Limits */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8">
              <CardContent>
                <h2 className="text-2xl font-bold mb-6">Rate Limits</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-agro-green mb-2">1000</div>
                    <div className="text-gray-600">Requests per hour</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-agro-green mb-2">100</div>
                    <div className="text-gray-600">Requests per minute</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-agro-green mb-2">10</div>
                    <div className="text-gray-600">Concurrent requests</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Support */}
      <section className="py-20 bg-gradient-to-r from-agro-green-dark to-agro-green text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Need Help?</h2>
          <p className="text-xl mb-8">Our support team is here to help you integrate with our API</p>
          <Button size="lg" className="bg-white text-agro-green-dark hover:bg-gray-100" asChild>
            <Link to="/contact">Contact Support</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default ApiDocsPage;
