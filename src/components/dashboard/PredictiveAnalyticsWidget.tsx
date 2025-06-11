
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  TrendingDown, 
  Droplet, 
  Sun, 
  CloudRain,
  Leaf,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { WeatherForecast } from '@/types';

interface Prediction {
  id: string;
  type: 'irrigation' | 'weather' | 'crop' | 'resource';
  title: string;
  description: string;
  confidence: number;
  priority: 'low' | 'medium' | 'high';
  action: string;
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'stable';
}

interface PredictiveAnalyticsWidgetProps {
  currentWeather?: WeatherForecast;
  moistureLevel?: number;
  className?: string;
}

const PredictiveAnalyticsWidget: React.FC<PredictiveAnalyticsWidgetProps> = ({
  currentWeather,
  moistureLevel = 45,
  className
}) => {
  const { t } = useTranslation(['dashboard', 'common']);

  const generatePredictions = (): Prediction[] => {
    const predictions: Prediction[] = [];

    // Weather-based irrigation prediction
    if (currentWeather) {
      const willRain = currentWeather.humidity > 70 && (currentWeather.condition?.toLowerCase().includes('rain') || currentWeather.condition?.toLowerCase().includes('cloud'));
      predictions.push({
        id: '1',
        type: 'irrigation',
        title: willRain ? 'Reduce Irrigation' : 'Increase Irrigation',
        description: willRain 
          ? `Rain expected. Reduce watering by 30% for next 48h`
          : `Low humidity (${currentWeather.humidity}%). Increase watering schedule`,
        confidence: willRain ? 85 : 72,
        priority: willRain ? 'medium' : 'high',
        action: willRain ? t('widgets.predictiveAnalytics.actions.adjustSchedule') : t('widgets.predictiveAnalytics.actions.startIrrigation'),
        icon: willRain ? <CloudRain className="h-4 w-4" /> : <Sun className="h-4 w-4" />,
        trend: willRain ? 'down' : 'up'
      });
    }

    // Soil moisture prediction
    if (moistureLevel < 30) {
      predictions.push({
        id: '2',
        type: 'irrigation',
        title: 'Critical Moisture Level',
        description: `Soil moisture at ${moistureLevel}%. Immediate watering recommended`,
        confidence: 95,
        priority: 'high',
        action: t('widgets.predictiveAnalytics.actions.waterNow'),
        icon: <Droplet className="h-4 w-4" />,
        trend: 'down'
      });
    } else if (moistureLevel > 80) {
      predictions.push({
        id: '3',
        type: 'resource',
        title: 'Optimal Moisture Level',
        description: `Excellent soil conditions. Save 20% water today`,
        confidence: 88,
        priority: 'low',
        action: t('widgets.predictiveAnalytics.actions.maintain'),
        icon: <CheckCircle className="h-4 w-4" />,
        trend: 'stable'
      });
    }

    // Crop health prediction
    predictions.push({
      id: '4',
      type: 'crop',
      title: 'Growth Phase Optimization',
      description: 'Crops entering flowering stage. Adjust nutrient schedule',
      confidence: 78,
      priority: 'medium',
      action: t('widgets.predictiveAnalytics.actions.updatePlan'),
      icon: <Leaf className="h-4 w-4" />,
      trend: 'up'
    });

    // Resource optimization
    predictions.push({
      id: '5',
      type: 'resource',
      title: 'Energy Efficiency',
      description: 'Run pumps during off-peak hours to save 25% on electricity',
      confidence: 82,
      priority: 'medium',
      action: t('widgets.predictiveAnalytics.actions.schedule'),
      icon: <TrendingDown className="h-4 w-4" />,
      trend: 'down'
    });

    return predictions.slice(0, 4); // Show top 4 predictions
  };

  const predictions = generatePredictions();

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'irrigation': return 'bg-blue-100 text-blue-800';
      case 'weather': return 'bg-purple-100 text-purple-800';
      case 'crop': return 'bg-green-100 text-green-800';
      case 'resource': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down': return <TrendingDown className="h-3 w-3 text-red-500" />;
      default: return <div className="h-3 w-3 rounded-full bg-gray-400" />;
    }
  };

  return (
    <Card className={cn("shadow-sm hover:shadow-md transition-shadow duration-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              {t('widgets.predictiveAnalytics.title')}
            </CardTitle>
            <CardDescription>
              {t('widgets.predictiveAnalytics.subtitle')}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            {t('common:buttons.viewAll')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {predictions.map((prediction) => (
            <div 
              key={prediction.id}
              className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex-shrink-0 mt-0.5">
                <div className={cn("p-1.5 rounded-md", getTypeColor(prediction.type))}>
                  {prediction.icon}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                      {prediction.title}
                      {getTrendIcon(prediction.trend)}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {prediction.description}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 ml-2">
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", getPriorityColor(prediction.priority))}
                    >
                      {t(`widgets.predictiveAnalytics.priorities.${prediction.priority}`)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {prediction.confidence}% {t('widgets.predictiveAnalytics.confidence')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {t(`widgets.predictiveAnalytics.types.${prediction.type}`)}
                  </Badge>
                  <Button variant="ghost" size="sm" className="h-6 text-xs">
                    {prediction.action}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PredictiveAnalyticsWidget;
