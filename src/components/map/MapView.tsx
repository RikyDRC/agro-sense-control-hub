import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, LoadScript, DrawingManager, Marker, Polygon } from '@react-google-maps/api';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Device, DeviceStatus, DeviceType, Zone, GeoLocation, IrrigationStatus } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';

const containerStyle = {
  width: '100%',
  height: '600px'
};

const libraries: ("drawing" | "places" | "geometry" | "visualization")[] = ["drawing", "places", "geometry"];

interface MapViewProps {
  devices: Device[];
  zones: Zone[];
  onDeviceAdd?: (device: Device) => void;
  onZoneAdd?: (zone: Zone) => void;
  onDeviceMove?: (deviceId: string, newLocation: GeoLocation) => void;
  editZoneId?: string;
  createZone?: {
    name: string;
    description?: string;
    soilMoistureThreshold?: number;
  };
}

const MapView: React.FC<MapViewProps> = ({ 
  devices = [], 
  zones = [], 
  onDeviceAdd, 
  onZoneAdd,
  onDeviceMove,
  editZoneId,
  createZone
}) => {
  const navigate = useNavigate();
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [newDeviceType, setNewDeviceType] = useState<DeviceType>(DeviceType.MOISTURE_SENSOR);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [isAddingDevice, setIsAddingDevice] = useState(false);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [drawingManager, setDrawingManager] = useState<google.maps.drawing.DrawingManager | null>(null);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);
  const [scriptLoadError, setScriptLoadError] = useState<Error | null>(null);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState<string>("");
  const [apiKeyLoading, setApiKeyLoading] = useState<boolean>(true);
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: 35.6895, lng: 139.6917 });
  
  const polygonRefs = useRef<{[key: string]: google.maps.Polygon | null}>({});
  const markerRefs = useRef<{[key: string]: google.maps.Marker | null}>({});
  
  const [createdPolygon, setCreatedPolygon] = useState<google.maps.Polygon | null>(null);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneDescription, setNewZoneDescription] = useState('');
  const [soilMoistureThreshold, setSoilMoistureThreshold] = useState(30);
  const [isNamingZone, setIsNamingZone] = useState(false);

  // Fetch the Google Maps API key from platform_config
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        setApiKeyLoading(true);
        const { data, error } = await supabase
          .from('platform_config')
          .select('value')
          .eq('key', 'google_maps_api_key')
          .maybeSingle();
          
        if (error) {
          console.error("Error fetching Google Maps API key:", error);
          setApiKeyError(error.message);
          toast.error("Failed to load Google Maps API key");
        } else if (data) {
          console.log("Google Maps API key loaded successfully");
          setGoogleMapsApiKey(data.value);
        }
      } catch (err: any) {
        console.error("Exception fetching Google Maps API key:", err);
        setApiKeyError(err.message);
      } finally {
        setApiKeyLoading(false);
      }
    };
    
    fetchApiKey();
  }, []);

  const onScriptLoad = useCallback(() => {
    console.log("Google Maps script loaded successfully");
    setIsScriptLoaded(true);
  }, []);

  const onScriptError = useCallback((error: Error) => {
    console.error("Error loading Google Maps script:", error);
    setScriptLoadError(error);
  }, []);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    console.log("Map loaded successfully");
    setMapInstance(map);
  }, []);

  const onDrawingManagerLoad = useCallback((drawingManager: google.maps.drawing.DrawingManager) => {
    console.log("Drawing manager loaded successfully");
    setDrawingManager(drawingManager);
  }, []);

  // Handle edit zone from route state
  useEffect(() => {
    if (editZoneId && isScriptLoaded && mapInstance) {
      const zoneToEdit = zones.find(zone => zone.id === editZoneId);
      if (zoneToEdit) {
        setSelectedZone(editZoneId);
        
        // Fit map to zone boundaries
        if (zoneToEdit.boundaryCoordinates.length > 0) {
          const bounds = new google.maps.LatLngBounds();
          zoneToEdit.boundaryCoordinates.forEach(coord => {
            bounds.extend(new google.maps.LatLng(coord.lat, coord.lng));
          });
          mapInstance.fitBounds(bounds);
        }
      }
    }
  }, [editZoneId, zones, mapInstance, isScriptLoaded]);

  // Handle create zone from route state
  useEffect(() => {
    if (createZone && drawingManager && isScriptLoaded) {
      setNewZoneName(createZone.name || '');
      setNewZoneDescription(createZone.description || '');
      setSoilMoistureThreshold(createZone.soilMoistureThreshold || 30);
      
      // Enable drawing mode
      drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
      toast.info('Draw the zone boundaries on the map');
    }
  }, [createZone, drawingManager, isScriptLoaded]);

  // Set initial map center based on device/zone locations
  useEffect(() => {
    if (devices.length > 0 || zones.length > 0) {
      if (isScriptLoaded && mapInstance) {
        const bounds = new google.maps.LatLngBounds();
        let hasLocations = false;
        
        devices.forEach(device => {
          bounds.extend(new google.maps.LatLng(device.location.lat, device.location.lng));
          hasLocations = true;
        });
        
        zones.forEach(zone => {
          if (zone.boundaryCoordinates && zone.boundaryCoordinates.length > 0) {
            zone.boundaryCoordinates.forEach(coord => {
              bounds.extend(new google.maps.LatLng(coord.lat, coord.lng));
            });
            hasLocations = true;
          }
        });
        
        if (hasLocations) {
          mapInstance.fitBounds(bounds);
        }
      }
    }
  }, [devices, zones, mapInstance, isScriptLoaded]);

  const onPolygonComplete = useCallback((polygon: google.maps.Polygon) => {
    console.log("Polygon drawing completed");
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
      description: newZoneDescription,
      boundaryCoordinates: coordinates,
      areaSize: area,
      devices: [],
      irrigationStatus: IrrigationStatus.INACTIVE,
      soilMoistureThreshold,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (onZoneAdd) {
      onZoneAdd(newZone);
    }
    
    // Clean up after zone creation
    setNewZoneName('');
    setNewZoneDescription('');
    setIsNamingZone(false);
    createdPolygon.setMap(null);
    setCreatedPolygon(null);
    
    // Re-enable drawing manager
    if (drawingManager) {
      drawingManager.setOptions({
        drawingControl: true
      });
    }
    
    // If we came from the zones page, navigate back to it
    if (createZone) {
      navigate('/zones');
    }
  }, [createdPolygon, newZoneName, newZoneDescription, soilMoistureThreshold, onZoneAdd, drawingManager, createZone, navigate]);

  const cancelZoneCreation = useCallback(() => {
    if (createdPolygon) {
      createdPolygon.setMap(null);
      setCreatedPolygon(null);
    }
    
    setNewZoneName('');
    setNewZoneDescription('');
    setIsNamingZone(false);
    
    // Re-enable drawing manager
    if (drawingManager) {
      drawingManager.setOptions({
        drawingControl: true
      });
    }
    
    // If we came from the zones page, navigate back to it
    if (createZone) {
      navigate('/zones');
    }
  }, [createdPolygon, drawingManager, createZone, navigate]);

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

  // If API key is loading, show loading skeleton
  if (apiKeyLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-full mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[600px] w-full" />
        </CardContent>
      </Card>
    );
  }
  
  // If there was an error fetching the API key, show error message
  if (apiKeyError) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load Google Maps API key: {apiKeyError}
        </AlertDescription>
      </Alert>
    );
  }

  // If script failed to load, show error message
  if (scriptLoadError) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load Google Maps API. Please check your API key and try again.
        </AlertDescription>
      </Alert>
    );
  }

  // If no API key is set, show a message
  if (!googleMapsApiKey || googleMapsApiKey === "YOUR_GOOGLE_MAPS_API_KEY") {
    return (
      <Alert variant="default" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Google Maps API key is not configured. Please go to Settings and add your Google Maps API key.
        </AlertDescription>
      </Alert>
    );
  }

  // Modify the device object to include lastReading property
  const demoDevice = {
    id: 'device-demo',
    name: 'Demo Device',
    type: DeviceType.MOISTURE_SENSOR,
    status: DeviceStatus.ONLINE,
    batteryLevel: 85,
    lastUpdated: new Date().toISOString(),
    lastReading: 65, // Add missing lastReading property
    location: { lat: 37.7749, lng: -122.4194 },
    zoneId: 'zone1'
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
            <LoadScript 
              googleMapsApiKey={googleMapsApiKey} 
              libraries={libraries}
              onLoad={onScriptLoad}
              onError={onScriptError}
            >
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={mapCenter}
                zoom={14}
                onLoad={onMapLoad}
                onClick={handleMapClick}
              >
                {/* Zone Polygons */}
                {isScriptLoaded && zones.map((zone) => (
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
                {isScriptLoaded && devices.map((device) => (
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
                {isScriptLoaded && (
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
                )}
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
              <Select value={selectedZone || 'all'} onValueChange={setSelectedZone}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Zones</SelectItem>
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
                    if (drawingManager && isScriptLoaded) {
                      drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
                    }
                  }}
                  className="w-full"
                  disabled={isNamingZone || isAddingDevice || !isScriptLoaded}
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
                  if (drawingManager && isScriptLoaded) {
                    drawingManager.setDrawingMode(null);
                  }
                }}
                disabled={isNamingZone || isAddingDevice || !isScriptLoaded}
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
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="zoneName">Zone Name</Label>
                    <Input
                      id="zoneName"
                      value={newZoneName}
                      onChange={(e) => setNewZoneName(e.target.value)}
                      placeholder="Field Zone A"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="zoneDescription">Description (Optional)</Label>
                    <Input
                      id="zoneDescription"
                      value={newZoneDescription}
                      onChange={(e) => setNewZoneDescription(e.target.value)}
                      placeholder="North field with corn"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="moistureThreshold">Soil Moisture Threshold (%)</Label>
                    <Input
                      id="moistureThreshold"
                      type="number"
                      value={soilMoistureThreshold}
                      onChange={(e) => setSoilMoistureThreshold(parseInt(e.target.value) || 30)}
                      min="0"
                      max="100"
                    />
                  </div>
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
