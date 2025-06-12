
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Clock, Sprout } from 'lucide-react';

const CareersPage = () => {
  const jobs = [
    {
      title: "Senior IoT Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      description: "Lead the development of our IoT sensor platform and data processing systems."
    },
    {
      title: "Agricultural Specialist",
      department: "Product",
      location: "California, USA",
      type: "Full-time",
      description: "Work with farmers to understand their needs and guide product development."
    },
    {
      title: "Customer Success Manager",
      department: "Customer Success",
      location: "Remote",
      type: "Full-time",
      description: "Help our customers achieve success with AgroSense Hub solutions."
    },
    {
      title: "Marketing Specialist",
      department: "Marketing",
      location: "New York, USA",
      type: "Full-time",
      description: "Drive awareness and adoption of our smart farming solutions."
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
            Join Our <span className="text-agro-green">Team</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Help us revolutionize agriculture and build the future of sustainable farming.
          </p>
        </div>
      </section>

      {/* Job Listings */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-6">
            {jobs.map((job, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <CardContent>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                        <Badge variant="outline">{job.department}</Badge>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{job.type}</span>
                        </div>
                      </div>
                      <p className="text-gray-600">{job.description}</p>
                    </div>
                    <Button className="bg-agro-green hover:bg-agro-green-dark ml-4">
                      Apply Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Company Culture */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Why Work With Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div>
              <h3 className="text-xl font-semibold mb-4">Mission-Driven</h3>
              <p className="text-gray-600">Work on technology that makes a real difference in sustainable agriculture.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Growth Focused</h3>
              <p className="text-gray-600">Continuous learning opportunities and career development support.</p>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Work-Life Balance</h3>
              <p className="text-gray-600">Flexible work arrangements and comprehensive benefits package.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CareersPage;
