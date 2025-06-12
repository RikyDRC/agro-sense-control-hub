
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, User, Sprout } from 'lucide-react';

const BlogPage = () => {
  const posts = [
    {
      title: "The Future of Smart Farming: IoT Trends in 2025",
      excerpt: "Discover the latest IoT innovations transforming agriculture and what farmers can expect in the coming year.",
      author: "Sarah Johnson",
      date: "December 10, 2024",
      category: "Technology",
      readTime: "5 min read"
    },
    {
      title: "Water Conservation Techniques That Actually Work",
      excerpt: "Learn proven strategies to reduce water usage by up to 40% while maintaining optimal crop health.",
      author: "Michael Chen",
      date: "December 8, 2024",
      category: "Sustainability",
      readTime: "7 min read"
    },
    {
      title: "Case Study: How Johnson Farm Increased Yields by 30%",
      excerpt: "A detailed look at how one farm transformed their operations with smart irrigation and sensor technology.",
      author: "Emma Rodriguez",
      date: "December 5, 2024",
      category: "Case Study",
      readTime: "8 min read"
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
            AgroSense <span className="text-agro-green">Blog</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Insights, tips, and stories from the world of smart agriculture and sustainable farming.
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-8">
            {posts.map((post, index) => (
              <Card key={index} className="p-8 hover:shadow-lg transition-shadow">
                <CardContent>
                  <div className="flex items-center gap-4 mb-4">
                    <Badge variant="outline">{post.category}</Badge>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{post.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <User className="h-4 w-4" />
                      <span>{post.author}</span>
                    </div>
                    <span className="text-sm text-gray-500">{post.readTime}</span>
                  </div>
                  <h2 className="text-2xl font-bold mb-3 hover:text-agro-green transition-colors">
                    <Link to="#">{post.title}</Link>
                  </h2>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <Button variant="outline" size="sm">Read More</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Stay Updated</h2>
          <p className="text-xl text-gray-600 mb-8">Get the latest insights delivered to your inbox</p>
          <div className="max-w-md mx-auto flex gap-4">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 px-4 py-2 border rounded-md"
            />
            <Button className="bg-agro-green hover:bg-agro-green-dark">Subscribe</Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;
