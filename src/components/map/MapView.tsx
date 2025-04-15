
import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, LoadScript, DrawingManager, Marker, Polygon } from '@react-google-maps/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Device, DeviceStatus, DeviceType, Zone, GeoLocation, IrrigationStatus } from '@/types';
import { v4 as uuidv4 } from 'uuid';

// You would typically store this in an environment variable
const GOOGLE_MAPS_API_KEY = "REPLACE_WITH_YOUR_API_KEY";

const containerStyle = {
  width: '100%',
  height: '600px'
};

const center = {
  lat: 35.6895,
  lng: 139.6917
};

const libraries: ("drawing" | "places" | "geometry" | "visualization")[] = ["drawing", "places", "geometry"];

interface MapViewProps {
  devices: Device[];
  zones: Zone[];
  onDeviceAdd?: (device: Device) => void;
  onZoneAdd?: (zone: Zone) => void;
  onDeviceMove?: (deviceId: string, newLocation: GeoLocation) => void;
}

const MapView: React.FC<MapViewProps> = ({ 
  devices = [], 
  zones = [], 
  onDeviceAdd, 
  onZoneAdd,
  onDeviceMove 
}) => {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [newDeviceType, setNewDeviceType] = useState<DeviceType>(DeviceType.MOISTURE_SENSOR);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [isAddingDevice, setIsAddingDevice] = useState(false);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);
  
  const polygonRefs = useRef<{[key: string]: google.maps.Polygon | null}>({});
  const markerRefs = useRef<{[key: string]: google.maps.Marker | null}>({});
  
  const [createdPolygon, setCreatedPolygon] = useState<google.maps.Polygon | null>(null);
  const [newZoneName, setNewZoneName] = useState('');
  const [isNamingZone, setIsNamingZone] = useState(false);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMapInstance(map);
  }, []);

  const onDrawingManagerLoad = useCallback((drawingManager: google.maps.drawing.DrawingManager) => {
    setDrawingManager(drawingManager);
  }, []);

  const onPolygonComplete = useCallback((polygon: google.maps.Polygon) => {
    setCreatedPolygon(polygon);
    setIsNamingZone(true);
    
    // Disable drawing manager while naming the zone
    if (drawingManager) {
      drawingManager.setDrawingMode(null);
      drawingManager.setOptions({
        drawingControl: false
      });
    }
  }, [drawingManager]);

  const handleZoneCreate = useCallback(() => {
    if (!createdPolygon || !newZoneName) return;
    
    const path = createdPolygon.getPath();
    const coordinates: GeoLocation[] = [];
    
    for (let i = 0; i < path.getLength(); i++) {
      const point = path.getAt(i);
      coordinates.push({
        lat: point.lat(),
        lng: point.lng()
      });
    }
    
    // Calculate approximate area (very rough calculation)
    let area = 0;
    if (coordinates.length > 2) {
      for (let i = 0; i < coordinates.length; i++) {
        const j = (i + 1) % coordinates.length;
        area += coordinates[i].lat * coordinates[j].lng;
        area -= coordinates[j].lat * coordinates[i].lng;
      }
      area = Math.abs(area) * 111000 * 111000 / 2; // rough conversion to square meters
    }
    
    const newZone: Zone = {
      id: uuidv4(),
      name: newZoneName,
      boundaryCoordinates: coordinates,
      areaSize: area,
      devices: [],
      irrigationStatus: IrrigationStatus.INACTIVE,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (onZoneAdd) {
      onZoneAdd(newZone);
    }
    
    // Clean up after zone creation
    setNewZoneName('');
    setIsNamingZone(false);
    createdPolygon.setMap(null);
    setCreatedPolygon(null);
    
    // Re-enable drawing manager
    if (drawingManager) {
      drawingManager.setOptions({
        drawingControl: true
      });
    }
  }, [createdPolygon, newZoneName, onZoneAdd, drawingManager]);

  const cancelZoneCreation = useCallback(() => {
    if (createdPolygon) {
      createdPolygon.setMap(null);
      setCreatedPolygon(null);
    }
    
    setNewZoneName('');
    setIsNamingZone(false);
    
    // Re-enable drawing manager
    if (drawingManager) {
      drawingManager.setOptions({
        drawingControl: true
      });
    }
  }, [createdPolygon, drawingManager]);

  const handleMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (isAddingDevice && e.latLng) {
      const location = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      };
      
      const newDevice: Device = {
        id: uuidv4(),
        name: newDeviceName || `New ${newDeviceType}`,
        type: newDeviceType,
        status: DeviceStatus.ONLINE,
        batteryLevel: 100,
        lastUpdated: new Date().toISOString(),
        location,
        zoneId: selectedZone || undefined
      };
      
      if (onDeviceAdd) {
        onDeviceAdd(newDevice);
      }
      
      setIsAddingDevice(false);
      setNewDeviceName('');
    }
  }, [isAddingDevice, newDeviceType, newDeviceName, selectedZone, onDeviceAdd]);

  const getDeviceIcon = (type: DeviceType, status: DeviceStatus) => {
    const baseUrl = 'https://maps.google.com/mapfiles/ms/icons/';
    
    // Color based on status
    let color;
    switch (status) {
      case DeviceStatus.ONLINE:
        color = 'green';
        break;
      case DeviceStatus.OFFLINE:
        color = 'gray';
        break;
      case DeviceStatus.MAINTENANCE:
        color = 'yellow';
        break;
      case DeviceStatus.ALERT:
        color = 'red';
        break;
      default:
        color = 'blue';
    }
    
    return `${baseUrl}${color}-dot.png`;
  };

  const onMarkerDragEnd = (deviceId: string, e: google.maps.MapMouseEvent) => {
    if (e.latLng && onDeviceMove) {
      const newLocation = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng()
      };
      
      onDeviceMove(deviceId, newLocation);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Field Map</CardTitle>
            <CardDescription>Manage your fields, zones, and device placement</CardDescription>
          </CardHeader>
          <CardContent>
            <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY} libraries={libraries}>
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={14}
                onLoad={onMapLoad}
                onClick={handleMapClick}
              >
                {/* Zone Polygons */}
                {zones.map((zone) => (
                  <Polygon
                    key={zone.id}
                    paths={zone.boundaryCoordinates}
                    options={{
                      fillColor: selectedZone === zone.id ? '#8FBF9F' : '#3D8361',
                      fillOpacity: 0.3,
                      strokeColor: selectedZone === zone.id ? '#1C6758' : '#3D8361',
                      strokeWeight: selectedZone === zone.id ? 2 : 1,
                    }}
                    onClick={() => setSelectedZone(zone.id)}
                    onLoad={(polygon) => {
                      polygonRefs.current[zone.id] = polygon;
                    }}
                  />
                ))}
                
                {/* Device Markers */}
                {devices.map((device) => (
                  <Marker
                    key={device.id}
                    position={device.location}
                    icon={getDeviceIcon(device.type, device.status)}
                    draggable={true}
                    onDragEnd={(e) => onMarkerDragEnd(device.id, e)}
                    onLoad={(marker) => {
                      markerRefs.current[device.id] = marker;
                    }}
                  />
                ))}
                
                {/* Drawing Manager for creating zones */}
                <DrawingManager
                  onLoad={onDrawingManagerLoad}
                  onPolygonComplete={onPolygonComplete}
                  options={{
                    drawingControl: !isAddingDevice && !isNamingZone,
                    drawingControlOptions: {
                      position: google.maps.ControlPosition.TOP_CENTER,
                      drawingModes: [
                        google.maps.drawing.OverlayType.POLYGON,
                      ],
                    },
                  }}
                />
              </GoogleMap>
            </LoadScript>
          </CardContent>
        </Card>
        
        <div className="lg:w-80 space-y-4">
          {/* Zone Selection Card */}
          <Card>
            <CardHeader>
              <CardTitle>Zones</CardTitle>
              <CardDescription>Select or create field zones</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedZone || ''} onValueChange={setSelectedZone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Zones</SelectItem>
                  {zones.map((zone) => (
                    <SelectItem key={zone.id} value={zone.id}>
                      {zone.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAddingDevice(false);
                    if (drawingManager) {
                      drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
                    }
                  }}
                  className="w-full"
                  disabled={isNamingZone || isAddingDevice}
                >
                  Draw New Zone
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Device Placement Card */}
          <Card>
            <CardHeader>
              <CardTitle>Add Device</CardTitle>
              <CardDescription>Place new devices on the map</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="deviceType">Device Type</Label>
                <Select value={newDeviceType} onValueChange={(value) => setNewDeviceType(value as DeviceType)}>
                  <SelectTrigger id="deviceType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(DeviceType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deviceName">Device Name (Optional)</Label>
                <Input
                  id="deviceName"
                  value={newDeviceName}
                  onChange={(e) => setNewDeviceName(e.target.value)}
                  placeholder={`New ${newDeviceType.replace('_', ' ')}`}
                />
              </div>
              
              <Button
                className="w-full"
                onClick={() => {
                  setIsAddingDevice(true);
                  if (drawingManager) {
                    drawingManager.setDrawingMode(null);
                  }
                }}
                disabled={isNamingZone || isAddingDevice}
              >
                {isAddingDevice ? 'Click on Map to Place' : 'Place Device on Map'}
              </Button>
              
              {isAddingDevice && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsAddingDevice(false)}
                >
                  Cancel
                </Button>
              )}
            </CardContent>
          </Card>
          
          {/* Zone Naming Dialog */}
          {isNamingZone && (
            <Card>
              <CardHeader>
                <CardTitle>Name Your Zone</CardTitle>
                <CardDescription>Give the drawn area a name</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="zoneName">Zone Name</Label>
                  <Input
                    id="zoneName"
                    value={newZoneName}
                    onChange={(e) => setNewZoneName(e.target.value)}
                    placeholder="Field Zone A"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={cancelZoneCreation}>
                  Cancel
                </Button>
                <Button onClick={handleZoneCreate} disabled={!newZoneName}>
                  Save Zone
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapView;
