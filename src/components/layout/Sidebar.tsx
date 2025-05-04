
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutDashboard, 
  Thermometer, 
  Map, 
  Layers, 
  Cloud, 
  Zap, 
  Settings, 
  Smartphone, 
  LogOut, 
  ChevronRight, 
  Sprout,
  Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  open: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [userRole, setUserRole] = useState<string | null>(null);
  
  useEffect(() => {
    // Get user role from user meta data if available
    if (user && user.user_metadata && user.user_metadata.role) {
      setUserRole(user.user_metadata.role);
    }
  }, [user]);
  
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Devices', href: '/devices', icon: Thermometer },
    { name: 'Map', href: '/map', icon: Map },
    { name: 'Zones', href: '/zones', icon: Layers },
    { name: 'Crops', href: '/crops', icon: Sprout },
    { name: 'Weather', href: '/weather', icon: Cloud },
    { name: 'Automation', href: '/automation', icon: Zap },
    { name: 'Device Connectivity', href: '/connectivity', icon: LinkIcon },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  // Add Admin Config for super_admin users
  if (userRole === 'super_admin') {
    navigationItems.push({ 
      name: 'Admin Config', 
      href: '/admin/config', 
      icon: Smartphone 
    });
  }

  return (
    <div 
      className={cn(
        "fixed inset-y-0 left-0 z-10 flex flex-col border-r bg-background transition-all duration-300",
        open ? "w-64" : "w-20"
      )}
    >
      <div className="flex h-14 items-center justify-between border-b px-4">
        <Link to="/" className={cn("flex items-center", open ? "justify-start" : "justify-center w-full")}>
          <Sprout className="h-6 w-6 text-primary" />
          {open && <span className="ml-2 font-semibold">Farm IoT</span>}
        </Link>
      </div>

      <ScrollArea className="flex-1 py-2">
        <nav className="grid gap-1 px-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "group flex items-center rounded-md px-2 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                  isActive ? "bg-accent text-accent-foreground" : "transparent",
                  !open && "justify-center"
                )}
              >
                <item.icon className="h-5 w-5" />
                {open && <span className="ml-3">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="mt-auto p-4 border-t">
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "w-full justify-start",
            !open && "justify-center px-0"
          )} 
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5" />
          {open && <span className="ml-2">Sign out</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
