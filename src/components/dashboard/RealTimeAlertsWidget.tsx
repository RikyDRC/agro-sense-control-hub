
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, AlertTriangle, CheckCircle, XCircle, Clock, Bell, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAlerts } from '@/hooks/useAlerts';
import { toast } from '@/components/ui/use-toast';

interface RealTimeAlertsWidgetProps {
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
      return 'bg-red-100 text-red-800 border-red-200';
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'low':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const RealTimeAlertsWidget: React.FC<RealTimeAlertsWidgetProps> = ({ className }) => {
  const { alerts, loading, markAsRead } = useAlerts();
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  
  const unreadCount = alerts.filter(alert => !alert.isRead && !dismissedAlerts.has(alert.id)).length;
  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id)).slice(0, 3);

  // Show toast notifications for new alerts
  useEffect(() => {
    const criticalAlerts = alerts.filter(alert => 
      alert.severity === 'critical' && 
      !alert.isRead && 
      !dismissedAlerts.has(alert.id)
    );

    criticalAlerts.forEach(alert => {
      toast({
        title: `Critical Alert: ${alert.title}`,
        description: alert.message,
        variant: "destructive",
      });
    });
  }, [alerts, dismissedAlerts]);

  const handleDismissAlert = (alertId: string) => {
    setDismissedAlerts(prev => new Set([...prev, alertId]));
    markAsRead(alertId);
  };

  if (loading) {
    return (
      <Card className={cn("shadow-sm", className)}>
        <CardHeader>
          <CardTitle>Loading alerts...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={cn("shadow-sm hover:shadow-md transition-shadow duration-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-red-500" />
              Real-time Alerts
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Live system alerts and notifications
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {visibleAlerts.length > 0 ? (
            visibleAlerts.map((alert) => (
              <div 
                key={alert.id}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border transition-colors hover:bg-muted/50",
                  !alert.isRead && "bg-muted/30"
                )}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getSeverityIcon(alert.severity)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-foreground">
                        {alert.title}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {alert.message}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", getSeverityColor(alert.severity))}
                      >
                        {alert.severity}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDismissAlert(alert.id)}
                        className="h-6 w-6 p-0"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center mt-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(alert.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
              <p className="text-muted-foreground">No active alerts</p>
              <p className="text-sm text-muted-foreground/70">Your system is running smoothly</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RealTimeAlertsWidget;
