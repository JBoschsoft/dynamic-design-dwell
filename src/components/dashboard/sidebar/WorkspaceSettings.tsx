
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Settings, 
  Building2, 
  Palette, 
  LinkIcon, 
  CreditCard, 
  Users, 
  Bell, 
  Lock, 
  Database, 
  Trash2 
} from 'lucide-react';
import { 
  Accordion, 
  AccordionItem, 
  AccordionTrigger, 
  AccordionContent 
} from '@/components/ui/accordion';
import { SidebarMenuItem } from '@/components/ui/sidebar';

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

const WorkspaceSettings = () => {
  return (
    <SidebarMenuItem>
      <Accordion type="single" collapsible className="w-full border-none">
        <AccordionItem value="settings" className="border-none">
          <AccordionTrigger className="flex items-center gap-2 w-full px-2 py-2 rounded-md hover:bg-sidebar-accent">
            <div className="flex items-center gap-2 flex-1 text-left">
              <Settings className="h-4 w-4" />
              <span>Ustawienia workspace</span>
            </div>
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
  );
};

export default WorkspaceSettings;
