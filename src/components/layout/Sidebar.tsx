
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Smartphone,
  MapPin,
  Zap,
  Wheat,
  Cloud,
  Map,
  Settings,
  Wifi,
  Users,
  CreditCard,
  MessageSquare,
  ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SidebarProps {
  isCollapsed?: boolean;
  onNavigate?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed = false, onNavigate }) => {
  const location = useLocation();
  const { isRoleAdmin, isRoleSuperAdmin } = useAuth();

  const mainNavItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/devices', icon: Smartphone, label: 'Devices' },
    { to: '/zones', icon: MapPin, label: 'Zones' },
    { to: '/automation', icon: Zap, label: 'Automation' },
    { to: '/crops', icon: Wheat, label: 'Crops' },
    { to: '/weather', icon: Cloud, label: 'Weather' },
    { to: '/map', icon: Map, label: 'Map View' },
  ];

  const toolsNavItems = [
    { to: '/device-connectivity', icon: Wifi, label: 'Device Connectivity' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  const adminNavItems = [
    ...(isRoleAdmin() || isRoleSuperAdmin() ? [
      { to: '/admin/farmers', icon: Users, label: 'Farmers Management' },
      { to: '/admin/contact-submissions', icon: MessageSquare, label: 'Contact Submissions' }
    ] : []),
    ...(isRoleSuperAdmin() ? [
      { to: '/admin/config', icon: ShieldCheck, label: 'Platform Config' },
      { to: '/admin/payments', icon: CreditCard, label: 'Payment Gateways' }
    ] : [])
  ];

  const NavItem = ({ item }: { item: typeof mainNavItems[0] }) => {
    const isActive = location.pathname === item.to;
    
    const content = (
      <NavLink
        to={item.to}
        onClick={onNavigate}
        className={cn(
          'group flex items-center text-sm font-medium rounded-md transition-colors',
          isCollapsed ? 'justify-center p-3' : 'px-3 py-2',
          isActive
            ? 'bg-primary text-primary-foreground'
            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
        )}
      >
        <item.icon className={cn('h-5 w-5', isCollapsed ? '' : 'mr-3')} />
        {!isCollapsed && <span>{item.label}</span>}
      </NavLink>
    );

    if (isCollapsed) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {content}
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{item.label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return content;
  };

  return (
    <div className="flex h-full w-full flex-col bg-white border-r border-gray-200">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className={cn(
          "flex items-center flex-shrink-0 px-4",
          isCollapsed && "justify-center px-2"
        )}>
          {isCollapsed ? (
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">AS</span>
            </div>
          ) : (
            <h1 className="text-xl font-bold text-gray-900">AgroSense Hub</h1>
          )}
        </div>
        
        <nav className={cn("mt-8 flex-1 space-y-6", isCollapsed ? "px-2" : "px-2")}>
          {/* Main Navigation */}
          <div>
            {!isCollapsed && (
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Main
              </h3>
            )}
            <div className="space-y-1">
              {mainNavItems.map((item) => (
                <NavItem key={item.to} item={item} />
              ))}
            </div>
          </div>

          {/* Tools */}
          <div>
            {!isCollapsed && (
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Tools
              </h3>
            )}
            <div className="space-y-1">
              {toolsNavItems.map((item) => (
                <NavItem key={item.to} item={item} />
              ))}
            </div>
          </div>

          {/* Admin Section */}
          {adminNavItems.length > 0 && (
            <div>
              {!isCollapsed && (
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Administration
                </h3>
              )}
              <div className="space-y-1">
                {adminNavItems.map((item) => (
                  <NavItem key={item.to} item={item} />
                ))}
              </div>
            </div>
          )}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;
