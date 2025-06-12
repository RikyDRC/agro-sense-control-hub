
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Users, Target, Award, Sprout } from 'lucide-react';

const AboutPage = () => {
  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Founder",
      bio: "Former agricultural engineer with 15+ years experience in precision farming and IoT solutions."
    },
    {
      name: "Michael Chen",
      role: "CTO",
      bio: "Expert in IoT infrastructure and machine learning, previously at leading tech companies."
    },
    {
      name: "Emma Rodriguez",
      role: "Head of Product",
      bio: "Product manager with deep understanding of farming operations and user experience design."
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
            About <span className="text-agro-green">AgroSense Hub</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're on a mission to revolutionize agriculture through smart technology, helping farmers increase yields while conserving resources.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="text-center p-8">
              <CardContent>
                <Target className="h-12 w-12 text-agro-green mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4">Our Mission</h3>
                <p className="text-gray-600">To empower farmers with intelligent IoT solutions that optimize crop yields while preserving our planet's resources.</p>
              </CardContent>
            </Card>
            <Card className="text-center p-8">
              <CardContent>
                <Users className="h-12 w-12 text-agro-green mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4">Our Vision</h3>
                <p className="text-gray-600">A world where every farm operates at peak efficiency through smart technology and sustainable practices.</p>
              </CardContent>
            </Card>
            <Card className="text-center p-8">
              <CardContent>
                <Award className="h-12 w-12 text-agro-green mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-4">Our Values</h3>
                <p className="text-gray-600">Innovation, sustainability, and farmer-first approach guide everything we do at AgroSense Hub.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">Our Story</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-600 leading-relaxed mb-6">
                AgroSense Hub was born from a simple observation: traditional farming methods weren't keeping pace with the world's growing food demands. Our founder, Sarah Johnson, witnessed firsthand how farmers struggled with water scarcity, unpredictable weather, and rising operational costs.
              </p>
              <p className="text-gray-600 leading-relaxed mb-6">
                In 2020, we set out to bridge the gap between cutting-edge IoT technology and practical farming needs. Our team of agricultural engineers, software developers, and farming experts worked together to create a platform that would be both powerful and accessible to farmers of all sizes.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Today, AgroSense Hub serves over 10,000 farmers across the globe, helping them save 30% on water usage while increasing their yields by 25%. Our journey is just beginning, and we're committed to continuous innovation in service of sustainable agriculture.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Meet Our Team</h2>
            <p className="text-xl text-gray-600">The passionate people behind AgroSense Hub</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="text-center p-8">
                <CardContent>
                  <div className="w-24 h-24 bg-agro-green/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="h-12 w-12 text-agro-green" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{member.name}</h3>
                  <Badge variant="outline" className="mb-4">{member.role}</Badge>
                  <p className="text-gray-600">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-agro-green-dark to-agro-green text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Join Our Mission</h2>
          <p className="text-xl mb-8">Ready to transform your farming operations with smart technology?</p>
          <Button size="lg" className="bg-white text-agro-green-dark hover:bg-gray-100" asChild>
            <Link to="/auth">Get Started Today</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
