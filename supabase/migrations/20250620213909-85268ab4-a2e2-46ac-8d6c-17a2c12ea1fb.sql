
-- Create a table for managing platform pages
CREATE TABLE public.platform_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}',
  meta_description TEXT,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for platform pages
ALTER TABLE public.platform_pages ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read published pages
CREATE POLICY "Anyone can view published pages" 
  ON public.platform_pages 
  FOR SELECT 
  USING (is_published = true);

-- Only super admins can create, update, and delete pages
CREATE POLICY "Super admins can manage pages" 
  ON public.platform_pages 
  FOR ALL 
  USING (public.is_current_user_super_admin());

-- Create a table for contact form submissions
CREATE TABLE public.contact_form_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT,
  message TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS for contact submissions
ALTER TABLE public.contact_form_submissions ENABLE ROW LEVEL SECURITY;

-- Only admins can view contact submissions
CREATE POLICY "Admins can view contact submissions" 
  ON public.contact_form_submissions 
  FOR SELECT 
  USING (public.is_current_user_admin_or_super());

-- Anyone can insert contact submissions
CREATE POLICY "Anyone can submit contact forms" 
  ON public.contact_form_submissions 
  FOR INSERT 
  WITH CHECK (true);

-- Create a table for newsletter subscriptions
CREATE TABLE public.newsletter_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS for newsletter subscriptions
ALTER TABLE public.newsletter_subscriptions ENABLE ROW LEVEL SECURITY;

-- Only admins can view subscriptions
CREATE POLICY "Admins can view newsletter subscriptions" 
  ON public.newsletter_subscriptions 
  FOR SELECT 
  USING (public.is_current_user_admin_or_super());

-- Anyone can subscribe to newsletter
CREATE POLICY "Anyone can subscribe to newsletter" 
  ON public.newsletter_subscriptions 
  FOR INSERT 
  WITH CHECK (true);

-- Insert default pages
INSERT INTO public.platform_pages (slug, title, content, meta_description) VALUES
('auth', 'Authentication', '{"type": "auth", "title": "Welcome to Irrify", "subtitle": "Access your smart farming dashboard"}', 'Sign in to your Irrify account'),
('features', 'Features', '{"type": "features", "title": "Smart Farming Features", "subtitle": "Everything you need for modern agriculture"}', 'Discover Irrify''s powerful smart farming features'),
('pricing', 'Pricing', '{"type": "pricing", "title": "Choose Your Plan", "subtitle": "Flexible pricing that grows with your farm"}', 'Irrify pricing plans for smart farming'),
('integrations', 'Integrations', '{"type": "integrations", "title": "Third-party Integrations", "subtitle": "Connect with your favorite tools"}', 'Irrify integrations with popular farming tools'),
('documentation', 'Documentation', '{"type": "documentation", "title": "Developer Documentation", "subtitle": "APIs, SDKs, and guides"}', 'Irrify API documentation and developer guides'),
('about', 'About Us', '{"type": "about", "title": "About Irrify", "subtitle": "Revolutionizing agriculture with IoT technology"}', 'Learn about Irrify''s mission in smart agriculture'),
('blog', 'Blog', '{"type": "blog", "title": "Irrify Blog", "subtitle": "Latest insights in smart farming"}', 'Read the latest articles on smart farming technology'),
('careers', 'Careers', '{"type": "careers", "title": "Join Our Team", "subtitle": "Help us shape the future of farming"}', 'Career opportunities at Irrify'),
('contact', 'Contact Us', '{"type": "contact", "title": "Get in Touch", "subtitle": "We''d love to hear from you"}', 'Contact Irrify for support or inquiries'),
('help-center', 'Help Center', '{"type": "help", "title": "Help Center", "subtitle": "Find answers to common questions"}', 'Irrify help center and support documentation'),
('community', 'Community', '{"type": "community", "title": "Irrify Community", "subtitle": "Connect with fellow farmers"}', 'Join the Irrify farming community'),
('status', 'System Status', '{"type": "status", "title": "System Status", "subtitle": "Real-time platform status"}', 'Check Irrify platform status and uptime'),
('api-docs', 'API Documentation', '{"type": "api", "title": "API Reference", "subtitle": "Complete API documentation"}', 'Irrify API reference and integration guides');

-- Add trigger to update timestamp
CREATE TRIGGER update_platform_pages_updated_at
  BEFORE UPDATE ON public.platform_pages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_contact_form_submissions_updated_at
  BEFORE UPDATE ON public.contact_form_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER update_newsletter_subscriptions_updated_at
  BEFORE UPDATE ON public.newsletter_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_timestamp();
