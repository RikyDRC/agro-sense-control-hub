
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
  AlertTriangle
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
      return 'bg-green-100 text-green-800 border-green-200';
    case 'FAILURE':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'RULE_TRIGGER':
      return 'bg-blue-100 text-blue-800';
    case 'SCHEDULE':
      return 'bg-purple-100 text-purple-800';
    case 'MANUAL':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({ 
  activities, 
  className 
}) => {
  const { t } = useTranslation('dashboard');
  const recentActivities = activities.slice(0, 8);

  return (
    <Card className={cn("dashboard-card", className)}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-500" />
              {t('widgets.recentActivity.title')}
            </CardTitle>
            <CardDescription>
              {t('widgets.recentActivity.latestSystemActions')}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            {t('widgets.recentActivity.viewHistory')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity) => (
              <div 
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-border/60 hover:bg-muted/50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <div className={cn(
                    "p-1.5 rounded-md",
                    getTypeColor(activity.type)
                  )}>
                    {getActivityIcon(activity.type)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-foreground">
                        {activity.name}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {activity.description}
                      </p>
                      {activity.details && (
                        <p className="text-xs text-muted-foreground/80 mt-1">
                          {activity.details}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 ml-2">
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", getStatusColor(activity.status))}
                      >
                        <span className="flex items-center gap-1">
                          {getStatusIcon(activity.status)}
                          {activity.status}
                        </span>
                      </Badge>
                      <Badge 
                        variant="secondary" 
                        className="text-xs"
                      >
                        {activity.type.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(activity.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Activity className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">{t('widgets.recentActivity.noRecentActivity')}</p>
              <p className="text-sm text-muted-foreground/70">{t('widgets.recentActivity.startUsingSystem')}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivityWidget;
