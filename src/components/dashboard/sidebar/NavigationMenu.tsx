
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Search, 
  BarChart, 
  HelpCircle 
} from 'lucide-react';
import { 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from '@/components/ui/sidebar';

const NavigationMenu = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
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
      
      {/* RecentCandidates component will be inserted here */}
      
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
  );
};

export default NavigationMenu;
