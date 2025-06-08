
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useContactSubmissions } from '@/hooks/useContactSubmissions';
import { useSubscriptionRequests } from '@/hooks/useSubscriptionRequests';
import { Loader2, Mail, Phone, User, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

const ContactSubmissionsPage = () => {
  const { submissions, loading: submissionsLoading, updateSubmissionStatus } = useContactSubmissions();
  const { requests, loading: requestsLoading, approveRequest, denyRequest } = useSubscriptionRequests();
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [showDenyDialog, setShowDenyDialog] = useState(false);
  const [denyReason, setDenyReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'denied': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'denied': return <XCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return null;
    }
  };

  const handleApprove = async (submission: any) => {
    setActionLoading(true);
    try {
      // Find corresponding subscription request
      const request = requests.find(r => r.contact_submission_id === submission.id);
      if (request) {
        await approveRequest(request.id);
      }
      await updateSubmissionStatus(submission.id, 'approved');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeny = async () => {
    if (!selectedSubmission || !denyReason.trim()) return;
    
    setActionLoading(true);
    try {
      // Find corresponding subscription request
      const request = requests.find(r => r.contact_submission_id === selectedSubmission.id);
      if (request) {
        await denyRequest(request.id, denyReason);
      }
      await updateSubmissionStatus(selectedSubmission.id, 'denied');
      setShowDenyDialog(false);
      setDenyReason('');
      setSelectedSubmission(null);
    } finally {
      setActionLoading(false);
    }
  };

  if (submissionsLoading || requestsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Contact Submissions</h1>
        <p className="text-muted-foreground">
          Review and manage subscription requests from users
        </p>
      </div>

      <div className="grid gap-6">
        {submissions.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No contact submissions yet</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          submissions.map((submission) => (
            <Card key={submission.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      {submission.full_name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {submission.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {submission.phone_number}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(submission.status)}>
                    <span className="flex items-center gap-1">
                      {getStatusIcon(submission.status)}
                      {submission.status}
                    </span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {submission.subscription_plans && (
                    <div className="bg-muted p-3 rounded-lg">
                      <h4 className="font-semibold">Selected Plan</h4>
                      <p className="text-sm">
                        {submission.subscription_plans.name} - 
                        ${submission.subscription_plans.price}/{submission.subscription_plans.billing_interval}
                      </p>
                    </div>
                  )}
                  
                  {submission.additional_notes && (
                    <div>
                      <h4 className="font-semibold mb-2">Additional Notes</h4>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                        {submission.additional_notes}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Submitted {new Date(submission.created_at).toLocaleString()}
                  </div>

                  {submission.status === 'pending' && (
                    <div className="flex gap-2 pt-2">
                      <Button 
                        onClick={() => handleApprove(submission)}
                        disabled={actionLoading}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Approve
                      </Button>
                      <Button 
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setShowDenyDialog(true);
                        }}
                        disabled={actionLoading}
                      >
                        Deny
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={showDenyDialog} onOpenChange={setShowDenyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deny Subscription Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for denying this subscription request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="denyReason">Denial Reason</Label>
              <Textarea
                id="denyReason"
                value={denyReason}
                onChange={(e) => setDenyReason(e.target.value)}
                placeholder="Enter the reason for denial..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDenyDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeny}
              disabled={!denyReason.trim() || actionLoading}
            >
              {actionLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Deny Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactSubmissionsPage;
