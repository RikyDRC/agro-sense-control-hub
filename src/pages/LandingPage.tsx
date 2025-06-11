import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowRight, 
  CheckCircle, 
  Cloud, 
  Droplet, 
  BarChart, 
  Smartphone, 
  Zap, 
  ThermometerIcon,
  Calendar,
  Bell,
  Sprout
} from 'lucide-react';
import { cn } from '@/lib/utils';

const LandingPage = () => {
  const { t } = useTranslation('landing');

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="w-full py-4 px-6 md:px-10 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <Sprout className="text-agro-green-dark h-7 w-7" />
          <span className="text-xl font-semibold">AgroSmart</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/auth" className="text-sm font-medium hover:text-agro-green">
            {t('navigation.signIn')}
          </Link>
          <Button asChild size="sm" className="bg-agro-green hover:bg-agro-green-dark">
            <Link to="/subscription/plans">{t('navigation.getStarted')}</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative px-6 lg:px-8 py-16 md:py-24 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-[url('/src/assets/farm-pattern.svg')] bg-center opacity-[0.1]"></div>
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0 md:pr-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                {t('hero.title')}
              </h1>
              <p className="mt-6 text-lg text-gray-600 max-w-2xl">
                {t('hero.subtitle')}
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button asChild className="bg-agro-green hover:bg-agro-green-dark" size="lg">
                  <Link to="/subscription/plans">{t('hero.getStarted')}</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <a href="#how-it-works">
                    {t('hero.seeDemo')} <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&h=500&q=80" 
                alt="Smart agriculture system" 
                className="rounded-lg shadow-2xl object-cover w-full"
              />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="px-6 lg:px-8 py-16 md:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{t('howItWorks.title')}</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                {t('howItWorks.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
              {[
                {
                  step: '01',
                  title: t('howItWorks.steps.collect.title'),
                  description: t('howItWorks.steps.collect.description'),
                  icon: <ThermometerIcon className="h-10 w-10 text-agro-green" />
                },
                {
                  step: '02',
                  title: t('howItWorks.steps.analyze.title'),
                  description: t('howItWorks.steps.analyze.description'),
                  icon: <BarChart className="h-10 w-10 text-agro-green" />
                },
                {
                  step: '03',
                  title: t('howItWorks.steps.control.title'),
                  description: t('howItWorks.steps.control.description'),
                  icon: <Smartphone className="h-10 w-10 text-agro-green" />
                }
              ].map((item, index) => (
                <div key={index} className="relative">
                  <div className="flex flex-col items-center text-center p-6 bg-white rounded-xl shadow-md">
                    {item.icon}
                    <span className="mt-2 text-sm font-bold text-agro-green">STEP {item.step}</span>
                    <h3 className="mt-2 text-xl font-semibold">{item.title}</h3>
                    <p className="mt-3 text-gray-600">{item.description}</p>
                  </div>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2">
                      <ArrowRight className="h-6 w-6 text-agro-green-light" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{t('features.title')}</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                {t('features.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: t('features.list.realTimeData.title'),
                  description: t('features.list.realTimeData.description'),
                  icon: <ThermometerIcon className="h-10 w-10 text-agro-green" />
                },
                {
                  title: t('features.list.automatedWatering.title'),
                  description: t('features.list.automatedWatering.description'),
                  icon: <Droplet className="h-10 w-10 text-agro-green" />
                },
                {
                  title: t('features.list.remoteControl.title'),
                  description: t('features.list.remoteControl.description'),
                  icon: <Smartphone className="h-10 w-10 text-agro-green" />
                },
                {
                  title: t('features.list.weatherIntegration.title'),
                  description: t('features.list.weatherIntegration.description'),
                  icon: <Cloud className="h-10 w-10 text-agro-green" />
                },
                {
                  title: t('features.list.smartAlerts.title'),
                  description: t('features.list.smartAlerts.description'),
                  icon: <Bell className="h-10 w-10 text-agro-green" />
                },
                {
                  title: t('features.list.energyEfficiency.title'),
                  description: t('features.list.energyEfficiency.description'),
                  icon: <Zap className="h-10 w-10 text-agro-green" />
                }
              ].map((feature, index) => (
                <Card key={index} className="border-none shadow-md hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="bg-agro-green/10 p-3 rounded-full w-fit mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Dashboard Preview */}
        <section className="px-6 lg:px-8 py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{t('dashboard.title')}</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                {t('dashboard.subtitle')}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
              <div className="p-4 bg-agro-green-dark text-white flex items-center">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="mx-auto font-mono text-sm">AgroSmart Dashboard</div>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&h=600&q=80"
                alt="Dashboard preview" 
                className="w-full h-auto"
              />
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Benefits for Farmers</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                See how our system helps farmers around the world
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  title: 'Save Time',
                  description: 'Reduce manual inspections and automate routine irrigation tasks.',
                  stat: '70%',
                  statLabel: 'less time spent on irrigation management'
                },
                {
                  title: 'Reduce Water Usage',
                  description: 'Optimize water consumption with precision irrigation.',
                  stat: '30%',
                  statLabel: 'average water savings'
                },
                {
                  title: 'Improve Crop Health',
                  description: 'Maintain optimal growing conditions for healthier plants.',
                  stat: '25%',
                  statLabel: 'increase in crop yield'
                }
              ].map((benefit, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md p-8">
                  <h3 className="text-xl font-semibold mb-3">{benefit.title}</h3>
                  <p className="text-gray-600 mb-6">{benefit.description}</p>
                  <div className="border-t pt-6">
                    <div className="text-4xl font-bold text-agro-green">{benefit.stat}</div>
                    <div className="text-sm text-gray-500">{benefit.statLabel}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="px-6 lg:px-8 py-16 md:py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">What Farmers Say</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                Hear from the farmers who use our system daily
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  quote: "This system has completely transformed how I manage irrigation. I can finally take weekends off!",
                  author: "John Wilson",
                  role: "Wheat Farmer, Kansas"
                },
                {
                  quote: "We've reduced our water usage by 35% while improving our crop yield. The ROI was evident within the first season.",
                  author: "Maria Rodriguez",
                  role: "Vineyard Owner, California"
                },
                {
                  quote: "The alerts have saved my crops multiple times. Being notified of freezing temperatures before they hit is invaluable.",
                  author: "David Chen",
                  role: "Orchard Manager, Washington"
                }
              ].map((testimonial, index) => (
                <div key={index} className="bg-white p-6 rounded-xl shadow-md">
                  <div className="mb-4 text-agro-green">
                    <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                    </svg>
                  </div>
                  <p className="text-gray-700 mb-6">{testimonial.quote}</p>
                  <div>
                    <p className="font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Simple, Transparent Pricing</h2>
              <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                Choose the plan that's right for your farming operation
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Starter",
                  price: "$99",
                  period: "/month",
                  description: "Perfect for small farms just getting started with smart irrigation",
                  features: [
                    "Up to 5 sensors",
                    "Basic irrigation controls",
                    "Weekly reports",
                    "Email support",
                    "Mobile app access"
                  ]
                },
                {
                  name: "Professional",
                  price: "$199",
                  period: "/month",
                  description: "Ideal for medium-sized farms with diverse needs",
                  features: [
                    "Up to 20 sensors",
                    "Advanced automation rules",
                    "Daily reports & analytics",
                    "Priority support",
                    "Weather integration",
                    "API access"
                  ],
                  highlighted: true
                },
                {
                  name: "Enterprise",
                  price: "$399",
                  period: "/month",
                  description: "Full-featured solution for large agricultural operations",
                  features: [
                    "Unlimited sensors",
                    "Custom automation workflows",
                    "Real-time analytics",
                    "24/7 dedicated support",
                    "Multiple user accounts",
                    "Custom integrations",
                    "On-site installation support"
                  ]
                }
              ].map((plan, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "rounded-xl overflow-hidden", 
                    plan.highlighted ? "ring-2 ring-agro-green shadow-xl scale-105" : "border shadow-md"
                  )}
                >
                  {plan.highlighted && (
                    <div className="bg-agro-green text-white text-center py-2 font-medium">
                      Most Popular
                    </div>
                  )}
                  <div className="p-8">
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <div className="mt-4 flex items-baseline">
                      <span className="text-4xl font-extrabold">{plan.price}</span>
                      <span className="ml-1 text-gray-500">{plan.period}</span>
                    </div>
                    <p className="mt-4 text-gray-600">{plan.description}</p>
                    <ul className="mt-6 space-y-4">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex">
                          <CheckCircle className="h-5 w-5 text-agro-green flex-shrink-0" />
                          <span className="ml-3 text-gray-600">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-8">
                      <Button 
                        className={cn(
                          "w-full", 
                          plan.highlighted ? "bg-agro-green hover:bg-agro-green-dark" : "bg-gray-800 hover:bg-gray-900"
                        )}
                        asChild
                      >
                        <Link to="/subscription/plans">Select Plan</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="px-6 lg:px-8 py-16 md:py-24 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Frequently Asked Questions</h2>
              <p className="mt-4 text-lg text-gray-600">
                Find answers to common questions about our platform
              </p>
            </div>

            <Tabs defaultValue="general" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="technical">Technical</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="space-y-6">
                {[
                  {
                    question: "How long does it take to set up the system?",
                    answer: "The basic setup can be completed in 1-2 days, depending on the size of your farm and number of sensors. Our team provides comprehensive installation guides and support throughout the process."
                  },
                  {
                    question: "Do I need technical knowledge to use the platform?",
                    answer: "No, our platform is designed to be user-friendly and intuitive. You don't need technical expertise to monitor your farm or make basic adjustments to your irrigation system."
                  },
                  {
                    question: "Can I try before I buy?",
                    answer: "Yes, we offer a 14-day free trial that includes access to most features. You can also request a personalized demo from our team."
                  }
                ].map((faq, index) => (
                  <div key={index} className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="technical" className="space-y-6">
                {[
                  {
                    question: "What type of sensors are compatible with your system?",
                    answer: "Our system is compatible with a wide range of agricultural IoT sensors, including soil moisture sensors, temperature sensors, humidity sensors, and more. We provide our own sensors but can also integrate with selected third-party devices."
                  },
                  {
                    question: "Do I need internet connectivity in my fields?",
                    answer: "Your sensors need to be able to transmit data to our platform, which typically requires some form of connectivity. This can be through cellular networks, LoRaWAN, or WiFi connections depending on your farm's setup."
                  },
                  {
                    question: "How accurate are the sensors?",
                    answer: "Our sensors provide industry-leading accuracy with error margins typically less than 2% for moisture readings and ±0.5°C for temperature readings. All sensors are calibrated before shipping."
                  }
                ].map((faq, index) => (
                  <div key={index} className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="billing" className="space-y-6">
                {[
                  {
                    question: "Are there any long-term contracts?",
                    answer: "We offer both monthly and annual billing options. Annual plans come with a 10% discount, but there are no long-term contracts required - you can cancel your subscription at any time."
                  },
                  {
                    question: "Are software updates included in the subscription?",
                    answer: "Yes, all software updates and platform improvements are included in your subscription at no additional cost."
                  },
                  {
                    question: "Is there a setup fee?",
                    answer: "There's no setup fee for our software platform. However, for Enterprise customers requiring custom integration or on-site installation support, additional service fees may apply."
                  }
                ].map((faq, index) => (
                  <div key={index} className="border-b border-gray-200 pb-6">
                    <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 lg:px-8 py-16 md:py-24 bg-agro-green-dark text-white">
          <div className="max-w-5xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold">Ready to Transform Your Farming?</h2>
            <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
              Join thousands of farmers who have already improved their operations with our IoT solutions
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button size="lg" className="bg-white text-agro-green-dark hover:bg-gray-100" asChild>
                <Link to="/subscription/plans">Start Free Trial</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 px-6 py-12 md:py-16">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sprout className="text-agro-green-light h-6 w-6" />
              <span className="text-white text-xl font-semibold">AgroSmart</span>
            </div>
            <p className="text-sm">
              {t('footer.description')}
            </p>
            <div className="mt-4 flex space-x-4">
              {['facebook', 'twitter', 'instagram', 'linkedin'].map((social) => (
                <a key={social} href="#" className="text-gray-400 hover:text-white">
                  <span className="sr-only">{social}</span>
                  <div className="h-6 w-6 rounded-full bg-gray-700 flex items-center justify-center">
                    <span className="text-xs">{social[0].toUpperCase()}</span>
                  </div>
                </a>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.product')}</h3>
            <ul className="space-y-2">
              {['Features', 'How It Works', 'Pricing', 'Use Cases', 'Integrations'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.resources')}</h3>
            <ul className="space-y-2">
              {['Documentation', 'API', 'Support', 'Blog', 'Partners'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.company')}</h3>
            <ul className="space-y-2">
              {['About', 'Team', 'Careers', 'Privacy Policy', 'Terms of Service'].map((item) => (
                <li key={item}>
                  <a href="#" className="text-gray-400 hover:text-white text-sm">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-gray-800 text-sm text-gray-400 flex flex-col md:flex-row justify-between items-center">
          <p>© {new Date().getFullYear()} AgroSmart. {t('footer.copyright')}</p>
          <div className="mt-4 md:mt-0">
            <a href="#" className="hover:text-white">{t('footer.privacy')}</a>
            <span className="mx-2">·</span>
            <a href="#" className="hover:text-white">{t('footer.terms')}</a>
            <span className="mx-2">·</span>
            <a href="#" className="hover:text-white">{t('footer.cookies')}</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
