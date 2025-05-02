
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DashboardStats from '@/components/dashboard/DashboardStats';
import SensorReadingsChart from '@/components/dashboard/SensorReadingsChart';
import DeviceStatusList from '@/components/dashboard/DeviceStatusList';
import WeatherWidget from '@/components/dashboard/WeatherWidget';
import QuickActions from '@/components/dashboard/QuickActions';
import { Device, DeviceStatus, DeviceType, WeatherCondition, WeatherForecast } from '@/types';

// Mock Data
const mockDevices: Device[] = [
  {
    id: '1',
    name: 'Moisture Sensor A1',
    type: DeviceType.MOISTURE_SENSOR,
    status: DeviceStatus.ONLINE,
    batteryLevel: 78,
    lastReading: 32.5,
    lastUpdated: new Date().toISOString(),
    location: { lat: 35.6895, lng: 139.6917 },
    zoneId: 'zone-a'
  },
  {
    id: '2',
    name: 'Temperature Sensor A2',
    type: DeviceType.TEMPERATURE_SENSOR,
    status: DeviceStatus.ONLINE,
    batteryLevel: 92,
    lastReading: 24.3,
    lastUpdated: new Date().toISOString(),
    location: { lat: 35.6895, lng: 139.6917 },
    zoneId: 'zone-a'
  },
  {
    id: '3',
    name: 'Valve B1',
    type: DeviceType.VALVE,
    status: DeviceStatus.OFFLINE,
    batteryLevel: 15,
    lastUpdated: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    location: { lat: 35.6895, lng: 139.6917 },
    zoneId: 'zone-b'
  },
  {
    id: '4',
    name: 'Main Pump',
    type: DeviceType.PUMP,
    status: DeviceStatus.ONLINE,
    batteryLevel: 65,
    lastUpdated: new Date().toISOString(),
    location: { lat: 35.6895, lng: 139.6917 }
  },
  {
    id: '5',
    name: 'Weather Station',
    type: DeviceType.WEATHER_STATION,
    status: DeviceStatus.MAINTENANCE,
    batteryLevel: 42,
    lastUpdated: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
    location: { lat: 35.6895, lng: 139.6917 }
  }
];

const currentDate = new Date();
const mockCurrentWeather: WeatherForecast = {
  date: currentDate.toISOString(),
  temperature: {
    min: 18,
    max: 26,
    current: 24
  },
  humidity: 65,
  precipitation: {
    probability: 20,
    amount: 0
  },
  windSpeed: 12,
  condition: WeatherCondition.PARTLY_CLOUDY
};

const mockForecast: WeatherForecast[] = Array.from({ length: 5 }).map((_, index) => {
  const date = new Date();
  date.setDate(date.getDate() + index + 1);
  
  const conditions = [
    WeatherCondition.SUNNY, 
    WeatherCondition.PARTLY_CLOUDY, 
    WeatherCondition.CLOUDY, 
    WeatherCondition.RAINY, 
    WeatherCondition.STORMY
  ];
  
  return {
    date: date.toISOString(),
    temperature: {
      min: 16 + Math.floor(Math.random() * 4),
      max: 24 + Math.floor(Math.random() * 6)
    },
    humidity: 50 + Math.floor(Math.random() * 30),
    precipitation: {
      probability: Math.floor(Math.random() * 100),
      amount: Math.random() * 10
    },
    windSpeed: 5 + Math.floor(Math.random() * 15),
    condition: conditions[index % conditions.length]
  };
});

const Dashboard: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back to your farm monitoring system</p>
      </div>

      <div className="space-y-6">
        <DashboardStats />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SensorReadingsChart />
          </div>
          <div>
            <DeviceStatusList devices={mockDevices} />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <WeatherWidget 
              currentWeather={mockCurrentWeather} 
              forecast={mockForecast} 
            />
          </div>
          <div>
            <QuickActions />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
