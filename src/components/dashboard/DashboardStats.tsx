
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropletIcon, ThermometerIcon, Zap, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

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
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon, trend, className }) => {
  return (
    <Card className={cn("transition-all hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-full bg-primary/10 p-1.5 text-primary">
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

const DashboardStats: React.FC = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard 
        title="Water Usage" 
        value="234.5 L" 
        description="Total today" 
        icon={<DropletIcon className="h-full w-full" />}
        trend={{ value: 12, isPositive: false }}
        className="border-l-4 border-agro-blue"
      />
      <StatCard 
        title="Avg. Soil Moisture" 
        value="32.5%" 
        description="Across all zones" 
        icon={<ThermometerIcon className="h-full w-full" />}
        trend={{ value: 8, isPositive: true }}
        className="border-l-4 border-agro-green"
      />
      <StatCard 
        title="Active Pumps" 
        value="2/5" 
        description="Currently running" 
        icon={<Zap className="h-full w-full" />}
        className="border-l-4 border-agro-status-warning"
      />
      <StatCard 
        title="Next Scheduled" 
        value="2h 15m" 
        description="Zone B irrigation" 
        icon={<Clock className="h-full w-full" />}
        className="border-l-4 border-agro-status-info"
      />
    </div>
  );
};

export default DashboardStats;
