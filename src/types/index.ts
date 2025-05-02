
// Device Types
export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  batteryLevel: number;
  lastReading?: number;
  lastUpdated: string;
  location: GeoLocation;
  zoneId?: string;
}

export enum DeviceType {
  MOISTURE_SENSOR = 'moisture_sensor',
  TEMPERATURE_SENSOR = 'temperature_sensor',
  VALVE = 'valve',
  PUMP = 'pump',
  WEATHER_STATION = 'weather_station',
  PH_SENSOR = 'ph_sensor',
  LIGHT_SENSOR = 'light_sensor'
}

export enum DeviceStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  MAINTENANCE = 'maintenance',
  ALERT = 'alert'
}

// Zone Types
export interface Zone {
  id: string;
  name: string;
  description?: string;
  boundaryCoordinates: GeoLocation[];
  areaSize: number; // in square meters
  cropId?: string;
  devices: string[]; // Array of device IDs
  irrigationStatus: IrrigationStatus;
  soilMoistureThreshold?: number;
  createdAt: string;
  updatedAt: string;
}

export enum IrrigationStatus {
  INACTIVE = 'inactive',
  ACTIVE = 'active',
  SCHEDULED = 'scheduled',
  PAUSED = 'paused'
}

export interface IrrigationStatusInfo {
  isActive: boolean;
  nextScheduled: string | null;
}

// Crop Types
export interface Crop {
  id: string;
  name: string;
  variety?: string;
  plantingDate: string;
  harvestDate?: string;
  growthStage: GrowthStage;
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

export enum GrowthStage {
  PLANTING = 'planting',
  GERMINATION = 'germination',
  VEGETATIVE = 'vegetative',
  FLOWERING = 'flowering',
  FRUITING = 'fruiting',
  HARVEST = 'harvest'
}

// Automation Types
export interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  condition: Condition;
  action: Action;
  zoneId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Condition {
  type: ConditionType;
  sensorId?: string;
  threshold?: number;
  operator?: ComparisonOperator;
  timeOfDay?: string;
  daysOfWeek?: number[];
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

export interface Action {
  type: ActionType;
  deviceId?: string;
  duration?: number; // in minutes
  value?: any;
}

export enum ActionType {
  TOGGLE_DEVICE = 'toggle_device',
  SET_VALUE = 'set_value',
  SEND_NOTIFICATION = 'send_notification'
}

// Weather Types
export interface WeatherForecast {
  date: string;
  temperature: {
    min: number;
    max: number;
    current?: number;
  };
  humidity: number;
  precipitation: {
    probability: number;
    amount?: number;
  };
  windSpeed: number;
  condition: WeatherCondition;
}

export enum WeatherCondition {
  SUNNY = 'sunny',
  CLOUDY = 'cloudy',
  RAINY = 'rainy',
  STORMY = 'stormy',
  SNOWY = 'snowy',
  FOGGY = 'foggy',
  PARTLY_CLOUDY = 'partly_cloudy'
}

// User Types
export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
  farmId?: string;
}

export enum UserRole {
  ADMIN = 'admin',
  FARM_MANAGER = 'farm_manager',
  TECHNICIAN = 'technician',
  VIEWER = 'viewer'
}

// Utility Types
export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface SensorReading {
  deviceId: string;
  timestamp: string;
  value: number;
  unit: string;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  severity: AlertSeverity;
  timestamp: string;
  isRead: boolean;
  deviceId?: string;
  zoneId?: string;
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}
