
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  // Auto-close sidebar on mobile when component mounts
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Mobile overlay with higher z-index and solid background */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-all duration-300" 
          onClick={closeSidebar}
        />
      )}
      
      {/* Sidebar with enhanced mobile styling */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 transform transition-all duration-300 ease-in-out lg:relative lg:translate-x-0",
        "bg-card border-r border-border shadow-xl",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        isMobile ? "w-72 max-w-[80vw]" : sidebarOpen ? "w-64" : "w-20"
      )}>
        <Sidebar isCollapsed={!sidebarOpen && !isMobile} onNavigate={closeSidebar} />
      </div>
      
      {/* Main content with improved mobile responsiveness */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0 bg-background">
        <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <main className="flex-1 overflow-hidden p-2 sm:p-4 lg:p-6 bg-gradient-to-br from-background via-background to-muted/10">
          <ScrollArea className="h-full w-full">
            <div className="min-w-0 max-w-7xl mx-auto space-y-4 sm:space-y-6">
              {children}
            </div>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
