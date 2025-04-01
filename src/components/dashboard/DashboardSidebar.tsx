
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Search, 
  BarChart, 
  Settings, 
  LogOut, 
  HelpCircle,
  Building2,
  Palette,
  Link as LinkIcon,
  CreditCard,
  Bell,
  Lock,
  Database,
  Trash2,
  ChevronDown
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
import { Button } from '@/components/ui';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const DashboardSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isSettingsActive = () => {
    return location.pathname.startsWith('/dashboard/settings');
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Wylogowano pomyślnie",
        description: "Zostałeś wylogowany z systemu.",
      });
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Błąd wylogowania",
        description: "Nie udało się wylogować. Spróbuj ponownie.",
        variant: "destructive",
      });
    }
  };

  // Settings menu items
  const settingsItems = [
    { title: 'Profil firmy', icon: Building2, path: '/dashboard/settings', },
    { title: 'Branding', icon: Palette, path: '/dashboard/settings?tab=branding', },
    { title: 'Integracje', icon: LinkIcon, path: '/dashboard/settings?tab=integrations', },
    { title: 'Płatności i subskrypcja', icon: CreditCard, path: '/dashboard/settings?tab=billing', },
    { title: 'Zespół i uprawnienia', icon: Users, path: '/dashboard/settings?tab=team', },
    { title: 'Powiadomienia', icon: Bell, path: '/dashboard/settings?tab=notifications', },
    { title: 'Bezpieczeństwo', icon: Lock, path: '/dashboard/settings?tab=security', },
    { title: 'Zarządzanie danymi', icon: Database, path: '/dashboard/settings?tab=data-management', },
    { title: 'Strefa zagrożenia', icon: Trash2, path: '/dashboard/settings?tab=danger-zone', },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2.5">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg" alt="Logo" />
            <AvatarFallback>HR</AvatarFallback>
          </Avatar>
          <span className="font-bold text-lg">HR Assist</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Nawigacja</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/dashboard')}>
                  <Link to="/dashboard">
                    <LayoutDashboard />
                    <span>Pulpit</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/dashboard/campaigns')}>
                  <Link to="/dashboard/campaigns">
                    <Briefcase />
                    <span>Kampanie rekrutacyjne</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/dashboard/candidates')}>
                  <Link to="/dashboard/candidates">
                    <Users />
                    <span>Kandydaci</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/dashboard/search')}>
                  <Link to="/dashboard/search">
                    <Search />
                    <span>Wyszukiwanie kandydatów</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/dashboard/analytics')}>
                  <Link to="/dashboard/analytics">
                    <BarChart />
                    <span>Analityka</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Administracja</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton isActive={isSettingsActive()}>
                      <Settings />
                      <span>Ustawienia workspace</span>
                      <ChevronDown className="h-4 w-4 ml-auto" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 p-0">
                    {settingsItems.map((item) => (
                      <DropdownMenuItem key={item.title} asChild>
                        <Link to={item.path} className="flex items-center gap-2 p-3 cursor-pointer">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/dashboard/help')}>
                  <Link to="/dashboard/help">
                    <HelpCircle />
                    <span>Pomoc i wsparcie</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" alt="Avatar" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium">Jan Kowalski</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>
          
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
