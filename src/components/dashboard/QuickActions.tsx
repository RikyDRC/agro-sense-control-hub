
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Droplet, 
  Power, 
  Eye, 
  Shield, 
  Bell, 
  MapPin, 
  Clock,
  Play,
  Pause,
  X,
  Zap
} from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const QuickActions: React.FC = () => {
  const handleAction = (action: string) => {
    toast.success(`${action} command sent successfully`);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center">
          <Zap className="h-5 w-5 mr-2 text-agro-green" /> Quick Actions
        </CardTitle>
        <CardDescription>
          Control your irrigation system and devices
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Irrigation Control</h3>
            <div className="grid grid-cols-2 gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start"
                onClick={() => handleAction('Start All Irrigation')}
              >
                <Play className="h-4 w-4 mr-2 text-green-500" /> 
                Start All
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start"
                onClick={() => handleAction('Pause All Irrigation')}
              >
                <Pause className="h-4 w-4 mr-2 text-amber-500" /> 
                Pause All
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start"
                onClick={() => handleAction('Emergency Stop')}
              >
                <X className="h-4 w-4 mr-2 text-red-500" /> 
                Emergency Stop
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="justify-start"
                onClick={() => handleAction('Schedule Check')}
              >
                <Clock className="h-4 w-4 mr-2 text-blue-500" /> 
                Check Schedule
              </Button>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium mb-2">Zone Control</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-indigo-500" />
                  <span>Field Zone A</span>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 px-2"
                    onClick={() => handleAction('Activate Zone A')}
                  >
                    <Play className="h-3.5 w-3.5 text-green-500" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 px-2"
                    onClick={() => handleAction('Deactivate Zone A')}
                  >
                    <Pause className="h-3.5 w-3.5 text-amber-500" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-indigo-500" />
                  <span>Field Zone B</span>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 px-2"
                    onClick={() => handleAction('Activate Zone B')}
                  >
                    <Play className="h-3.5 w-3.5 text-green-500" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 px-2"
                    onClick={() => handleAction('Deactivate Zone B')}
                  >
                    <Pause className="h-3.5 w-3.5 text-amber-500" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium mb-2">System Status</h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <div className="flex items-center">
                <Droplet className="h-4 w-4 mr-2 text-blue-500" />
                <span>Water Supply</span>
              </div>
              <Badge variant="outline" className="justify-self-end">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span> Normal
              </Badge>
              
              <div className="flex items-center">
                <Power className="h-4 w-4 mr-2 text-yellow-500" />
                <span>Power System</span>
              </div>
              <Badge variant="outline" className="justify-self-end">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span> Online
              </Badge>
              
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-2 text-purple-500" />
                <span>Sensor Network</span>
              </div>
              <Badge variant="outline" className="justify-self-end">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span> Active
              </Badge>
              
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-2 text-green-500" />
                <span>Security</span>
              </div>
              <Badge variant="outline" className="justify-self-end">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span> Secure
              </Badge>
              
              <div className="flex items-center">
                <Bell className="h-4 w-4 mr-2 text-red-500" />
                <span>Alerts</span>
              </div>
              <Badge variant="outline" className="justify-self-end">
                <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span> None
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
