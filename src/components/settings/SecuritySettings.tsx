
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Lock, ShieldCheck } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const SecuritySettings: React.FC = () => {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setChangingPassword(true);
    try {
      // TODO: Implement password change logic with Supabase
      toast.success('Password changed successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    // TODO: Implement logout logic
    toast.success('Logged out successfully');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" /> Security Settings
        </CardTitle>
        <CardDescription>
          Manage account security and authentication options
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input 
                id="current-password" 
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input 
                id="new-password" 
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input 
                id="confirm-password" 
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
              />
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Password must be at least 8 characters and include uppercase, lowercase, number, and special character
          </p>
          
          <Button 
            size="sm" 
            className="mt-2"
            onClick={handlePasswordChange}
            disabled={changingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
          >
            {changingPassword ? 'Changing...' : 'Change Password'}
          </Button>
        </div>
        
        <Separator />
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="two-factor">Two-Factor Authentication</Label>
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security to your account
            </p>
          </div>
          <Switch 
            id="two-factor" 
            checked={false}
            disabled
          />
        </div>
        
        <Alert>
          <ShieldCheck className="h-4 w-4" />
          <AlertTitle>Enhance Your Security</AlertTitle>
          <AlertDescription>
            We strongly recommend enabling two-factor authentication for additional account protection.
          </AlertDescription>
        </Alert>
        
        <Separator />
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Active Sessions</h3>
          <div className="rounded-md border p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium">Current Session</p>
                <p className="text-xs text-muted-foreground">Started: {new Date().toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">IP: 192.168.1.1</p>
              </div>
              <Badge>Active</Badge>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm">Log Out All Other Devices</Button>
            <Button variant="destructive" size="sm" onClick={handleLogout}>Log Out</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SecuritySettings;
