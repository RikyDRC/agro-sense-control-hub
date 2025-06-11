
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { DropletIcon, Thermometer, Wind } from 'lucide-react';
import { SensorReading, Device, DeviceType } from '@/types';
import { format, subDays, subHours, isAfter, isBefore } from 'date-fns';

interface SensorReadingsChartProps {
  readings: SensorReading[];
}

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

const SensorReadingsChart: React.FC<SensorReadingsChartProps> = ({ readings }) => {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  
  const chartData = useMemo(() => {
    if (!readings || readings.length === 0) {
      return [];
    }

    const now = new Date();
    let startDate: Date;
    let timeFormat: string;

    switch (timeRange) {
      case 'daily':
        startDate = subHours(now, 24);
        timeFormat = 'HH:mm';
        break;
      case 'weekly':
        startDate = subDays(now, 7);
        timeFormat = 'EEE dd';
        break;
      case 'monthly':
        startDate = subDays(now, 30);
        timeFormat = 'MMM dd';
        break;
      default:
        startDate = subHours(now, 24);
        timeFormat = 'HH:mm';
    }

    // Filter readings within the time range
    const filteredReadings = readings.filter(reading => {
      const readingDate = new Date(reading.timestamp);
      return isAfter(readingDate, startDate) && isBefore(readingDate, now);
    });

    // Group readings by time period with improved categorization
    const groupedData = new Map();

    filteredReadings.forEach(reading => {
      const readingDate = new Date(reading.timestamp);
      const timeKey = format(readingDate, timeFormat);
      
      if (!groupedData.has(timeKey)) {
        groupedData.set(timeKey, {
          time: timeKey,
          moisture: [],
          temperature: [],
          windSpeed: []
        });
      }

      const group = groupedData.get(timeKey);
      
      // Better categorization based on unit and value ranges
      if (reading.unit === '%' && reading.value >= 0 && reading.value <= 100) {
        group.moisture.push(reading.value);
      } else if (reading.unit === '°C' || reading.unit === 'C' || 
                 (reading.value > -50 && reading.value < 60 && !reading.unit.includes('%'))) {
        group.temperature.push(reading.value);
      } else if (reading.unit === 'm/s' || reading.unit === 'km/h' || 
                 reading.unit.toLowerCase().includes('wind')) {
        group.windSpeed.push(reading.value);
      }
    });

    // Convert to chart format with averages, sorted by time
    const chartArray = Array.from(groupedData.entries())
      .map(([timeKey, group]) => ({
        time: timeKey,
        moisture: group.moisture.length > 0 ? 
          parseFloat((group.moisture.reduce((sum: number, val: number) => sum + val, 0) / group.moisture.length).toFixed(1)) : 
          null,
        temperature: group.temperature.length > 0 ? 
          parseFloat((group.temperature.reduce((sum: number, val: number) => sum + val, 0) / group.temperature.length).toFixed(1)) : 
          null,
        windSpeed: group.windSpeed.length > 0 ? 
          parseFloat((group.windSpeed.reduce((sum: number, val: number) => sum + val, 0) / group.windSpeed.length).toFixed(1)) : 
          null,
      }))
      .filter(item => item.moisture !== null || item.temperature !== null || item.windSpeed !== null)
      .sort((a, b) => {
        // Simple time-based sorting for display
        return a.time.localeCompare(b.time);
      });

    return chartArray;
  }, [readings, timeRange]);

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Sensor Readings</CardTitle>
            <CardDescription>
              {readings.length > 0 ? 
                `${readings.length} readings • ${chartData.length} data points` : 
                'No sensor data available'
              }
            </CardDescription>
          </div>
          <Tabs 
            defaultValue="daily" 
            className="w-fit" 
            onValueChange={(value) => setTimeRange(value as 'daily' | 'weekly' | 'monthly')}
          >
            <TabsList className="grid grid-cols-3 h-8">
              <TabsTrigger value="daily" className="text-xs px-3">24h</TabsTrigger>
              <TabsTrigger value="weekly" className="text-xs px-3">7d</TabsTrigger>
              <TabsTrigger value="monthly" className="text-xs px-3">30d</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {chartData.length > 0 ? (
            <ChartContainer config={chartConfig} className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                  <XAxis 
                    dataKey="time" 
                    stroke="var(--muted-foreground)" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    interval="preserveStartEnd"
                  />
                  <YAxis 
                    stroke="var(--muted-foreground)" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Legend 
                    formatter={(value) => chartConfig[value as keyof typeof chartConfig]?.label || value} 
                    iconType="circle" 
                    height={30}
                    verticalAlign="bottom"
                  />
                  {chartData.some(d => d.moisture !== null) && (
                    <Line 
                      type="monotone" 
                      dataKey="moisture" 
                      stroke="var(--color-moisture)" 
                      strokeWidth={2} 
                      dot={{ r: 2, strokeWidth: 2 }}
                      activeDot={{ r: 4 }}
                      name="Soil Moisture (%)"
                      connectNulls={false}
                    />
                  )}
                  {chartData.some(d => d.temperature !== null) && (
                    <Line 
                      type="monotone" 
                      dataKey="temperature" 
                      stroke="var(--color-temperature)" 
                      strokeWidth={2} 
                      dot={{ r: 2, strokeWidth: 2 }}
                      activeDot={{ r: 4 }}
                      name="Temperature (°C)"
                      connectNulls={false}
                    />
                  )}
                  {chartData.some(d => d.windSpeed !== null) && (
                    <Line 
                      type="monotone" 
                      dataKey="windSpeed" 
                      stroke="var(--color-windSpeed)" 
                      strokeWidth={2} 
                      dot={{ r: 2, strokeWidth: 2 }}
                      activeDot={{ r: 4 }}
                      name="Wind Speed (m/s)"
                      connectNulls={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Thermometer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No sensor data available</p>
                <p className="text-sm text-muted-foreground/70">
                  {readings.length === 0 
                    ? "Add devices and start collecting data to see charts"
                    : "No data in selected time range"
                  }
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SensorReadingsChart;
