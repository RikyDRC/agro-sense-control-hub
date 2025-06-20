
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Send, History, Users, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import BroadcastMessageForm from '@/components/notifications/BroadcastMessageForm';
import DashboardLayout from '@/components/layout/DashboardLayout';

interface BroadcastMessage {
  id: string;
  title: string;
  message: string;
  type: string;
  targetAudience: string;
  status: string;
  recipientsCount: number;
  deliveredCount: number;
  createdAt: string;
  sentAt?: string;
  createdBy: string;
}

const BroadcastMessagesPage: React.FC = () => {
  const { user, isRoleAdmin, isRoleSuperAdmin } = useAuth();
  const [messages, setMessages] = useState<BroadcastMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('broadcast_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedMessages: BroadcastMessage[] = data.map(msg => ({
        id: msg.id,
        title: msg.title,
        message: msg.message,
        type: msg.type,
        targetAudience: msg.target_audience,
        status: msg.status,
        recipientsCount: msg.recipients_count || 0,
        deliveredCount: msg.delivered_count || 0,
        createdAt: msg.created_at,
        sentAt: msg.sent_at,
        createdBy: msg.created_by
      }));

      setMessages(formattedMessages);
    } catch (err) {
      console.error('Error fetching broadcast messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'maintenance': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!isRoleAdmin() && !isRoleSuperAdmin()) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Broadcast Messages</h1>
          <p className="text-muted-foreground">
            Send notifications to users and manage message history
          </p>
        </div>

        <Tabs defaultValue="send" className="space-y-6">
          <TabsList>
            <TabsTrigger value="send" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Send Message
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Message History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="send">
            <BroadcastMessageForm onSuccess={fetchMessages} />
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  Message History
                </CardTitle>
                <CardDescription>
                  View all sent and scheduled broadcast messages
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No broadcast messages found</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[600px]">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className="border rounded-lg p-4 space-y-3"
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <h3 className="font-medium">{message.title}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {message.message}
                              </p>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge variant="outline" className={getStatusColor(message.status)}>
                                {message.status}
                              </Badge>
                              <Badge variant="outline" className={getTypeColor(message.type)}>
                                {message.type}
                              </Badge>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>
                                  {message.targetAudience === 'all' ? 'All Users' : 
                                   message.targetAudience === 'farmers' ? 'Farmers' : 'Admins'}
                                </span>
                              </div>
                              {message.recipientsCount > 0 && (
                                <div className="flex items-center gap-1">
                                  <span>Recipients: {message.recipientsCount}</span>
                                </div>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>
                                {message.sentAt 
                                  ? `Sent ${formatDistanceToNow(new Date(message.sentAt), { addSuffix: true })}`
                                  : `Created ${formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}`
                                }
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default BroadcastMessagesPage;
