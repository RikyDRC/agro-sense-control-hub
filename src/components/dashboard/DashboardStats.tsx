
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
  // Calculate real statistics from data with better accuracy
  const calculateWaterUsage = () => {
    const activePumps = devices.filter(d => 
      d.type === DeviceType.PUMP && d.status === DeviceStatus.ONLINE
    );
    
    // Estimate water usage based on active pumps and their typical flow rates
    const totalUsage = activePumps.reduce((total, pump) => {
      // Assume each pump uses 50L/hour on average
      const hoursActive = 8; // Simplified - could be calculated from pump runtime
      return total + (50 * hoursActive);
    }, 0);
    
    return totalUsage > 0 ? `${totalUsage.toFixed(1)} L` : '0 L';
  };

  const calculateAverageMoisture = () => {
    // Get recent moisture readings (last 24 hours)
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
    // This should eventually integrate with irrigation schedules
    const activeZones = zones.filter(zone => zone.irrigationStatus === 'active');
    const inactiveZones = zones.filter(zone => zone.irrigationStatus === 'inactive');
    
    if (activeZones.length > 0) {
      return 'Running Now';
    } else if (inactiveZones.length > 0) {
      return '2h 15m'; // Placeholder for next schedule
    }
    return 'None';
  };

  // Calculate trends based on recent data
  const calculateWaterTrend = () => {
    // Simplified trend calculation - positive means increased usage
    const activePumps = devices.filter(d => d.type === DeviceType.PUMP && d.status === DeviceStatus.ONLINE);
    return activePumps.length > 2 ? { value: 12, isPositive: false } : { value: 8, isPositive: true };
  };

  const calculateMoistureTrend = () => {
    // Check if average moisture is increasing or decreasing
    const moistureReadings = readings.filter(r => r.unit === '%');
    if (moistureReadings.length < 2) return { value: 0, isPositive: true };
    
    // Compare recent vs older readings
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
        title="Water Usage" 
        value={calculateWaterUsage()} 
        description="Total today" 
        icon={<DropletIcon className="h-full w-full" />}
        trend={calculateWaterTrend()}
        className="border-agro-blue"
        colorClass="bg-agro-blue-light/30 text-agro-blue-dark"
      />
      <StatCard 
        title="Avg. Soil Moisture" 
        value={calculateAverageMoisture()} 
        description="Last 24 hours" 
        icon={<ThermometerIcon className="h-full w-full" />}
        trend={calculateMoistureTrend()}
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
