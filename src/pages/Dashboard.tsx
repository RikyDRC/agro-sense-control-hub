
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardStats from '@/components/dashboard/DashboardStats';
import SensorReadingsChart from '@/components/dashboard/SensorReadingsChart';
import DeviceStatusList from '@/components/dashboard/DeviceStatusList';
import WeatherWidget from '@/components/dashboard/WeatherWidget';
import QuickActions from '@/components/dashboard/QuickActions';
import AlertsWidget from '@/components/dashboard/AlertsWidget';
import SystemHealthWidget from '@/components/dashboard/SystemHealthWidget';
import RecentActivityWidget from '@/components/dashboard/RecentActivityWidget';
import GaugeChart from '@/components/dashboard/GaugeChart';
import PredictiveAnalyticsWidget from '@/components/dashboard/PredictiveAnalyticsWidget';
import MobileDashboardLayout from '@/components/dashboard/MobileDashboardLayout';
import QuickAutomationPanel from '@/components/dashboard/QuickAutomationPanel';
import { WeatherForecast } from '@/types';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SunMoon, Grid3X3, BarChart3, Activity, TrendingUp } from 'lucide-react';
import { getUserLocationWeather } from '@/services/weatherService';
import { toast } from '@/components/ui/sonner';
import { useDevices } from '@/hooks/useDevices';
import { useZones } from '@/hooks/useZones';
import { useSensorReadings } from '@/hooks/useSensorReadings';
import { useAlerts } from '@/hooks/useAlerts';
import { useAutomationHistory } from '@/hooks/useAutomationHistory';
import { useIsMobile } from '@/hooks/use-mobile';

