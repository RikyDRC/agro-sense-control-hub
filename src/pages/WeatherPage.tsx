
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CloudSun, Sun, Cloud, CloudRain, CloudLightning, Snowflake, CloudFog, 
  ThermometerSun, Droplets, Wind, Calendar, RefreshCw, Umbrella, 
  AlertTriangle 
} from 'lucide-react';
import { WeatherCondition, WeatherForecast } from '@/types';
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

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

interface WeatherAlertInfo {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  severity: 'low' | 'medium' | 'high';
}

const mockWeatherAlerts: WeatherAlertInfo[] = [
  {
    id: '1',
    title: 'Heavy Rain Warning',
    description: 'Heavy rain expected with potential for localized flooding in low-lying areas.',
    startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString(),
    severity: 'medium'
  },
  {
    id: '2',
    title: 'Strong Wind Advisory',
    description: 'Winds of 20-30 mph with gusts up to 45 mph expected.',
    startTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    severity: 'low'
  }
];

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'low':
      return 'bg-yellow-500';
    case 'medium':
      return 'bg-orange-500';
    case 'high':
      return 'bg-red-500';
    default:
      return 'bg-blue-500';
  }
};

const WeatherPage: React.FC = () => {
  const [currentWeather, setCurrentWeather] = useState<WeatherForecast>(mockCurrentWeather);
  const [forecast, setForecast] = useState<WeatherForecast[]>(mockForecast);
  const [historicalTab, setHistoricalTab] = useState<'week' | 'month' | 'year'>('week');
  const [historicalData, setHistoricalData] = useState(mockHistoricalData);
  const [alerts, setAlerts] = useState<WeatherAlertInfo[]>(mockWeatherAlerts);
  const [isLoading, setIsLoading] = useState(false);

  const handleRefreshWeather = () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setCurrentWeather({
        ...mockCurrentWeather,
        temperature: {
          ...mockCurrentWeather.temperature,
          current: Math.floor(Math.random() * 10) + 20
        },
        humidity: Math.floor(Math.random() * 30) + 50
      });
      setForecast(generateMockForecast());
      setIsLoading(false);
    }, 1500);
  };

  const formatDateRange = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    return `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
            ${end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Weather</h1>
            <p className="text-muted-foreground">Monitor current conditions, forecasts, and weather alerts</p>
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
                    {currentWeather.condition.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                  </h3>
                </div>

                <div className="flex flex-col items-center">
                  <span className="text-5xl font-bold">
                    {currentWeather.temperature.current}°C
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Feels like {currentWeather.temperature.current! - 1}°C
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4">
                  <div className="flex items-center">
                    <ThermometerSun className="h-4 w-4 mr-2 text-orange-500" />
                    <span className="text-sm">
                      High: {currentWeather.temperature.max}°C
                    </span>
                  </div>
                  <div className="flex items-center">
                    <ThermometerSun className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-sm">
                      Low: {currentWeather.temperature.min}°C
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Droplets className="h-4 w-4 mr-2 text-blue-500" />
                    <span className="text-sm">
                      Humidity: {currentWeather.humidity}%
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Wind className="h-4 w-4 mr-2 text-green-500" />
                    <span className="text-sm">
                      Wind: {currentWeather.windSpeed} km/h
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Umbrella className="h-4 w-4 mr-2 text-blue-600" />
                    <span className="text-sm">
                      Rain: {currentWeather.precipitation.probability}%
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
              <CardDescription>Weekly weather outlook for your location</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                {forecast.map((day, index) => (
                  <div 
                    key={index}
                    className={`flex flex-col items-center p-3 rounded-lg 
                              ${index === 0 ? 'bg-primary/10' : 'hover:bg-muted/60'}`}
                  >
                    <span className="text-sm font-medium">
                      {index === 0 
                        ? 'Today' 
                        : new Date(day.date).toLocaleDateString([], { weekday: 'short' })}
                    </span>
                    <div className="my-2">
                      {getWeatherIcon(day.condition, 36)}
                    </div>
                    <div className="text-sm font-medium flex justify-between w-full">
                      <span className="text-red-500">{day.temperature.max}°</span>
                      <span className="text-blue-500">{day.temperature.min}°</span>
                    </div>
                    <div className="mt-1 flex items-center justify-center gap-1">
                      <Umbrella className="h-3 w-3 text-blue-600" />
                      <span className="text-xs">{day.precipitation.probability}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Historical Data and Charts */}
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
                <TabsTrigger value="year">Past Year</TabsTrigger>
              </TabsList>
              <TabsContent value="week" className="space-y-4">
                <h3 className="text-lg font-medium">Temperature Trends (°C)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={historicalData.week}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
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
                  <BarChart
                    data={historicalData.week}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
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
                  <LineChart
                    data={historicalData.month}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="temperature" stroke="#e11d48" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="year">
                <h3 className="text-lg font-medium">Temperature Trends (°C)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={historicalData.year}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
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

        {/* Weather Alerts */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Weather Alerts</CardTitle>
                <CardDescription>Important weather warnings and advisories</CardDescription>
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Alerts</SelectItem>
                  <SelectItem value="high">High Severity</SelectItem>
                  <SelectItem value="medium">Medium Severity</SelectItem>
                  <SelectItem value="low">Low Severity</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {alerts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No active weather alerts at this time.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className="border rounded-lg p-4 flex items-start gap-4"
                  >
                    <div>
                      <AlertTriangle className={`h-6 w-6 ${getSeverityColor(alert.severity)} rounded-full p-1 text-white`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{alert.title}</h3>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {formatDateRange(alert.startTime, alert.endTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default WeatherPage;
