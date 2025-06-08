
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useContactSubmissions } from '@/hooks/useContactSubmissions';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const ContactSubmissionsPage = () => {
  const { submissions, loading, updateSubmissionStatus } = useContactSubmissions();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'denied':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'denied':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleStatusUpdate = async (submissionId: string, newStatus: 'approved' | 'denied') => {
    const success = await updateSubmissionStatus(submissionId, newStatus);
    if (success) {
      toast.success(`Submission ${newStatus} successfully`);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Contact Submissions</h1>
          <p className="text-muted-foreground">
            Manage contact form submissions and subscription requests
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Submissions ({submissions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {submissions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No contact submissions found.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell className="font-medium">
                        {submission.full_name}
                      </TableCell>
                      <TableCell>{submission.email}</TableCell>
                      <TableCell>{submission.phone_number}</TableCell>
                      <TableCell>
                        {submission.subscription_plans?.name || 'No plan selected'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(submission.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(submission.status)}
                            {submission.status}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(submission.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {submission.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleStatusUpdate(submission.id, 'approved')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleStatusUpdate(submission.id, 'denied')}
                            >
                              Deny
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ContactSubmissionsPage;
