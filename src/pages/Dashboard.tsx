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
import { WeatherForecast } from '@/types';
import { Button } from '@/components/ui/button';
import { SunMoon } from 'lucide-react';
import { getUserLocationWeather } from '@/services/weatherService';
import { toast } from '@/components/ui/sonner';
import { useDevices } from '@/hooks/useDevices';
import { useZones } from '@/hooks/useZones';
import { useSensorReadings } from '@/hooks/useSensorReadings';
import { useAlerts } from '@/hooks/useAlerts';
import { useAutomationHistory } from '@/hooks/useAutomationHistory';

const Dashboard: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentWeather, setCurrentWeather] = useState<WeatherForecast | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(true);
  
  // Fetch real data from database
  const { devices, loading: devicesLoading } = useDevices();
  const { zones, loading: zonesLoading } = useZones();
  const { readings, loading: readingsLoading } = useSensorReadings();
  const { alerts, loading: alertsLoading } = useAlerts();
  const { history: automationHistory, loading: historyLoading } = useAutomationHistory();
  
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
          // Fallback to Tunisia coordinates if location not available
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

  // Show loading state while data is being fetched
  const isLoading = devicesLoading || zonesLoading || readingsLoading || alertsLoading || historyLoading;
  
  return (
    <DashboardLayout>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back to your farm monitoring system</p>
        </div>
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

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading dashboard data...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Overview */}
          <DashboardStats devices={devices} zones={zones} readings={readings} />
          
          {/* Main Content Grid - Mobile First Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column - Quick Actions (Mobile: Full width, Desktop: 1 column) */}
            <div className="lg:col-span-1">
              <QuickActions />
            </div>
            
            {/* Center Column - Charts (Mobile: Full width, Desktop: 2 columns) */}
            <div className="lg:col-span-2 space-y-6">
              <SensorReadingsChart readings={readings} />
              
              {/* System Health Widget */}
              <SystemHealthWidget devices={devices} zones={zones} />
            </div>
            
            {/* Right Column - Alerts & Activity (Mobile: Full width, Desktop: 1 column) */}
            <div className="lg:col-span-1 space-y-6">
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
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
