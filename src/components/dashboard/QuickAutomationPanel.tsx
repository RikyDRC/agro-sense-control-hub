
import React, { useState } from 'react';
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
  Calendar
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
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const executeAction = async (actionId: string, actionFn: () => void) => {
    setLoadingAction(actionId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      actionFn();
      toast.success('Action completed successfully');
    } catch (error) {
      toast.error('Failed to execute action');
    } finally {
      setLoadingAction(null);
    }
  };

  const quickActions: QuickAction[] = [
    {
      id: '1',
      name: 'Start Emergency Irrigation',
      description: 'Water all zones for 10 minutes',
      icon: <Droplet className="h-4 w-4" />,
      type: 'irrigation',
      estimatedDuration: '10 min',
      zones: ['Zone 1', 'Zone 2', 'Zone 3'],
      action: () => console.log('Starting emergency irrigation')
    },
    {
      id: '2',
      name: 'Morning Schedule',
      description: 'Start daily morning routine',
      icon: <Clock className="h-4 w-4" />,
      type: 'schedule',
      isActive: true,
      estimatedDuration: '45 min',
      action: () => console.log('Starting morning schedule')
    },
    {
      id: '3',
      name: 'Refresh All Sensors',
      description: 'Update all device readings',
      icon: <RefreshCw className="h-4 w-4" />,
      type: 'device',
      estimatedDuration: '2 min',
      action: () => console.log('Refreshing sensors')
    },
    {
      id: '4',
      name: 'Energy Saving Mode',
      description: 'Optimize power consumption',
      icon: <Zap className="h-4 w-4" />,
      type: 'automation',
      estimatedDuration: 'Ongoing',
      action: () => console.log('Activating energy saving')
    },
    {
      id: '5',
      name: 'Weekend Schedule',
      description: 'Activate weekend irrigation plan',
      icon: <Calendar className="h-4 w-4" />,
      type: 'schedule',
      estimatedDuration: '2 days',
      action: () => console.log('Setting weekend schedule')
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'irrigation': return 'bg-blue-100 text-blue-800';
      case 'schedule': return 'bg-purple-100 text-purple-800';
      case 'device': return 'bg-green-100 text-green-800';
      case 'automation': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={cn("shadow-sm hover:shadow-md transition-shadow duration-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Common automation tasks and schedules
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Create
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {quickActions.map((action) => (
            <div 
              key={action.id}
              className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex-shrink-0">
                <div className={cn("p-2 rounded-md", getTypeColor(action.type))}>
                  {action.icon}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                      {action.name}
                      {action.isActive && (
                        <Badge variant="secondary" className="text-xs">
                          Active
                        </Badge>
                      )}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {action.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        ⏱️ {action.estimatedDuration}
                      </span>
                      {action.zones && (
                        <span className="text-xs text-muted-foreground">
                          📍 {action.zones.length} zones
                        </span>
                      )}
                    </div>
                  </div>
                  <Button 
                    variant={action.isActive ? "secondary" : "default"}
                    size="sm" 
                    className="ml-2"
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
