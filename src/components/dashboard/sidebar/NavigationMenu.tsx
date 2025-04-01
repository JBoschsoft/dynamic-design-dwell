
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { LayoutDashboard, Briefcase, Search, BarChart, HelpCircle } from 'lucide-react';

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
      
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <a 
            href="/dokumentacja" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex items-center gap-2"
          >
            <HelpCircle />
            <span>Pomoc i wsparcie</span>
          </a>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};

export default NavigationMenu;
