
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle, Sprout } from 'lucide-react';
import { cn } from '@/lib/utils';

const PricingPage = () => {
  const plans = [
    {
      name: "Starter",
      price: "$99",
      period: "/month",
      description: "Perfect for small farms getting started with smart agriculture",
      features: [
        "Up to 10 sensors",
        "Basic automation rules",
        "Mobile app access",
        "Email support",
        "Weekly reports"
      ],
      highlighted: false
    },
    {
      name: "Professional",
      price: "$199",
      period: "/month",
      description: "Advanced features for growing agricultural operations",
      features: [
        "Up to 50 sensors",
        "Advanced automation",
        "Real-time analytics",
        "Priority support",
        "Weather integration",
        "API access"
      ],
      highlighted: true,
      badge: "Most Popular"
    },
    {
      name: "Enterprise",
      price: "$399",
      period: "/month",
      description: "Complete solution for large-scale agricultural operations",
      features: [
        "Unlimited sensors",
        "Custom automations",
        "Advanced analytics",
        "24/7 support",
        "Custom integrations",
        "On-site training"
      ],
      highlighted: false
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
            Choose Your <span className="text-agro-green">Plan</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Flexible pricing that grows with your farm
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={cn(
                  "relative overflow-hidden transition-all duration-300 hover:shadow-xl",
                  plan.highlighted ? "ring-2 ring-agro-green shadow-xl scale-105" : "hover:-translate-y-1"
                )}
              >
                {plan.badge && (
                  <div className="absolute top-0 left-0 right-0 bg-agro-green text-white text-center py-2 text-sm font-medium">
                    {plan.badge}
                  </div>
                )}
                <CardContent className={cn("p-8", plan.badge && "pt-12")}>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                      <div className="mt-2 flex items-baseline">
                        <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                        <span className="ml-1 text-gray-500">{plan.period}</span>
                      </div>
                      <p className="mt-4 text-gray-600">{plan.description}</p>
                    </div>
                    
                    <ul className="space-y-3">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-3">
                          <CheckCircle className="h-5 w-5 text-agro-green flex-shrink-0 mt-0.5" />
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className={cn(
                        "w-full", 
                        plan.highlighted 
                          ? "bg-agro-green hover:bg-agro-green-dark" 
                          : "bg-gray-900 hover:bg-gray-800"
                      )}
                      asChild
                    >
                      <Link to="/auth">Select Plan</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Got questions? We've got answers.</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Can I change my plan later?</h3>
                <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Is there a free trial?</h3>
                <p className="text-gray-600">Yes, we offer a 14-day free trial for all new users. No credit card required.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                <p className="text-gray-600">We accept all major credit cards, PayPal, and bank transfers for enterprise customers.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;
