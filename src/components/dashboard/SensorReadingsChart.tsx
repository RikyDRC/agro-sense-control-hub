import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { DropletIcon, Thermometer, Wind } from 'lucide-react';

// Mock data for the chart
const generateHourlyData = (hours = 24, baseValue = 30, variance = 10) => {
  return Array.from({ length: hours }).map((_, i) => {
    const hour = i;
    const timeLabel = `${hour}:00`;
    // Create some natural-looking variations
    const moistureValue = Math.max(0, Math.min(100, 
      baseValue + Math.sin(i / 4) * variance + (Math.random() * variance - variance / 2)
    ));
    const tempValue = 18 + Math.sin(i / 8) * 5 + (Math.random() * 2);
    const windSpeed = 5 + Math.cos(i / 6) * 3 + (Math.random() * 1.5);
    
    return {
      time: timeLabel,
      moisture: moistureValue.toFixed(1),
      temperature: tempValue.toFixed(1),
      windSpeed: windSpeed.toFixed(1),
    };
  });
};

const dailyData = generateHourlyData(24, 35, 15);

// Generate weekly data with a different pattern
const generateWeeklyData = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return days.map((day, i) => {
    // Create a different pattern for weekly data
    const moistureValue = 30 + Math.sin(i / 2) * 10 + (Math.random() * 5);
    const tempValue = 20 + Math.sin(i / 3) * 4 + (Math.random() * 2);
    const windSpeed = 6 + Math.cos(i / 2) * 2 + (Math.random() * 1.5);
    
    return {
      time: day,
      moisture: moistureValue.toFixed(1),
      temperature: tempValue.toFixed(1),
      windSpeed: windSpeed.toFixed(1),
    };
  });
};

const weeklyData = generateWeeklyData();

// Generate monthly data with another pattern
const generateMonthlyData = () => {
  return Array.from({ length: 30 }).map((_, i) => {
    const day = i + 1;
    const moistureValue = 40 + Math.sin(i / 5) * 15 + (Math.random() * 8 - 4);
    const tempValue = 22 + Math.sin(i / 7) * 6 + (Math.random() * 3 - 1.5);
    const windSpeed = 7 + Math.cos(i / 4) * 3 + (Math.random() * 2 - 1);
    
    return {
      time: `${day}`,
      moisture: moistureValue.toFixed(1),
      temperature: tempValue.toFixed(1),
      windSpeed: windSpeed.toFixed(1),
    };
  });
};

const monthlyData = generateMonthlyData();

const chartConfig = {
  moisture: {
    label: 'Soil Moisture',
    theme: {
      light: 'hsl(152, 37%, 38%)',
      dark: 'hsl(152, 37%, 60%)',
    },
    icon: DropletIcon,
  },
  temperature: {
    label: 'Temperature',
    theme: {
      light: 'hsl(46, 100%, 50%)',
      dark: 'hsl(46, 100%, 60%)',
    },
    icon: Thermometer,
  },
  windSpeed: {
    label: 'Wind Speed',
    theme: {
      light: 'hsl(200, 70%, 50%)',
      dark: 'hsl(200, 70%, 60%)',
    },
    icon: Wind,
  },
};

const SensorReadingsChart: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  
  const data = timeRange === 'daily' 
    ? dailyData 
    : timeRange === 'weekly' 
      ? weeklyData 
      : monthlyData;

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Sensor Readings</CardTitle>
            <CardDescription>Monitoring data from field sensors</CardDescription>
          </div>
          <Tabs 
            defaultValue="daily" 
            className="w-fit" 
            onValueChange={(value) => setTimeRange(value as 'daily' | 'weekly' | 'monthly')}
          >
            <TabsList className="grid grid-cols-3 h-8">
              <TabsTrigger value="daily" className="text-xs px-3">Daily</TabsTrigger>
              <TabsTrigger value="weekly" className="text-xs px-3">Weekly</TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs px-3">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ChartContainer config={chartConfig} className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                <XAxis 
                  dataKey="time" 
                  stroke="var(--muted-foreground)" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={8}
                />
                <YAxis 
                  stroke="var(--muted-foreground)" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => `${value}${timeRange === 'daily' ? '%' : '°'}`}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend 
                  formatter={(value) => chartConfig[value as keyof typeof chartConfig]?.label || value} 
                  iconType="circle" 
                  height={30}
                  verticalAlign="bottom"
                />
                <Line 
                  type="monotone" 
                  dataKey="moisture" 
                  stroke="var(--color-moisture)" 
                  strokeWidth={2} 
                  dot={{ r: 2, strokeWidth: 2 }}
                  activeDot={{ r: 4 }}
                  name="Soil Moisture"
                />
                <Line 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="var(--color-temperature)" 
                  strokeWidth={2} 
                  dot={{ r: 2, strokeWidth: 2 }}
                  activeDot={{ r: 4 }}
                  name="Temperature"
                />
                <Line 
                  type="monotone" 
                  dataKey="windSpeed" 
                  stroke="var(--color-windSpeed)" 
                  strokeWidth={2} 
                  dot={{ r: 2, strokeWidth: 2 }}
                  activeDot={{ r: 4 }}
                  name="Wind Speed"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default SensorReadingsChart;
