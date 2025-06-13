
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Settings, 
  Droplet, 
  Clock, 
  Zap,
  RefreshCw,
  Plus,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/sonner';

interface QuickAction {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  type: 'irrigation' | 'schedule' | 'device' | 'automation';
  isActive?: boolean;
  estimatedDuration?: string;
  zones?: string[];
  action: () => void;
}

interface QuickAutomationPanelProps {
  className?: string;
}

const QuickAutomationPanel: React.FC<QuickAutomationPanelProps> = ({ className }) => {
  const { t } = useTranslation('dashboard');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const executeAction = async (actionId: string, actionFn: () => void) => {
    setLoadingAction(actionId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      actionFn();
      toast.success(t('widgets.quickActions.actionCompleted'));
    } catch (error) {
      toast.error(t('widgets.quickActions.failedToExecute'));
    } finally {
      setLoadingAction(null);
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: '1',
      name: t('widgets.quickActions.startEmergencyIrrigation'),
      description: t('widgets.quickActions.waterAllZones'),
      icon: <Droplet className="h-4 w-4" />,
      type: 'irrigation',
      estimatedDuration: '10 min',
      zones: ['Zone 1', 'Zone 2', 'Zone 3'],
      action: () => console.log('Starting emergency irrigation')
    },
    {
      id: '2',
      name: t('widgets.quickActions.morningSchedule'),
      description: t('widgets.quickActions.startDailyMorning'),
      icon: <Clock className="h-4 w-4" />,
      type: 'schedule',
      isActive: true,
      estimatedDuration: '45 min',
      action: () => console.log('Starting morning schedule')
    },
    {
      id: '3',
      name: t('widgets.quickActions.refreshAllSensors'),
      description: t('widgets.quickActions.updateAllDevices'),
      icon: <RefreshCw className="h-4 w-4" />,
      type: 'device',
      estimatedDuration: '2 min',
      action: () => console.log('Refreshing sensors')
    },
    {
      id: '4',
      name: t('widgets.quickActions.energySavingMode'),
      description: t('widgets.quickActions.optimizePower'),
      icon: <Zap className="h-4 w-4" />,
      type: 'automation',
      estimatedDuration: t('widgets.quickActions.ongoing'),
      action: () => console.log('Activating energy saving')
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'irrigation': 
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300';
      case 'schedule': 
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300';
      case 'device': 
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300';
      case 'automation': 
        return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300';
      default: 
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300';
    }
  };

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950">
                <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>
              {t('widgets.quickActions.title')}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {t('widgets.quickActions.commonAutomationTasks')}
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <Plus className="h-3 w-3 mr-1" />
            {t('widgets.quickActions.create')}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {quickActions.map((action) => (
            <div 
              key={action.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border/50 transition-all duration-200 hover:border-border group"
            >
              <div className="flex-shrink-0">
                <div className={cn("p-2 rounded-md border", getTypeColor(action.type))}>
                  {action.icon}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                      {action.name}
                      {action.isActive && (
                        <Badge variant="secondary" className="text-xs font-medium">
                          {t('widgets.quickActions.active')}
                        </Badge>
                      )}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {action.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {action.estimatedDuration}
                      </span>
                      {action.zones && (
                        <span className="flex items-center gap-1">
                          <Settings className="h-3 w-3" />
                          {action.zones.length} {t('widgets.quickActions.zones')}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant={action.isActive ? "secondary" : "default"}
                    size="sm" 
                    className="ml-3 flex-shrink-0"
                    disabled={loadingAction === action.id}
                    onClick={() => executeAction(action.id, action.action)}
                  >
                    {loadingAction === action.id ? (
                      <RefreshCw className="h-3 w-3 animate-spin" />
                    ) : action.isActive ? (
                      <Pause className="h-3 w-3" />
                    ) : (
                      <Play className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickAutomationPanel;
