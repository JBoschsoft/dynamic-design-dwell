
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
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
import { Button } from '@/components/ui';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';

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
    { title: 'Profil firmy', icon: Building2, sectionId: 'company-profile' },
    { title: 'Branding', icon: Palette, sectionId: 'branding' },
    { title: 'Integracje', icon: LinkIcon, sectionId: 'integrations' },
    { title: 'Płatności i subskrypcja', icon: CreditCard, sectionId: 'billing' },
    { title: 'Zespół i uprawnienia', icon: Users, sectionId: 'team' },
    { title: 'Powiadomienia', icon: Bell, sectionId: 'notifications' },
    { title: 'Bezpieczeństwo', icon: Lock, sectionId: 'security' },
    { title: 'Zarządzanie danymi', icon: Database, sectionId: 'data-management' },
    { title: 'Strefa zagrożenia', icon: Trash2, sectionId: 'danger-zone' },
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
                <Accordion type="single" collapsible className="w-full border-none">
                  <AccordionItem value="settings" className="border-none">
                    <AccordionTrigger asChild>
                      <SidebarMenuButton isActive={isSettingsActive()}>
                        <Settings />
                        <span>Ustawienia workspace</span>
                      </SidebarMenuButton>
                    </AccordionTrigger>
                    <AccordionContent className="pl-8 pr-2 pt-1 pb-0">
                      <div className="flex flex-col space-y-1">
                        {settingsItems.map((item) => (
                          <Link 
                            key={item.sectionId}
                            to={`/dashboard/settings?section=${item.sectionId}`}
                            className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
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
