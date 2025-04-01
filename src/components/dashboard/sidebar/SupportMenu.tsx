
import React from 'react';
import { HelpCircle } from 'lucide-react';
import { 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from '@/components/ui/sidebar';
import WorkspaceSettings from './WorkspaceSettings';

const SupportMenu = () => {
  return (
    <SidebarMenu>
      <WorkspaceSettings />
      
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

export default SupportMenu;
