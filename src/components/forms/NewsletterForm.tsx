
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Bell } from 'lucide-react';
import { useCreateNewsletterSubscription } from '@/hooks/useNewsletterSubscriptions';

const NewsletterForm = () => {
  const createSubscription = useCreateNewsletterSubscription();
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createSubscription.mutateAsync(email);
      setEmail('');
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Bell className="h-5 w-5 text-agro-green" />
          Newsletter
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Stay updated with the latest smart farming insights
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="pl-10"
              required
            />
          </div>
          
          <Button
            type="submit"
            className="w-full bg-agro-green hover:bg-agro-green-dark"
            disabled={createSubscription.isPending}
          >
            {createSubscription.isPending ? 'Subscribing...' : 'Subscribe'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewsletterForm;
