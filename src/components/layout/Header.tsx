
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, Bell, User, ChevronLeft, ChevronRight, CreditCard, LogOut, Settings, UserCircle, Shield } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import LanguageSelector from '@/components/ui/language-selector';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, sidebarOpen }) => {
  const { user, profile, signOut } = useAuth();
  const { t } = useTranslation(['navigation', 'common']);
  const isMobile = useIsMobile();
  
  const getInitials = () => {
    if (profile?.display_name) {
      return profile.display_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return profile?.email?.substring(0, 2).toUpperCase() || 'U';
  };

  const getUserRole = () => {
    if (!profile) return '';
    return profile.role?.replace('_', ' ') || '';
  };

  // Generate a consistent avatar URL based on user data
  const getAvatarUrl = () => {
    if (profile?.profile_image) return profile.profile_image;
    if (user?.user_metadata?.avatar_url) return user.user_metadata.avatar_url;
    // Generate a consistent placeholder avatar
    const seed = profile?.email || user?.email || 'user';
    return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=22c55e&color=ffffff`;
  };
  
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 bg-header-background/95 backdrop-blur-md border-b border-header-border shadow-sm">
      <div className="flex items-center">
        {isMobile ? (
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2 hover:bg-muted/50">
            <Menu className="h-5 w-5" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-4 hover:bg-muted/50">
            {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </Button>
        )}
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-primary-foreground font-bold text-sm">AS</span>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-header-foreground hidden md:block">
              {t('navigation:header.controlHub')}
            </h1>
            <h1 className="text-base font-semibold text-header-foreground md:hidden">
              {t('navigation:header.appName')}
            </h1>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        <LanguageSelector />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative hover:bg-muted/50">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-destructive text-destructive-foreground border-2 border-header-background">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-popover/95 backdrop-blur-sm border-border shadow-xl">
            <DropdownMenuLabel className="text-popover-foreground">{t('navigation:header.notifications')}</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <div className="max-h-80 overflow-y-auto">
              <DropdownMenuItem className="cursor-pointer py-3 hover:bg-muted/50">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-popover-foreground">Low soil moisture alert</p>
                  <p className="text-xs text-muted-foreground">Zone A needs irrigation</p>
                  <p className="text-xs text-muted-foreground">10 min ago</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer py-3 hover:bg-muted/50">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-popover-foreground">Irrigation completed</p>
                  <p className="text-xs text-muted-foreground">Zone C irrigation cycle completed</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer py-3 hover:bg-muted/50">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-popover-foreground">Weather warning</p>
                  <p className="text-xs text-muted-foreground">Heavy rain expected in 24 hours</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem className="cursor-pointer hover:bg-muted/50">
              <p className="text-sm text-center w-full text-primary font-medium">View all notifications</p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative flex items-center space-x-2 px-3 py-2 hover:bg-muted/50 rounded-lg" size="sm">
              <Avatar className="h-8 w-8 ring-2 ring-primary/20 shadow-sm">
                <AvatarImage 
                  src={getAvatarUrl()} 
                  alt={profile?.display_name || 'User Avatar'}
                  className="object-cover"
                />
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm hidden md:inline-block text-header-foreground">
                {profile?.display_name || profile?.email?.split('@')[0]}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-popover/95 backdrop-blur-sm border-border shadow-xl">
            <DropdownMenuLabel className="text-popover-foreground">
              <div className="flex flex-col">
                <span className="font-medium">{profile?.display_name || profile?.email?.split('@')[0]}</span>
                <span className="text-xs text-muted-foreground capitalize">{getUserRole()}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem className="cursor-pointer hover:bg-muted/50" asChild>
              <Link to="/settings" className="text-popover-foreground">
                <UserCircle className="mr-2 h-4 w-4" /> {t('navigation:header.profile')}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer hover:bg-muted/50" asChild>
              <Link to="/settings" className="text-popover-foreground">
                <Settings className="mr-2 h-4 w-4" /> {t('navigation:sidebar.settings')}
              </Link>
            </DropdownMenuItem>
            
            {profile?.role === 'farmer' && (
              <DropdownMenuItem className="cursor-pointer hover:bg-muted/50" asChild>
                <Link to="/subscription/plans" className="text-popover-foreground">
                  <CreditCard className="mr-2 h-4 w-4" /> {t('navigation:header.subscription')}
                </Link>
              </DropdownMenuItem>
            )}
            
            {(profile?.role === 'super_admin' || profile?.role === 'admin') && (
              <DropdownMenuItem className="cursor-pointer hover:bg-muted/50" asChild>
                <Link to={profile.role === 'super_admin' ? '/admin/config' : '/settings'} className="text-popover-foreground">
                  <Shield className="mr-2 h-4 w-4" /> {t('navigation:header.adminControls')}
                </Link>
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem className="cursor-pointer text-destructive hover:bg-destructive/10" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" /> {t('navigation:header.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
