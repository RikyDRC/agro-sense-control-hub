
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('navigation');

  const mainNavItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('sidebar.dashboard') },
    { to: '/devices', icon: Smartphone, label: t('sidebar.devices') },
    { to: '/zones', icon: MapPin, label: t('sidebar.zones') },
    { to: '/automation', icon: Zap, label: t('sidebar.automation') },
    { to: '/crops', icon: Wheat, label: t('sidebar.crops') },
    { to: '/weather', icon: Cloud, label: t('sidebar.weather') },
    { to: '/map', icon: Map, label: t('sidebar.mapView') },
  ];

  const toolsNavItems = [
    { to: '/device-connectivity', icon: Wifi, label: t('sidebar.deviceConnectivity') },
    { to: '/settings', icon: Settings, label: t('sidebar.settings') },
  ];

  const adminNavItems = [
    ...(isRoleAdmin() || isRoleSuperAdmin() ? [
      { to: '/admin/farmers', icon: Users, label: t('sidebar.farmersManagement') },
      { to: '/admin/contact-submissions', icon: MessageSquare, label: t('sidebar.contactSubmissions') }
    ] : []),
    ...(isRoleSuperAdmin() ? [
      { to: '/admin/config', icon: ShieldCheck, label: t('sidebar.platformConfig') },
      { to: '/admin/payments', icon: CreditCard, label: t('sidebar.paymentGateways') }
    ] : [])
  ];

  const NavItem = ({ item }: { item: typeof mainNavItems[0] }) => {
    const isActive = location.pathname === item.to;
    
    const content = (
      <NavLink
        to={item.to}
        onClick={onNavigate}
        className={cn(
          'sidebar-nav-item group flex items-center w-full text-left transition-colors duration-200',
          isCollapsed ? 'justify-center p-3' : 'px-3 py-2.5',
          isActive 
            ? 'bg-primary text-primary-foreground shadow-sm' 
            : 'text-sidebar-foreground hover:bg-accent hover:text-accent-foreground'
        )}
      >
        <item.icon className={cn('h-5 w-5 flex-shrink-0', isCollapsed ? '' : 'mr-3')} />
        {!isCollapsed && <span className="truncate font-medium">{item.label}</span>}
        {isActive && !isCollapsed && (
          <div className="absolute left-0 top-0 h-full w-1 bg-primary rounded-r-full" />
        )}
      </NavLink>
    );

    if (isCollapsed) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {content}
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-popover border-border shadow-md z-50">
              <p className="text-popover-foreground font-medium">{item.label}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return content;
  };

  return (
    <div className="flex h-full w-full flex-col bg-card border-r border-border shadow-lg relative z-50">
      <div className="flex-1 flex flex-col pt-4 pb-4 overflow-y-auto bg-card">
        <div className={cn(
          "flex items-center flex-shrink-0 px-4 mb-6",
          isCollapsed && "justify-center px-2"
        )}>
          {isCollapsed ? (
            <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
              <span className="text-primary-foreground font-bold text-lg">AS</span>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
                <span className="text-primary-foreground font-bold text-lg">AS</span>
              </div>
              <h1 className="text-xl font-bold text-foreground">{t('header.appName')}</h1>
            </div>
          )}
        </div>
        
        <nav className={cn("flex-1 space-y-6", isCollapsed ? "px-2" : "px-3")}>
          {/* Main Navigation */}
          <div>
            {!isCollapsed && (
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {t('sidebar.main')}
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
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {t('sidebar.tools')}
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
                <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  {t('sidebar.administration')}
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
