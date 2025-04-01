
import React, { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
import NavigationMenu from './sidebar/NavigationMenu';
import CandidatesMenuItem from './sidebar/CandidatesMenuItem';
import SettingsMenu from './sidebar/SettingsMenu';
import SidebarUser from './sidebar/SidebarUser';

const DashboardSidebar = () => {
  const [isRecentCandidatesOpen, setIsRecentCandidatesOpen] = useState(false);

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
            <NavigationMenu />
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Kandydaci</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenuItem>
              <CandidatesMenuItem 
                isRecentCandidatesOpen={isRecentCandidatesOpen}
                setIsRecentCandidatesOpen={setIsRecentCandidatesOpen}
              />
            </SidebarMenuItem>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Administracja</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenuItem>
              <SettingsMenu />
            </SidebarMenuItem>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarUser />
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
