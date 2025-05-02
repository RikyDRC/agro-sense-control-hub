
export enum DeviceType {
  MOISTURE_SENSOR = 'moisture_sensor',
  WEATHER_STATION = 'weather_station',
  VALVE = 'valve',
  CAMERA = 'camera',
  TEMPERATURE_SENSOR = 'temperature_sensor',
  PUMP = 'pump',
  PH_SENSOR = 'ph_sensor',
  LIGHT_SENSOR = 'light_sensor'
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
  lastReading?: any;
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
  devices: Device[] | string[];
  irrigationStatus: IrrigationStatus;
  soilMoistureThreshold?: number;
  createdAt: string;
  updatedAt: string;
}

export enum CropGrowthStage {
  PLANTING = 'planting',
  GERMINATION = 'germination',
  VEGETATIVE = 'vegetative',
  REPRODUCTIVE = 'reproductive',
  FLOWERING = 'flowering',
  FRUITING = 'fruiting',
  RIPENING = 'ripening',
  HARVEST = 'harvest'
}

// Alias for backward compatibility
export const GrowthStage = CropGrowthStage;

export const WeatherCondition = {
  SUNNY: 'sunny',
  CLOUDY: 'cloudy',
  RAINY: 'rainy',
  STORMY: 'stormy',
  SNOWY: 'snowy',
  FOGGY: 'foggy',
  PARTLY_CLOUDY: 'partly_cloudy'
} as const;

export type WeatherCondition = typeof WeatherCondition[keyof typeof WeatherCondition];

export interface WeatherForecast {
  id: string;
  date: string;
  condition: WeatherCondition;
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

export enum ActionType {
  TOGGLE_DEVICE = 'toggle_device',
  SEND_NOTIFICATION = 'send_notification',
  SET_VALUE = 'set_value'
}

export enum ConditionType {
  SENSOR_READING = 'sensor_reading',
  TIME_BASED = 'time_based',
  WEATHER_FORECAST = 'weather_forecast'
}

export enum ComparisonOperator {
  LESS_THAN = 'less_than',
  GREATER_THAN = 'greater_than',
  EQUAL_TO = 'equal_to',
  NOT_EQUAL_TO = 'not_equal_to'
}

export enum IrrigationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SCHEDULED = 'scheduled',
  PAUSED = 'paused'
}

export interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  zoneId: string;
  condition: {
    type: ConditionType;
    sensorId?: string;
    threshold?: number;
    operator?: ComparisonOperator;
    timeOfDay?: string;
    daysOfWeek?: number[];
    value?: any;
  };
  action: {
    type: ActionType;
    deviceId?: string;
    duration?: number;
    value?: any;
  };
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
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

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface Crop {
  id: string;
  name: string;
  variety?: string;
  plantingDate: string;
  harvestDate?: string;
  growthStage: CropGrowthStage;
  idealMoisture: {
    min: number;
    max: number;
  };
  idealTemperature: {
    min: number;
    max: number;
  };
  zoneId: string;
}
