
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
import { AlertCircle, MapPin, Loader2, Map, Settings, Plus, Target } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { Textarea } from '@/components/ui/textarea';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [mapType, setMapType] = useState<'satellite' | 'roadmap' | 'hybrid'>('hybrid');
  
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
  const [activeTab, setActiveTab] = useState('zones');

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
        },
        options
      );
    } else {
      console.warn("Geolocation is not supported by this browser");
      setLocationLoading(false);
    }
  }, []);

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
      setActiveTab('devices');
      toast.info('Click on the map to place your new device');
    }
  }, [newDevice, isScriptLoaded]);

  const onScriptLoad = useCallback(() => {
    console.log("Google Maps script loaded successfully");
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
    
    // Use hybrid view by default (combines satellite with road labels)
    if (window.google && window.google.maps && window.google.maps.MapTypeId) {
      map.setMapTypeId(window.google.maps.MapTypeId.HYBRID);
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
      setActiveTab('zones');
      
      drawingManager.setDrawingMode(window.google.maps.drawing.OverlayType.POLYGON);
      toast.info('Draw the zone boundaries on the map');
    }
  }, [createZone, drawingManager, isScriptLoaded]);

  // Set initial map center
  useEffect(() => {
    if (isScriptLoaded && mapInstance && window.google) {
      if (userLocation) {
        mapInstance.setCenter(userLocation);
        mapInstance.setZoom(isMobile ? 16 : 17);
        return;
      }

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
    
    let area = 0;
    if (coordinates.length > 2) {
      for (let i = 0; i < coordinates.length; i++) {
        const j = (i + 1) % coordinates.length;
        area += coordinates[i].lat * coordinates[j].lng;
        area -= coordinates[j].lat * coordinates[i].lng;
      }
      area = Math.abs(area) * 111000 * 111000 / 2;
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
    
    // Clean up
    setNewZoneName('');
    setNewZoneDescription('');
    setSoilType('');
    setCropType('');
    setIrrigationMethod('');
    setNotes('');
    setIsNamingZone(false);
    createdPolygon.setMap(null);
    setCreatedPolygon(null);
    
    if (drawingManager) {
      drawingManager.setOptions({
        drawingControl: true
      });
    }
    
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
    
    if (drawingManager) {
      drawingManager.setOptions({
        drawingControl: true
      });
    }
    
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
      
      if (newDevice) {
        toast.success(`Device placed successfully${targetZoneId ? ' in zone' : ''}`);
        navigate('/devices');
      }
    }
  }, [isAddingDevice, newDeviceType, newDeviceName, selectedZone, zones, onDeviceAdd, newDevice, navigate]);

  const getDeviceIcon = (type: DeviceType, status: DeviceStatus) => {
    const baseUrl = 'https://maps.google.com/mapfiles/ms/icons/';
    
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

  const changeMapType = (type: 'satellite' | 'roadmap' | 'hybrid') => {
    setMapType(type);
    if (mapInstance && window.google && window.google.maps) {
      switch (type) {
        case 'satellite':
          mapInstance.setMapTypeId(window.google.maps.MapTypeId.SATELLITE);
          break;
        case 'roadmap':
          mapInstance.setMapTypeId(window.google.maps.MapTypeId.ROADMAP);
          break;
        case 'hybrid':
          mapInstance.setMapTypeId(window.google.maps.MapTypeId.HYBRID);
          break;
      }
    }
  };

  // Loading states
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
          <Skeleton className={`w-full ${isMobile ? 'h-[60vh]' : 'h-[70vh]'}`} />
        </CardContent>
      </Card>
    );
  }
  
  // Error states
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
      {/* Mobile: Controls first, then map */}
      {isMobile ? (
        <>
          {/* Mobile Controls */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Field Controls</CardTitle>
              <CardDescription className="text-sm">Manage zones and devices</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="zones" className="text-xs">Zones</TabsTrigger>
                  <TabsTrigger value="devices" className="text-xs">Devices</TabsTrigger>
                  <TabsTrigger value="settings" className="text-xs">View</TabsTrigger>
                </TabsList>
                
                <TabsContent value="zones" className="space-y-3 mt-4">
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
                    size="sm"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Zone
                  </Button>
                </TabsContent>
                
                <TabsContent value="devices" className="space-y-3 mt-4">
                  {!newDevice && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="deviceType" className="text-sm">Device Type</Label>
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
                        <Label htmlFor="deviceName" className="text-sm">Device Name (Optional)</Label>
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
                        size="sm"
                      >
                        {isAddingDevice ? (
                          <>
                            <Target className="mr-2 h-4 w-4" />
                            Tap Map to Place
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Device
                          </>
                        )}
                      </Button>
                      
                      {isAddingDevice && (
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => setIsAddingDevice(false)}
                          size="sm"
                        >
                          Cancel
                        </Button>
                      )}
                    </>
                  )}
                  
                  {newDevice && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Device:</span>
                        <Badge variant="outline" className="text-xs">{newDevice.name}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Type:</span>
                        <Badge variant="secondary" className="text-xs">
                          {newDevice.type.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        </Badge>
                      </div>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => navigate('/devices')}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="settings" className="space-y-3 mt-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Map View</Label>
                    <Select value={mapType} onValueChange={(value: 'satellite' | 'roadmap' | 'hybrid') => changeMapType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hybrid">Hybrid (Recommended)</SelectItem>
                        <SelectItem value="satellite">Satellite</SelectItem>
                        <SelectItem value="roadmap">Road Map</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {userLocation && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        if (mapInstance && userLocation) {
                          mapInstance.setCenter(userLocation);
                          mapInstance.setZoom(16);
                        }
                      }}
                      size="sm"
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      Go to My Location
                    </Button>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Mobile Map */}
          <Card>
            <CardContent className="p-2">
              <LoadScript 
                googleMapsApiKey={googleMapsApiKey} 
                libraries={libraries}
                onLoad={onScriptLoad}
                onError={onScriptError}
                loadingElement={
                  <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading map...</span>
                  </div>
                }
              >
                {isScriptLoaded && window.google && window.google.maps ? (
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '60vh' }}
                    center={mapCenter}
                    zoom={userLocation ? 16 : 13}
                    onLoad={onMapLoad}
                    onClick={handleMapClick}
                    options={{
                      streetViewControl: false,
                      mapTypeControl: false,
                      fullscreenControl: false,
                      zoomControl: true,
                      mapTypeId: window.google.maps.MapTypeId.HYBRID,
                      gestureHandling: 'cooperative'
                    }}
                  >
                    {/* User location marker */}
                    {userLocation && window.google && window.google.maps && (
                      <Marker
                        position={userLocation}
                        icon={{
                          url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                          scaledSize: new window.google.maps.Size(24, 24)
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
                    
                    {/* Drawing Manager */}
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
                  <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Preparing map...</span>
                  </div>
                )}
              </LoadScript>
            </CardContent>
          </Card>
        </>
      ) : (
        /* Desktop Layout: Map on left, controls on right */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Desktop Map - Takes up 3/4 of the width */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Field Map - {mapType.charAt(0).toUpperCase() + mapType.slice(1)} View</CardTitle>
                    <CardDescription>
                      {userLocation ? 'Your current location shown' : 'Manage your fields and devices'}
                    </CardDescription>
                  </div>
                  {userLocation && (
                    <div className="flex items-center text-muted-foreground text-sm">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>Your Location</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <LoadScript 
                  googleMapsApiKey={googleMapsApiKey} 
                  libraries={libraries}
                  onLoad={onScriptLoad}
                  onError={onScriptError}
                  loadingElement={
                    <div className="flex items-center justify-center h-[70vh]">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span className="ml-2">Loading map...</span>
                    </div>
                  }
                >
                  {isScriptLoaded && window.google && window.google.maps ? (
                    <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '70vh' }}
                      center={mapCenter}
                      zoom={userLocation ? 17 : 14}
                      onLoad={onMapLoad}
                      onClick={handleMapClick}
                      options={{
                        streetViewControl: false,
                        mapTypeControl: true,
                        fullscreenControl: true,
                        zoomControl: true,
                        mapTypeId: window.google.maps.MapTypeId.HYBRID,
                        gestureHandling: 'auto'
                      }}
                    >
                      {/* User location marker */}
                      {userLocation && window.google && window.google.maps && (
                        <Marker
                          position={userLocation}
                          icon={{
                            url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                            scaledSize: new window.google.maps.Size(32, 32)
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
                      
                      {/* Drawing Manager */}
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
                    <div className="flex items-center justify-center h-[70vh]">
                      <Loader2 className="h-8 w-8 animate-spin" />
                      <span className="ml-2">Preparing map...</span>
                    </div>
                  )}
                </LoadScript>
              </CardContent>
            </Card>
          </div>
          
          {/* Desktop Controls - Takes up 1/4 of the width */}
          <div className="space-y-4">
            {/* Map Settings */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Map View
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label>View Type</Label>
                  <Select value={mapType} onValueChange={(value: 'satellite' | 'roadmap' | 'hybrid') => changeMapType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hybrid">Hybrid (Best)</SelectItem>
                      <SelectItem value="satellite">Satellite</SelectItem>
                      <SelectItem value="roadmap">Road Map</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {userLocation && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      if (mapInstance && userLocation) {
                        mapInstance.setCenter(userLocation);
                        mapInstance.setZoom(17);
                      }
                    }}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    My Location
                  </Button>
                )}
              </CardContent>
            </Card>
            
            {/* Zone Management */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Zones</CardTitle>
                <CardDescription>Select or create field zones</CardDescription>
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
                >
                  <Map className="mr-2 h-4 w-4" />
                  Draw New Zone
                </Button>
              </CardContent>
            </Card>
            
            {/* Device Management */}
            {!newDevice && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Add Device</CardTitle>
                  <CardDescription>Place new devices on the map</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
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
            )}

            {/* Device from route state */}
            {newDevice && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Place Device</CardTitle>
                  <CardDescription>Click on the map to place your new device</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Device:</span>
                      <Badge variant="outline">{newDevice.name}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Type:</span>
                      <Badge variant="secondary">
                        {newDevice.type.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate('/devices')}
                    >
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
      
      {/* Zone Naming Dialog - Full width for both mobile and desktop */}
      {isNamingZone && (
        <Card className="w-full">
          <CardHeader className="pb-3">
            <CardTitle>Zone Details</CardTitle>
            <CardDescription>Provide information about your zone</CardDescription>
          </CardHeader>
          <CardContent>
            <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
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

              <div className="space-y-2">
                <Label htmlFor="soilType">Soil Type</Label>
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

              <div className="space-y-2">
                <Label htmlFor="cropType">Primary Crop Type</Label>
                <Input
                  id="cropType"
                  value={cropType}
                  onChange={(e) => setCropType(e.target.value)}
                  placeholder="e.g. Wheat, Corn, Soybeans"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="irrigationMethod">Irrigation Method</Label>
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

              <div className={`space-y-2 ${isMobile ? 'col-span-1' : 'col-span-2'}`}>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Enter any additional information"
                  className="min-h-[80px]"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className={`flex ${isMobile ? 'flex-col gap-2' : 'justify-between'}`}>
            <Button 
              variant="outline" 
              onClick={cancelZoneCreation}
              className={`${isMobile ? 'w-full order-2' : ''}`}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleZoneCreate} 
              disabled={!newZoneName}
              className={`${isMobile ? 'w-full order-1' : ''}`}
            >
              Save Zone
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default MapView;
