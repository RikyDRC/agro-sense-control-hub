import React, { useState, useEffect } from 'react';
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
            <TabsContent value="overview" className="space-y-4">
              <DashboardStats devices={devices} zones={zones} readings={readings} />
              
              <div className="grid grid-cols-1 gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <GaugeChart
                    title="Soil Moisture"
                    value={averageMoisture}
                    max={100}
                    unit="%"
                    description="Average across all zones"
                    color="hsl(152, 37%, 38%)"
                    size="sm"
                  />
                  <GaugeChart
                    title="System Health"
                    value={systemHealth}
                    max={100}
                    unit="%"
                    description="Overall status"
                    color={systemHealth > 80 ? "hsl(152, 37%, 38%)" : systemHealth > 60 ? "hsl(46, 100%, 50%)" : "hsl(0, 84%, 60%)"}
                    size="sm"
                  />
                </div>
                
                <QuickAutomationPanel />
                
                <DeviceStatusList devices={devices} />
              </div>
            </TabsContent>

            <TabsContent value="charts" className="space-y-4">
              <SensorReadingsChart readings={readings} />
              <SystemHealthWidget devices={devices} zones={zones} />
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              <AlertsWidget alerts={alerts} />
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <RecentActivityWidget activities={automationHistory} />
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
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
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to your farm monitoring system</p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={activeView} onValueChange={setActiveView}>
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Grid3X3 className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Monitoring
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Insights
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Button 
            variant="outline" 
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-full"
          >
            <SunMoon className="h-5 w-5" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      ) : (
        <Tabs value={activeView} onValueChange={setActiveView} className="space-y-6">
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Overview */}
            <DashboardStats devices={devices} zones={zones} readings={readings} />
            
            {/* Enhanced Overview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
              {/* Left Column - Gauges and Quick Actions */}
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <GaugeChart
                    title="Soil Moisture"
                    value={averageMoisture}
                    max={100}
                    unit="%"
                    description="Average across all zones"
                    color="hsl(152, 37%, 38%)"
                  />
                  <GaugeChart
                    title="System Health"
                    value={systemHealth}
                    max={100}
                    unit="%"
                    description="Overall system status"
                    color={systemHealth > 80 ? "hsl(152, 37%, 38%)" : systemHealth > 60 ? "hsl(46, 100%, 50%)" : "hsl(0, 84%, 60%)"}
                  />
                </div>
                <QuickAutomationPanel />
              </div>
              
              {/* Center Column - Charts and Health */}
              <div className="lg:col-span-2 space-y-6">
                <SensorReadingsChart readings={readings} />
                <SystemHealthWidget devices={devices} zones={zones} />
              </div>
              
              {/* Right Column - Alerts and Activity */}
              <div className="lg:col-span-2 space-y-6">
                <AlertsWidget alerts={alerts} />
                <RecentActivityWidget activities={automationHistory} />
              </div>
            </div>
            
            {/* Bottom Row - Device Status and Weather */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div>
                <DeviceStatusList devices={devices} />
              </div>
              <div className="lg:col-span-2">
                {!weatherLoading && currentWeather ? (
                  <WeatherWidget 
                    currentWeather={currentWeather} 
                    forecast={forecast} 
                  />
                ) : (
                  <div className="flex items-center justify-center h-48 bg-muted/50 rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Loading weather data...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SensorReadingsChart readings={readings} />
              <SystemHealthWidget devices={devices} zones={zones} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <GaugeChart
                title="Soil Moisture"
                value={averageMoisture}
                max={100}
                unit="%"
                color="hsl(152, 37%, 38%)"
              />
              <GaugeChart
                title="System Health"
                value={systemHealth}
                max={100}
                unit="%"
                color={systemHealth > 80 ? "hsl(152, 37%, 38%)" : "hsl(0, 84%, 60%)"}
              />
              <GaugeChart
                title="Active Devices"
                value={activeDevices}
                max={devices.length || 1}
                unit=""
                color="hsl(200, 70%, 50%)"
              />
              <GaugeChart
                title="Water Usage"
                value={parseInt(waterUsage) || 0}
                max={500}
                unit="L"
                color="hsl(210, 40%, 50%)"
              />
            </div>
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RecentActivityWidget activities={automationHistory} />
              </div>
              <div>
                <AlertsWidget alerts={alerts} />
              </div>
            </div>
            <DeviceStatusList devices={devices} />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <PredictiveAnalyticsWidget 
              currentWeather={currentWeather || undefined}
              moistureLevel={averageMoisture}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
