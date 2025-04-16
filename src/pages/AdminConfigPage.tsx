
import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Save, RotateCw, Database, MapPin, CloudSun, CreditCard, Users } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ConfigItem {
  id: string;
  key: string;
  value: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  role: string;
  created_at: string;
}

const AdminConfigPage: React.FC = () => {
  const { profile } = useAuth();
  const [configItems, setConfigItems] = useState<ConfigItem[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    fetchConfigItems();
    fetchUsers();
  }, []);

  const fetchConfigItems = async () => {
    try {
      const { data, error } = await supabase
        .from('platform_config')
        .select('*')
        .order('key');

      if (error) throw error;
      setConfigItems(data || []);
    } catch (error) {
      console.error('Error fetching config items:', error);
      toast.error('Failed to load configuration items');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .order('email');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const handleConfigChange = (id: string, value: string) => {
    setConfigItems(configItems.map(item => 
      item.id === id ? { ...item, value } : item
    ));
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const updates = configItems.map(({ id, value }) => ({
        id,
        value,
        updated_at: new Date().toISOString()
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('platform_config')
          .update({ value: update.value, updated_at: update.updated_at })
          .eq('id', update.id);

        if (error) throw error;
      }

      toast.success('Configuration updated successfully');
    } catch (error) {
      console.error('Error updating configuration:', error);
      toast.error('Failed to update configuration');
    } finally {
      setSaving(false);
    }
  };

  const updateUserRole = async (userId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role })
        .eq('id', userId);

      if (error) throw error;
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role } : user
      ));
      
      toast.success('User role updated successfully');
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const toggleShowSecret = (id: string) => {
    setShowSecrets({
      ...showSecrets,
      [id]: !showSecrets[id]
    });
  };

  if (!profile) {
    return <Navigate to="/auth" />;
  }

  if (profile.role !== 'super_admin') {
    return <Navigate to="/settings" />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Platform Administration</h1>
          <p className="text-muted-foreground">
            Manage system configuration and user roles
          </p>
        </div>

        <Tabs defaultValue="apikeys" className="space-y-4">
          <TabsList>
            <TabsTrigger value="apikeys">API Keys & Integration</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
          </TabsList>

          <TabsContent value="apikeys">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" /> System Configuration
                </CardTitle>
                <CardDescription>
                  Manage API keys and system integration settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  {configItems
                    .filter(item => item.key.includes('_api_key'))
                    .map(item => (
                      <div key={item.id} className="space-y-2">
                        <div className="flex items-center">
                          {item.key.includes('google_maps') && <MapPin className="h-4 w-4 mr-2" />}
                          {item.key.includes('weather') && <CloudSun className="h-4 w-4 mr-2" />}
                          {item.key.includes('stripe') && <CreditCard className="h-4 w-4 mr-2" />}
                          <Label htmlFor={item.id}>{item.key.replace(/_/g, ' ').toUpperCase()}</Label>
                        </div>
                        <div className="flex">
                          <Input
                            id={item.id}
                            type={showSecrets[item.id] ? 'text' : 'password'}
                            value={item.value}
                            onChange={e => handleConfigChange(item.id, e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => toggleShowSecret(item.id)}
                            className="ml-2"
                          >
                            {showSecrets[item.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                        )}
                      </div>
                    ))}
                </div>

                <Separator />

                <div className="space-y-4">
                  {configItems
                    .filter(item => !item.key.includes('_api_key'))
                    .map(item => (
                      <div key={item.id} className="space-y-2">
                        <Label htmlFor={`other-${item.id}`}>{item.key.replace(/_/g, ' ').toUpperCase()}</Label>
                        <Input
                          id={`other-${item.id}`}
                          value={item.value}
                          onChange={e => handleConfigChange(item.id, e.target.value)}
                        />
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                        )}
                      </div>
                    ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  onClick={fetchConfigItems} 
                  variant="outline" 
                  className="mr-2"
                  disabled={saving}
                >
                  <RotateCw className="mr-2 h-4 w-4" /> Refresh
                </Button>
                <Button onClick={saveConfig} disabled={saving}>
                  {saving ? (
                    <>
                      <RotateCw className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" /> User Management
                </CardTitle>
                <CardDescription>
                  Manage user roles and permissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Display Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map(user => (
                      <TableRow key={user.id}>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.display_name || '-'}</TableCell>
                        <TableCell>
                          <span className="capitalize">{user.role.replace('_', ' ')}</span>
                        </TableCell>
                        <TableCell>
                          <select
                            className="border rounded px-2 py-1"
                            value={user.role}
                            onChange={e => updateUserRole(user.id, e.target.value)}
                            disabled={user.id === profile.id} // Can't change own role
                          >
                            <option value="super_admin">Super Admin</option>
                            <option value="admin">Admin</option>
                            <option value="farmer">Farmer</option>
                          </select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button onClick={fetchUsers} variant="outline">
                  <RotateCw className="mr-2 h-4 w-4" /> Refresh
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AdminConfigPage;
