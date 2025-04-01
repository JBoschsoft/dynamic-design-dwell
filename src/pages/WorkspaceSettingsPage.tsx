
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'company-profile');
  
  // Update active tab when URL changes
  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    } else {
      setActiveTab('company-profile');
    }
  }, [tabFromUrl]);

  // Render the appropriate component based on the active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'branding':
        return <BrandingSettings />;
      case 'integrations':
        return <IntegrationsSettings />;
      case 'billing':
        return <BillingSettings />;
      case 'team':
        return <TeamSettings />;
      case 'notifications':
        return <NotificationsSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'data-management':
        return <DataManagementSettings />;
      case 'danger-zone':
        return <DangerZoneSettings />;
      case 'company-profile':
      default:
        return <CompanyProfileSettings />;
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Ustawienia workspace</h1>
          <p className="text-muted-foreground">
            Zarządzaj ustawieniami swojego workspace i dostosuj go do potrzeb zespołu.
          </p>
        </div>

        <div className="bg-card rounded-md border border-border shadow-sm p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSettingsPage;
