
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WeatherCondition, WeatherForecast } from '@/types';
import { 
  Cloud, 
  CloudDrizzle, 
  CloudLightning, 
  CloudRain, 
  CloudSnow, 
  Sun, 
  Droplet, 
  Wind, 
  Thermometer, 
  CloudSun,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface WeatherWidgetProps {
  currentWeather: WeatherForecast;
  forecast: WeatherForecast[];
  className?: string;
}

const getWeatherIcon = (condition: WeatherCondition, className?: string) => {
  const iconClass = cn("h-6 w-6", className);
  
  switch (condition) {
    case WeatherCondition.SUNNY:
      return <Sun className={cn(iconClass, "text-amber-500")} />;
    case WeatherCondition.PARTLY_CLOUDY:
      return <CloudSun className={cn(iconClass, "text-amber-400")} />;
    case WeatherCondition.CLOUDY:
      return <Cloud className={cn(iconClass, "text-gray-400")} />;
    case WeatherCondition.RAIN:
      return <CloudRain className={cn(iconClass, "text-blue-400")} />;
    case WeatherCondition.STORM:
      return <CloudLightning className={cn(iconClass, "text-purple-500")} />;
    case WeatherCondition.SNOW:
      return <CloudSnow className={cn(iconClass, "text-blue-200")} />;
    case WeatherCondition.FOG:
      return <Cloud className={cn(iconClass, "text-gray-300")} />;
    case WeatherCondition.DRIZZLE:
      return <CloudDrizzle className={cn(iconClass, "text-blue-300")} />;
    default:
      return <Cloud className={iconClass} />;
  }
};

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ 
  currentWeather, 
  forecast, 
  className 
}) => {
  const [view, setView] = useState<'current' | 'forecast'>('current');
  
  // Format the date for readability
  const formatWeatherDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'EEE, MMM d');
  };
  
  // Get weather condition description
  const getWeatherDescription = (condition: WeatherCondition): string => {
    switch (condition) {
      case WeatherCondition.SUNNY:
        return 'Sunny';
      case WeatherCondition.PARTLY_CLOUDY:
        return 'Partly Cloudy';
      case WeatherCondition.CLOUDY:
        return 'Cloudy';
      case WeatherCondition.RAIN:
        return 'Rainy';
      case WeatherCondition.STORM:
        return 'Storm';
      case WeatherCondition.SNOW:
        return 'Snow';
      case WeatherCondition.FOG:
        return 'Foggy';
      case WeatherCondition.DRIZZLE:
        return 'Drizzle';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card className={cn("shadow-sm hover:shadow-md transition-shadow duration-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Weather</CardTitle>
            <CardDescription>Current conditions and forecast</CardDescription>
          </div>
          <Tabs 
            defaultValue="current" 
            className="w-fit" 
            onValueChange={(value) => setView(value as 'current' | 'forecast')}
          >
            <TabsList className="grid grid-cols-2 h-8">
              <TabsTrigger value="current" className="text-xs px-3">Current</TabsTrigger>
              <TabsTrigger value="forecast" className="text-xs px-3">Forecast</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {view === 'current' ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl">
                  {getWeatherIcon(currentWeather.condition, "h-10 w-10")}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{getWeatherDescription(currentWeather.condition)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatWeatherDate(currentWeather.date)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold">
                  {currentWeather.temperature.current}°{currentWeather.temperature.unit}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentWeather.temperature.min}° / {currentWeather.temperature.max}°
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="flex flex-col items-center justify-center p-3 bg-muted/50 rounded-lg">
                <Droplet className="h-5 w-5 text-blue-500 mb-1" />
                <span className="text-sm font-medium">{currentWeather.humidity}%</span>
                <span className="text-xs text-muted-foreground">Humidity</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-muted/50 rounded-lg">
                <Wind className="h-5 w-5 text-blue-400 mb-1" />
                <span className="text-sm font-medium">{currentWeather.windSpeed} km/h</span>
                <span className="text-xs text-muted-foreground">Wind</span>
              </div>
              <div className="flex flex-col items-center justify-center p-3 bg-muted/50 rounded-lg">
                <CloudRain className="h-5 w-5 text-blue-600 mb-1" />
                <span className="text-sm font-medium">{currentWeather.precipitation.probability}%</span>
                <span className="text-xs text-muted-foreground">Precipitation</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-2">
              {forecast.slice(0, 5).map((day) => (
                <div 
                  key={day.id} 
                  className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <span className="text-xs text-muted-foreground mb-1">
                    {format(new Date(day.date), 'EEE')}
                  </span>
                  {getWeatherIcon(day.condition, "h-8 w-8 my-2")}
                  <div className="flex items-center justify-center space-x-1 mt-1">
                    <span className="text-xs font-medium">{day.temperature.min}°</span>
                    <span className="text-xs text-muted-foreground">/</span>
                    <span className="text-xs font-medium">{day.temperature.max}°</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="flex items-center justify-center mt-4">
              <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">View full forecast</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
