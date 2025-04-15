
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import MapView from '@/components/map/MapView';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';
import { Device, DeviceStatus, DeviceType, Zone, GeoLocation, IrrigationStatus } from '@/types';

// Mock Data
const initialDevices: Device[] = [
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
    name: 'Valve B1',
    type: DeviceType.VALVE,
    status: DeviceStatus.OFFLINE,
    batteryLevel: 15,
    lastUpdated: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    location: { lat: 35.6855, lng: 139.6957 },
    zoneId: 'zone-b'
  },
  {
    id: '3',
    name: 'Weather Station',
    type: DeviceType.WEATHER_STATION,
    status: DeviceStatus.ONLINE,
    batteryLevel: 92,
    lastUpdated: new Date().toISOString(),
    location: { lat: 35.6925, lng: 139.6887 }
  }
];

const initialZones: Zone[] = [
  {
    id: 'zone-a',
    name: 'Field Zone A',
    boundaryCoordinates: [
      { lat: 35.6885, lng: 139.6907 },
      { lat: 35.6905, lng: 139.6927 },
      { lat: 35.6885, lng: 139.6947 },
      { lat: 35.6865, lng: 139.6927 },
    ],
    areaSize: 1000, // square meters
    devices: ['1'],
    irrigationStatus: IrrigationStatus.INACTIVE,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'zone-b',
    name: 'Field Zone B',
    boundaryCoordinates: [
      { lat: 35.6845, lng: 139.6947 },
      { lat: 35.6865, lng: 139.6967 },
      { lat: 35.6845, lng: 139.6987 },
      { lat: 35.6825, lng: 139.6967 },
    ],
    areaSize: 1200, // square meters
    devices: ['2'],
    irrigationStatus: IrrigationStatus.INACTIVE,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const MapPage: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>(initialDevices);
  const [zones, setZones] = useState<Zone[]>(initialZones);

  const handleDeviceAdd = (newDevice: Device) => {
    setDevices(prev => [...prev, newDevice]);
  };

  const handleZoneAdd = (newZone: Zone) => {
    setZones(prev => [...prev, newZone]);
  };

  const handleDeviceMove = (deviceId: string, newLocation: GeoLocation) => {
    setDevices(prev => 
      prev.map(device => 
        device.id === deviceId 
          ? { ...device, location: newLocation } 
          : device
      )
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Field Map</h1>
          <p className="text-muted-foreground">Visualize and manage your fields, zones, and devices</p>
        </div>

        <Alert className="bg-muted/50">
          <InfoIcon className="h-4 w-4" />
          <AlertTitle>Field Mapping Guide</AlertTitle>
          <AlertDescription>
            Draw zones by selecting the polygon tool, then place devices within zones. 
            Drag existing devices to reposition them.
          </AlertDescription>
        </Alert>

        <MapView
          devices={devices}
          zones={zones}
          onDeviceAdd={handleDeviceAdd}
          onZoneAdd={handleZoneAdd}
          onDeviceMove={handleDeviceMove}
        />
      </div>
    </DashboardLayout>
  );
};

export default MapPage;
