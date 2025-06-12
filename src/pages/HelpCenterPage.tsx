
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Search, Book, MessageCircle, Video, Sprout } from 'lucide-react';

const HelpCenterPage = () => {
  const categories = [
    {
      title: "Getting Started",
      icon: <Book className="h-6 w-6" />,
      articles: ["Quick Setup Guide", "First Time Setup", "Connecting Sensors", "Mobile App Setup"]
    },
    {
      title: "Troubleshooting",
      icon: <MessageCircle className="h-6 w-6" />,
      articles: ["Common Issues", "Connection Problems", "Data Sync Issues", "Alert Not Working"]
    },
    {
      title: "Video Tutorials",
      icon: <Video className="h-6 w-6" />,
      articles: ["Installation Guide", "Dashboard Overview", "Setting Up Automation", "Mobile App Tutorial"]
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
            <span className="text-agro-green">Help Center</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Find answers to your questions and get the most out of AgroSense Hub.
          </p>
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input 
              placeholder="Search for help..." 
              className="pl-10 pr-4 py-3 text-lg"
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {categories.map((category, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-agro-green/10 rounded-lg text-agro-green">
                      {category.icon}
                    </div>
                    <h3 className="text-xl font-semibold">{category.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {category.articles.map((article, articleIndex) => (
                      <li key={articleIndex}>
                        <Link 
                          to="#" 
                          className="text-gray-600 hover:text-agro-green transition-colors block py-1"
                        >
                          {article}
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

      {/* Contact Support */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Still Need Help?</h2>
          <p className="text-xl text-gray-600 mb-8">Our support team is here to assist you</p>
          <Button size="lg" className="bg-agro-green hover:bg-agro-green-dark" asChild>
            <Link to="/contact">Contact Support</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default HelpCenterPage;
