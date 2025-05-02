import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Play, Pause, Plus, ArrowUpRight, CalendarDays, History, X, Clock, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/sonner';
import { 
  ConditionType, 
  ComparisonOperator, 
  ActionType,
  DeviceStatus,
  DeviceType,
  IrrigationStatus,
  AutomationRule,
  Zone,
  Device
} from '@/types';
import AutomationRuleForm from '@/components/automation/AutomationRuleForm';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

// Interface for Schedule
interface IrrigationSchedule {
  id: string;
  name: string;
  description: string;
  zoneId: string;
  deviceId: string;
  startTime: string;
  duration: number;
  daysOfWeek: number[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Interface for History
interface AutomationHistory {
  id: string;
  type: 'RULE_TRIGGER' | 'SCHEDULE' | 'MANUAL';
  name: string;
  description: string;
  status: 'SUCCESS' | 'FAILURE' | 'PENDING';
  zoneId: string;
  deviceId?: string;
  timestamp: string;
  details?: string;
}

const initialRules: AutomationRule[] = [
  {
    id: '1',
    name: 'Auto-Irrigation',
    description: 'Automatically activate irrigation when soil moisture falls below threshold',
    condition: {
      type: ConditionType.SENSOR_READING,
      sensorId: '1',
      threshold: 30,
      operator: ComparisonOperator.LESS_THAN
    },
    action: {
      type: ActionType.TOGGLE_DEVICE,
      deviceId: '2',
      duration: 30,
      target: '2' // Added required target field
    },
    zoneId: 'zone-a',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Morning Irrigation',
    description: 'Schedule irrigation every morning at 6:00 AM',
    condition: {
      type: ConditionType.TIME_BASED,
      timeOfDay: '06:00',
      daysOfWeek: [1, 2, 3, 4, 5, 6, 7]
    },
    action: {
      type: ActionType.TOGGLE_DEVICE,
      deviceId: '2',
      duration: 15,
      target: '2' // Added required target field
    },
    zoneId: 'zone-a',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const initialSchedules: IrrigationSchedule[] = [
  {
    id: 'sched-1',
    name: 'Evening Irrigation',
    description: 'Water zone A every evening',
    zoneId: 'zone-a',
    deviceId: '2',
    startTime: '18:30',
    duration: 20,
    daysOfWeek: [1, 3, 5],
    isActive: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const initialHistory: AutomationHistory[] = [
  {
    id: 'hist-1',
    type: 'RULE_TRIGGER',
    name: 'Auto-Irrigation Triggered',
    description: 'Moisture level below threshold (25%)',
    status: 'SUCCESS',
    zoneId: 'zone-a',
    deviceId: '2',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    details: 'Valve opened for 30 minutes'
  },
  {
    id: 'hist-2',
    type: 'SCHEDULE',
    name: 'Morning Irrigation Run',
    description: 'Scheduled irrigation at 6:00 AM',
    status: 'SUCCESS',
    zoneId: 'zone-a',
    deviceId: '2',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    details: 'Valve opened for 15 minutes'
  },
  {
    id: 'hist-3',
    type: 'MANUAL',
    name: 'Manual Irrigation',
    description: 'User initiated irrigation',
    status: 'SUCCESS',
    zoneId: 'zone-b',
    deviceId: '5',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    details: 'Valve opened for 10 minutes'
  }
];

const zones: Zone[] = [
  {
    id: 'zone-a',
    name: 'Field Zone A',
    description: 'Primary field zone',
    boundaryCoordinates: [],
    areaSize: 1200,
    devices: ['1', '2', '3'],
    irrigationStatus: IrrigationStatus.ACTIVE,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'zone-b',
    name: 'Field Zone B',
    description: 'Secondary field zone',
    boundaryCoordinates: [],
    areaSize: 900,
    devices: ['4', '5'],
    irrigationStatus: IrrigationStatus.SCHEDULED,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const devices: Device[] = [
  {
    id: '1',
    name: 'Moisture Sensor A1',
    type: DeviceType.MOISTURE_SENSOR,
    status: DeviceStatus.ONLINE,
    batteryLevel: 85,
    lastReading: 45.5,
    lastUpdated: new Date().toISOString(),
    location: { lat: 35.6895, lng: 139.6917 }
  },
  {
    id: '2',
    name: 'Valve A1',
    type: DeviceType.VALVE,
    status: DeviceStatus.ONLINE,
    batteryLevel: 78,
    lastUpdated: new Date().toISOString(),
    location: { lat: 35.6895, lng: 139.6917 }
  },
  {
    id: '3',
    name: 'Temperature Sensor A1',
    type: DeviceType.TEMPERATURE_SENSOR,
    status: DeviceStatus.ONLINE,
    batteryLevel: 92,
    lastReading: 22.3,
    lastUpdated: new Date().toISOString(),
    location: { lat: 35.6895, lng: 139.6917 }
  },
  {
    id: '4',
    name: 'Moisture Sensor B1',
    type: DeviceType.MOISTURE_SENSOR,
    status: DeviceStatus.ONLINE,
    batteryLevel: 65,
    lastReading: 62.1,
    lastUpdated: new Date().toISOString(),
    location: { lat: 35.6895, lng: 139.6917 }
  },
  {
    id: '5',
    name: 'Valve B1',
    type: DeviceType.VALVE,
    status: DeviceStatus.ONLINE,
    batteryLevel: 70,
    lastUpdated: new Date().toISOString(),
    location: { lat: 35.6895, lng: 139.6917 }
  }
];

const AutomationPage: React.FC = () => {
  const [rules, setRules] = useState<AutomationRule[]>(initialRules);
  const [schedules, setSchedules] = useState<IrrigationSchedule[]>(initialSchedules);
  const [history, setHistory] = useState<AutomationHistory[]>(initialHistory);
  const [activeTab, setActiveTab] = useState('rules');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);
  const [editingSchedule, setEditingSchedule] = useState<IrrigationSchedule | null>(null);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [newSchedule, setNewSchedule] = useState<Partial<IrrigationSchedule>>({
    name: '',
    description: '',
    zoneId: '',
    deviceId: '',
    startTime: '08:00',
    duration: 15,
    daysOfWeek: [],
    isActive: true
  });

  const daysOfWeek = [
    { name: 'Mon', value: 1 },
    { name: 'Tue', value: 2 },
    { name: 'Wed', value: 3 },
    { name: 'Thu', value: 4 },
    { name: 'Fri', value: 5 },
    { name: 'Sat', value: 6 },
    { name: 'Sun', value: 7 }
  ];

  useEffect(() => {
    // Simulate loading state
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleCreateRule = () => {
    setEditingRule(null);
    setDialogOpen(true);
  };

  const handleEditRule = (rule: AutomationRule) => {
    setEditingRule(rule);
    setDialogOpen(true);
  };

  const handleSaveRule = (rule: AutomationRule) => {
    if (rule.id && rules.some(r => r.id === rule.id)) {
      setRules(prev => prev.map(r => r.id === rule.id ? rule : r));
      // Add to history
      const historyEntry: AutomationHistory = {
        id: uuidv4(),
        type: 'MANUAL',
        name: 'Rule Updated',
        description: `Rule "${rule.name}" was updated`,
        status: 'SUCCESS',
        zoneId: rule.zoneId,
        deviceId: rule.action.deviceId,
        timestamp: new Date().toISOString()
      };
      setHistory(prev => [historyEntry, ...prev]);
      toast.success("Rule updated successfully");
    } else {
      const newRule = {
        ...rule,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setRules(prev => [...prev, newRule]);
      // Add to history
      const historyEntry: AutomationHistory = {
        id: uuidv4(),
        type: 'MANUAL',
        name: 'Rule Created',
        description: `New rule "${rule.name}" was created`,
        status: 'SUCCESS',
        zoneId: rule.zoneId,
        deviceId: rule.action.deviceId,
        timestamp: new Date().toISOString()
      };
      setHistory(prev => [historyEntry, ...prev]);
      toast.success("Rule created successfully");
    }
    setDialogOpen(false);
  };

  const handleDeleteRule = (ruleId: string) => {
    const ruleToDelete = rules.find(rule => rule.id === ruleId);
    if (ruleToDelete) {
      // Add to history
      const historyEntry: AutomationHistory = {
        id: uuidv4(),
        type: 'MANUAL',
        name: 'Rule Deleted',
        description: `Rule "${ruleToDelete.name}" was deleted`,
        status: 'SUCCESS',
        zoneId: ruleToDelete.zoneId,
        deviceId: ruleToDelete.action.deviceId,
        timestamp: new Date().toISOString()
      };
      setHistory(prev => [historyEntry, ...prev]);
    }
    
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
    toast.success("Rule deleted successfully");
  };

  const toggleRuleStatus = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    if (!rule) return;
    
    const newStatus = !rule.isActive;
    
    setRules(prev => 
      prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, isActive: newStatus, updatedAt: new Date().toISOString() } 
          : rule
      )
    );
    
    // Add to history
    const historyEntry: AutomationHistory = {
      id: uuidv4(),
      type: 'MANUAL',
      name: `Rule ${newStatus ? 'Activated' : 'Paused'}`,
      description: `Rule "${rule.name}" was ${newStatus ? 'activated' : 'paused'}`,
      status: 'SUCCESS',
      zoneId: rule.zoneId,
      deviceId: rule.action.deviceId,
      timestamp: new Date().toISOString()
    };
    setHistory(prev => [historyEntry, ...prev]);
    
    toast.success(`Rule ${newStatus ? 'activated' : 'paused'}`);
  };

  const handleCreateSchedule = () => {
    setSelectedDays([]);
    setNewSchedule({
      name: '',
      description: '',
      zoneId: '',
      deviceId: '',
      startTime: '08:00',
      duration: 15,
      daysOfWeek: [],
      isActive: true
    });
    setEditingSchedule(null);
    setScheduleDialogOpen(true);
  };

  const handleEditSchedule = (schedule: IrrigationSchedule) => {
    setSelectedDays(schedule.daysOfWeek);
    setNewSchedule(schedule);
    setEditingSchedule(schedule);
    setScheduleDialogOpen(true);
  };

  const handleSaveSchedule = () => {
    if (!newSchedule.name || !newSchedule.zoneId || !newSchedule.deviceId) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (selectedDays.length === 0) {
      toast.error("Please select at least one day of the week");
      return;
    }

    const updatedSchedule = {
      ...newSchedule,
      daysOfWeek: selectedDays,
      updatedAt: new Date().toISOString()
    } as IrrigationSchedule;

    if (editingSchedule) {
      // Update existing schedule
      setSchedules(prev => 
        prev.map(s => s.id === editingSchedule.id ? updatedSchedule : s)
      );
      
      // Add to history
      const historyEntry: AutomationHistory = {
        id: uuidv4(),
        type: 'MANUAL',
        name: 'Schedule Updated',
        description: `Schedule "${updatedSchedule.name}" was updated`,
        status: 'SUCCESS',
        zoneId: updatedSchedule.zoneId,
        deviceId: updatedSchedule.deviceId,
        timestamp: new Date().toISOString()
      };
      setHistory(prev => [historyEntry, ...prev]);
      
      toast.success("Schedule updated successfully");
    } else {
      // Create new schedule
      const newScheduleEntry = {
        ...updatedSchedule,
        id: uuidv4(),
        createdAt: new Date().toISOString()
      } as IrrigationSchedule;
      
      setSchedules(prev => [...prev, newScheduleEntry]);
      
      // Add to history
      const historyEntry: AutomationHistory = {
        id: uuidv4(),
        type: 'MANUAL',
        name: 'Schedule Created',
        description: `New schedule "${newScheduleEntry.name}" was created`,
        status: 'SUCCESS',
        zoneId: newScheduleEntry.zoneId,
        deviceId: newScheduleEntry.deviceId,
        timestamp: new Date().toISOString()
      };
      setHistory(prev => [historyEntry, ...prev]);
      
      toast.success("Schedule created successfully");
    }
    
    setScheduleDialogOpen(false);
  };

  const handleDeleteSchedule = (scheduleId: string) => {
    const scheduleToDelete = schedules.find(s => s.id === scheduleId);
    if (scheduleToDelete) {
      // Add to history
      const historyEntry: AutomationHistory = {
        id: uuidv4(),
        type: 'MANUAL',
        name: 'Schedule Deleted',
        description: `Schedule "${scheduleToDelete.name}" was deleted`,
        status: 'SUCCESS',
        zoneId: scheduleToDelete.zoneId,
        deviceId: scheduleToDelete.deviceId,
        timestamp: new Date().toISOString()
      };
      setHistory(prev => [historyEntry, ...prev]);
    }
    
    setSchedules(prev => prev.filter(s => s.id !== scheduleId));
    toast.success("Schedule deleted successfully");
  };

  const toggleScheduleStatus = (scheduleId: string) => {
    const schedule = schedules.find(s => s.id === scheduleId);
    if (!schedule) return;
    
    const newStatus = !schedule.isActive;
    
    setSchedules(prev => 
      prev.map(s => 
        s.id === scheduleId 
          ? { ...s, isActive: newStatus, updatedAt: new Date().toISOString() } 
          : s
      )
    );
    
    // Add to history
    const historyEntry: AutomationHistory = {
      id: uuidv4(),
      type: 'MANUAL',
      name: `Schedule ${newStatus ? 'Activated' : 'Paused'}`,
      description: `Schedule "${schedule.name}" was ${newStatus ? 'activated' : 'paused'}`,
      status: 'SUCCESS',
      zoneId: schedule.zoneId,
      deviceId: schedule.deviceId,
      timestamp: new Date().toISOString()
    };
    setHistory(prev => [historyEntry, ...prev]);
    
    toast.success(`Schedule ${newStatus ? 'activated' : 'paused'}`);
  };

  const toggleDaySelection = (day: number) => {
    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day) 
        : [...prev, day].sort((a, b) => a - b)
    );
  };

  const handleInputChange = (field: string, value: any) => {
    setNewSchedule(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Loading automation...</h1>
            <p className="text-muted-foreground">Please wait while we load your automation settings</p>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Irrigation Automation</h1>
          <p className="text-muted-foreground">Manage your automated irrigation rules and schedules</p>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="schedules">Schedules</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Automation Rules</h2>
              <Button onClick={handleCreateRule}>
                <Plus className="mr-2 h-4 w-4" /> Create Rule
              </Button>
            </div>

            {rules.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-6">
                  <p className="text-muted-foreground mb-4">No automation rules found</p>
                  <Button onClick={handleCreateRule}>
                    <Plus className="mr-2 h-4 w-4" /> Create Your First Rule
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {rules.map((rule) => (
                  <Card key={rule.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{rule.name}</CardTitle>
                          <CardDescription>{rule.description}</CardDescription>
                        </div>
                        <Badge variant={rule.isActive ? "default" : "outline"}>
                          {rule.isActive ? "Active" : "Paused"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Condition:</span>
                          <span>
                            {rule.condition.type === ConditionType.SENSOR_READING && (
                              <>
                                Sensor {devices.find(d => d.id === rule.condition.sensorId)?.name} 
                                {' '}
                                {rule.condition.operator === ComparisonOperator.LESS_THAN ? 'below' : 'above'} 
                                {' '}
                                {rule.condition.threshold}%
                              </>
                            )}
                            {rule.condition.type === ConditionType.TIME_BASED && (
                              <>
                                At {rule.condition.timeOfDay} daily
                              </>
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Action:</span>
                          <span>
                            {rule.action.type === ActionType.TOGGLE_DEVICE && (
                              <>
                                Turn {devices.find(d => d.id === rule.action.deviceId)?.name} on for {rule.action.duration} mins
                              </>
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Zone:</span>
                          <span>{zones.find(z => z.id === rule.zoneId)?.name}</span>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        {rule.isActive ? (
                          <Button size="sm" variant="outline" onClick={() => toggleRuleStatus(rule.id)}>
                            <Pause className="mr-1 h-3 w-3" /> Pause
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => toggleRuleStatus(rule.id)}>
                            <Play className="mr-1 h-3 w-3" /> Resume
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleEditRule(rule)}>
                          <ArrowUpRight className="mr-1 h-3 w-3" /> Edit
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteRule(rule.id)}>
                          <X className="mr-1 h-3 w-3" /> Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="schedules" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Irrigation Schedules</h2>
              <Button onClick={handleCreateSchedule}>
                <Plus className="mr-2 h-4 w-4" /> Create Schedule
              </Button>
            </div>

            {schedules.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-6 text-center">
                  <CalendarDays className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-1">No Active Schedules</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first irrigation schedule to automate water delivery on a regular basis.
                  </p>
                  <Button onClick={handleCreateSchedule}>
                    <Plus className="mr-2 h-4 w-4" /> Create Schedule
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {schedules.map((schedule) => (
                  <Card key={schedule.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{schedule.name}</CardTitle>
                          <CardDescription>{schedule.description}</CardDescription>
                        </div>
                        <Badge variant={schedule.isActive ? "default" : "outline"}>
                          {schedule.isActive ? "Active" : "Paused"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Schedule:</span>
                          <span className="flex items-center">
                            <Clock className="mr-1 h-3 w-3" /> {schedule.startTime}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Duration:</span>
                          <span>{schedule.duration} minutes</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Days:</span>
                          <span>
                            {schedule.daysOfWeek
                              .map(day => daysOfWeek.find(d => d.value === day)?.name)
                              .join(', ')}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Device:</span>
                          <span>{devices.find(d => d.id === schedule.deviceId)?.name}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Zone:</span>
                          <span>{zones.find(z => z.id === schedule.zoneId)?.name}</span>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        {schedule.isActive ? (
                          <Button size="sm" variant="outline" onClick={() => toggleScheduleStatus(schedule.id)}>
                            <Pause className="mr-1 h-3 w-3" /> Pause
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => toggleScheduleStatus(schedule.id)}>
                            <Play className="mr-1 h-3 w-3" /> Resume
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleEditSchedule(schedule)}>
                          <ArrowUpRight className="mr-1 h-3 w-3" /> Edit
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteSchedule(schedule.id)}>
                          <X className="mr-1 h-3 w-3" /> Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Automation History</h2>
              <Button variant="outline">
                <History className="mr-2 h-4 w-4" /> View All
              </Button>
            </div>
            
            {history.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-6 text-center">
                  <History className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-1">No History Records</h3>
                  <p className="text-muted-foreground mb-4">
                    Once your automation rules run, their activity will be recorded here.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {history.map((entry) => (
                  <Card key={entry.id}>
                    <CardContent className="pt-4 pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{entry.name}</h3>
                            <Badge variant={
                              entry.status === 'SUCCESS' ? "default" :
                              entry.status === 'PENDING' ? "outline" : "destructive"
                            }>
                              {entry.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {entry.description}
                          </p>
                          <div className="mt-2 text-xs text-muted-foreground">
                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                              <span>
                                <span className="font-medium">Time:</span> {format(new Date(entry.timestamp), 'MMM d, yyyy h:mm a')}
                              </span>
                              <span>
                                <span className="font-medium">Zone:</span> {zones.find(z => z.id === entry.zoneId)?.name}
                              </span>
                              {entry.deviceId && (
                                <span>
                                  <span className="font-medium">Device:</span> {devices.find(d => d.id === entry.deviceId)?.name}
                                </span>
                              )}
                              {entry.details && (
                                <span>
                                  <span className="font-medium">Details:</span> {entry.details}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="flex items-center text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          {entry.type === 'RULE_TRIGGER' ? 'Rule' : 
                           entry.type === 'SCHEDULE' ? 'Schedule' : 'Manual'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Rule Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingRule ? 'Edit Automation Rule' : 'Create Automation Rule'}</DialogTitle>
            <DialogDescription>
              {editingRule 
                ? 'Modify this automation rule to adjust when and how your irrigation system activates' 
                : 'Set up conditions to trigger automatic actions in your irrigation system'
              }
            </DialogDescription>
          </DialogHeader>
          
          <AutomationRuleForm
            zones={zones}
            devices={devices}
            onSubmit={handleSaveRule}
            onCancel={() => setDialogOpen(false)}
            initialValues={editingRule || undefined}
          />
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingSchedule ? 'Edit Irrigation Schedule' : 'Create Irrigation Schedule'}</DialogTitle>
            <DialogDescription>
              {editingSchedule 
                ? 'Modify this schedule to adjust when and how your irrigation system activates' 
                : 'Set up a recurring schedule for your irrigation system'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Schedule Name</Label>
                <Input 
                  id="name" 
                  placeholder="Daily Morning Irrigation"
                  value={newSchedule.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input 
                  id="description" 
                  placeholder="Brief description of this schedule"
                  value={newSchedule.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zone">Zone</Label>
                  <Select 
                    value={newSchedule.zoneId} 
                    onValueChange={(value) => handleInputChange('zoneId', value)}
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
                
                <div className="space-y-2">
                  <Label htmlFor="device">Device</Label>
                  <Select 
                    value={newSchedule.deviceId} 
                    onValueChange={(value) => handleInputChange('deviceId', value)}
                  >
                    <SelectTrigger id="device">
                      <SelectValue placeholder="Select device" />
                    </SelectTrigger>
                    <SelectContent>
                      {devices
                        .filter(device => device.type === DeviceType.VALVE)
                        .map((device) => (
                          <SelectItem key={device.id} value={device.id}>
                            {device.name}
                          </SelectItem>
                        ))
                      }
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input 
                    id="startTime" 
                    type="time"
                    value={newSchedule.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input 
                    id="duration" 
                    type="number"
                    min="1"
                    max="120"
                    value={newSchedule.duration}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Days of the Week</Label>
                <div className="flex flex-wrap gap-2">
                  {daysOfWeek.map((day) => (
                    <Button
                      key={day.value}
                      type="button"
                      variant={selectedDays.includes(day.value) ? "default" : "outline"}
                      onClick={() => toggleDaySelection(day.value)}
                      className="flex-1 min-w-[48px]"
                    >
                      {day.name}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSchedule}>
              {editingSchedule ? 'Update Schedule' : 'Create Schedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AutomationPage;
