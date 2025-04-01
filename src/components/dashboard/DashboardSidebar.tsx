
import React, { useState } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
import NavigationMenu from './sidebar/NavigationMenu';
import RecentCandidates from './sidebar/RecentCandidates';
import SupportMenu from './sidebar/SupportMenu';
import UserProfile from './sidebar/UserProfile';

interface RecentCandidate {
  id: string;
  firstName: string;
  lastName: string;
  viewedAt: Date;
}

const DashboardSidebar = () => {
  const [recentCandidates, setRecentCandidates] = useState<RecentCandidate[]>(() => {
    const saved = localStorage.getItem('recentlyViewedCandidates');
    return saved ? JSON.parse(saved) : [];
  });
  
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
            <RecentCandidates
              recentCandidates={recentCandidates}
              setRecentCandidates={setRecentCandidates}
              isRecentCandidatesOpen={isRecentCandidatesOpen}
              setIsRecentCandidatesOpen={setIsRecentCandidatesOpen}
            />
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Administracja</SidebarGroupLabel>
          <SidebarGroupContent>
            <SupportMenu />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <UserProfile />
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
