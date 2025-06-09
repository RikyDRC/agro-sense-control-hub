import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardStats from '@/components/dashboard/DashboardStats';
import SensorReadingsChart from '@/components/dashboard/SensorReadingsChart';
import DeviceStatusList from '@/components/dashboard/DeviceStatusList';
import WeatherWidget from '@/components/dashboard/WeatherWidget';
import QuickActions from '@/components/dashboard/QuickActions';
import { Device, DeviceStatus, DeviceType, WeatherCondition, WeatherForecast } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/button';
import { SunMoon } from 'lucide-react';
import { getUserLocationWeather } from '@/services/weatherService';
import { toast } from '@/components/ui/sonner';

// Mock Data
const mockDevices: Device[] = [
  {
    id: '1',
    name: 'Moisture Sensor A1',
    type: DeviceType.MOISTURE_SENSOR,
    status: DeviceStatus.ONLINE,
    batteryLevel: 78,
    lastReading: 32.5,
    lastUpdated: new Date().toISOString(),
    location: { lat: 35.6895, lng: 139.6917 },
    zoneId: 'zone-a'
  },
  {
    id: '2',
    name: 'Temperature Sensor A2',
    type: DeviceType.TEMPERATURE_SENSOR,
    status: DeviceStatus.ONLINE,
    batteryLevel: 92,
    lastReading: 24.3,
    lastUpdated: new Date().toISOString(),
    location: { lat: 35.6895, lng: 139.6917 },
    zoneId: 'zone-a'
  },
  {
    id: '3',
    name: 'Valve B1',
    type: DeviceType.VALVE,
    status: DeviceStatus.OFFLINE,
    batteryLevel: 15,
    lastUpdated: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    location: { lat: 35.6895, lng: 139.6917 },
    zoneId: 'zone-b'
  },
  {
    id: '4',
    name: 'Main Pump',
    type: DeviceType.PUMP,
    status: DeviceStatus.ONLINE,
    batteryLevel: 65,
    lastUpdated: new Date().toISOString(),
    location: { lat: 35.6895, lng: 139.6917 }
  },
  {
    id: '5',
    name: 'Weather Station',
    type: DeviceType.WEATHER_STATION,
    status: DeviceStatus.MAINTENANCE,
    batteryLevel: 42,
    lastUpdated: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    location: { lat: 35.6895, lng: 139.6917 }
  }
];

const currentDate = new Date();
const mockCurrentWeather: WeatherForecast = {
  id: uuidv4(),
  date: currentDate.toISOString(),
  temperature: {
    min: 18,
    max: 26,
    unit: 'C',
    current: 24
  },
  humidity: 65,
  precipitation: {
    probability: 20,
    amount: 0,
    unit: 'mm'
  },
  windSpeed: 12,
  condition: WeatherCondition.PARTLY_CLOUDY
};

const mockForecast: WeatherForecast[] = Array.from({ length: 5 }).map((_, index) => {
  const date = new Date();
  date.setDate(date.getDate() + index + 1);
  
  const conditions = [
    WeatherCondition.SUNNY, 
    WeatherCondition.PARTLY_CLOUDY, 
    WeatherCondition.CLOUDY, 
    WeatherCondition.RAIN, 
    WeatherCondition.STORM
  ];
  
  return {
    id: uuidv4(),
    date: date.toISOString(),
    temperature: {
      min: 16 + Math.floor(Math.random() * 4),
      max: 24 + Math.floor(Math.random() * 6),
      unit: 'C'
    },
    humidity: 50 + Math.floor(Math.random() * 30),
    precipitation: {
      probability: Math.floor(Math.random() * 100),
      amount: Math.random() * 10,
      unit: 'mm'
    },
    windSpeed: 5 + Math.floor(Math.random() * 15),
    condition: conditions[index % conditions.length]
  };
});

const Dashboard: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentWeather, setCurrentWeather] = useState<WeatherForecast | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(true);
  
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

      <div className="space-y-6">
        <DashboardStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <QuickActions />
          </div>
          <div className="lg:col-span-2">
            <SensorReadingsChart />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <DeviceStatusList devices={mockDevices} />
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
    </DashboardLayout>
  );
};

export default Dashboard;
