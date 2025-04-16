
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Dialog, DialogClose, DialogContent, DialogDescription, 
  DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Pencil, Trash2, Check, X, Bot, Clock, Activity, 
  Settings, Zap, Droplet, ThermometerIcon, Cloud, Clock7, 
  CalendarDays, MoreHorizontal, Eye 
} from 'lucide-react';
import { 
  AutomationRule, Condition, ConditionType, ComparisonOperator, 
  Action, ActionType, Device, DeviceType, Zone 
} from '@/types';
import { v4 as uuidv4 } from 'uuid';

// Mock data
const mockZones: Zone[] = [
  {
    id: 'zone-a',
    name: 'Field Zone A',
    description: 'North field with corn',
    boundaryCoordinates: [],
    areaSize: 1000,
    devices: ['1', '2'],
    irrigationStatus: 'active',
    soilMoistureThreshold: 30,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'zone-b',
    name: 'Field Zone B',
    description: 'East field with soybeans',
    boundaryCoordinates: [],
    areaSize: 1200,
    devices: ['3'],
    irrigationStatus: 'scheduled',
    soilMoistureThreshold: 35,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const mockDevices: Device[] = [
  {
    id: '1',
    name: 'Moisture Sensor A1',
    type: DeviceType.MOISTURE_SENSOR,
    status: 'online',
    batteryLevel: 78,
    lastReading: 32.5,
    lastUpdated: new Date().toISOString(),
    location: { lat: 35.6895, lng: 139.6917 },
    zoneId: 'zone-a'
  },
  {
    id: '2',
    name: 'Temperature Sensor A2',
    type: DeviceType.TEMPERATURE_SENSOR,
    status: 'online',
    batteryLevel: 92,
    lastReading: 24.3,
    lastUpdated: new Date().toISOString(),
    location: { lat: 35.6895, lng: 139.6917 },
    zoneId: 'zone-a'
  },
  {
    id: '3',
    name: 'Valve B1',
    type: DeviceType.VALVE,
    status: 'online',
    batteryLevel: 65,
    lastUpdated: new Date().toISOString(),
    location: { lat: 35.6855, lng: 139.6957 },
    zoneId: 'zone-b'
  },
  {
    id: '4',
    name: 'Main Pump',
    type: DeviceType.PUMP,
    status: 'online',
    batteryLevel: 85,
    lastUpdated: new Date().toISOString(),
    location: { lat: 35.6825, lng: 139.6937 }
  }
];

const mockRules: AutomationRule[] = [
  {
    id: '1',
    name: 'Auto Irrigation - Zone A',
    description: 'Activate irrigation when soil moisture drops below threshold',
    condition: {
      type: ConditionType.SENSOR_READING,
      sensorId: '1',
      threshold: 25,
      operator: ComparisonOperator.LESS_THAN
    },
    action: {
      type: ActionType.TOGGLE_DEVICE,
      deviceId: '3',
      duration: 30
    },
    zoneId: 'zone-a',
    isActive: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Scheduled Watering - Zone B',
    description: 'Water Zone B every morning at 6am',
    condition: {
      type: ConditionType.TIME_BASED,
      timeOfDay: '06:00',
      daysOfWeek: [1, 2, 3, 4, 5]
    },
    action: {
      type: ActionType.TOGGLE_DEVICE,
      deviceId: '3',
      duration: 20
    },
    zoneId: 'zone-b',
    isActive: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Rain Forecast Override',
    description: 'Skip irrigation if rain is forecast',
    condition: {
      type: ConditionType.WEATHER_FORECAST,
      threshold: 60,
      operator: ComparisonOperator.GREATER_THAN
    },
    action: {
      type: ActionType.SEND_NOTIFICATION,
      value: 'Irrigation skipped due to rain forecast'
    },
    zoneId: 'zone-a',
    isActive: false,
    createdAt: new Date(Date.now() - 259200000).toISOString(),
    updatedAt: new Date().toISOString()
  }
];

interface RuleFormValues {
  id?: string;
  name: string;
  description: string;
  conditionType: ConditionType;
  sensorId?: string;
  threshold?: number;
  operator?: ComparisonOperator;
  timeOfDay?: string;
  daysOfWeek?: number[];
  actionType: ActionType;
  deviceId?: string;
  duration?: number;
  notificationText?: string;
  zoneId: string;
  isActive: boolean;
}

const getConditionString = (condition: Condition) => {
  switch (condition.type) {
    case ConditionType.SENSOR_READING:
      const sensorDevice = mockDevices.find(device => device.id === condition.sensorId);
      const sensorName = sensorDevice ? sensorDevice.name : 'Unknown Sensor';
      let operatorString = '';
      
      switch (condition.operator) {
        case ComparisonOperator.LESS_THAN:
          operatorString = 'falls below';
          break;
        case ComparisonOperator.GREATER_THAN:
          operatorString = 'rises above';
          break;
        case ComparisonOperator.EQUAL_TO:
          operatorString = 'equals';
          break;
        case ComparisonOperator.NOT_EQUAL_TO:
          operatorString = 'is not equal to';
          break;
        default:
          operatorString = 'is';
      }
      
      return `When ${sensorName} ${operatorString} ${condition.threshold}`;
      
    case ConditionType.TIME_BASED:
      const days = condition.daysOfWeek?.map(day => {
        const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return weekdays[day % 7];
      }).join(', ');
      
      return `At ${condition.timeOfDay} on ${days || 'every day'}`;
      
    case ConditionType.WEATHER_FORECAST:
      return `When rain probability ${condition.operator === ComparisonOperator.GREATER_THAN ? 'is above' : 'is below'} ${condition.threshold}%`;
      
    default:
      return 'Unknown condition';
  }
};

const getActionString = (action: Action) => {
  switch (action.type) {
    case ActionType.TOGGLE_DEVICE:
      const device = mockDevices.find(d => d.id === action.deviceId);
      const deviceName = device ? device.name : 'Unknown Device';
      return `Turn on ${deviceName} for ${action.duration} minutes`;
      
    case ActionType.SET_VALUE:
      return `Set value to ${action.value}`;
      
    case ActionType.SEND_NOTIFICATION:
      return `Send notification: "${action.value}"`;
      
    default:
      return 'Unknown action';
  }
};

const weekdayOptions = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' }
];

const initialRuleForm: RuleFormValues = {
  name: '',
  description: '',
  conditionType: ConditionType.SENSOR_READING,
  sensorId: '',
  threshold: 30,
  operator: ComparisonOperator.LESS_THAN,
  timeOfDay: '06:00',
  daysOfWeek: [1, 2, 3, 4, 5],
  actionType: ActionType.TOGGLE_DEVICE,
  deviceId: '',
  duration: 30,
  notificationText: '',
  zoneId: '',
  isActive: true
};

const AutomationPage: React.FC = () => {
  const [rules, setRules] = useState<AutomationRule[]>(mockRules);
  const [devices] = useState<Device[]>(mockDevices);
  const [zones] = useState<Zone[]>(mockZones);
  const [selectedTab, setSelectedTab] = useState<'all' | 'active' | 'inactive'>('all');
  const [ruleForm, setRuleForm] = useState<RuleFormValues>(initialRuleForm);
  const [isEditing, setIsEditing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const filteredRules = selectedTab === 'all' 
    ? rules 
    : selectedTab === 'active' 
      ? rules.filter(rule => rule.isActive) 
      : rules.filter(rule => !rule.isActive);

  const getSensorDevices = () => {
    return devices.filter(device => 
      device.type === DeviceType.MOISTURE_SENSOR || 
      device.type === DeviceType.TEMPERATURE_SENSOR ||
      device.type === DeviceType.PH_SENSOR ||
      device.type === DeviceType.LIGHT_SENSOR
    );
  };

  const getActuatorDevices = () => {
    return devices.filter(device => 
      device.type === DeviceType.VALVE || 
      device.type === DeviceType.PUMP
    );
  };

  const handleRuleStatusChange = (ruleId: string, isActive: boolean) => {
    setRules(prevRules => 
      prevRules.map(rule => 
        rule.id === ruleId 
          ? { ...rule, isActive, updatedAt: new Date().toISOString() } 
          : rule
      )
    );
  };

  const handleCreateRule = () => {
    let condition: Condition;
    let action: Action;
    
    // Build condition based on type
    switch (ruleForm.conditionType) {
      case ConditionType.SENSOR_READING:
        condition = {
          type: ConditionType.SENSOR_READING,
          sensorId: ruleForm.sensorId,
          threshold: ruleForm.threshold,
          operator: ruleForm.operator
        };
        break;
      case ConditionType.TIME_BASED:
        condition = {
          type: ConditionType.TIME_BASED,
          timeOfDay: ruleForm.timeOfDay,
          daysOfWeek: ruleForm.daysOfWeek
        };
        break;
      case ConditionType.WEATHER_FORECAST:
        condition = {
          type: ConditionType.WEATHER_FORECAST,
          threshold: ruleForm.threshold,
          operator: ruleForm.operator
        };
        break;
      default:
        condition = { type: ConditionType.SENSOR_READING };
    }
    
    // Build action based on type
    switch (ruleForm.actionType) {
      case ActionType.TOGGLE_DEVICE:
        action = {
          type: ActionType.TOGGLE_DEVICE,
          deviceId: ruleForm.deviceId,
          duration: ruleForm.duration
        };
        break;
      case ActionType.SET_VALUE:
        action = {
          type: ActionType.SET_VALUE,
          value: ruleForm.threshold
        };
        break;
      case ActionType.SEND_NOTIFICATION:
        action = {
          type: ActionType.SEND_NOTIFICATION,
          value: ruleForm.notificationText
        };
        break;
      default:
        action = { type: ActionType.SEND_NOTIFICATION };
    }
    
    const newRule: AutomationRule = {
      id: uuidv4(),
      name: ruleForm.name,
      description: ruleForm.description,
      condition,
      action,
      zoneId: ruleForm.zoneId,
      isActive: ruleForm.isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setRules(prev => [...prev, newRule]);
    resetForm();
    setIsDialogOpen(false);
  };

  const handleUpdateRule = () => {
    if (!ruleForm.id) return;
    
    let condition: Condition;
    let action: Action;
    
    // Build condition based on type
    switch (ruleForm.conditionType) {
      case ConditionType.SENSOR_READING:
        condition = {
          type: ConditionType.SENSOR_READING,
          sensorId: ruleForm.sensorId,
          threshold: ruleForm.threshold,
          operator: ruleForm.operator
        };
        break;
      case ConditionType.TIME_BASED:
        condition = {
          type: ConditionType.TIME_BASED,
          timeOfDay: ruleForm.timeOfDay,
          daysOfWeek: ruleForm.daysOfWeek
        };
        break;
      case ConditionType.WEATHER_FORECAST:
        condition = {
          type: ConditionType.WEATHER_FORECAST,
          threshold: ruleForm.threshold,
          operator: ruleForm.operator
        };
        break;
      default:
        condition = { type: ConditionType.SENSOR_READING };
    }
    
    // Build action based on type
    switch (ruleForm.actionType) {
      case ActionType.TOGGLE_DEVICE:
        action = {
          type: ActionType.TOGGLE_DEVICE,
          deviceId: ruleForm.deviceId,
          duration: ruleForm.duration
        };
        break;
      case ActionType.SET_VALUE:
        action = {
          type: ActionType.SET_VALUE,
          value: ruleForm.threshold
        };
        break;
      case ActionType.SEND_NOTIFICATION:
        action = {
          type: ActionType.SEND_NOTIFICATION,
          value: ruleForm.notificationText
        };
        break;
      default:
        action = { type: ActionType.SEND_NOTIFICATION };
    }
    
    setRules(prev => 
      prev.map(rule => 
        rule.id === ruleForm.id 
          ? {
              ...rule,
              name: ruleForm.name,
              description: ruleForm.description,
              condition,
              action,
              zoneId: ruleForm.zoneId,
              isActive: ruleForm.isActive,
              updatedAt: new Date().toISOString()
            } 
          : rule
      )
    );
    
    resetForm();
    setIsDialogOpen(false);
    setIsEditing(false);
  };

  const handleEditRule = (rule: AutomationRule) => {
    const formValues: RuleFormValues = {
      id: rule.id,
      name: rule.name,
      description: rule.description || '',
      conditionType: rule.condition.type,
      zoneId: rule.zoneId,
      isActive: rule.isActive,
      actionType: rule.action.type
    };
    
    // Populate condition-specific fields
    if (rule.condition.type === ConditionType.SENSOR_READING) {
      formValues.sensorId = rule.condition.sensorId;
      formValues.threshold = rule.condition.threshold;
      formValues.operator = rule.condition.operator;
    } else if (rule.condition.type === ConditionType.TIME_BASED) {
      formValues.timeOfDay = rule.condition.timeOfDay;
      formValues.daysOfWeek = rule.condition.daysOfWeek;
    } else if (rule.condition.type === ConditionType.WEATHER_FORECAST) {
      formValues.threshold = rule.condition.threshold;
      formValues.operator = rule.condition.operator;
    }
    
    // Populate action-specific fields
    if (rule.action.type === ActionType.TOGGLE_DEVICE) {
      formValues.deviceId = rule.action.deviceId;
      formValues.duration = rule.action.duration;
    } else if (rule.action.type === ActionType.SET_VALUE) {
      formValues.threshold = Number(rule.action.value);
    } else if (rule.action.type === ActionType.SEND_NOTIFICATION) {
      formValues.notificationText = String(rule.action.value);
    }
    
    setRuleForm(formValues);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!ruleToDelete) return;
    
    setRules(prev => prev.filter(rule => rule.id !== ruleToDelete));
    setRuleToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const resetForm = () => {
    setRuleForm(initialRuleForm);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Automation</h1>
            <p className="text-muted-foreground">Create and manage automated rules for your irrigation system</p>
          </div>
          <Button onClick={() => {
            resetForm();
            setIsEditing(false);
            setIsDialogOpen(true);
          }}>
            <Plus className="h-4 w-4 mr-2" /> Add Rule
          </Button>
        </div>

        <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)}>
          <TabsList>
            <TabsTrigger value="all">All Rules</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
          </TabsList>
          
          <Card className="mt-6">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rule</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Zone</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRules.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        <p className="text-muted-foreground">No rules found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRules.map((rule) => (
                      <TableRow key={rule.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-md bg-primary/10">
                                <Bot className="h-5 w-5 text-primary" />
                              </div>
                              <span className="font-medium">{rule.name}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{rule.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {rule.condition.type === ConditionType.SENSOR_READING && (
                              <Droplet className="h-4 w-4 text-blue-500" />
                            )}
                            {rule.condition.type === ConditionType.TIME_BASED && (
                              <Clock className="h-4 w-4 text-purple-500" />
                            )}
                            {rule.condition.type === ConditionType.WEATHER_FORECAST && (
                              <Cloud className="h-4 w-4 text-gray-500" />
                            )}
                            <span className="text-sm">{getConditionString(rule.condition)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {rule.action.type === ActionType.TOGGLE_DEVICE && (
                              <Zap className="h-4 w-4 text-yellow-500" />
                            )}
                            {rule.action.type === ActionType.SET_VALUE && (
                              <Settings className="h-4 w-4 text-gray-500" />
                            )}
                            {rule.action.type === ActionType.SEND_NOTIFICATION && (
                              <Activity className="h-4 w-4 text-red-500" />
                            )}
                            <span className="text-sm">{getActionString(rule.action)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {zones.find(zone => zone.id === rule.zoneId)?.name || 'System-wide'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={rule.isActive}
                              onCheckedChange={(checked) => handleRuleStatusChange(rule.id, checked)}
                            />
                            <span>{rule.isActive ? 'Active' : 'Inactive'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {new Date(rule.updatedAt).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="icon"
                              onClick={() => handleEditRule(rule)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon" 
                              className="text-red-500"
                              onClick={() => {
                                setRuleToDelete(rule.id);
                                setIsDeleteDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="icon"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Tabs>
      </div>

      {/* Rule Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Rule' : 'Create New Rule'}</DialogTitle>
            <DialogDescription>
              {isEditing 
                ? 'Update automation rule parameters' 
                : 'Set conditions and actions for automated control'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Rule Name</Label>
                <Input
                  id="name"
                  value={ruleForm.name}
                  onChange={(e) => setRuleForm({...ruleForm, name: e.target.value})}
                  placeholder="Auto-Irrigation Zone A"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={ruleForm.description}
                  onChange={(e) => setRuleForm({...ruleForm, description: e.target.value})}
                  placeholder="Describe what this rule does"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zone">Apply to Zone</Label>
                <Select 
                  value={ruleForm.zoneId} 
                  onValueChange={(value) => setRuleForm({...ruleForm, zoneId: value})}
                >
                  <SelectTrigger id="zone">
                    <SelectValue placeholder="Select zone" />
                  </SelectTrigger>
                  <SelectContent>
                    {zones.map((zone) => (
                      <SelectItem key={zone.id} value={zone.id}>
                        {zone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="active"
                  checked={ruleForm.isActive}
                  onCheckedChange={(checked) => setRuleForm({...ruleForm, isActive: checked})}
                />
                <Label htmlFor="active">Rule Active</Label>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Condition Type</Label>
                <Select 
                  value={ruleForm.conditionType} 
                  onValueChange={(value) => setRuleForm({...ruleForm, conditionType: value as ConditionType})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ConditionType.SENSOR_READING}>Sensor Reading</SelectItem>
                    <SelectItem value={ConditionType.TIME_BASED}>Time Based</SelectItem>
                    <SelectItem value={ConditionType.WEATHER_FORECAST}>Weather Forecast</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Condition type specific fields */}
              {ruleForm.conditionType === ConditionType.SENSOR_READING && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="sensor">Select Sensor</Label>
                    <Select 
                      value={ruleForm.sensorId} 
                      onValueChange={(value) => setRuleForm({...ruleForm, sensorId: value})}
                    >
                      <SelectTrigger id="sensor">
                        <SelectValue placeholder="Select sensor" />
                      </SelectTrigger>
                      <SelectContent>
                        {getSensorDevices().map((device) => (
                          <SelectItem key={device.id} value={device.id}>
                            {device.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="operator">Condition</Label>
                    <Select 
                      value={ruleForm.operator} 
                      onValueChange={(value) => setRuleForm({...ruleForm, operator: value as ComparisonOperator})}
                    >
                      <SelectTrigger id="operator">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ComparisonOperator.LESS_THAN}>Less Than</SelectItem>
                        <SelectItem value={ComparisonOperator.GREATER_THAN}>Greater Than</SelectItem>
                        <SelectItem value={ComparisonOperator.EQUAL_TO}>Equal To</SelectItem>
                        <SelectItem value={ComparisonOperator.NOT_EQUAL_TO}>Not Equal To</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="threshold">Threshold Value</Label>
                    <Input
                      id="threshold"
                      type="number"
                      value={ruleForm.threshold}
                      onChange={(e) => setRuleForm({...ruleForm, threshold: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </>
              )}

              {ruleForm.conditionType === ConditionType.TIME_BASED && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="timeOfDay">Time of Day</Label>
                    <Input
                      id="timeOfDay"
                      type="time"
                      value={ruleForm.timeOfDay}
                      onChange={(e) => setRuleForm({...ruleForm, timeOfDay: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Days of Week</Label>
                    <div className="flex flex-wrap gap-2">
                      {weekdayOptions.map((day) => (
                        <Badge
                          key={day.value}
                          className={`cursor-pointer ${
                            ruleForm.daysOfWeek?.includes(day.value)
                              ? 'bg-primary'
                              : 'bg-muted text-muted-foreground'
                          }`}
                          onClick={() => {
                            const currentDays = ruleForm.daysOfWeek || [];
                            const updatedDays = currentDays.includes(day.value)
                              ? currentDays.filter(d => d !== day.value)
                              : [...currentDays, day.value];
                            setRuleForm({...ruleForm, daysOfWeek: updatedDays});
                          }}
                        >
                          {day.label.substring(0, 3)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {ruleForm.conditionType === ConditionType.WEATHER_FORECAST && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="weatherOperator">Rain Probability</Label>
                    <Select 
                      value={ruleForm.operator} 
                      onValueChange={(value) => setRuleForm({...ruleForm, operator: value as ComparisonOperator})}
                    >
                      <SelectTrigger id="weatherOperator">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ComparisonOperator.GREATER_THAN}>Greater Than</SelectItem>
                        <SelectItem value={ComparisonOperator.LESS_THAN}>Less Than</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="weatherThreshold">Probability Percentage</Label>
                    <Input
                      id="weatherThreshold"
                      type="number"
                      value={ruleForm.threshold}
                      onChange={(e) => setRuleForm({...ruleForm, threshold: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <h3 className="font-medium mb-3">Action to Take</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Action Type</Label>
                  <Select 
                    value={ruleForm.actionType} 
                    onValueChange={(value) => setRuleForm({...ruleForm, actionType: value as ActionType})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ActionType.TOGGLE_DEVICE}>Control Device</SelectItem>
                      <SelectItem value={ActionType.SET_VALUE}>Set Value</SelectItem>
                      <SelectItem value={ActionType.SEND_NOTIFICATION}>Send Notification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {ruleForm.actionType === ActionType.TOGGLE_DEVICE && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="actionDevice">Select Device</Label>
                      <Select 
                        value={ruleForm.deviceId} 
                        onValueChange={(value) => setRuleForm({...ruleForm, deviceId: value})}
                      >
                        <SelectTrigger id="actionDevice">
                          <SelectValue placeholder="Select device" />
                        </SelectTrigger>
                        <SelectContent>
                          {getActuatorDevices().map((device) => (
                            <SelectItem key={device.id} value={device.id}>
                              {device.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={ruleForm.duration}
                        onChange={(e) => setRuleForm({...ruleForm, duration: parseInt(e.target.value) || 0})}
                      />
                    </div>
                  </>
                )}

                {ruleForm.actionType === ActionType.SET_VALUE && (
                  <div className="space-y-2">
                    <Label htmlFor="setValue">Value to Set</Label>
                    <Input
                      id="setValue"
                      type="number"
                      value={ruleForm.threshold}
                      onChange={(e) => setRuleForm({...ruleForm, threshold: parseInt(e.target.value) || 0})}
                    />
                  </div>
                )}

                {ruleForm.actionType === ActionType.SEND_NOTIFICATION && (
                  <div className="space-y-2">
                    <Label htmlFor="notificationText">Notification Message</Label>
                    <Input
                      id="notificationText"
                      value={ruleForm.notificationText}
                      onChange={(e) => setRuleForm({...ruleForm, notificationText: e.target.value})}
                      placeholder="Enter notification message"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={isEditing ? handleUpdateRule : handleCreateRule}>
              {isEditing ? 'Update Rule' : 'Create Rule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this automation rule? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">
                <X className="h-4 w-4 mr-2" /> Cancel
              </Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              <Check className="h-4 w-4 mr-2" /> Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AutomationPage;
