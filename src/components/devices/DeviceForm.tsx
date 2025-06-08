
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DeviceType } from '@/types';
import { MapPin } from 'lucide-react';

interface DeviceFormProps {
  onSubmit?: (deviceData: { name: string; type: DeviceType }) => void;
}

const DeviceForm: React.FC<DeviceFormProps> = ({ onSubmit }) => {
  const navigate = useNavigate();
  const [deviceName, setDeviceName] = useState('');
  const [deviceType, setDeviceType] = useState<DeviceType>(DeviceType.MOISTURE_SENSOR);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deviceName.trim()) {
      return;
    }

    const deviceData = {
      name: deviceName.trim(),
      type: deviceType
    };

    if (onSubmit) {
      onSubmit(deviceData);
    }

    // Navigate to map for device placement
    navigate('/map', {
      state: {
        action: 'placeDevice',
        device: deviceData
      }
    });
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Add New Device</CardTitle>
        <CardDescription>
          Create a new device and place it on the map
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="deviceName">Device Name</Label>
            <Input
              id="deviceName"
              value={deviceName}
              onChange={(e) => setDeviceName(e.target.value)}
              placeholder="e.g. North Field Sensor"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deviceType">Device Type</Label>
            <Select value={deviceType} onValueChange={(value) => setDeviceType(value as DeviceType)}>
              <SelectTrigger id="deviceType">
                <SelectValue placeholder="Select device type" />
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

          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/devices')}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              <MapPin className="mr-2 h-4 w-4" />
              Place on Map
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default DeviceForm;
