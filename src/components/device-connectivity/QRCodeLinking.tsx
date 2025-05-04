
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCodeIcon, RefreshCw, ClipboardCopy } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { supabase } from '@/integrations/supabase/client';
import { v4 as uuidv4 } from 'uuid';

interface DeviceLink {
  id: string;
  user_id: string;
  link_code: string;
  device_name: string;
  is_claimed: boolean;
  expires_at: string;
  created_at: string;
}

interface QRCodeLinkingProps {
  userId?: string;
}

const QRCodeLinking: React.FC<QRCodeLinkingProps> = ({ userId }) => {
  const [deviceLinks, setDeviceLinks] = useState<DeviceLink[]>([]);
  const [deviceName, setDeviceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (userId) {
      loadDeviceLinks();
    }
  }, [userId]);

  const loadDeviceLinks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('device_links')
        .select('*')
        .eq('user_id', userId)
        .eq('is_claimed', false)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setDeviceLinks(data || []);
    } catch (error: any) {
      console.error('Error loading device links:', error);
      toast.error('Failed to load device links');
    } finally {
      setLoading(false);
    }
  };

  const generateDeviceLink = async () => {
    if (!deviceName.trim()) {
      toast.error('Please enter a name for the device');
      return;
    }
    
    try {
      setGenerating(true);
      
      // Generate a random 6-character code
      const linkCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Set expiration to 24 hours from now
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);
      
      const { error } = await supabase
        .from('device_links')
        .insert({
          user_id: userId,
          link_code: linkCode,
          device_name: deviceName,
          is_claimed: false,
          expires_at: expiresAt.toISOString()
        });
      
      if (error) throw error;
      
      toast.success('Device link created successfully');
      setDeviceName('');
      loadDeviceLinks();
    } catch (error: any) {
      console.error('Error generating device link:', error);
      toast.error('Failed to generate device link');
    } finally {
      setGenerating(false);
    }
  };

  const deleteDeviceLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from('device_links')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success('Device link deleted successfully');
      loadDeviceLinks();
    } catch (error: any) {
      console.error('Error deleting device link:', error);
      toast.error('Failed to delete device link');
    }
  };

  const copyLinkToClipboard = (linkCode: string) => {
    const linkUrl = `https://farm-iot-dashboard.com/link?code=${linkCode}`;
    navigator.clipboard.writeText(linkUrl)
      .then(() => toast.success('Device link copied to clipboard'))
      .catch(() => toast.error('Failed to copy device link'));
  };

  const copySetupCommand = (linkCode: string) => {
    const command = `farmctl device link ${linkCode}`;
    navigator.clipboard.writeText(command)
      .then(() => toast.success('Setup command copied to clipboard'))
      .catch(() => toast.error('Failed to copy setup command'));
  };

  // Generate a QR code for a device link
  const getQRCodeUrl = (linkCode: string) => {
    const linkUrl = `https://farm-iot-dashboard.com/link?code=${linkCode}`;
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(linkUrl)}`;
  };

  // Format expiration time
  const formatExpiration = (expiresAt: string) => {
    const now = new Date();
    const expiration = new Date(expiresAt);
    const diffMs = expiration.getTime() - now.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHrs > 0) {
      return `${diffHrs}h ${diffMins}m`;
    }
    return `${diffMins}m`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCodeIcon className="h-5 w-5" />
            QR Code Device Linking
          </CardTitle>
          <CardDescription>
            Generate QR codes for quick and easy device setup
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="deviceName">New Device Name</Label>
            <div className="flex space-x-2">
              <Input
                id="deviceName"
                placeholder="e.g., Greenhouse Sensor 1"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
              />
              <Button 
                onClick={generateDeviceLink} 
                disabled={generating || !deviceName.trim()}
              >
                {generating ? 'Generating...' : 'Generate QR'}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Your Active Device Links</Label>
            {loading ? (
              <div className="text-center py-4">Loading...</div>
            ) : deviceLinks.length === 0 ? (
              <div className="text-sm text-muted-foreground py-4">
                No active device links. Generate a new link above.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {deviceLinks.map((link) => (
                  <Card key={link.id}>
                    <CardContent className="pt-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{link.device_name}</h4>
                          <p className="text-xs text-muted-foreground">
                            Expires in {formatExpiration(link.expires_at)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteDeviceLink(link.id)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex justify-center">
                        <img 
                          src={getQRCodeUrl(link.link_code)} 
                          alt={`QR Code for ${link.device_name}`} 
                          className="h-48 w-48"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Link Code:</span>
                          <div className="flex items-center gap-1">
                            <code className="bg-muted px-1 py-0.5 rounded text-sm">{link.link_code}</code>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => copyLinkToClipboard(link.link_code)}
                            >
                              <ClipboardCopy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full" 
                          onClick={() => copySetupCommand(link.link_code)}
                        >
                          Copy Setup Command
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start space-y-2">
          <p className="text-sm font-medium">How to use QR codes</p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li>Generate a QR code with a device name</li>
            <li>Scan the QR code with your IoT device or mobile app</li>
            <li>The device will automatically connect to your dashboard</li>
            <li>Links expire after 24 hours for security</li>
          </ol>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Device Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium">Using the CLI Tool</h4>
              <p className="text-sm text-muted-foreground mb-2">
                You can use our command-line tool to quickly link your device:
              </p>
              <pre className="p-2 bg-muted rounded text-xs overflow-x-auto">
{`# Install the farm CLI tool
pip install farmctl

# Link your device
farmctl device link YOUR_LINK_CODE

# Follow the on-screen instructions to complete setup`}
              </pre>
            </div>
            
            <div>
              <h4 className="font-medium">Using the Mobile App</h4>
              <p className="text-sm text-muted-foreground">
                Download our mobile app and use the "Scan QR" feature to link your device.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodeLinking;
