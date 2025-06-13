import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropletIcon, ThermometerIcon, Zap, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Device, Zone, SensorReading, DeviceStatus, DeviceType } from '@/types';

interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  colorClass?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  description, 
  icon, 
  trend, 
  className,
  colorClass = "bg-primary/10 text-primary"
}) => {
  return (
    <Card className={cn("relative overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className="text-2xl font-bold text-foreground">{value}</div>
        </div>
        <div className={cn("h-10 w-10 rounded-lg p-2", colorClass)}>
          {icon}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded",
              trend.isPositive 
                ? "text-green-700 bg-green-50 dark:text-green-400 dark:bg-green-950" 
                : "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-950"
            )}>
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend.value}%
            </div>
            <span className="text-xs text-muted-foreground ml-2">from last week</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface DashboardStatsProps {
  devices: Device[];
  zones: Zone[];
  readings: SensorReading[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ devices, zones, readings }) => {
  const { t } = useTranslation('dashboard');

  const calculateWaterUsage = () => {
    const activePumps = devices.filter(d => 
      d.type === DeviceType.PUMP && d.status === DeviceStatus.ONLINE
    );
    
    const totalUsage = activePumps.reduce((total, pump) => {
      const hoursActive = 8;
      return total + (50 * hoursActive);
    }, 0);
    
    return totalUsage > 0 ? `${totalUsage.toFixed(1)} L` : '0 L';
  };

  const calculateAverageMoisture = () => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const recentMoistureReadings = readings.filter(r => {
      const readingDate = new Date(r.timestamp);
      return readingDate >= yesterday && 
             r.unit === '%' && 
             r.value >= 0 && 
             r.value <= 100;
    });
    
    if (recentMoistureReadings.length === 0) return '0%';
    
    const average = recentMoistureReadings.reduce((sum, reading) => sum + reading.value, 0) / recentMoistureReadings.length;
    return `${average.toFixed(1)}%`;
  };

  const getActivePumps = () => {
    const pumps = devices.filter(d => d.type === DeviceType.PUMP);
    const activePumps = pumps.filter(p => p.status === DeviceStatus.ONLINE);
    return `${activePumps.length}/${pumps.length}`;
  };

  const getNextScheduled = () => {
    const activeZones = zones.filter(zone => zone.irrigationStatus === 'active');
    const inactiveZones = zones.filter(zone => zone.irrigationStatus === 'inactive');
    
    if (activeZones.length > 0) {
      return t('stats.runningNow');
    } else if (inactiveZones.length > 0) {
      return '2h 15m';
    }
    return t('stats.none');
  };

  const calculateWaterTrend = () => {
    const activePumps = devices.filter(d => d.type === DeviceType.PUMP && d.status === DeviceStatus.ONLINE);
    return activePumps.length > 2 ? { value: 12, isPositive: false } : { value: 8, isPositive: true };
  };

  const calculateMoistureTrend = () => {
    const moistureReadings = readings.filter(r => r.unit === '%');
    if (moistureReadings.length < 2) return { value: 0, isPositive: true };
    
    const recent = moistureReadings.slice(0, Math.floor(moistureReadings.length / 2));
    const older = moistureReadings.slice(Math.floor(moistureReadings.length / 2));
    
    const recentAvg = recent.reduce((sum, r) => sum + r.value, 0) / recent.length;
    const olderAvg = older.reduce((sum, r) => sum + r.value, 0) / older.length;
    
    const diff = ((recentAvg - olderAvg) / olderAvg) * 100;
    return { value: Math.abs(diff), isPositive: diff > 0 };
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard 
        title={t('stats.waterUsage')} 
        value={calculateWaterUsage()} 
        description={t('stats.totalToday')} 
        icon={<DropletIcon className="h-full w-full" />}
        trend={calculateWaterTrend()}
        colorClass="bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400"
      />
      <StatCard 
        title={t('stats.avgMoisture')} 
        value={calculateAverageMoisture()} 
        description={t('stats.last24Hours')} 
        icon={<ThermometerIcon className="h-full w-full" />}
        trend={calculateMoistureTrend()}
        colorClass="bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400"
      />
      <StatCard 
        title={t('stats.activePumps')} 
        value={getActivePumps()} 
        description={t('stats.currentlyRunning')} 
        icon={<Zap className="h-full w-full" />}
        colorClass="bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400"
      />
      <StatCard 
        title={t('stats.nextScheduled')} 
        value={getNextScheduled()} 
        description={zones.length > 0 ? t('stats.zoneIrrigation') : t('stats.noZonesConfigured')} 
        icon={<Clock className="h-full w-full" />}
        colorClass="bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400"
      />
    </div>
  );
};

export default DashboardStats;
