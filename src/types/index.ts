
export enum DeviceType {
  MOISTURE_SENSOR = 'moisture_sensor',
  WEATHER_STATION = 'weather_station',
  VALVE = 'valve',
  CAMERA = 'camera'
}

export enum DeviceStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  MAINTENANCE = 'maintenance',
  ALERT = 'alert'
}

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  batteryLevel?: number;
  lastReading: any;
  lastUpdated: string;
  location: { lat: number; lng: number };
  zoneId?: string | null;
}

export interface Zone {
  id: string;
  name: string;
  description?: string;
  boundaryCoordinates: Array<{ lat: number; lng: number }>;
  areaSize: number;
  devices: Device[];
  irrigationStatus: 'active' | 'inactive' | 'scheduled';
  soilMoistureThreshold?: number;
  createdAt: string;
  updatedAt: string;
}

export enum CropGrowthStage {
  PLANTING = 'planting',
  GERMINATION = 'germination',
  VEGETATIVE = 'vegetative',
  REPRODUCTIVE = 'reproductive',
  RIPENING = 'ripening',
  HARVEST = 'harvest'
}

export interface WeatherCondition {
  description: string;
  icon: string;
}

export interface Crop {
  id: string;
  name: string;
  variety?: string;
  plantingDate: string;
  harvestDate?: string;
  growthStage: CropGrowthStage;
  zoneId: string;
  idealTemperature: {
    min: number;
    max: number;
  };
  idealMoisture: {
    min: number;
    max: number;
  };
}

export interface WeatherForecast {
  id: string;
  date: string;
  condition: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy';
  temperature: {
    min: number;
    max: number;
    current?: number;
  };
  humidity: number;
  windSpeed: number;
  precipitation: {
    probability: number;
    amount?: number;
  };
}

export interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  zoneId: string;
  condition: {
    type: string;
    value: any;
    operator: string;
  };
  action: {
    type: string;
    value: any;
  };
  isActive: boolean;
}

export interface SensorReading {
  id: string;
  deviceId: string;
  value: number;
  unit: string;
  timestamp: string;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  timestamp: string;
  isRead: boolean;
  deviceId?: string;
  zoneId?: string;
}
