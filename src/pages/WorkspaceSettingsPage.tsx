
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { 
  Building2, 
  Palette, 
  Link as LinkIcon, 
  CreditCard, 
  Users, 
  Bell, 
  Lock, 
  Database, 
  Trash2,
  ChevronRight
} from 'lucide-react';
import CompanyProfileSettings from '@/components/settings/CompanyProfileSettings';
import BrandingSettings from '@/components/settings/BrandingSettings';
import IntegrationsSettings from '@/components/settings/IntegrationsSettings';
import BillingSettings from '@/components/settings/BillingSettings';
import TeamSettings from '@/components/settings/TeamSettings';
import NotificationsSettings from '@/components/settings/NotificationsSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import DataManagementSettings from '@/components/settings/DataManagementSettings';
import DangerZoneSettings from '@/components/settings/DangerZoneSettings';

const WorkspaceSettingsPage = () => {
  const [activeTab, setActiveTab] = useState('company-profile');

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Ustawienia workspace</h1>
          <p className="text-muted-foreground">
            Zarządzaj ustawieniami swojego workspace i dostosuj go do potrzeb zespołu.
          </p>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <div className="flex flex-col md:flex-row gap-6 w-full">
            <div className="md:sticky md:top-6 md:self-start">
              <TabsList className="flex flex-col h-auto bg-card p-1 mb-2 rounded-md border border-border w-full md:w-64 shrink-0">
                <TabsTrigger 
                  value="company-profile" 
                  className="w-full justify-start gap-3 px-4 py-3 h-auto text-start mb-1 rounded-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Building2 className="h-5 w-5" />
                  <div className="flex-1">
                    <span className="font-medium">Profil firmy</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </TabsTrigger>
                <TabsTrigger 
                  value="branding" 
                  className="w-full justify-start gap-3 px-4 py-3 h-auto text-start mb-1 rounded-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Palette className="h-5 w-5" />
                  <div className="flex-1">
                    <span className="font-medium">Branding</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </TabsTrigger>
                <TabsTrigger 
                  value="integrations" 
                  className="w-full justify-start gap-3 px-4 py-3 h-auto text-start mb-1 rounded-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <LinkIcon className="h-5 w-5" />
                  <div className="flex-1">
                    <span className="font-medium">Integracje</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </TabsTrigger>
                <TabsTrigger 
                  value="billing" 
                  className="w-full justify-start gap-3 px-4 py-3 h-auto text-start mb-1 rounded-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <CreditCard className="h-5 w-5" />
                  <div className="flex-1">
                    <span className="font-medium">Płatności i subskrypcja</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </TabsTrigger>
                <TabsTrigger 
                  value="team" 
                  className="w-full justify-start gap-3 px-4 py-3 h-auto text-start mb-1 rounded-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Users className="h-5 w-5" />
                  <div className="flex-1">
                    <span className="font-medium">Zespół i uprawnienia</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="w-full justify-start gap-3 px-4 py-3 h-auto text-start mb-1 rounded-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Bell className="h-5 w-5" />
                  <div className="flex-1">
                    <span className="font-medium">Powiadomienia</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </TabsTrigger>
                <TabsTrigger 
                  value="security" 
                  className="w-full justify-start gap-3 px-4 py-3 h-auto text-start mb-1 rounded-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Lock className="h-5 w-5" />
                  <div className="flex-1">
                    <span className="font-medium">Bezpieczeństwo</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </TabsTrigger>
                <TabsTrigger 
                  value="data-management" 
                  className="w-full justify-start gap-3 px-4 py-3 h-auto text-start mb-1 rounded-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  <Database className="h-5 w-5" />
                  <div className="flex-1">
                    <span className="font-medium">Zarządzanie danymi</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </TabsTrigger>
                <TabsTrigger 
                  value="danger-zone" 
                  className="w-full justify-start gap-3 px-4 py-3 h-auto text-start mb-1 rounded-sm data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground"
                >
                  <Trash2 className="h-5 w-5" />
                  <div className="flex-1">
                    <span className="font-medium">Strefa zagrożenia</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="flex-1 p-6 bg-card rounded-md border border-border shadow-sm">
              <TabsContent value="company-profile" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <CompanyProfileSettings />
              </TabsContent>
              <TabsContent value="branding" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <BrandingSettings />
              </TabsContent>
              <TabsContent value="integrations" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <IntegrationsSettings />
              </TabsContent>
              <TabsContent value="billing" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <BillingSettings />
              </TabsContent>
              <TabsContent value="team" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <TeamSettings />
              </TabsContent>
              <TabsContent value="notifications" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <NotificationsSettings />
              </TabsContent>
              <TabsContent value="security" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <SecuritySettings />
              </TabsContent>
              <TabsContent value="data-management" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <DataManagementSettings />
              </TabsContent>
              <TabsContent value="danger-zone" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
                <DangerZoneSettings />
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default WorkspaceSettingsPage;
