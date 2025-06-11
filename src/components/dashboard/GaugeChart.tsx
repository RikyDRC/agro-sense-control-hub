
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface GaugeChartProps {
  title: string;
  value: number;
  max: number;
  unit: string;
  description?: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const GaugeChart: React.FC<GaugeChartProps> = ({
  title,
  value,
  max,
  unit,
  description,
  color = 'hsl(var(--primary))',
  size = 'md',
  className
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const circumference = 2 * Math.PI * 45;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const sizeClasses = {
    sm: 'h-24 w-24',
    md: 'h-32 w-32', 
    lg: 'h-40 w-40'
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <Card className={cn("p-4", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className={cn("relative", sizeClasses[size])}>
          <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 100 100">
            {/* Background circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
              fill="none"
              className="opacity-20"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r="45"
              stroke={color}
              strokeWidth="8"
              fill="none"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("font-bold", textSizes[size])}>{value.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">{unit}</span>
          </div>
        </div>
        <div className="mt-2 text-center">
          <span className="text-sm text-muted-foreground">
            {percentage.toFixed(1)}% of {max}{unit}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default GaugeChart;
