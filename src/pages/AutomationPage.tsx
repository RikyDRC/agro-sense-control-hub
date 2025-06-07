import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Play, Pause, Plus, ArrowUpRight, CalendarDays, History, X, Clock, Loader2, CheckSquare, Square } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/sonner';
import { 
  ConditionType, 
  ComparisonOperator, 
  ActionType,
  DeviceStatus,
  DeviceType,
  IrrigationStatus,
  Zone,
  Device
} from '@/types';
import AutomationRuleForm from '@/components/automation/AutomationRuleForm';
import AutomationFilters from '@/components/automation/AutomationFilters';
import BulkActions from '@/components/automation/BulkActions';
import { useAutomationRules } from '@/hooks/useAutomationRules';
import { useIrrigationSchedules, type IrrigationSchedule } from '@/hooks/useIrrigationSchedules';
import { useAutomationHistory } from '@/hooks/useAutomationHistory';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

// Mock data for zones and devices - in a real app, these would come from hooks too
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
  // Hooks for data management
  const { rules, loading: rulesLoading, createRule, updateRule, deleteRule, toggleRule } = useAutomationRules();
  const { schedules, loading: schedulesLoading, createSchedule, updateSchedule, deleteSchedule, toggleSchedule } = useIrrigationSchedules();
  const { history, loading: historyLoading, addHistoryEntry, clearHistory } = useAutomationHistory();

  // UI state
  const [activeTab, setActiveTab] = useState('rules');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [editingSchedule, setEditingSchedule] = useState<IrrigationSchedule | null>(null);
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: 'rule' | 'schedule'; name: string } | null>(null);

  // Filtering and search state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Bulk actions state
  const [selectedRules, setSelectedRules] = useState<Set<string>>(new Set());
  const [selectedSchedules, setSelectedSchedules] = useState<Set<string>>(new Set());

  // Schedule form state
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

  // Filter functions
  const filteredRules = rules.filter(rule => {
    const matchesSearch = rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         rule.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && rule.isActive) ||
                         (statusFilter === 'inactive' && !rule.isActive);
    const matchesType = typeFilter === 'all' || typeFilter === 'rules';
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && schedule.isActive) ||
                         (statusFilter === 'inactive' && !schedule.isActive);
    const matchesType = typeFilter === 'all' || typeFilter === 'schedules';
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const activeFiltersCount = [searchTerm, statusFilter !== 'all', typeFilter !== 'all'].filter(Boolean).length;

  // Event handlers
  const handleCreateRule = () => {
    setEditingRule(null);
    setDialogOpen(true);
  };

  const handleEditRule = (rule) => {
    setEditingRule(rule);
    setDialogOpen(true);
  };

  const handleSaveRule = async (rule) => {
    try {
      if (editingRule) {
        await updateRule(rule.id, rule);
        await addHistoryEntry({
          type: 'MANUAL',
          name: 'Rule Updated',
          description: `Rule "${rule.name}" was updated`,
          status: 'SUCCESS',
          zoneId: rule.zoneId,
          deviceId: rule.action.deviceId
        });
      } else {
        await createRule(rule);
        await addHistoryEntry({
          type: 'MANUAL',
          name: 'Rule Created',
          description: `New rule "${rule.name}" was created`,
          status: 'SUCCESS',
          zoneId: rule.zoneId,
          deviceId: rule.action.deviceId
        });
      }
      setDialogOpen(false);
    } catch (error) {
      console.error('Error saving rule:', error);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;

    try {
      if (itemToDelete.type === 'rule') {
        await deleteRule(itemToDelete.id);
        await addHistoryEntry({
          type: 'MANUAL',
          name: 'Rule Deleted',
          description: `Rule "${itemToDelete.name}" was deleted`,
          status: 'SUCCESS',
          zoneId: rules.find(r => r.id === itemToDelete.id)?.zoneId || '',
        });
      } else {
        await deleteSchedule(itemToDelete.id);
        await addHistoryEntry({
          type: 'MANUAL',
          name: 'Schedule Deleted',
          description: `Schedule "${itemToDelete.name}" was deleted`,
          status: 'SUCCESS',
          zoneId: schedules.find(s => s.id === itemToDelete.id)?.zoneId || '',
        });
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
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

  const handleSaveSchedule = async () => {
    if (!newSchedule.name || !newSchedule.zoneId || !newSchedule.deviceId || selectedDays.length === 0) {
      toast.error("Please fill in all required fields and select at least one day");
      return;
    }

    try {
      const scheduleData = {
        ...newSchedule,
        daysOfWeek: selectedDays
      } as Omit<IrrigationSchedule, 'id' | 'createdAt' | 'updatedAt'>;

      if (editingSchedule) {
        await updateSchedule(editingSchedule.id, scheduleData);
        await addHistoryEntry({
          type: 'MANUAL',
          name: 'Schedule Updated',
          description: `Schedule "${scheduleData.name}" was updated`,
          status: 'SUCCESS',
          zoneId: scheduleData.zoneId,
          deviceId: scheduleData.deviceId
        });
      } else {
        await createSchedule(scheduleData);
        await addHistoryEntry({
          type: 'MANUAL',
          name: 'Schedule Created',
          description: `New schedule "${scheduleData.name}" was created`,
          status: 'SUCCESS',
          zoneId: scheduleData.zoneId,
          deviceId: scheduleData.deviceId
        });
      }
      setScheduleDialogOpen(false);
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  // Bulk action handlers
  const handleBulkActivate = async () => {
    const ids = activeTab === 'rules' ? Array.from(selectedRules) : Array.from(selectedSchedules);
    const promises = ids.map(id => 
      activeTab === 'rules' ? 
        updateRule(id, { isActive: true }) : 
        updateSchedule(id, { isActive: true })
    );
    
    try {
      await Promise.all(promises);
      toast.success(`${ids.length} items activated`);
      setSelectedRules(new Set());
      setSelectedSchedules(new Set());
    } catch (error) {
      toast.error('Failed to activate some items');
    }
  };

  const handleBulkDeactivate = async () => {
    const ids = activeTab === 'rules' ? Array.from(selectedRules) : Array.from(selectedSchedules);
    const promises = ids.map(id => 
      activeTab === 'rules' ? 
        updateRule(id, { isActive: false }) : 
        updateSchedule(id, { isActive: false })
    );
    
    try {
      await Promise.all(promises);
      toast.success(`${ids.length} items deactivated`);
      setSelectedRules(new Set());
      setSelectedSchedules(new Set());
    } catch (error) {
      toast.error('Failed to deactivate some items');
    }
  };

  const handleBulkDelete = async () => {
    const ids = activeTab === 'rules' ? Array.from(selectedRules) : Array.from(selectedSchedules);
    const promises = ids.map(id => 
      activeTab === 'rules' ? 
        deleteRule(id) : 
        deleteSchedule(id)
    );
    
    try {
      await Promise.all(promises);
      toast.success(`${ids.length} items deleted`);
      setSelectedRules(new Set());
      setSelectedSchedules(new Set());
    } catch (error) {
      toast.error('Failed to delete some items');
    }
  };

  const handleBulkDuplicate = async () => {
    if (activeTab === 'rules') {
      const ids = Array.from(selectedRules);
      for (const id of ids) {
        const rule = rules.find(r => r.id === id);
        if (rule) {
          await createRule({
            ...rule,
            name: `${rule.name} (Copy)`,
            isActive: false
          });
        }
      }
      setSelectedRules(new Set());
      toast.success(`${ids.length} rules duplicated`);
    } else {
      const ids = Array.from(selectedSchedules);
      for (const id of ids) {
        const schedule = schedules.find(s => s.id === id);
        if (schedule) {
          await createSchedule({
            ...schedule,
            name: `${schedule.name} (Copy)`,
            isActive: false
          });
        }
      }
      setSelectedSchedules(new Set());
      toast.success(`${ids.length} schedules duplicated`);
    }
  };

  // Loading states
  if (rulesLoading && schedulesLoading && historyLoading) {
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
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200">Irrigation Automation</h1>
          <p className="text-muted-foreground">Manage your automated irrigation rules and schedules</p>
        </div>

        <AutomationFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          onClearFilters={() => {
            setSearchTerm('');
            setStatusFilter('all');
            setTypeFilter('all');
          }}
          activeFiltersCount={activeFiltersCount}
        />

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="rules">
              Rules ({filteredRules.length})
            </TabsTrigger>
            <TabsTrigger value="schedules">
              Schedules ({filteredSchedules.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              History ({history.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Automation Rules</h2>
              <Button onClick={handleCreateRule}>
                <Plus className="mr-2 h-4 w-4" /> Create Rule
              </Button>
            </div>

            <BulkActions
              selectedCount={selectedRules.size}
              onActivateSelected={handleBulkActivate}
              onDeactivateSelected={handleBulkDeactivate}
              onDeleteSelected={handleBulkDelete}
              onDuplicateSelected={handleBulkDuplicate}
              onClearSelection={() => setSelectedRules(new Set())}
            />

            {filteredRules.length === 0 ? (
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
                {filteredRules.map((rule) => (
                  <Card key={rule.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedRules.has(rule.id)}
                            onCheckedChange={(checked) => {
                              const newSelected = new Set(selectedRules);
                              if (checked) {
                                newSelected.add(rule.id);
                              } else {
                                newSelected.delete(rule.id);
                              }
                              setSelectedRules(newSelected);
                            }}
                          />
                          <div>
                            <CardTitle>{rule.name}</CardTitle>
                            <CardDescription>{rule.description}</CardDescription>
                          </div>
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
                          <Button size="sm" variant="outline" onClick={() => toggleRule(rule.id)}>
                            <Pause className="mr-1 h-3 w-3" /> Pause
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => toggleRule(rule.id)}>
                            <Play className="mr-1 h-3 w-3" /> Resume
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleEditRule(rule)}>
                          <ArrowUpRight className="mr-1 h-3 w-3" /> Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-500 hover:bg-red-50" 
                          onClick={() => {
                            setItemToDelete({ id: rule.id, type: 'rule', name: rule.name });
                            setDeleteDialogOpen(true);
                          }}
                        >
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

            <BulkActions
              selectedCount={selectedSchedules.size}
              onActivateSelected={handleBulkActivate}
              onDeactivateSelected={handleBulkDeactivate}
              onDeleteSelected={handleBulkDelete}
              onDuplicateSelected={handleBulkDuplicate}
              onClearSelection={() => setSelectedSchedules(new Set())}
            />

            {filteredSchedules.length === 0 ? (
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
                {filteredSchedules.map((schedule) => (
                  <Card key={schedule.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={selectedSchedules.has(schedule.id)}
                            onCheckedChange={(checked) => {
                              const newSelected = new Set(selectedSchedules);
                              if (checked) {
                                newSelected.add(schedule.id);
                              } else {
                                newSelected.delete(schedule.id);
                              }
                              setSelectedSchedules(newSelected);
                            }}
                          />
                          <div>
                            <CardTitle>{schedule.name}</CardTitle>
                            <CardDescription>{schedule.description}</CardDescription>
                          </div>
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
                          <Button size="sm" variant="outline" onClick={() => toggleSchedule(schedule.id)}>
                            <Pause className="mr-1 h-3 w-3" /> Pause
                          </Button>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => toggleSchedule(schedule.id)}>
                            <Play className="mr-1 h-3 w-3" /> Resume
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => handleEditSchedule(schedule)}>
                          <ArrowUpRight className="mr-1 h-3 w-3" /> Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-red-500 hover:bg-red-50" 
                          onClick={() => {
                            setItemToDelete({ id: schedule.id, type: 'schedule', name: schedule.name });
                            setDeleteDialogOpen(true);
                          }}
                        >
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
              <Button variant="outline" onClick={clearHistory}>
                <History className="mr-2 h-4 w-4" /> Clear History
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
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input 
                  id="description" 
                  placeholder="Brief description of this schedule"
                  value={newSchedule.description}
                  onChange={(e) => setNewSchedule(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zone">Zone</Label>
                  <Select 
                    value={newSchedule.zoneId} 
                    onValueChange={(value) => setNewSchedule(prev => ({ ...prev, zoneId: value }))}
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
                    onValueChange={(value) => setNewSchedule(prev => ({ ...prev, deviceId: value }))}
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
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, startTime: e.target.value }))}
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
                    onChange={(e) => setNewSchedule(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
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
                      onClick={() => {
                        setSelectedDays(prev => 
                          prev.includes(day.value) 
                            ? prev.filter(d => d !== day.value) 
                            : [...prev, day.value].sort((a, b) => a - b)
                        );
                      }}
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
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{itemToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default AutomationPage;
