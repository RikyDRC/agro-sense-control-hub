
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Shield, Zap, Users, CheckCircle, Star, Mail, Phone, MapPin, Github, Twitter, Linkedin, Instagram, Sprout } from 'lucide-react';
import { Link } from 'react-router-dom';
import NewsletterForm from '@/components/forms/NewsletterForm';
import ContactForm from '@/components/forms/ContactForm';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Sprout className="text-agro-green-dark h-8 w-8" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-agro-green rounded-full animate-pulse" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">Irrify</h1>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/features" className="text-muted-foreground hover:text-foreground transition-colors">Features</Link>
              <Link to="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</Link>
              <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">About</Link>
              <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
              <Link to="/auth">
                <Button variant="outline" className="mr-2">Login</Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-agro-green hover:bg-agro-green-dark">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-4 px-4 py-2">
            🌱 Smart Farming Revolution
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-agro-green to-primary bg-clip-text text-transparent mb-6">
            Transform Your Farm with Irrify
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Advanced smart irrigation management that maximizes crop yield while minimizing water usage. 
            Monitor, automate, and optimize your farming operations with cutting-edge IoT technology.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-agro-green hover:bg-agro-green-dark text-white px-8 py-3">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/features">
              <Button size="lg" variant="outline" className="px-8 py-3">
                Explore Features
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Irrify?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Comprehensive smart farming solutions designed for modern agriculture
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Shield className="h-12 w-12 text-agro-green mb-4" />
              <CardTitle>Reliable Monitoring</CardTitle>
              <CardDescription>
                24/7 real-time monitoring of soil moisture, weather conditions, and crop health
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Zap className="h-12 w-12 text-agro-green mb-4" />
              <CardTitle>Smart Automation</CardTitle>
              <CardDescription>
                Intelligent irrigation systems that adapt to weather patterns and crop needs
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 text-agro-green mb-4" />
              <CardTitle>Expert Support</CardTitle>
              <CardDescription>
                Professional agricultural consultants and technical support available 24/7
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Stay Updated</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get the latest insights on smart farming and irrigation technology
          </p>
        </div>
        <div className="flex justify-center">
          <NewsletterForm />
        </div>
      </section>

      {/* Contact Section */}
      <section className="container mx-auto px-4 py-20 bg-muted/50 rounded-3xl my-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Get in Touch</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ready to transform your farming operations? Contact us today
          </p>
        </div>
        <div className="max-w-2xl mx-auto">
          <ContactForm />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative">
                  <Sprout className="text-agro-green-dark h-8 w-8" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-agro-green rounded-full animate-pulse" />
                </div>
                <h3 className="text-xl font-bold">Irrify</h3>
              </div>
              <p className="text-muted-foreground">
                Revolutionizing agriculture with smart irrigation technology.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link to="/integrations" className="hover:text-foreground transition-colors">Integrations</Link></li>
                <li><Link to="/api-docs" className="hover:text-foreground transition-colors">API</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/about" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link to="/careers" className="hover:text-foreground transition-colors">Careers</Link></li>
                <li><Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><Link to="/help-center" className="hover:text-foreground transition-colors">Help Center</Link></li>
                <li><Link to="/documentation" className="hover:text-foreground transition-colors">Documentation</Link></li>
                <li><Link to="/community" className="hover:text-foreground transition-colors">Community</Link></li>
                <li><Link to="/status" className="hover:text-foreground transition-colors">Status</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border/40 mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Irrify. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