const Dashboard: React.FC = () => {
  const { t } = useTranslation(['dashboard', 'navigation', 'common']);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentWeather, setCurrentWeather] = useState<WeatherForecast | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  
  // Fetch real data from database
  const { devices, loading: devicesLoading } = useDevices();
  const { zones, loading: zonesLoading } = useZones();
  const { readings, loading: readingsLoading } = useSensorReadings();
  const { alerts, loading: alertsLoading } = useAlerts();
  const { history: automationHistory, loading: historyLoading } = useAutomationHistory();
  
  const isMobile = useIsMobile();
  
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  // Fetch real weather data based on user location
  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setWeatherLoading(true);
        const weatherData = await getUserLocationWeather();
        
        if (weatherData) {
          setCurrentWeather(weatherData.current);
          setForecast(weatherData.forecast);
        } else {
          console.log('Using fallback location for weather data');
          toast.info('Using default location for weather data');
        }
      } catch (error) {
        console.error('Error fetching weather data:', error);
        toast.error('Failed to load weather data');
      } finally {
        setWeatherLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  // Calculate derived metrics for mobile layout
  const activeDevices = devices.filter(d => d.status === 'online').length;
  const unreadAlerts = alerts.filter(a => !a.isRead).length;
  const averageMoisture = readings
    .filter(r => r.unit === '%')
    .reduce((sum, r, _, arr) => sum + r.value / arr.length, 0) || 0;

  // Show loading state while data is being fetched
  const isLoading = devicesLoading || zonesLoading || readingsLoading || alertsLoading || historyLoading;

  const calculateSystemHealth = () => {
    if (devices.length === 0) return 0;
    const onlineDevices = devices.filter(d => d.status === 'online');
    return Math.round((onlineDevices.length / devices.length) * 100);
  };

  const calculateWaterUsage = () => {
    const activePumps = devices.filter(d => d.type === 'pump' && d.status === 'online');
    const totalUsage = activePumps.length * 50; // Simplified calculation
    return totalUsage > 0 ? `${totalUsage}L` : '0L';
  };

  const systemHealth = calculateSystemHealth();
  const waterUsage = calculateWaterUsage();

  if (isMobile) {
    return (
      <DashboardLayout>
        <MobileDashboardLayout
          activeDevices={activeDevices}
          totalAlerts={unreadAlerts}
          systemHealth={systemHealth}
          waterUsage={waterUsage}
        >
          <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
            <TabsContent value="overview" className="space-y-3">
              <div className="dashboard-card p-4 fade-in">
                <DashboardStats devices={devices} zones={zones} readings={readings} />
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="dashboard-card p-4 hover-scale fade-in" style={{ animationDelay: '0.1s' }}>
                    <GaugeChart
                      title={t('widgets.soilMoisture.title')}
                      value={averageMoisture}
                      max={100}
                      unit="%"
                      description={t('widgets.soilMoisture.description')}
                      color="hsl(142, 76%, 36%)"
                      size="sm"
                    />
                  </div>
                  <div className="dashboard-card p-4 hover-scale fade-in" style={{ animationDelay: '0.2s' }}>
                    <GaugeChart
                      title={t('widgets.systemHealth.title')}
                      value={systemHealth}
                      max={100}
                      unit="%"
                      description={t('widgets.systemHealth.description')}
                      color={systemHealth > 80 ? "hsl(142, 76%, 36%)" : systemHealth > 60 ? "hsl(46, 100%, 50%)" : "hsl(0, 84%, 60%)"}
                      size="sm"
                    />
                  </div>
                </div>
                
                <div className="dashboard-card fade-in" style={{ animationDelay: '0.3s' }}>
                  <QuickAutomationPanel />
                </div>
                
                <div className="dashboard-card fade-in" style={{ animationDelay: '0.4s' }}>
                  <DeviceStatusList devices={devices} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="charts" className="space-y-3">
              <SensorReadingsChart readings={readings} />
              <SystemHealthWidget devices={devices} zones={zones} />
            </TabsContent>

            <TabsContent value="alerts" className="space-y-3">
              <AlertsWidget alerts={alerts} />
            </TabsContent>

            <TabsContent value="activity" className="space-y-3">
              <RecentActivityWidget activities={automationHistory} />
            </TabsContent>

            <TabsContent value="insights" className="space-y-3">
              <PredictiveAnalyticsWidget 
                currentWeather={currentWeather || undefined}
                moistureLevel={averageMoisture}
              />
            </TabsContent>
          </Tabs>
        </MobileDashboardLayout>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6 flex justify-between items-center fade-in">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            {t('title')}
          </h1>
          <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <Tabs value={activeView} onValueChange={setActiveView}>
            <TabsList className="grid grid-cols-4 bg-muted/50 backdrop-blur-sm">
              <TabsTrigger value="overview" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Grid3X3 className="h-4 w-4" />
                {t('navigation:tabs.overview')}
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <BarChart3 className="h-4 w-4" />
                {t('navigation:tabs.analytics')}
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Activity className="h-4 w-4" />
                {t('navigation:tabs.monitoring')}
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <TrendingUp className="h-4 w-4" />
                {t('navigation:tabs.insights')}
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button 
            variant="outline" 
            size="icon"
            onClick={toggleTheme}
            className="h-10 w-10 rounded-full border-2 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
          >
            <SunMoon className="h-5 w-5" />
            <span className="sr-only">{t('navigation:header.toggleTheme')}</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/30 border-t-primary mx-auto mb-4"></div>
            <p className="text-lg font-medium text-muted-foreground">{t('loading')}</p>
          </div>
        </div>
      ) : (
        <Tabs value={activeView} onValueChange={setActiveView} className="space-y-4">
          <TabsContent value="overview" className="space-y-4">
            {/* Enhanced Stats Overview */}
            <div className="dashboard-card p-6 fade-in">
              <DashboardStats devices={devices} zones={zones} readings={readings} />
            </div>
            
            {/* Enhanced Overview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
              {/* Left Column - Gauges and Quick Actions */}
              <div className="lg:col-span-2 space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="dashboard-card p-6 hover-scale fade-in" style={{ animationDelay: '0.1s' }}>
                    <GaugeChart
                      title={t('widgets.soilMoisture.title')}
                      value={averageMoisture}
                      max={100}
                      unit="%"
                      description={t('widgets.soilMoisture.description')}
                      color="hsl(142, 76%, 36%)"
                    />
                  </div>
                  <div className="dashboard-card p-6 hover-scale fade-in" style={{ animationDelay: '0.2s' }}>
                    <GaugeChart
                      title={t('widgets.systemHealth.title')}
                      value={systemHealth}
                      max={100}
                      unit="%"
                      description={t('widgets.systemHealth.description')}
                      color={systemHealth > 80 ? "hsl(142, 76%, 36%)" : systemHealth > 60 ? "hsl(46, 100%, 50%)" : "hsl(0, 84%, 60%)"}
                    />
                  </div>
                </div>
                <div className="dashboard-card hover-scale fade-in" style={{ animationDelay: '0.3s' }}>
                  <QuickAutomationPanel />
                </div>
              </div>
              
              {/* Center Column - Charts and Health */}
              <div className="lg:col-span-2 space-y-4">
                <div className="dashboard-card hover-scale fade-in" style={{ animationDelay: '0.4s' }}>
                  <SensorReadingsChart readings={readings} />
                </div>
                <div className="dashboard-card hover-scale fade-in" style={{ animationDelay: '0.5s' }}>
                  <SystemHealthWidget devices={devices} zones={zones} />
                </div>
              </div>
              
              {/* Right Column - Alerts and Activity */}
              <div className="lg:col-span-2 space-y-4">
                <div className="dashboard-card hover-scale fade-in" style={{ animationDelay: '0.6s' }}>
                  <AlertsWidget alerts={alerts} />
                </div>
                <div className="dashboard-card hover-scale fade-in" style={{ animationDelay: '0.7s' }}>
                  <RecentActivityWidget activities={automationHistory} />
                </div>
              </div>
            </div>
            
            {/* Bottom Row - Device Status and Weather */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="dashboard-card hover-scale fade-in" style={{ animationDelay: '0.8s' }}>
                <DeviceStatusList devices={devices} />
              </div>
              <div className="lg:col-span-2">
                {!weatherLoading && currentWeather ? (
                  <div className="dashboard-card hover-scale fade-in" style={{ animationDelay: '0.9s' }}>
                    <WeatherWidget 
                      currentWeather={currentWeather} 
                      forecast={forecast} 
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-48 dashboard-card">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary/30 border-t-primary mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Loading weather data...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <SensorReadingsChart readings={readings} />
              <SystemHealthWidget devices={devices} zones={zones} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <GaugeChart
                title={t('widgets.soilMoisture.title')}
                value={averageMoisture}
                max={100}
                unit="%"
                color="hsl(152, 37%, 38%)"
              />
              <GaugeChart
                title={t('widgets.systemHealth.title')}
                value={systemHealth}
                max={100}
                unit="%"
                color={systemHealth > 80 ? "hsl(152, 37%, 38%)" : "hsl(0, 84%, 60%)"}
              />
              <GaugeChart
                title={t('widgets.activeDevices.title')}
                value={activeDevices}
                max={devices.length || 1}
                unit=""
                color="hsl(200, 70%, 50%)"
              />
              <GaugeChart
                title={t('widgets.waterUsage.title')}
                value={parseInt(waterUsage) || 0}
                max={500}
                unit="L"
                color="hsl(210, 40%, 50%)"
              />
            </div>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <RecentActivityWidget activities={automationHistory} />
              </div>
              <div>
                <AlertsWidget alerts={alerts} />
              </div>
            </div>
            <DeviceStatusList devices={devices} />
          </TabsContent>

          <TabsContent value="insights" className="space-y-4">
            <PredictiveAnalyticsWidget 
              currentWeather={currentWeather || undefined}
              moistureLevel={averageMoisture}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <QuickAutomationPanel />
              <SystemHealthWidget devices={devices} zones={zones} />
            </div>
          </TabsContent>
        </Tabs>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
