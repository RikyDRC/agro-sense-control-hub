import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, EyeOff, Save, RotateCw, Database, MapPin, CloudSun, CreditCard, Users, KeyRound, Loader2, PlusCircle, ShieldCheck } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserRole } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import GoogleMapsApiKey from '@/components/settings/GoogleMapsApiKey';

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
  role: UserRole;
  created_at: string;
}

const AdminConfigPage: React.FC = () => {
  const [configItems, setConfigItems] = useState<ConfigItem[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [newConfigItem, setNewConfigItem] = useState({
    key: '',
    value: '',
    description: ''
  });
  const [isAddingConfig, setIsAddingConfig] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isAccessChecked, setIsAccessChecked] = useState(false);
  
  useEffect(() => {
    const checkSuperAdmin = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase.rpc('is_super_admin');
        
        if (error) {
          console.error('Error checking super admin status:', error);
          setFetchError(error.message);
          toast.error('Failed to verify permissions: ' + error.message);
          return;
        }
        
        setIsSuperAdmin(data || false);
        
        if (data) {
          fetchConfigItems();
          fetchUsers();
        }
      } catch (error: any) {
        console.error('Error in checkSuperAdmin:', error);
        setFetchError(error.message);
        toast.error('Failed to verify permissions: ' + error.message);
      } finally {
        setLoading(false);
        setIsAccessChecked(true);
      }
    };
    
    checkSuperAdmin();
  }, []);

  const fetchConfigItems = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      
      const { data, error } = await supabase
        .from('platform_config')
        .select('*')
        .order('key');

      if (error) {
        console.error('Error fetching config items:', error);
        setFetchError(error.message);
        toast.error('Failed to load configuration items: ' + error.message);
        return;
      }
      
      console.log('Config items loaded:', data);
      setConfigItems(data || []);
    } catch (error: any) {
      console.error('Error in fetchConfigItems:', error);
      setFetchError(error.message);
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

      if (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users: ' + error.message);
        return;
      }
      
      console.log('Users loaded:', data);
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error in fetchUsers:', error);
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
    } catch (error: any) {
      console.error('Error updating configuration:', error);
      toast.error('Failed to update configuration: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const addNewConfigItem = async () => {
    if (!newConfigItem.key || !newConfigItem.value) {
      toast.error('Key and value are required');
      return;
    }

    try {
      setSaving(true);
      const { data, error } = await supabase
        .from('platform_config')
        .insert({
          key: newConfigItem.key,
          value: newConfigItem.value,
          description: newConfigItem.description || null,
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single();

      if (error) {
        console.error('Error adding config item:', error);
        toast.error('Failed to add configuration item: ' + error.message);
        return;
      }

      setConfigItems([...configItems, data]);
      setNewConfigItem({ key: '', value: '', description: '' });
      setIsAddingConfig(false);
      toast.success('Configuration item added successfully');
    } catch (error: any) {
      console.error('Error in addNewConfigItem:', error);
      toast.error('Failed to add configuration item');
    } finally {
      setSaving(false);
    }
  };

  const handleUserRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId);
      
      if (error) {
        toast.error('Failed to update user role: ' + error.message);
        return;
      }
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      toast.success(`User role updated to ${newRole}`);
    } catch (error: any) {
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

  if (isAccessChecked && !isSuperAdmin) {
    return (
      <DashboardLayout>
        <div className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-red-500" /> Access Denied
              </CardTitle>
              <CardDescription>
                You don't have permission to access this page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertDescription>
                  This area is restricted to super administrators only. Please contact your system administrator if you need access.
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter>
              <Button onClick={() => window.history.back()}>Go Back</Button>
            </CardFooter>
          </Card>
        </div>
      </DashboardLayout>
    );
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
            <div className="space-y-4">
              <GoogleMapsApiKey />
              
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
                  {loading ? (
                    <div className="flex justify-center items-center h-24">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : fetchError ? (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>
                        Error loading configuration: {fetchError}
                        <div className="mt-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={fetchConfigItems}
                          >
                            <RotateCw className="mr-2 h-4 w-4" /> Try Again
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ) : configItems.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-muted-foreground">No configuration items found</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setIsAddingConfig(true)}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" /> 
                        Add Configuration Item
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {configItems
                          .filter(item => item.key !== 'google_maps_api_key' && item.key.includes('_api_key'))
                          .map(item => (
                            <div key={item.id} className="space-y-2">
                              <div className="flex items-center">
                                {item.key.includes('weather') && <CloudSun className="h-4 w-4 mr-2" />}
                                {item.key.includes('stripe') && <CreditCard className="h-4 w-4 mr-2" />}
                                {!item.key.includes('weather') && !item.key.includes('stripe') && (
                                  <KeyRound className="h-4 w-4 mr-2" />
                                )}
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

                      {configItems.some(item => !item.key.includes('_api_key') || (configItems.filter(item => !item.key.includes('google_maps') && item.key.includes('_api_key')).length > 0 && configItems.some(item => !item.key.includes('_api_key')))) && (
                        <Separator />
                      )}

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

                      <Button 
                        variant="outline" 
                        className="w-full"
                        onClick={() => setIsAddingConfig(true)}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" /> 
                        Add Configuration Item
                      </Button>
                    </>
                  )}

                  {isAddingConfig && (
                    <div className="border rounded-lg p-4 space-y-4 mt-4">
                      <h3 className="font-medium">Add New Configuration Item</h3>
                      <div className="space-y-2">
                        <Label htmlFor="new-key">Key</Label>
                        <Input
                          id="new-key"
                          value={newConfigItem.key}
                          onChange={e => setNewConfigItem({...newConfigItem, key: e.target.value})}
                          placeholder="e.g., stripe_api_key"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-value">Value</Label>
                        <Input
                          id="new-value"
                          value={newConfigItem.value}
                          onChange={e => setNewConfigItem({...newConfigItem, value: e.target.value})}
                          placeholder="Enter value"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-description">Description (Optional)</Label>
                        <Input
                          id="new-description"
                          value={newConfigItem.description}
                          onChange={e => setNewConfigItem({...newConfigItem, description: e.target.value})}
                          placeholder="Brief description of this configuration"
                        />
                      </div>
                      <div className="flex justify-end space-x-2 pt-2">
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setIsAddingConfig(false);
                            setNewConfigItem({key: '', value: '', description: ''});
                          }}
                        >
                          Cancel
                        </Button>
                        <Button onClick={addNewConfigItem} disabled={saving}>
                          {saving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                            </>
                          ) : (
                            <>Add Item</>
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    onClick={fetchConfigItems} 
                    variant="outline" 
                    className="mr-2"
                    disabled={saving || loading}
                  >
                    <RotateCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                  </Button>
                  <Button onClick={saveConfig} disabled={saving || loading || configItems.length === 0}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" /> Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </div>
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
                {loading ? (
                  <div className="flex justify-center items-center h-24">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No users found</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={fetchUsers}
                    >
                      <RotateCw className="mr-2 h-4 w-4" /> Refresh
                    </Button>
                  </div>
                ) : (
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
                            <span className={`capitalize inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              user.role === 'super_admin' ? 'bg-red-100 text-red-800' : 
                              user.role === 'admin' ? 'bg-blue-100 text-blue-800' : 
                              'bg-green-100 text-green-800'
                            }`}>
                              {user.role.replace('_', ' ')}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={user.role}
                              onValueChange={(value) => handleUserRoleChange(user.id, value as UserRole)}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select role" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="super_admin">Super Admin</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="farmer">Farmer</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button 
                  onClick={fetchUsers} 
                  variant="outline"
                  disabled={loading}
                >
                  <RotateCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Refresh User List
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
