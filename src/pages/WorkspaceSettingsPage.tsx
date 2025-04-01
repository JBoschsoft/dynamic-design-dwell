
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
  Trash2
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

        <div className="flex flex-col md:flex-row gap-6">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="w-full"
          >
            <div className="flex flex-col md:flex-row gap-6 w-full">
              <TabsList className="flex flex-col h-auto bg-card p-2 mb-2 rounded-md border border-border w-full md:w-64 shrink-0">
                <TabsTrigger 
                  value="company-profile" 
                  className="w-full justify-start gap-2 px-3 py-2 h-10"
                >
                  <Building2 className="h-4 w-4" />
                  <span>Profil firmy</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="branding" 
                  className="w-full justify-start gap-2 px-3 py-2 h-10"
                >
                  <Palette className="h-4 w-4" />
                  <span>Branding</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="integrations" 
                  className="w-full justify-start gap-2 px-3 py-2 h-10"
                >
                  <LinkIcon className="h-4 w-4" />
                  <span>Integracje</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="billing" 
                  className="w-full justify-start gap-2 px-3 py-2 h-10"
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Płatności i subskrypcja</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="team" 
                  className="w-full justify-start gap-2 px-3 py-2 h-10"
                >
                  <Users className="h-4 w-4" />
                  <span>Zespół i uprawnienia</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="w-full justify-start gap-2 px-3 py-2 h-10"
                >
                  <Bell className="h-4 w-4" />
                  <span>Powiadomienia</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="security" 
                  className="w-full justify-start gap-2 px-3 py-2 h-10"
                >
                  <Lock className="h-4 w-4" />
                  <span>Bezpieczeństwo</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="data-management" 
                  className="w-full justify-start gap-2 px-3 py-2 h-10"
                >
                  <Database className="h-4 w-4" />
                  <span>Zarządzanie danymi</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="danger-zone" 
                  className="w-full justify-start gap-2 px-3 py-2 h-10 text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Strefa zagrożenia</span>
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 p-6 bg-card rounded-md border border-border">
                <TabsContent value="company-profile" className="mt-0">
                  <CompanyProfileSettings />
                </TabsContent>
                <TabsContent value="branding" className="mt-0">
                  <BrandingSettings />
                </TabsContent>
                <TabsContent value="integrations" className="mt-0">
                  <IntegrationsSettings />
                </TabsContent>
                <TabsContent value="billing" className="mt-0">
                  <BillingSettings />
                </TabsContent>
                <TabsContent value="team" className="mt-0">
                  <TeamSettings />
                </TabsContent>
                <TabsContent value="notifications" className="mt-0">
                  <NotificationsSettings />
                </TabsContent>
                <TabsContent value="security" className="mt-0">
                  <SecuritySettings />
                </TabsContent>
                <TabsContent value="data-management" className="mt-0">
                  <DataManagementSettings />
                </TabsContent>
                <TabsContent value="danger-zone" className="mt-0">
                  <DangerZoneSettings />
                </TabsContent>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSettingsPage;
