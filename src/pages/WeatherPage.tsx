import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  CloudSun, Sun, Cloud, CloudRain, CloudLightning, Snowflake, CloudFog, 
  ThermometerSun, Droplets, Wind, Calendar, RefreshCw, Umbrella, 
  AlertTriangle, Loader2, MapPin
} from 'lucide-react';
import { WeatherCondition, WeatherForecast } from '@/types';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { getWeatherData, getHistoricalWeatherData } from '@/services/weatherService';
import { toast } from '@/components/ui/sonner';

// Mock data
const currentDate = new Date();
const mockCurrentWeather: WeatherForecast = {
  id: '1',
  date: currentDate.toISOString(),
  temperature: {
    min: 18,
    max: 26,
    current: 24,
    unit: '°C'
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

const generateMockForecast = () => {
  const forecast: WeatherForecast[] = [];
  const conditions = Object.values(WeatherCondition);
  
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    forecast.push({
      id: `forecast-${i}`,
      date: date.toISOString(),
      temperature: {
        min: 16 + Math.floor(Math.random() * 4),
        max: 24 + Math.floor(Math.random() * 6),
        unit: '°C'
      },
      humidity: 50 + Math.floor(Math.random() * 30),
      precipitation: {
        probability: Math.floor(Math.random() * 100),
        amount: Math.random() * 10,
        unit: 'mm'
      },
      windSpeed: 5 + Math.floor(Math.random() * 15),
      condition: conditions[Math.floor(Math.random() * conditions.length)]
    });
  }
  
  return forecast;
};

const mockForecast = generateMockForecast();

// Mock historical data for charts
const generateHistoricalData = (days: number) => {
  const data = [];
  const today = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    
    data.push({
      date: date.toLocaleDateString(),
      temperature: 15 + Math.floor(Math.random() * 15),
      humidity: 40 + Math.floor(Math.random() * 40),
      precipitation: Math.random() * 10,
    });
  }
  
  return data;
};

const mockHistoricalData = {
  week: generateHistoricalData(7),
  month: generateHistoricalData(30),
  year: generateHistoricalData(365)
};

const getWeatherIcon = (condition: WeatherCondition, size: number = 24) => {
  switch (condition) {
    case WeatherCondition.SUNNY:
      return <Sun size={size} className="text-yellow-500" />;
    case WeatherCondition.CLOUDY:
      return <Cloud size={size} className="text-gray-500" />;
    case WeatherCondition.RAINY:
      return <CloudRain size={size} className="text-blue-500" />;
    case WeatherCondition.STORMY:
      return <CloudLightning size={size} className="text-purple-500" />;
    case WeatherCondition.SNOWY:
      return <Snowflake size={size} className="text-blue-300" />;
    case WeatherCondition.FOGGY:
      return <CloudFog size={size} className="text-gray-400" />;
    case WeatherCondition.PARTLY_CLOUDY:
      return <CloudSun size={size} className="text-yellow-400" />;
    default:
      return <Cloud size={size} className="text-gray-500" />;
  }
};

const getWeatherDescription = (condition: WeatherCondition) => {
  switch (condition) {
    case WeatherCondition.SUNNY:
      return 'Sunny';
    case WeatherCondition.CLOUDY:
      return 'Cloudy';
    case WeatherCondition.RAINY:
      return 'Rainy';
    case WeatherCondition.STORMY:
      return 'Stormy';
    case WeatherCondition.SNOWY:
      return 'Snowy';
    case WeatherCondition.FOGGY:
      return 'Foggy';
    case WeatherCondition.PARTLY_CLOUDY:
      return 'Partly Cloudy';
    default:
      return 'Unknown';
  }
};

