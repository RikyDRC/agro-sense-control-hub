
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, CheckCircle, XCircle, Clock, Bell, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AlertItem {
  id: string;
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  isRead: boolean;
  deviceId?: string;
  zoneId?: string;
}

interface AlertsWidgetProps {
  alerts: AlertItem[];
  className?: string;
}

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case 'critical':
      return <XCircle className="h-4 w-4 text-red-500" />;
    case 'high':
      return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    case 'medium':
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    case 'low':
      return <CheckCircle className="h-4 w-4 text-blue-500" />;
    default:
      return <Bell className="h-4 w-4 text-gray-500" />;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300';
    case 'high':
      return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300';
    case 'medium':
      return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-300';
    case 'low':
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-300';
  }
};

const AlertsWidget: React.FC<AlertsWidgetProps> = ({ alerts, className }) => {
  const { t } = useTranslation('dashboard');
  const unreadCount = alerts.filter(alert => !alert.isRead).length;
  const recentAlerts = alerts.slice(0, 5);

  return (
    <Card className={cn("h-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <div className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950">
                <Bell className="h-4 w-4 text-red-600 dark:text-red-400" />
              </div>
              {t('widgets.alerts.recentAlerts')}
              {unreadCount > 0 && (
                <Badge variant="destructive" className="h-5 px-1.5 text-xs font-medium">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {t('widgets.alerts.systemAlertsNotifications')}
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            {t('widgets.alerts.viewAllAlerts')}
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {recentAlerts.length > 0 ? (
            recentAlerts.map((alert) => (
              <div 
                key={alert.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border border-border/50 transition-all duration-200 hover:border-border cursor-pointer group",
                  !alert.isRead && "bg-muted/30 border-primary/20"
                )}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getSeverityIcon(alert.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-foreground leading-tight">
                        {alert.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {alert.message}
                      </p>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs font-medium flex-shrink-0", getSeverityColor(alert.severity))}
                    >
                      {alert.severity}
                    </Badge>
                  </div>
                  <div className="flex items-center mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                    <span className="truncate">
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="p-3 rounded-full bg-green-50 dark:bg-green-950 mb-3">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-sm font-medium text-foreground mb-1">{t('widgets.alerts.noRecentAlerts')}</p>
              <p className="text-xs text-muted-foreground">{t('widgets.alerts.systemRunningSmooth')}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AlertsWidget;
