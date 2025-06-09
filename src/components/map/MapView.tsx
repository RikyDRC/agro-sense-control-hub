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
import { AlertCircle, MapPin, Loader2, Map } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { Textarea } from '@/components/ui/textarea';
import { useIsMobile } from '@/hooks/use-mobile';

// Mobile-optimized container style
const getMobileContainerStyle = (isMobile: boolean) => ({
  width: '100%',
  height: isMobile ? '400px' : '700px'
});

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
    soilType?: string;
    cropType?: string;
    irrigationMethod?: string;
    notes?: string;
  };
  newDevice?: {
    name: string;
    type: DeviceType;
  };
}

const MapView: React.FC<MapViewProps> = ({ 
  devices = [], 
  zones = [], 
  onDeviceAdd, 
  onZoneAdd,
  onDeviceMove,
  editZoneId,
  createZone,
  newDevice
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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
  const [userLocation, setUserLocation] = useState<GeoLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState(true);
  
  const polygonRefs = useRef<{[key: string]: google.maps.Polygon | null}>({});
  const markerRefs = useRef<{[key: string]: google.maps.Marker | null}>({});
  
  const [createdPolygon, setCreatedPolygon] = useState<google.maps.Polygon | null>(null);
  const [newZoneName, setNewZoneName] = useState('');
  const [newZoneDescription, setNewZoneDescription] = useState('');
  const [soilMoistureThreshold, setSoilMoistureThreshold] = useState(30);
  const [soilType, setSoilType] = useState('');
  const [cropType, setCropType] = useState('');
  const [irrigationMethod, setIrrigationMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [isNamingZone, setIsNamingZone] = useState(false);

  // Get user's current location with better error handling
  useEffect(() => {
    setLocationLoading(true);
    
    if (navigator.geolocation) {
      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setMapCenter(location);
          setLocationLoading(false);
          console.log("User location detected:", location);
        },
        (error) => {
          console.warn("Could not get user location:", error.message);
          setLocationLoading(false);
          // Keep default location if geolocation fails
        },
        options
      );
    } else {
      console.warn("Geolocation is not supported by this browser");
      setLocationLoading(false);
    }
  }, []);

  // Fetch the Google Maps API key from platform_config with better error handling
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
          setApiKeyError("Failed to load Google Maps configuration. Please contact support.");
        } else if (data && data.value && data.value !== "YOUR_GOOGLE_MAPS_API_KEY") {
          setGoogleMapsApiKey(data.value);
        } else {
          setApiKeyError("Google Maps is not configured. Please contact your administrator.");
        }
      } catch (err: any) {
        console.error("Exception fetching Google Maps API key:", err);
        setApiKeyError("Unable to load map configuration.");
      } finally {
        setApiKeyLoading(false);
      }
    };
    
    fetchApiKey();
  }, []);

  // Handle new device from route state
  useEffect(() => {
    if (newDevice && isScriptLoaded) {
      setNewDeviceName(newDevice.name);
      setNewDeviceType(newDevice.type);
      setIsAddingDevice(true);
      toast.info('Click on the map to place your new device');
    }
  }, [newDevice, isScriptLoaded]);

  const onScriptLoad = useCallback(() => {
    console.log("Google Maps script loaded successfully");
    // Add a small delay to ensure google object is fully available
    setTimeout(() => {
      if (typeof window !== 'undefined' && window.google && window.google.maps) {
        setIsScriptLoaded(true);
      } else {
        console.error("Google Maps API not properly loaded");
        setScriptLoadError(new Error("Google Maps API not available"));
      }
    }, 100);
  }, []);

  const onScriptError = useCallback((error: Error) => {
    console.error("Error loading Google Maps script:", error);
    setScriptLoadError(error);
    setApiKeyError("Failed to load Google Maps. Please check your internet connection and try again.");
  }, []);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    console.log("Map loaded successfully");
    setMapInstance(map);
    
    // Set map type to satellite only after confirming google is available
    if (window.google && window.google.maps && window.google.maps.MapTypeId) {
      map.setMapTypeId(window.google.maps.MapTypeId.SATELLITE);
    }
  }, []);

  const onDrawingManagerLoad = useCallback((drawingManager: google.maps.drawing.DrawingManager) => {
    console.log("Drawing manager loaded successfully");
    setDrawingManager(drawingManager);
  }, []);

  // Handle edit zone from route state
  useEffect(() => {
    if (editZoneId && isScriptLoaded && mapInstance && window.google) {
      const zoneToEdit = zones.find(zone => zone.id === editZoneId);
      if (zoneToEdit) {
        setSelectedZone(editZoneId);
        
        // Fit map to zone boundaries
        if (zoneToEdit.boundaryCoordinates.length > 0) {
          const bounds = new window.google.maps.LatLngBounds();
          zoneToEdit.boundaryCoordinates.forEach(coord => {
            bounds.extend(new window.google.maps.LatLng(coord.lat, coord.lng));
          });
          mapInstance.fitBounds(bounds);
        }
      }
    }
  }, [editZoneId, zones, mapInstance, isScriptLoaded]);

  // Handle create zone from route state
  useEffect(() => {
    if (createZone && drawingManager && isScriptLoaded && window.google) {
      setNewZoneName(createZone.name || '');
      setNewZoneDescription(createZone.description || '');
      setSoilMoistureThreshold(createZone.soilMoistureThreshold || 30);
      setSoilType(createZone.soilType || '');
      setCropType(createZone.cropType || '');
      setIrrigationMethod(createZone.irrigationMethod || '');
      setNotes(createZone.notes || '');
      
      // Enable drawing mode
      drawingManager.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON);
      toast.info('Draw the zone boundaries on the map');
    }
  }, [createZone, drawingManager, isScriptLoaded]);

  // Set initial map center based on user location, then device/zone locations
  useEffect(() => {
    if (isScriptLoaded && mapInstance && window.google) {
      // If we have user location, use it first
      if (userLocation) {
        mapInstance.setCenter(userLocation);
        mapInstance.setZoom(isMobile ? 14 : 15);
        return;
      }

      // Otherwise, fit to existing devices/zones
      if (devices.length > 0 || zones.length > 0) {
        const bounds = new window.google.maps.LatLngBounds();
        let hasLocations = false;
        
        devices.forEach(device => {
          bounds.extend(new window.google.maps.LatLng(device.location.lat, device.location.lng));
          hasLocations = true;
        });
        
        zones.forEach(zone => {
          if (zone.boundaryCoordinates && zone.boundaryCoordinates.length > 0) {
            zone.boundaryCoordinates.forEach(coord => {
              bounds.extend(new window.google.maps.LatLng(coord.lat, coord.lng));
            });
            hasLocations = true;
          }
        });
        
        if (hasLocations) {
          mapInstance.fitBounds(bounds);
        }
      }
    }
  }, [devices, zones, mapInstance, isScriptLoaded, userLocation, isMobile]);

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
      soilType,
      cropType,
      irrigationMethod,
      notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    if (onZoneAdd) {
      onZoneAdd(newZone);
    }
    
    // Clean up after zone creation
    setNewZoneName('');
    setNewZoneDescription('');
    setSoilType('');
    setCropType('');
    setIrrigationMethod('');
    setNotes('');
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
  }, [createdPolygon, newZoneName, newZoneDescription, soilMoistureThreshold, soilType, cropType, irrigationMethod, notes, onZoneAdd, drawingManager, createZone, navigate]);

  const cancelZoneCreation = useCallback(() => {
    if (createdPolygon) {
      createdPolygon.setMap(null);
      setCreatedPolygon(null);
    }
    
    setNewZoneName('');
    setNewZoneDescription('');
    setSoilType('');
    setCropType('');
    setIrrigationMethod('');
    setNotes('');
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
      
      // Check if the click is within any zone
      let targetZoneId: string | undefined;
      if (window.google && window.google.maps && window.google.maps.geometry) {
        for (const zone of zones) {
          if (zone.boundaryCoordinates.length > 0) {
            const polygon = new window.google.maps.Polygon({
              paths: zone.boundaryCoordinates
            });
            
            if (window.google.maps.geometry.poly.containsLocation(e.latLng, polygon)) {
              targetZoneId = zone.id;
              break;
            }
          }
        }
      }
      
      const newDevice: Device = {
        id: uuidv4(),
        name: newDeviceName || `New ${newDeviceType}`,
        type: newDeviceType,
        status: DeviceStatus.ONLINE,
        batteryLevel: 100,
        lastUpdated: new Date().toISOString(),
        location,
        zoneId: targetZoneId || selectedZone || undefined
      };
      
      if (onDeviceAdd) {
        onDeviceAdd(newDevice);
      }
      
      setIsAddingDevice(false);
      setNewDeviceName('');
      
      // If device was placed from DevicesPage, navigate back
      if (newDevice) {
        toast.success(`Device placed successfully${targetZoneId ? ' in zone' : ''}`);
        navigate('/devices');
      }
    }
  }, [isAddingDevice, newDeviceType, newDeviceName, selectedZone, zones, onDeviceAdd, newDevice, navigate]);

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
  if (apiKeyLoading || locationLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading map...</span>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className={`w-full ${isMobile ? 'h-[400px]' : 'h-[700px]'}`} />
        </CardContent>
      </Card>
    );
  }
  
  // If there was an error, show error message with retry option
  if (apiKeyError || scriptLoadError) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{apiKeyError || "Failed to load map"}</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // If no API key is set, show a message
  if (!googleMapsApiKey) {
    return (
      <Alert variant="default" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Map is not available. Please contact your administrator to configure Google Maps.
        </AlertDescription>
      </Alert>
    );
  }

  const soilTypes = [
    { value: 'clay', label: 'Clay' },
    { value: 'silt', label: 'Silt' },
    { value: 'sand', label: 'Sandy' },
    { value: 'loam', label: 'Loam' },
    { value: 'peat', label: 'Peat' },
    { value: 'chalk', label: 'Chalky' },
  ];

  const irrigationMethods = [
    { value: 'drip', label: 'Drip Irrigation' },
    { value: 'sprinkler', label: 'Sprinkler System' },
    { value: 'flood', label: 'Flood Irrigation' },
    { value: 'manual', label: 'Manual Watering' },
    { value: 'subsurface', label: 'Subsurface Irrigation' },
  ];

  return (
    <div className="space-y-4">
      {/* Mobile-first layout - Map first, then controls below */}
      <div className="flex flex-col gap-4">
        {/* Map Card - Full width on mobile */}
        <Card className="w-full">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'}`}>Field Map - Satellite View</CardTitle>
                <CardDescription className={`${isMobile ? 'text-xs' : 'text-sm'}`}>
                  {userLocation ? 'Your current location' : 'Manage your fields and devices'}
                </CardDescription>
              </div>
              {userLocation && (
                <div className={`flex items-center text-muted-foreground ${isMobile ? 'text-xs' : 'text-xs'}`}>
                  <MapPin className={`${isMobile ? 'h-3 w-3' : 'h-3 w-3'} mr-1`} />
                  {!isMobile && <span>Your Location</span>}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className={`${isMobile ? 'p-2' : 'p-3 lg:p-6'}`}>
            <LoadScript 
              googleMapsApiKey={googleMapsApiKey} 
              libraries={libraries}
              onLoad={onScriptLoad}
              onError={onScriptError}
              loadingElement={
                <div className={`flex items-center justify-center ${isMobile ? 'h-[400px]' : 'h-[700px]'}`}>
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading map...</span>
                </div>
              }
            >
              {isScriptLoaded && window.google && window.google.maps ? (
                <GoogleMap
                  mapContainerStyle={getMobileContainerStyle(isMobile)}
                  center={mapCenter}
                  zoom={userLocation ? (isMobile ? 14 : 15) : (isMobile ? 13 : 14)}
                  onLoad={onMapLoad}
                  onClick={handleMapClick}
                  options={{
                    streetViewControl: false,
                    mapTypeControl: !isMobile,
                    fullscreenControl: !isMobile,
                    zoomControl: true,
                    mapTypeId: window.google.maps.MapTypeId.SATELLITE,
                    gestureHandling: isMobile ? 'cooperative' : 'auto'
                  }}
                >
                  {/* User location marker */}
                  {userLocation && window.google && window.google.maps && (
                    <Marker
                      position={userLocation}
                      icon={{
                        url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                        scaledSize: new window.google.maps.Size(isMobile ? 24 : 32, isMobile ? 24 : 32)
                      }}
                      title="Your Location"
                    />
                  )}

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
                      title={`${device.name} (${device.type})`}
                    />
                  ))}
                  
                  {/* Drawing Manager for creating zones */}
                  {window.google && window.google.maps && (
                    <DrawingManager
                      onLoad={onDrawingManagerLoad}
                      onPolygonComplete={onPolygonComplete}
                      options={{
                        drawingControl: !isAddingDevice && !isNamingZone,
                        drawingControlOptions: {
                          position: window.google.maps.ControlPosition.TOP_CENTER,
                          drawingModes: [
                            window.google.maps.drawing.OverlayType.POLYGON,
                          ],
                        },
                      }}
                    />
                  )}
                </GoogleMap>
              ) : (
                <div className={`flex items-center justify-center ${isMobile ? 'h-[400px]' : 'h-[700px]'}`}>
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Preparing map...</span>
                </div>
              )}
            </LoadScript>
          </CardContent>
        </Card>
        
        {/* Controls - Stacked on mobile, grid on desktop */}
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
          {/* Zone Selection Card */}
          <Card>
            <CardHeader className={`${isMobile ? 'pb-3' : ''}`}>
              <CardTitle className={`${isMobile ? 'text-base' : ''}`}>Zones</CardTitle>
              <CardDescription className={`${isMobile ? 'text-xs' : ''}`}>Select or create field zones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
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
              
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddingDevice(false);
                  if (drawingManager && isScriptLoaded && window.google) {
                    drawingManager.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON);
                  }
                }}
                className="w-full"
                disabled={isNamingZone || isAddingDevice || !isScriptLoaded}
                size={isMobile ? "sm" : "default"}
              >
                <Map className="mr-2 h-4 w-4" />
                Draw New Zone
              </Button>
            </CardContent>
          </Card>
          
          {/* Device Placement Card - Hide when device from route */}
          {!newDevice && (
            <Card>
              <CardHeader className={`${isMobile ? 'pb-3' : ''}`}>
                <CardTitle className={`${isMobile ? 'text-base' : ''}`}>Add Device</CardTitle>
                <CardDescription className={`${isMobile ? 'text-xs' : ''}`}>Place new devices on the map</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="deviceType" className={`${isMobile ? 'text-xs' : ''}`}>Device Type</Label>
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
                  <Label htmlFor="deviceName" className={`${isMobile ? 'text-xs' : ''}`}>Device Name (Optional)</Label>
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
                  size={isMobile ? "sm" : "default"}
                >
                  {isAddingDevice ? 'Click on Map to Place' : 'Place Device on Map'}
                </Button>
                
                {isAddingDevice && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsAddingDevice(false)}
                    size={isMobile ? "sm" : "default"}
                  >
                    Cancel
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Device from route state */}
          {newDevice && (
            <Card>
              <CardHeader className={`${isMobile ? 'pb-3' : ''}`}>
                <CardTitle className={`${isMobile ? 'text-base' : ''}`}>Place Device</CardTitle>
                <CardDescription className={`${isMobile ? 'text-xs' : ''}`}>Click on the map to place your new device</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>Device:</span>
                    <Badge variant="outline" className={`${isMobile ? 'text-xs' : ''}`}>{newDevice.name}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-medium`}>Type:</span>
                    <Badge variant="secondary" className={`${isMobile ? 'text-xs' : ''}`}>
                      {newDevice.type.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </Badge>
                  </div>
                </div>
                <div className="mt-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate('/devices')}
                    size={isMobile ? "sm" : "default"}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Zone Naming Dialog - Enhanced with all fields */}
          {isNamingZone && (
            <Card className={`${isMobile ? 'col-span-full' : ''}`}>
              <CardHeader className={`${isMobile ? 'pb-3' : ''}`}>
                <CardTitle className={`${isMobile ? 'text-base' : ''}`}>Zone Details</CardTitle>
                <CardDescription className={`${isMobile ? 'text-xs' : ''}`}>Provide information about your zone</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="zoneName" className={`${isMobile ? 'text-xs' : ''}`}>Zone Name</Label>
                    <Input
                      id="zoneName"
                      value={newZoneName}
                      onChange={(e) => setNewZoneName(e.target.value)}
                      placeholder="Field Zone A"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="zoneDescription" className={`${isMobile ? 'text-xs' : ''}`}>Description (Optional)</Label>
                    <Input
                      id="zoneDescription"
                      value={newZoneDescription}
                      onChange={(e) => setNewZoneDescription(e.target.value)}
                      placeholder="North field with corn"
                    />
                  </div>
                  
                  <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    <div className="space-y-2">
                      <Label htmlFor="moistureThreshold" className={`${isMobile ? 'text-xs' : ''}`}>Soil Moisture Threshold (%)</Label>
                      <Input
                        id="moistureThreshold"
                        type="number"
                        value={soilMoistureThreshold}
                        onChange={(e) => setSoilMoistureThreshold(parseInt(e.target.value) || 30)}
                        min="0"
                        max="100"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="soilType" className={`${isMobile ? 'text-xs' : ''}`}>Soil Type</Label>
                      <Select value={soilType} onValueChange={setSoilType}>
                        <SelectTrigger id="soilType">
                          <SelectValue placeholder="Select soil type" />
                        </SelectTrigger>
                        <SelectContent>
                          {soilTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    <div className="space-y-2">
                      <Label htmlFor="cropType" className={`${isMobile ? 'text-xs' : ''}`}>Primary Crop Type</Label>
                      <Input
                        id="cropType"
                        value={cropType}
                        onChange={(e) => setCropType(e.target.value)}
                        placeholder="e.g. Wheat, Corn, Soybeans"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="irrigationMethod" className={`${isMobile ? 'text-xs' : ''}`}>Irrigation Method</Label>
                      <Select value={irrigationMethod} onValueChange={setIrrigationMethod}>
                        <SelectTrigger id="irrigationMethod">
                          <SelectValue placeholder="Select method" />
                        </SelectTrigger>
                        <SelectContent>
                          {irrigationMethods.map((method) => (
                            <SelectItem key={method.value} value={method.value}>
                              {method.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className={`${isMobile ? 'text-xs' : ''}`}>Additional Notes</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Enter any additional information"
                      className={`${isMobile ? 'min-h-[60px]' : 'min-h-[80px]'}`}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className={`flex ${isMobile ? 'flex-col gap-2' : 'justify-between'}`}>
                <Button 
                  variant="outline" 
                  onClick={cancelZoneCreation}
                  className={`${isMobile ? 'w-full order-2' : ''}`}
                  size={isMobile ? "sm" : "default"}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleZoneCreate} 
                  disabled={!newZoneName}
                  className={`${isMobile ? 'w-full order-1' : ''}`}
                  size={isMobile ? "sm" : "default"}
                >
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