const formatDateRange = (startTime: string, endTime: string) => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  
  return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
          ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const WeatherPage: React.FC = () => {
  const [currentWeather, setCurrentWeather] = useState<WeatherForecast | null>(null);
  const [forecast, setForecast] = useState<WeatherForecast[]>([]);
  const [historicalTab, setHistoricalTab] = useState<'week' | 'month' | 'year'>('week');
  const [historicalData, setHistoricalData] = useState<any>({ week: [], month: [], year: [] });
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Get user location and fetch weather data
  useEffect(() => {
    const getUserLocationAndWeather = async () => {
      setWeatherLoading(true);
      setWeatherError(null);

      try {
        // Get user location
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const location = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              setUserLocation(location);
              
              try {
                // Fetch current weather and forecast
                const weatherData = await getWeatherData(location.lat, location.lng);
                setCurrentWeather(weatherData.current);
                setForecast(weatherData.forecast);
                
                // Fetch historical data
                await fetchHistoricalData(location.lat, location.lng);
                
                toast.success('Weather data loaded successfully');
              } catch (weatherErr: any) {
                console.error('Error fetching weather data:', weatherErr);
                setWeatherError('Unable to load weather data. Please try again later.');
                toast.error('Failed to load weather data');
              }
              
              setWeatherLoading(false);
            },
            (error) => {
              console.warn('Geolocation error:', error);
              setWeatherError('Location access required for weather data. Please enable location services.');
              setWeatherLoading(false);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000
            }
          );
        } else {
          setWeatherError('Geolocation is not supported by this browser');
          setWeatherLoading(false);
        }
      } catch (error) {
        console.error('Error in weather initialization:', error);
        setWeatherError('Failed to initialize weather service');
        setWeatherLoading(false);
      }
    };

    getUserLocationAndWeather();
  }, []);

  const fetchHistoricalData = async (lat: number, lng: number) => {
    try {
      const today = new Date();
      
      // Fetch week data
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - 7);
      const weekData = await getHistoricalWeatherData(
        lat, lng, 
        weekStart.toISOString().split('T')[0], 
        today.toISOString().split('T')[0]
      );
      
      // Fetch month data
      const monthStart = new Date(today);
      monthStart.setDate(today.getDate() - 30);
      const monthData = await getHistoricalWeatherData(
        lat, lng,
        monthStart.toISOString().split('T')[0],
        today.toISOString().split('T')[0]
      );
      
      setHistoricalData({
        week: weekData,
        month: monthData,
        year: monthData // Using month data for year as well to avoid too many API calls
      });
    } catch (error) {
      console.error('Error fetching historical data:', error);
      toast.error('Failed to load historical weather data');
    }
  };

  const handleRefreshWeather = async () => {
    if (!userLocation) {
      toast.error('Location not available');
      return;
    }

    setIsLoading(true);
    
    try {
      const weatherData = await getWeatherData(userLocation.lat, userLocation.lng);
      setCurrentWeather(weatherData.current);
      setForecast(weatherData.forecast);
      await fetchHistoricalData(userLocation.lat, userLocation.lng);
      toast.success('Weather data refreshed successfully');
    } catch (error) {
      console.error('Error refreshing weather:', error);
      toast.error('Failed to refresh weather data');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state
  if (weatherLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading weather data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state
  if (weatherError) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Weather</h1>
              <p className="text-muted-foreground">Monitor current conditions, forecasts, and weather alerts</p>
            </div>
          </div>
          
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Weather Data Unavailable</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>{weatherError}</span>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Weather</h1>
            <p className="text-muted-foreground">Real-time weather data from Open-Meteo</p>
            {userLocation && (
              <div className="flex items-center text-sm text-muted-foreground mt-1">
                <MapPin className="h-4 w-4 mr-1" />
                Location: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
              </div>
            )}
          </div>
          <Button 
            variant="outline" 
            onClick={handleRefreshWeather}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>

        {currentWeather && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Weather Card */}
            <Card className="col-span-1">
              <CardHeader className="pb-2">
                <CardTitle>Current Conditions</CardTitle>
                <CardDescription>
                  {new Date().toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-4 space-y-4">
                  <div className="text-center">
                    {getWeatherIcon(currentWeather.condition, 64)}
                    <h3 className="text-lg font-medium mt-2">
                      {getWeatherDescription(currentWeather.condition)}
                    </h3>
                  </div>

                  <div className="flex flex-col items-center">
                    <span className="text-5xl font-bold">
                      {Math.round(currentWeather.temperature.current || 0)}°C
                    </span>
                    <span className="text-sm text-muted-foreground">
                      Feels like {Math.round((currentWeather.temperature.current || 0) - 1)}°C
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4">
                    <div className="flex items-center">
                      <ThermometerSun className="h-4 w-4 mr-2 text-orange-500" />
                      <span className="text-sm">
                        High: {Math.round(currentWeather.temperature.max)}°C
                      </span>
                    </div>
                    <div className="flex items-center">
                      <ThermometerSun className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-sm">
                        Low: {Math.round(currentWeather.temperature.min)}°C
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Droplets className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-sm">
                        Humidity: {Math.round(currentWeather.humidity)}%
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Wind className="h-4 w-4 mr-2 text-green-500" />
                      <span className="text-sm">
                        Wind: {Math.round(currentWeather.windSpeed)} km/h
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Umbrella className="h-4 w-4 mr-2 text-blue-600" />
                      <span className="text-sm">
                        Rain: {Math.round(currentWeather.precipitation.probability)}%
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 7-Day Forecast Card */}
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle>7-Day Forecast</CardTitle>
                <CardDescription>Weekly weather outlook powered by Open-Meteo</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {forecast.slice(0, 6).map((day, index) => (
                    <div 
                      key={index}
                      className="flex flex-col items-center p-3 rounded-lg hover:bg-muted/60"
                    >
                      <span className="text-sm font-medium">
                        {new Date(day.date).toLocaleDateString([], { weekday: 'short' })}
                      </span>
                      <div className="my-2">
                        {getWeatherIcon(day.condition, 36)}
                      </div>
                      <div className="text-sm font-medium flex justify-between w-full">
                        <span className="text-red-500">{Math.round(day.temperature.max)}°</span>
                        <span className="text-blue-500">{Math.round(day.temperature.min)}°</span>
                      </div>
                      <div className="mt-1 flex items-center justify-center gap-1">
                        <Umbrella className="h-3 w-3 text-blue-600" />
                        <span className="text-xs">{Math.round(day.precipitation.probability)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Historical Data Charts */}
        {historicalData.week.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Historical Weather Data</CardTitle>
              <CardDescription>View trends for temperature, humidity, and precipitation</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="week" value={historicalTab} onValueChange={(value) => setHistoricalTab(value as any)}>
                <TabsList className="mb-4">
                  <TabsTrigger value="week">Past Week</TabsTrigger>
                  <TabsTrigger value="month">Past Month</TabsTrigger>
                </TabsList>
                
                <TabsContent value="week" className="space-y-4">
                  <h3 className="text-lg font-medium">Temperature Trends (°C)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={historicalData.week}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="temperature" stroke="#e11d48" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>

                  <h3 className="text-lg font-medium mt-8">Precipitation (mm)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={historicalData.week}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="precipitation" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </TabsContent>
                
                <TabsContent value="month">
                  <h3 className="text-lg font-medium">Temperature Trends (°C)</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={historicalData.month}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="temperature" stroke="#e11d48" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Weather Alerts - Keep existing mock data for now */}
        <Card>
          <CardHeader>
            <CardTitle>Weather Alerts</CardTitle>
            <CardDescription>No active weather alerts at this time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <p className="text-muted-foreground">All weather conditions are normal.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default WeatherPage;
