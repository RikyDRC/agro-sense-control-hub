
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ConditionType, 
  ComparisonOperator, 
  ActionType,
  DeviceType,
  Zone,
  Device,
  AutomationRule
} from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface AutomationRuleFormProps {
  zones: Zone[];
  devices: Device[];
  onSubmit: (rule: AutomationRule) => void;
  onCancel: () => void;
  initialValues?: Partial<AutomationRule>;
}

const AutomationRuleForm: React.FC<AutomationRuleFormProps> = ({
  zones,
  devices,
  onSubmit,
  onCancel,
  initialValues
}) => {
  const [name, setName] = useState(initialValues?.name || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [zoneId, setZoneId] = useState(initialValues?.zoneId || '');
  const [conditionType, setConditionType] = useState<ConditionType>(
    initialValues?.condition?.type || ConditionType.SENSOR_READING
  );
  const [sensorId, setSensorId] = useState(initialValues?.condition?.sensorId || '');
  const [operator, setOperator] = useState<ComparisonOperator>(
    initialValues?.condition?.operator || ComparisonOperator.LESS_THAN
  );
  const [threshold, setThreshold] = useState<number>(
    initialValues?.condition?.threshold || 30
  );
  const [timeOfDay, setTimeOfDay] = useState(initialValues?.condition?.timeOfDay || '06:00');
  const [actionType, setActionType] = useState<ActionType>(
    initialValues?.action?.type || ActionType.TOGGLE_DEVICE
  );
  const [actionDeviceId, setActionDeviceId] = useState(initialValues?.action?.deviceId || '');
  const [duration, setDuration] = useState<number>(
    initialValues?.action?.duration || 30
  );

  const sensorsForZone = devices.filter(
    device => (device.type === DeviceType.MOISTURE_SENSOR || 
              device.type === DeviceType.TEMPERATURE_SENSOR) && 
              (!zoneId || device.zoneId === zoneId)
  );
  
  const actuatorsForZone = devices.filter(
    device => (device.type === DeviceType.VALVE || 
              device.type === DeviceType.PUMP) && 
              (!zoneId || device.zoneId === zoneId)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let condition: any = {};
    if (conditionType === ConditionType.SENSOR_READING) {
      condition = {
        type: conditionType,
        sensorId,
        threshold,
        operator
      };
    } else if (conditionType === ConditionType.TIME_BASED) {
      condition = {
        type: conditionType,
        timeOfDay,
        daysOfWeek: [1, 2, 3, 4, 5, 6, 7] // Default to all days
      };
    }
    
    const action = {
      type: actionType,
      deviceId: actionDeviceId,
      duration
    };
    
    const rule: AutomationRule = {
      id: initialValues?.id || uuidv4(),
      name,
      description,
      condition,
      action,
      zoneId,
      isActive: initialValues?.isActive ?? true,
      createdAt: initialValues?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    onSubmit(rule);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Rule Name</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Auto-Irrigation for Zone A"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the purpose of this automation rule"
          rows={2}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="zone">Zone</Label>
        <Select value={zoneId} onValueChange={setZoneId}>
          <SelectTrigger>
            <SelectValue placeholder="Select a zone" />
          </SelectTrigger>
          <SelectContent>
            {zones.map((zone) => (
              <SelectItem key={zone.id} value={zone.id}>{zone.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="border rounded-md p-4 space-y-4">
        <h3 className="text-sm font-medium">Condition</h3>
        
        <div className="space-y-2">
          <Label htmlFor="conditionType">Condition Type</Label>
          <Select 
            value={conditionType} 
            onValueChange={(value) => setConditionType(value as ConditionType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select condition type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ConditionType.SENSOR_READING}>Sensor Reading</SelectItem>
              <SelectItem value={ConditionType.TIME_BASED}>Time-Based</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {conditionType === ConditionType.SENSOR_READING && (
          <>
            <div className="space-y-2">
              <Label htmlFor="sensorId">Sensor</Label>
              <Select 
                value={sensorId} 
                onValueChange={setSensorId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a sensor" />
                </SelectTrigger>
                <SelectContent>
                  {sensorsForZone.map((sensor) => (
                    <SelectItem key={sensor.id} value={sensor.id}>{sensor.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="operator">Condition</Label>
              <Select 
                value={operator} 
                onValueChange={(value) => setOperator(value as ComparisonOperator)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ComparisonOperator.LESS_THAN}>Less Than</SelectItem>
                  <SelectItem value={ComparisonOperator.GREATER_THAN}>Greater Than</SelectItem>
                  <SelectItem value={ComparisonOperator.EQUAL_TO}>Equal To</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="threshold">Threshold</Label>
              <div className="flex items-center">
                <Input
                  id="threshold"
                  type="number"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-20 mr-2"
                />
                <span>%</span>
              </div>
            </div>
          </>
        )}
        
        {conditionType === ConditionType.TIME_BASED && (
          <div className="space-y-2">
            <Label htmlFor="timeOfDay">Time of Day</Label>
            <Input
              id="timeOfDay"
              type="time"
              value={timeOfDay}
              onChange={(e) => setTimeOfDay(e.target.value)}
            />
          </div>
        )}
      </div>
      
      <div className="border rounded-md p-4 space-y-4">
        <h3 className="text-sm font-medium">Action</h3>
        
        <div className="space-y-2">
          <Label htmlFor="actionType">Action Type</Label>
          <Select 
            value={actionType} 
            onValueChange={(value) => setActionType(value as ActionType)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select action type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ActionType.TOGGLE_DEVICE}>Toggle Device</SelectItem>
              <SelectItem value={ActionType.SEND_NOTIFICATION}>Send Notification</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {actionType === ActionType.TOGGLE_DEVICE && (
          <>
            <div className="space-y-2">
              <Label htmlFor="actionDeviceId">Device</Label>
              <Select 
                value={actionDeviceId} 
                onValueChange={setActionDeviceId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a device" />
                </SelectTrigger>
                <SelectContent>
                  {actuatorsForZone.map((device) => (
                    <SelectItem key={device.id} value={device.id}>{device.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                min={1}
              />
            </div>
          </>
        )}
      </div>
      
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialValues?.id ? 'Update Rule' : 'Create Rule'}
        </Button>
      </div>
    </form>
  );
};

export default AutomationRuleForm;
