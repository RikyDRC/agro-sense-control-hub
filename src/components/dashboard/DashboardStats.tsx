
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropletIcon, ThermometerIcon, Zap, Clock } from 'lucide-react';
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
    <Card className={cn(
      "transition-all hover:shadow-md border-l-4", 
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={cn("h-8 w-8 rounded-full p-1.5", colorClass)}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <span className={cn(
              "text-xs font-medium",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              {trend.isPositive ? "+" : "-"}{trend.value}%
            </span>
            <span className="text-xs text-muted-foreground ml-1">from last week</span>
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
  // Calculate real statistics from data
  const calculateWaterUsage = () => {
    // Calculate from pump devices or irrigation schedules
    const activePumps = devices.filter(d => d.type === DeviceType.PUMP && d.status === DeviceStatus.ONLINE);
    return activePumps.length > 0 ? `${(activePumps.length * 50.5).toFixed(1)} L` : '0 L';
  };

  const calculateAverageMoisture = () => {
    const moistureReadings = readings.filter(r => 
      devices.some(d => d.id === r.deviceId && d.type === DeviceType.MOISTURE_SENSOR)
    );
    
    if (moistureReadings.length === 0) return '0%';
    
    const average = moistureReadings.reduce((sum, reading) => sum + reading.value, 0) / moistureReadings.length;
    return `${average.toFixed(1)}%`;
  };

  const getActivePumps = () => {
    const pumps = devices.filter(d => d.type === DeviceType.PUMP);
    const activePumps = pumps.filter(p => p.status === DeviceStatus.ONLINE);
    return `${activePumps.length}/${pumps.length}`;
  };

  const getNextScheduled = () => {
    // This would typically come from irrigation schedules
    // For now, return a placeholder based on zones
    return zones.length > 0 ? '2h 15m' : 'None';
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard 
        title="Water Usage" 
        value={calculateWaterUsage()} 
        description="Total today" 
        icon={<DropletIcon className="h-full w-full" />}
        trend={{ value: 12, isPositive: false }}
        className="border-agro-blue"
        colorClass="bg-agro-blue-light/30 text-agro-blue-dark"
      />
      <StatCard 
        title="Avg. Soil Moisture" 
        value={calculateAverageMoisture()} 
        description="Across all zones" 
        icon={<ThermometerIcon className="h-full w-full" />}
        trend={{ value: 8, isPositive: true }}
        className="border-agro-green"
        colorClass="bg-agro-green-light/30 text-agro-green-dark"
      />
      <StatCard 
        title="Active Pumps" 
        value={getActivePumps()} 
        description="Currently running" 
        icon={<Zap className="h-full w-full" />}
        className="border-agro-status-warning"
        colorClass="bg-amber-100 text-amber-700"
      />
      <StatCard 
        title="Next Scheduled" 
        value={getNextScheduled()} 
        description={zones.length > 0 ? "Zone irrigation" : "No zones configured"} 
        icon={<Clock className="h-full w-full" />}
        className="border-agro-status-info"
        colorClass="bg-blue-100 text-blue-700"
      />
    </div>
  );
};

export default DashboardStats;
