
import React, { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const LazyComponent: React.FC<LazyComponentProps> = ({ 
  children, 
  fallback = <div className="space-y-4"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" /></div>
}) => {
  return (
    <Suspense fallback={fallback}>
      {children}
    </Suspense>
  );
};
