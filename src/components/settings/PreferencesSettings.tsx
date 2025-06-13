
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Globe, Save, Database } from 'lucide-react';
import { UserSettings } from '@/services/settingsService';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface PreferencesSettingsProps {
  settings: UserSettings;
  onSettingsChange: (settings: UserSettings) => void;
  onSave: () => void;
  saving: boolean;
}

const PreferencesSettings: React.FC<PreferencesSettingsProps> = ({
  settings,
  onSettingsChange,
  onSave,
  saving
}) => {
  const updatePreferenceSetting = (key: keyof UserSettings['preferences'], value: any) => {
    onSettingsChange({
      ...settings,
      preferences: {
        ...settings.preferences,
        [key]: value,
      },
    });
  };

  const updateDataManagementSetting = (key: keyof UserSettings['dataManagement'], value: any) => {
    onSettingsChange({
      ...settings,
      dataManagement: {
        ...settings.dataManagement,
        [key]: value,
      },
    });
  };

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" /> Regional Settings
          </CardTitle>
          <CardDescription>
            Configure regional preferences for your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="measurementUnit">Measurement Units</Label>
              <Select 
                value={settings.preferences.measurementUnit} 
                onValueChange={(value: 'metric' | 'imperial') => updatePreferenceSetting('measurementUnit', value)}
              >
                <SelectTrigger id="measurementUnit">
                  <SelectValue placeholder="Select unit system" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="metric">Metric (°C, mm, km)</SelectItem>
                  <SelectItem value="imperial">Imperial (°F, in, mi)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeZone">Time Zone</Label>
              <Select 
                value={settings.preferences.timeZone} 
                onValueChange={(value) => updatePreferenceSetting('timeZone', value)}
              >
                <SelectTrigger id="timeZone">
                  <SelectValue placeholder="Select time zone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                  <SelectItem value="Europe/London">GMT/UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-sm font-medium">App Settings</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dark-mode">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable dark theme for the application
                </p>
              </div>
              <Switch 
                id="dark-mode" 
                checked={settings.preferences.darkMode}
                onCheckedChange={(checked) => updatePreferenceSetting('darkMode', checked)}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={onSave} disabled={saving}>
            {saving ? 'Saving...' : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" /> Data Management
          </CardTitle>
          <CardDescription>
            Configure how your data is stored and managed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="dataRetention">Data Retention Period (days)</Label>
            <div className="grid grid-cols-4 gap-4 items-center">
              <Input 
                id="dataRetention" 
                type="number" 
                value={settings.dataManagement.retentionPeriod}
                onChange={(e) => updateDataManagementSetting('retentionPeriod', parseInt(e.target.value) || 90)}
                min="30"
                max="365"
                className="col-span-3"
              />
              <Badge>{settings.dataManagement.retentionPeriod} days</Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Sensor data older than this will be automatically archived
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={onSave} disabled={saving}>
            {saving ? 'Saving...' : (
              <>
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PreferencesSettings;
