
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, MessageSquare, Award, Sprout } from 'lucide-react';

const CommunityPage = () => {
  const discussions = [
    {
      title: "Best practices for soil moisture monitoring",
      author: "JohnFarmer",
      replies: 12,
      category: "Tips & Tricks",
      lastActivity: "2 hours ago"
    },
    {
      title: "Automation rules for tomato irrigation",
      author: "GreenThumb",
      replies: 8,
      category: "Automation",
      lastActivity: "4 hours ago"
    },
    {
      title: "Weather integration setup help",
      author: "SmartFarm23",
      replies: 15,
      category: "Support",
      lastActivity: "6 hours ago"
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
              <Link to="/auth">Join Community</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-agro-green-dark/5 via-white to-agro-green/5">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="text-agro-green">Community</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with fellow farmers, share experiences, and learn from the AgroSense Hub community.
          </p>
        </div>
      </section>

      {/* Community Stats */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
            <Card className="p-6">
              <CardContent>
                <Users className="h-12 w-12 text-agro-green mx-auto mb-4" />
                <div className="text-3xl font-bold mb-2">10,000+</div>
                <div className="text-gray-600">Active Members</div>
              </CardContent>
            </Card>
            <Card className="p-6">
              <CardContent>
                <MessageSquare className="h-12 w-12 text-agro-green mx-auto mb-4" />
                <div className="text-3xl font-bold mb-2">5,000+</div>
                <div className="text-gray-600">Discussions</div>
              </CardContent>
            </Card>
            <Card className="p-6">
              <CardContent>
                <Award className="h-12 w-12 text-agro-green mx-auto mb-4" />
                <div className="text-3xl font-bold mb-2">500+</div>
                <div className="text-gray-600">Expert Contributors</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Recent Discussions */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">Recent Discussions</h2>
            <div className="space-y-4">
              {discussions.map((discussion, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <CardContent>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline">{discussion.category}</Badge>
                          <span className="text-sm text-gray-500">by {discussion.author}</span>
                        </div>
                        <h3 className="text-lg font-semibold mb-2 hover:text-agro-green transition-colors">
                          <Link to="#">{discussion.title}</Link>
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{discussion.replies} replies</span>
                          <span>Last activity: {discussion.lastActivity}</span>
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

      {/* Join CTA */}
      <section className="py-20 bg-gradient-to-r from-agro-green-dark to-agro-green text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Join Our Community</h2>
          <p className="text-xl mb-8">Connect with thousands of farmers using AgroSense Hub</p>
          <Button size="lg" className="bg-white text-agro-green-dark hover:bg-gray-100" asChild>
            <Link to="/auth">Get Started</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default CommunityPage;
