
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ThermometerIcon,
  Droplet,
  Smartphone,
  Cloud,
  Bell,
  Zap,
  BarChart,
  Shield,
  Sprout
} from 'lucide-react';

const FeaturesPage = () => {
  const features = [
    {
      icon: <ThermometerIcon className="h-8 w-8" />,
      title: "Real-Time Sensor Data",
      description: "Monitor soil moisture, temperature, humidity, and other critical metrics in real-time from anywhere.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Droplet className="h-8 w-8" />,
      title: "Automated Irrigation",
      description: "Set intelligent rules to automatically trigger irrigation based on sensor readings and weather forecasts.",
      color: "from-agro-green to-agro-green-light"
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "Remote Control",
      description: "Control your irrigation systems, pumps, and valves remotely from your smartphone or computer.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Cloud className="h-8 w-8" />,
      title: "Weather Integration",
      description: "Integrate local weather data to make smarter irrigation decisions and protect your crops.",
      color: "from-indigo-500 to-blue-500"
    },
    {
      icon: <Bell className="h-8 w-8" />,
      title: "Smart Alerts",
      description: "Receive instant notifications when conditions fall outside optimal ranges or equipment needs attention.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Energy Efficiency",
      description: "Optimize water and energy usage with our intelligent algorithms and scheduling systems.",
      color: "from-yellow-500 to-orange-500"
    },
    {
      icon: <BarChart className="h-8 w-8" />,
      title: "Advanced Analytics",
      description: "Get detailed insights into your farm's performance with comprehensive analytics and reporting.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Secure & Reliable",
      description: "Bank-level security with 99.9% uptime guarantee ensures your data is always safe and accessible.",
      color: "from-gray-500 to-slate-500"
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
          <Badge variant="outline" className="bg-agro-green/10 text-agro-green border-agro-green/20 mb-6">
            Platform Features
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Everything You Need for <span className="text-agro-green">Smart Farming</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Our comprehensive IoT platform provides all the tools you need to optimize your agricultural operations and increase productivity.
          </p>
          <Button size="lg" className="bg-agro-green hover:bg-agro-green-dark" asChild>
            <Link to="/auth">Start Free Trial</Link>
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-2">
                <CardContent className="p-8">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 ${feature.color}`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-agro-green-dark to-agro-green text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Farm?</h2>
          <p className="text-xl mb-8">Join thousands of farmers who have increased their yields while reducing costs.</p>
          <Button size="lg" className="bg-white text-agro-green-dark hover:bg-gray-100" asChild>
            <Link to="/auth">Get Started Today</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default FeaturesPage;
