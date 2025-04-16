
import React from 'react';
import { Link } from 'react-router-dom';
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
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, sidebarOpen }) => {
  const { user, profile, signOut } = useAuth();
  
  const getInitials = () => {
    if (profile?.display_name) {
      return profile.display_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
    }
    return profile?.email.substring(0, 2).toUpperCase() || 'U';
  };

  const getUserRole = () => {
    if (!profile) return '';
    return profile.role.replace('_', ' ');
  };
  
  return (
    <header className="sticky top-0 z-10 flex items-center justify-between h-16 px-4 border-b bg-white/80 backdrop-blur-sm border-border">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-4">
          {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </Button>
        <h1 className="text-lg font-semibold text-gray-800 hidden md:block">AgroSense Control Hub</h1>
      </div>

      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-agro-status-warning text-white">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              <DropdownMenuItem className="cursor-pointer py-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">Low soil moisture alert</p>
                  <p className="text-xs text-muted-foreground">Zone A needs irrigation</p>
                  <p className="text-xs text-muted-foreground">10 min ago</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer py-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">Irrigation completed</p>
                  <p className="text-xs text-muted-foreground">Zone C irrigation cycle completed</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer py-3">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">Weather warning</p>
                  <p className="text-xs text-muted-foreground">Heavy rain expected in 24 hours</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer">
              <p className="text-sm text-center w-full text-primary">View all notifications</p>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative flex items-center space-x-2" size="sm">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg" alt={profile?.display_name || 'User'} />
                <AvatarFallback className="bg-agro-green text-white">{getInitials()}</AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm hidden md:inline-block">
                {profile?.display_name || profile?.email.split('@')[0]}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span>{profile?.display_name || profile?.email.split('@')[0]}</span>
                <span className="text-xs text-muted-foreground capitalize">{getUserRole()}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" asChild>
              <Link to="/settings">
                <UserCircle className="mr-2 h-4 w-4" /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" asChild>
              <Link to="/settings">
                <Settings className="mr-2 h-4 w-4" /> Settings
              </Link>
            </DropdownMenuItem>
            
            {profile?.role === 'farmer' && (
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link to="/subscription/plans">
                  <CreditCard className="mr-2 h-4 w-4" /> Subscription
                </Link>
              </DropdownMenuItem>
            )}
            
            {(profile?.role === 'super_admin' || profile?.role === 'admin') && (
              <DropdownMenuItem className="cursor-pointer" asChild>
                <Link to={profile.role === 'super_admin' ? '/admin/config' : '/settings'}>
                  <Shield className="mr-2 h-4 w-4" /> Admin Controls
                </Link>
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer text-red-500" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
