
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const isMobile = useIsMobile();

  // Auto-close sidebar on mobile when component mounts
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-muted/30 overflow-hidden">
      <Sidebar />
      
      <div className={cn(
        "flex flex-col flex-1 overflow-hidden transition-all duration-300",
        sidebarOpen && !isMobile ? "md:ml-64" : "md:ml-20",
        isMobile && sidebarOpen ? "ml-0" : "ml-0"
      )}>
        <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <main className="flex-1 overflow-hidden p-4 md:p-6">
          <ScrollArea className="h-full w-full">
            {children}
          </ScrollArea>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
