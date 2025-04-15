
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CloudRain, CloudSun, Sun, CloudDrizzle, CloudLightning, Cloud, Snowflake } from 'lucide-react';
import { WeatherCondition, WeatherForecast } from '@/types';
import { cn } from '@/lib/utils';

interface WeatherWidgetProps {
  currentWeather: WeatherForecast;
  forecast: WeatherForecast[];
  className?: string;
}

const getWeatherIcon = (condition: WeatherCondition, className?: string) => {
  switch (condition) {
    case WeatherCondition.SUNNY:
      return <Sun className={cn("text-yellow-500", className)} />;
    case WeatherCondition.CLOUDY:
      return <Cloud className={cn("text-gray-500", className)} />;
    case WeatherCondition.RAINY:
      return <CloudRain className={cn("text-blue-500", className)} />;
    case WeatherCondition.STORMY:
      return <CloudLightning className={cn("text-purple-500", className)} />;
    case WeatherCondition.SNOWY:
      return <Snowflake className={cn("text-blue-300", className)} />;
    case WeatherCondition.FOGGY:
      return <Cloud className={cn("text-gray-400", className)} />;
    case WeatherCondition.PARTLY_CLOUDY:
      return <CloudSun className={cn("text-yellow-400", className)} />;
    default:
      return <CloudSun className={cn("text-yellow-400", className)} />;
  }
};

const formatDayOfWeek = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
};

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ currentWeather, forecast, className }) => {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <CardTitle>Weather Forecast</CardTitle>
        <CardDescription>Current weather and 5-day forecast</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              {getWeatherIcon(currentWeather.condition, "h-16 w-16 mx-auto mb-2")}
              <h3 className="text-2xl font-bold">{currentWeather.temperature.current}°C</h3>
              <p className="text-muted-foreground capitalize">{currentWeather.condition.replace(/_/g, ' ')}</p>
              <div className="flex justify-center gap-4 mt-2 text-sm">
                <span>Humidity: {currentWeather.humidity}%</span>
                <span>Wind: {currentWeather.windSpeed} km/h</span>
              </div>
            </div>
          </div>
          
          <div className="w-full sm:w-auto grid grid-cols-5 gap-2 text-center">
            {forecast.slice(0, 5).map((day, index) => (
              <div key={index} className="flex flex-col items-center justify-center p-2">
                <span className="text-xs font-medium">{formatDayOfWeek(day.date)}</span>
                {getWeatherIcon(day.condition, "h-8 w-8 my-1")}
                <div className="flex flex-col text-xs">
                  <span className="font-medium">{day.temperature.max}°</span>
                  <span className="text-muted-foreground">{day.temperature.min}°</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherWidget;
