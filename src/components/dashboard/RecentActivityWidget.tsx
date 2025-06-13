
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  Play, 
  Pause, 
  Settings, 
  User, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AutomationHistory } from '@/hooks/useAutomationHistory';

interface RecentActivityWidgetProps {
  activities: AutomationHistory[];
  className?: string;
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'RULE_TRIGGER':
      return <Settings className="h-4 w-4" />;
    case 'SCHEDULE':
      return <Clock className="h-4 w-4" />;
    case 'MANUAL':
      return <User className="h-4 w-4" />;
    default:
      return <Activity className="h-4 w-4" />;
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'SUCCESS':
      return <CheckCircle className="h-3 w-3 text-green-500" />;
    case 'FAILURE':
      return <XCircle className="h-3 w-3 text-red-500" />;
    case 'PENDING':
      return <AlertTriangle className="h-3 w-3 text-yellow-500" />;
    default:
      return <Clock className="h-3 w-3 text-gray-500" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'SUCCESS':
      return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300';
    case 'FAILURE':
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300';
    case 'PENDING':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'RULE_TRIGGER':
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300';
    case 'SCHEDULE':
      return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300';
    case 'MANUAL':
      return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300';
  }
};

const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({ 
  activities, 
  className 
}) => {
  const { t } = useTranslation('dashboard');
  const recentActivities = activities.slice(0, 5);

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950">
                <Activity className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              {t('widgets.recentActivity.title')}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {t('widgets.recentActivity.latestSystemActions')}
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            {t('widgets.recentActivity.viewHistory')}
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity) => (
              <div 
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border/50 transition-all duration-200 hover:border-border cursor-pointer group"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div className={cn(
                    "p-1.5 rounded-md border",
                    getTypeColor(activity.type)
                  )}>
                    {getActivityIcon(activity.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground leading-tight">
                        {activity.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {activity.description}
                      </p>
                      {activity.details && (
                        <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-1">
                          {activity.details}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-2 flex-shrink-0">
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs font-medium", getStatusColor(activity.status))}
                      >
                        <span className="flex items-center gap-1">
                          {getStatusIcon(activity.status)}
                          {activity.status}
                        </span>
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="p-3 rounded-full bg-muted/50 mb-3">
                <Activity className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">
                {t('widgets.recentActivity.noActivity')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('widgets.recentActivity.startUsingSystem')}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivityWidget;
