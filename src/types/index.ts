
// This file contains type definitions for the entire application

export interface Profile {
  id: string;
  email: string;
  display_name?: string;
  phone_number?: string;
  profile_image?: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  FARMER = 'farmer',
  VIEWER = 'viewer'
}

export enum DeviceType {
  MOISTURE_SENSOR = 'moisture_sensor',
  TEMPERATURE_SENSOR = 'temperature_sensor',
  PH_SENSOR = 'ph_sensor',
  VALVE = 'valve',
  PUMP = 'pump',
  WEATHER_STATION = 'weather_station',
  CAMERA = 'camera',
  LIGHT_SENSOR = 'light_sensor'
}

export enum DeviceStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  MAINTENANCE = 'maintenance',
  ALERT = 'alert'
}

export enum IrrigationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SCHEDULED = 'scheduled',
  PAUSED = 'paused'
}

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface Zone {
  id: string;
  name: string;
  description?: string;
  boundaryCoordinates: GeoLocation[];
  areaSize: number;
  devices: string[];
  irrigationStatus: IrrigationStatus;
  soilMoistureThreshold?: number;
  soilType?: string;
  cropType?: string;
  irrigationMethod?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  status: DeviceStatus;
  batteryLevel?: number;
  lastReading?: number;
  lastUpdated: string;
  location: GeoLocation;
  zoneId?: string;
}

export interface SensorReading {
  id: string;
  deviceId: string;
  timestamp: string;
  value: number;
  unit: string;
}

export interface Crop {
  id: string;
  name: string;
  variety?: string;
  plantingDate: string;
  harvestDate?: string;
  growthStage: GrowthStage;
  zoneId: string;
  idealMoisture: { min: number; max: number };
  idealTemperature: { min: number; max: number };
}

export enum GrowthStage {
  PLANTING = 'planting',
  GERMINATION = 'germination',
  VEGETATIVE = 'vegetative',
  FLOWERING = 'flowering',
  FRUITING = 'fruiting',
  MATURITY = 'maturity',
  HARVESTED = 'harvested'
}

export interface AutomationRule {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  condition: RuleCondition;
  action: RuleAction;
  zoneId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RuleCondition {
  type: string;
  parameter: string;
  operator: string;
  value: string | number;
}

export interface RuleAction {
  type: string;
  target: string;
  value?: string | number;
  duration?: number;
}

export interface WeatherForecast {
  id: string;
  date: string;
  condition: WeatherCondition;
  temperature: {
    min: number;
    max: number;
    unit: string;
  };
  precipitation: {
    probability: number;
    amount: number;
    unit: string;
  };
  humidity: number;
  windSpeed: number;
}

export enum WeatherCondition {
  CLEAR = 'clear',
  PARTLY_CLOUDY = 'partly_cloudy',
  CLOUDY = 'cloudy',
  RAIN = 'rain',
  STORM = 'storm',
  SNOW = 'snow',
  FOG = 'fog'
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  severity: AlertSeverity;
  deviceId?: string;
  zoneId?: string;
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export interface Subscription {
  id: string;
  planId: string;
  userId: string;
  status: string;
  startDate: string;
  endDate?: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description?: string;
  price: number;
  billingInterval: string;
  features: string[] | Record<string, boolean>;
}
