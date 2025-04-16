
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, Droplets, Map, Layers, Sprout, 
  CloudSun, Bot, Settings, ChevronRight, LogOut,
  CreditCard, Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SidebarProps {
  open: boolean;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  
  const NAV_ITEMS: NavItem[] = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Devices', href: '/devices', icon: Droplets },
    { label: 'Map View', href: '/map', icon: Map },
    { label: 'Zones', href: '/zones', icon: Layers },
    { label: 'Crops', href: '/crops', icon: Sprout },
    { label: 'Weather', href: '/weather', icon: CloudSun },
    { label: 'Automation', href: '/automation', icon: Bot },
    { label: 'Subscription', href: '/subscription/plans', icon: CreditCard, roles: ['farmer'] },
    { label: 'Admin', href: '/admin/config', icon: Shield, roles: ['super_admin'] },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];
  
  const filteredNavItems = NAV_ITEMS.filter(item => {
    if (!item.roles) return true;
    return profile && item.roles.includes(profile.role);
  });
  
  return (
    <aside 
      className={cn(
        "fixed inset-y-0 left-0 z-10 flex flex-col bg-white border-r border-border transition-all duration-300",
        open ? "w-64" : "w-20"
      )}
    >
      <div className="flex items-center justify-center h-16 border-b border-border">
        {open ? (
          <h1 className="text-xl font-bold text-agro-green-dark">AgroSense Hub</h1>
        ) : (
          <h1 className="text-2xl font-bold text-agro-green-dark">AS</h1>
        )}
      </div>
      
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.href || 
                          (item.href !== '/' && location.pathname.startsWith(item.href));
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center py-3 px-3 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-agro-green text-white"
                  : "text-gray-700 hover:bg-agro-green-light/20 hover:text-agro-green-dark"
              )}
            >
              <item.icon className={cn("h-5 w-5", !open && "mx-auto")} />
              {open && <span className="ml-3">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border">
        <button 
          className={cn(
            "flex items-center py-2 px-3 w-full rounded-md text-sm font-medium text-red-500 hover:bg-red-50 transition-colors",
            !open && "justify-center"
          )}
          onClick={signOut}
        >
          <LogOut className="h-5 w-5" />
          {open && <span className="ml-3">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
