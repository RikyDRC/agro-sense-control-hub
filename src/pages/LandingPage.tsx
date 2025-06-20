
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  CheckCircle, 
  Cloud, 
  Droplet, 
  BarChart, 
  Smartphone, 
  Zap, 
  ThermometerIcon,
  Bell,
  Sprout,
  Play,
  Shield,
  Globe,
  Users,
  TrendingUp,
  Star,
  Award,
  Wifi,
  Database,
  Settings,
  MapPin,
  Monitor
} from 'lucide-react';
import { cn } from '@/lib/utils';
import LanguageSelector from '@/components/ui/language-selector';

const LandingPage = () => {
  const { t } = useTranslation('landing');

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Sprout className="text-agro-green-dark h-8 w-8" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-agro-green rounded-full animate-pulse" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-agro-green-dark to-agro-green bg-clip-text text-transparent">
              Irrify
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/features" className="text-gray-600 hover:text-agro-green transition-colors">
                {t('navigation.features')}
              </Link>
              <Link to="/pricing" className="text-gray-600 hover:text-agro-green transition-colors">
                {t('navigation.pricing')}
              </Link>
              <Link to="/about" className="text-gray-600 hover:text-agro-green transition-colors">
                {t('navigation.about')}
              </Link>
            </nav>
            
            <LanguageSelector />
            
            <Button asChild size="sm" className="bg-agro-green hover:bg-agro-green-dark text-white">
              <Link to="/auth">{t('navigation.signIn')}</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-agro-green-dark/5 via-white to-agro-green/5">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />
          
          <div className="container mx-auto px-4 py-20 md:py-32">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 animate-fade-in">
                <div className="space-y-4">
                  <Badge variant="outline" className="bg-agro-green/10 text-agro-green border-agro-green/20">
                    <Wifi className="w-3 h-3 mr-1" />
                    {t('hero.badge')}
                  </Badge>
                  
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
                    <span className="bg-gradient-to-r from-agro-green-dark via-agro-green to-agro-green-light bg-clip-text text-transparent">
                      {t('hero.title')}
                    </span>
                  </h1>
                  
                  <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-2xl">
                    {t('hero.subtitle')}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    className="bg-agro-green hover:bg-agro-green-dark text-white shadow-lg hover:shadow-xl transition-all duration-300 group"
                    asChild
                  >
                    <Link to="/auth">
                      {t('hero.getStarted')}
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="border-2 border-agro-green text-agro-green hover:bg-agro-green hover:text-white transition-all duration-300 group"
                    onClick={() => {
                      const demoSection = document.getElementById('demo');
                      demoSection?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    {t('hero.watchDemo')}
                  </Button>
                </div>
                
                <div className="flex items-center gap-8 pt-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-agro-green-dark">10k+</div>
                    <div className="text-sm text-gray-500">{t('hero.stats.farmers')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-agro-green-dark">50M+</div>
                    <div className="text-sm text-gray-500">{t('hero.stats.sensors')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-agro-green-dark">30%</div>
                    <div className="text-sm text-gray-500">{t('hero.stats.waterSaved')}</div>
                  </div>
                </div>
              </div>
              
              <div className="relative lg:scale-110 animate-fade-in">
                <div className="absolute inset-0 bg-gradient-to-r from-agro-green/20 to-agro-green-light/20 rounded-3xl blur-3xl" />
                <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border">
                  <div className="p-4 bg-agro-green-dark text-white flex items-center gap-3">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                    </div>
                    <div className="text-sm font-medium">Smart Technology Hub</div>
                  </div>
                  <img 
                    src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&h=600&q=80" 
                    alt="Smart Technology Circuit Board" 
                    className="w-full h-auto object-cover animate-pulse"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-white/90 backdrop-blur rounded-lg p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-700 font-medium">AI Processing</span>
                        <span className="text-agro-green font-bold">Active</span>
                      </div>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                        <div className="bg-agro-green h-1.5 rounded-full w-3/4 animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="py-20 md:py-32 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16 space-y-4">
              <Badge variant="outline" className="bg-agro-green/10 text-agro-green border-agro-green/20">
                <Settings className="w-3 h-3 mr-1" />
                {t('features.badge')}
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">{t('features.title')}</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t('features.subtitle')}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <ThermometerIcon className="h-8 w-8" />,
                  title: t('features.list.realTimeData.title'),
                  description: t('features.list.realTimeData.description'),
                  color: "from-blue-500 to-cyan-500"
                },
                {
                  icon: <Droplet className="h-8 w-8" />,
                  title: t('features.list.automatedWatering.title'),
                  description: t('features.list.automatedWatering.description'),
                  color: "from-agro-green to-agro-green-light"
                },
                {
                  icon: <Smartphone className="h-8 w-8" />,
                  title: t('features.list.remoteControl.title'),
                  description: t('features.list.remoteControl.description'),
                  color: "from-purple-500 to-pink-500"
                },
                {
                  icon: <Cloud className="h-8 w-8" />,
                  title: t('features.list.weatherIntegration.title'),
                  description: t('features.list.weatherIntegration.description'),
                  color: "from-indigo-500 to-blue-500"
                },
                {
                  icon: <Bell className="h-8 w-8" />,
                  title: t('features.list.smartAlerts.title'),
                  description: t('features.list.smartAlerts.description'),
                  color: "from-orange-500 to-red-500"
                },
                {
                  icon: <Zap className="h-8 w-8" />,
                  title: t('features.list.energyEfficiency.title'),
                  description: t('features.list.energyEfficiency.description'),
                  color: "from-yellow-500 to-orange-500"
                }
              ].map((feature, index) => (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg hover:-translate-y-2">
                  <CardContent className="p-8">
                    <div className={cn(
                      "w-16 h-16 rounded-2xl bg-gradient-to-r flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300",
                      feature.color
                    )}>
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

        {/* Demo Section */}
        <section id="demo" className="py-20 md:py-32 bg-gradient-to-br from-agro-green-dark to-agro-green text-white">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                <div className="space-y-4">
                  <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                    <Monitor className="w-3 h-3 mr-1" />
                    {t('demo.badge')}
                  </Badge>
                  <h2 className="text-4xl md:text-5xl font-bold">{t('demo.title')}</h2>
                  <p className="text-xl text-white/90 leading-relaxed">
                    {t('demo.subtitle')}
                  </p>
                </div>
                
                <div className="space-y-4">
                  {[
                    t('demo.features.realTime'),
                    t('demo.features.automation'),
                    t('demo.features.analytics'),
                    t('demo.features.alerts')
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0" />
                      <span className="text-white/90">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  size="lg" 
                  className="bg-white text-agro-green-dark hover:bg-gray-100 shadow-lg group"
                  asChild
                >
                  <Link to="/auth">
                    {t('demo.cta')}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
              
              <div className="relative">
                <div className="absolute inset-0 bg-white/10 rounded-3xl blur-3xl" />
                <div className="relative bg-white/10 backdrop-blur rounded-3xl p-8 border border-white/20">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Live Dashboard</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-sm">Online</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 rounded-xl p-4">
                        <div className="text-2xl font-bold">87%</div>
                        <div className="text-sm text-white/70">Soil Moisture</div>
                      </div>
                      <div className="bg-white/10 rounded-xl p-4">
                        <div className="text-2xl font-bold">24°C</div>
                        <div className="text-sm text-white/70">Temperature</div>
                      </div>
                    </div>
                    
                    <div className="bg-white/10 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Water Usage</span>
                        <span className="text-sm">↓ 30%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div className="bg-green-400 h-2 rounded-full w-3/4" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{t('stats.title')}</h2>
              <p className="text-xl text-gray-600">{t('stats.subtitle')}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Users className="h-12 w-12 text-agro-green" />,
                  stat: "70%",
                  label: t('stats.timeSaved'),
                  description: t('stats.timeSavedDesc')
                },
                {
                  icon: <Droplet className="h-12 w-12 text-blue-500" />,
                  stat: "30%",
                  label: t('stats.waterReduced'),
                  description: t('stats.waterReducedDesc')
                },
                {
                  icon: <TrendingUp className="h-12 w-12 text-green-500" />,
                  stat: "25%",
                  label: t('stats.yieldIncrease'),
                  description: t('stats.yieldIncreaseDesc')
                }
              ].map((item, index) => (
                <Card key={index} className="text-center p-8 hover:shadow-lg transition-shadow">
                  <CardContent className="space-y-4">
                    <div className="mx-auto w-fit p-4 bg-gray-50 rounded-2xl">
                      {item.icon}
                    </div>
                    <div className="text-5xl font-bold text-gray-900">{item.stat}</div>
                    <div className="text-xl font-semibold text-gray-700">{item.label}</div>
                    <p className="text-gray-600">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 md:py-32 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <Badge variant="outline" className="bg-agro-green/10 text-agro-green border-agro-green/20 mb-4">
                <Star className="w-3 h-3 mr-1" />
                {t('testimonials.badge')}
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{t('testimonials.title')}</h2>
              <p className="text-xl text-gray-600">{t('testimonials.subtitle')}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote: t('testimonials.testimonial1.quote'),
                  author: t('testimonials.testimonial1.author'),
                  role: t('testimonials.testimonial1.role'),
                  rating: 5
                },
                {
                  quote: t('testimonials.testimonial2.quote'),
                  author: t('testimonials.testimonial2.author'),
                  role: t('testimonials.testimonial2.role'),
                  rating: 5
                },
                {
                  quote: t('testimonials.testimonial3.quote'),
                  author: t('testimonials.testimonial3.author'),
                  role: t('testimonials.testimonial3.role'),
                  rating: 5
                }
              ].map((testimonial, index) => (
                <Card key={index} className="p-8 hover:shadow-lg transition-shadow">
                  <CardContent className="space-y-6">
                    <div className="flex gap-1">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                    <blockquote className="text-gray-700 italic leading-relaxed">
                      "{testimonial.quote}"
                    </blockquote>
                    <div>
                      <div className="font-semibold text-gray-900">{testimonial.author}</div>
                      <div className="text-sm text-gray-500">{testimonial.role}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">{t('pricing.title')}</h2>
              <p className="text-xl text-gray-600">{t('pricing.subtitle')}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {[
                {
                  name: t('pricing.free.name'),
                  price: t('pricing.free.price'),
                  period: t('pricing.free.period'),
                  description: t('pricing.free.description'),
                  features: t('pricing.free.features', { returnObjects: true }) as string[],
                  highlighted: false
                },
                {
                  name: t('pricing.premium.name'),
                  price: t('pricing.premium.price'),
                  period: t('pricing.premium.period'),
                  description: t('pricing.premium.description'),
                  features: t('pricing.premium.features', { returnObjects: true }) as string[],
                  highlighted: true,
                  badge: t('pricing.premium.mostPopular')
                }
              ].map((plan, index) => (
                <Card 
                  key={index} 
                  className={cn(
                    "relative overflow-hidden transition-all duration-300 hover:shadow-xl",
                    plan.highlighted ? "ring-2 ring-agro-green shadow-xl scale-105" : "hover:-translate-y-1"
                  )}
                >
                  {plan.badge && (
                    <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-agro-green via-agro-green-dark to-agro-green text-white text-center py-3 text-sm font-semibold tracking-wide shadow-lg">
                      <div className="flex items-center justify-center gap-2">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="uppercase">{plan.badge}</span>
                        <Star className="w-4 h-4 fill-current" />
                      </div>
                      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                    </div>
                  )}
                  <CardContent className={cn("p-8", plan.badge && "pt-16")}>
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
                        {Array.isArray(plan.features) && plan.features.map((feature: string, featureIndex: number) => (
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
                        <Link to="/subscription-plans">{t('pricing.selectPlan')}</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 md:py-32 bg-gradient-to-r from-agro-green-dark to-agro-green text-white">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto space-y-8">
              <h2 className="text-4xl md:text-6xl font-bold">{t('cta.title')}</h2>
              <p className="text-xl md:text-2xl text-white/90 leading-relaxed">
                {t('cta.subtitle')}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-white text-agro-green-dark hover:bg-gray-100 shadow-lg group"
                  asChild
                >
                  <Link to="/auth">
                    {t('cta.startTrial')}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white/10"
                  asChild
                >
                  <Link to="/auth">{t('cta.signIn')}</Link>
                </Button>
              </div>
              
              <div className="flex items-center justify-center gap-8 pt-8 text-white/80">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  <span className="text-sm">{t('cta.secure')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  <span className="text-sm">{t('cta.worldwide')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  <span className="text-sm">{t('cta.certified')}</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Sprout className="text-agro-green-light h-8 w-8" />
                <span className="text-xl font-bold text-white">Irrify</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                {t('footer.description')}
              </p>
              <div className="flex gap-4">
                {['facebook', 'twitter', 'linkedin', 'instagram'].map((social) => (
                  <a key={social} href="#" className="text-gray-400 hover:text-agro-green transition-colors">
                    <div className="w-10 h-10 rounded-full bg-gray-800 hover:bg-agro-green/20 flex items-center justify-center transition-colors">
                      <span className="text-sm font-bold">{social[0].toUpperCase()}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">{t('footer.product')}</h3>
              <ul className="space-y-2">
                <li><Link to="/features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/integrations" className="text-gray-400 hover:text-white transition-colors">Integrations</Link></li>
                <li><Link to="/documentation" className="text-gray-400 hover:text-white transition-colors">Documentation</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">{t('footer.company')}</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About</Link></li>
                <li><Link to="/blog" className="text-gray-400 hover:text-white transition-colors">Blog</Link></li>
                <li><Link to="/careers" className="text-gray-400 hover:text-white transition-colors">Careers</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-4">{t('footer.support')}</h3>
              <ul className="space-y-2">
                <li><Link to="/help-center" className="text-gray-400 hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/community" className="text-gray-400 hover:text-white transition-colors">Community</Link></li>
                <li><Link to="/status" className="text-gray-400 hover:text-white transition-colors">Status</Link></li>
                <li><Link to="/api-docs" className="text-gray-400 hover:text-white transition-colors">API Docs</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} Irrify. {t('footer.copyright')}
            </p>
            <div className="mt-4 md:mt-0 flex gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">{t('footer.privacy')}</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">{t('footer.terms')}</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">{t('footer.cookies')}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
