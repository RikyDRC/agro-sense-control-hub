import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Play, Pause, Plus, ArrowUpRight, CalendarDays, History, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
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
      duration: 30
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
      duration: 15
    },
    zoneId: 'zone-a',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
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
  const [activeTab, setActiveTab] = useState('rules');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomationRule | null>(null);

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
      toast.success("Rule updated successfully");
    } else {
      setRules(prev => [...prev, rule]);
      toast.success("Rule created successfully");
    }
    setDialogOpen(false);
  };

  const handleDeleteRule = (ruleId: string) => {
    setRules(prev => prev.filter(rule => rule.id !== ruleId));
    toast.success("Rule deleted successfully");
  };

  const toggleRuleStatus = (ruleId: string) => {
    setRules(prev => 
      prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, isActive: !rule.isActive } 
          : rule
      )
    );
    
    const rule = rules.find(r => r.id === ruleId);
    if (rule) {
      toast.success(`Rule ${rule.isActive ? 'paused' : 'activated'}`);
    }
  };

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
                        <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleDeleteRule(rule.id)}>
                          <X className="mr-1 h-3 w-3" /> Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="schedules">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Irrigation Schedules</CardTitle>
                    <CardDescription>
                      View and manage your scheduled irrigation tasks
                    </CardDescription>
                  </div>
                  <Button variant="outline">
                    <CalendarDays className="mr-2 h-4 w-4" /> New Schedule
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <CalendarDays className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-1">No Active Schedules</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first irrigation schedule to automate water delivery on a regular basis.
                  </p>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" /> Create Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Automation History</CardTitle>
                    <CardDescription>
                      View a log of past automation activities
                    </CardDescription>
                  </div>
                  <Button variant="outline">
                    <History className="mr-2 h-4 w-4" /> View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <History className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-1">No History Records</h3>
                  <p className="text-muted-foreground mb-4">
                    Once your automation rules run, their activity will be recorded here.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

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
    </DashboardLayout>
  );
};

export default AutomationPage;
