
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ReactApexChart from 'react-apexcharts';

interface SensorReadingsChartProps {
  className?: string;
}

// Mock data
const mockMoistureData = [
  { x: '2023-04-01', y: 28 },
  { x: '2023-04-02', y: 32 },
  { x: '2023-04-03', y: 36 },
  { x: '2023-04-04', y: 30 },
  { x: '2023-04-05', y: 25 },
  { x: '2023-04-06', y: 29 },
  { x: '2023-04-07', y: 33 },
  { x: '2023-04-08', y: 35 },
  { x: '2023-04-09', y: 38 },
  { x: '2023-04-10', y: 32 },
  { x: '2023-04-11', y: 28 },
  { x: '2023-04-12', y: 24 },
  { x: '2023-04-13', y: 26 },
  { x: '2023-04-14', y: 30 },
  { x: '2023-04-15', y: 34 },
];

const mockTemperatureData = [
  { x: '2023-04-01', y: 22 },
  { x: '2023-04-02', y: 24 },
  { x: '2023-04-03', y: 25 },
  { x: '2023-04-04', y: 27 },
  { x: '2023-04-05', y: 29 },
  { x: '2023-04-06', y: 28 },
  { x: '2023-04-07', y: 26 },
  { x: '2023-04-08', y: 25 },
  { x: '2023-04-09', y: 24 },
  { x: '2023-04-10', y: 26 },
  { x: '2023-04-11', y: 28 },
  { x: '2023-04-12', y: 30 },
  { x: '2023-04-13', y: 29 },
  { x: '2023-04-14', y: 27 },
  { x: '2023-04-15', y: 25 },
];

const mockHumidityData = [
  { x: '2023-04-01', y: 65 },
  { x: '2023-04-02', y: 62 },
  { x: '2023-04-03', y: 58 },
  { x: '2023-04-04', y: 55 },
  { x: '2023-04-05', y: 60 },
  { x: '2023-04-06', y: 64 },
  { x: '2023-04-07', y: 68 },
  { x: '2023-04-08', y: 66 },
  { x: '2023-04-09', y: 62 },
  { x: '2023-04-10', y: 59 },
  { x: '2023-04-11', y: 63 },
  { x: '2023-04-12', y: 67 },
  { x: '2023-04-13', y: 70 },
  { x: '2023-04-14', y: 68 },
  { x: '2023-04-15', y: 65 },
];

const zones = [
  { value: 'all', label: 'All Zones' },
  { value: 'zone-a', label: 'Zone A' },
  { value: 'zone-b', label: 'Zone B' },
  { value: 'zone-c', label: 'Zone C' },
];

const timeRanges = [
  { value: 'day', label: 'Last 24 Hours' },
  { value: 'week', label: 'Last Week' },
  { value: 'month', label: 'Last Month' },
  { value: 'year', label: 'Last Year' },
];

const SensorReadingsChart: React.FC<SensorReadingsChartProps> = ({ className }) => {
  const [selectedZone, setSelectedZone] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('week');
  
  const getChartOptions = (title: string, color: string, unit: string) => {
    return {
      chart: {
        type: 'area' as const,
        toolbar: {
          show: false,
        },
        zoom: {
          enabled: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: 'smooth' as const,
        width: 2,
      },
      colors: [color],
      fill: {
        type: 'gradient' as const,
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0.2,
          stops: [0, 90, 100],
        },
      },
      tooltip: {
        x: {
          format: 'dd MMM yyyy',
        },
        y: {
          formatter: function(value: number) {
            return `${value}${unit}`;
          },
        },
      },
      grid: {
        borderColor: '#f1f1f1',
        row: {
          colors: ['transparent', 'transparent'],
          opacity: 0.5,
        },
      },
      xaxis: {
        type: 'datetime' as const,
        labels: {
          datetimeUTC: false,
        },
      },
      yaxis: {
        title: {
          text: title,
        },
        labels: {
          formatter: function(value: number) {
            return `${value}${unit}`;
          },
        },
      },
    };
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle>Sensor Readings</CardTitle>
            <CardDescription>Historical readings from your field sensors</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:ml-auto">
            <Select value={selectedZone} onValueChange={setSelectedZone}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Zone" />
              </SelectTrigger>
              <SelectContent>
                {zones.map((zone) => (
                  <SelectItem key={zone.value} value={zone.value}>
                    {zone.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Time Range" />
              </SelectTrigger>
              <SelectContent>
                {timeRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="moisture" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="moisture">Soil Moisture</TabsTrigger>
            <TabsTrigger value="temperature">Temperature</TabsTrigger>
            <TabsTrigger value="humidity">Humidity</TabsTrigger>
          </TabsList>
          <TabsContent value="moisture">
            <div className="h-[350px]">
              <ReactApexChart
                options={getChartOptions('Soil Moisture', '#3D8361', '%')}
                series={[{
                  name: 'Soil Moisture',
                  data: mockMoistureData,
                }]}
                type="area" as const
                height="100%"
              />
            </div>
          </TabsContent>
          <TabsContent value="temperature">
            <div className="h-[350px]">
              <ReactApexChart
                options={getChartOptions('Temperature', '#FF9800', '°C')}
                series={[{
                  name: 'Temperature',
                  data: mockTemperatureData,
                }]}
                type="area"
                height="100%"
              />
            </div>
          </TabsContent>
          <TabsContent value="humidity">
            <div className="h-[350px]">
              <ReactApexChart
                options={getChartOptions('Humidity', '#4B91C5', '%')}
                series={[{
                  name: 'Humidity',
                  data: mockHumidityData,
                }]}
                type="area"
                height="100%"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default SensorReadingsChart;
