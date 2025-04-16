
import React, { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Play, Pause, Plus, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { 
  ConditionType, 
  ComparisonOperator, 
  ActionType,
  DeviceStatus,
  DeviceType,
  IrrigationStatus,
  AutomationRule
} from '@/types';

// Mock data
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

// Mock zone data
const zones = [
  {
    id: 'zone-a',
    name: 'Field Zone A',
    devices: ['1', '2', '3'],
    irrigationStatus: IrrigationStatus.ACTIVE
  },
  {
    id: 'zone-b',
    name: 'Field Zone B',
    devices: ['4', '5'],
    irrigationStatus: IrrigationStatus.SCHEDULED
  }
];

// Mock device data
const devices = [
  {
    id: '1',
    name: 'Moisture Sensor A1',
    type: DeviceType.MOISTURE_SENSOR,
    status: DeviceStatus.ONLINE,
    lastReading: 45.5
  },
  {
    id: '2',
    name: 'Valve A1',
    type: DeviceType.VALVE,
    status: DeviceStatus.ONLINE
  },
  {
    id: '3',
    name: 'Temperature Sensor A1',
    type: DeviceType.TEMPERATURE_SENSOR,
    status: DeviceStatus.ONLINE,
    lastReading: 22.3
  },
  {
    id: '4',
    name: 'Moisture Sensor B1',
    type: DeviceType.MOISTURE_SENSOR,
    status: DeviceStatus.ONLINE,
    lastReading: 62.1
  },
  {
    id: '5',
    name: 'Valve B1',
    type: DeviceType.VALVE,
    status: DeviceStatus.ONLINE
  }
];

const AutomationPage: React.FC = () => {
  const [rules, setRules] = useState<AutomationRule[]>(initialRules);
  const [activeTab, setActiveTab] = useState('rules');

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
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Create Rule
              </Button>
            </div>

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
                        {rule.isActive ? "Active" : "Disabled"}
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
                        <Button size="sm" variant="outline">
                          <Pause className="mr-1 h-3 w-3" /> Pause
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline">
                          <Play className="mr-1 h-3 w-3" /> Resume
                        </Button>
                      )}
                      <Button size="sm" variant="outline">
                        <ArrowUpRight className="mr-1 h-3 w-3" /> Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="schedules">
            <Card>
              <CardHeader>
                <CardTitle>Irrigation Schedules</CardTitle>
                <CardDescription>
                  View and manage your scheduled irrigation tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Scheduled irrigation content goes here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Automation History</CardTitle>
                <CardDescription>
                  View a log of past automation activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Automation history content goes here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AutomationPage;
