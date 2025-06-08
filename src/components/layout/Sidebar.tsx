
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

const Sidebar = () => {
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

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r border-gray-200">
      <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4">
          <h1 className="text-xl font-bold text-gray-900">AgroSense Hub</h1>
        </div>
        
        <nav className="mt-8 flex-1 px-2 space-y-8">
          {/* Main Navigation */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Main
            </h3>
            <div className="mt-2 space-y-1">
              {mainNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    )
                  }
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Tools */}
          <div>
            <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Tools
            </h3>
            <div className="mt-2 space-y-1">
              {toolsNavItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    )
                  }
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>

          {/* Admin Section */}
          {adminNavItems.length > 0 && (
            <div>
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Administration
              </h3>
              <div className="mt-2 space-y-1">
                {adminNavItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      )
                    }
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.label}
                  </NavLink>
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
