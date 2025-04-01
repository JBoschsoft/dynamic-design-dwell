
import React from 'react';
import CompanyProfileSettings from '@/components/settings/CompanyProfileSettings';
import BrandingSettings from '@/components/settings/BrandingSettings';
import IntegrationsSettings from '@/components/settings/IntegrationsSettings';
import BillingSettings from '@/components/settings/BillingSettings';
import TeamSettings from '@/components/settings/TeamSettings';
import NotificationsSettings from '@/components/settings/NotificationsSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import DataManagementSettings from '@/components/settings/DataManagementSettings';
import DangerZoneSettings from '@/components/settings/DangerZoneSettings';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

const WorkspaceSettingsPage = () => {
  const [searchParams] = useSearchParams();
  const sectionId = searchParams.get('section');
  
  // Scroll to the specific section when the URL changes
  useEffect(() => {
    if (sectionId) {
      const element = document.getElementById(sectionId);
      if (element) {
        // Add a small delay to ensure the DOM is fully rendered
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    } else {
      // Scroll to top if no section specified
      window.scrollTo(0, 0);
    }
  }, [sectionId]);

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Ustawienia workspace</h1>
          <p className="text-muted-foreground">
            Zarządzaj ustawieniami swojego workspace i dostosuj go do potrzeb zespołu.
          </p>
        </div>

        <div className="space-y-12">
          {/* Company Profile Section */}
          <section id="company-profile" className="bg-card rounded-md border border-border shadow-sm p-6">
            <CompanyProfileSettings />
          </section>
          
          {/* Branding Section */}
          <section id="branding" className="bg-card rounded-md border border-border shadow-sm p-6">
            <BrandingSettings />
          </section>
          
          {/* Integrations Section */}
          <section id="integrations" className="bg-card rounded-md border border-border shadow-sm p-6">
            <IntegrationsSettings />
          </section>
          
          {/* Billing Section */}
          <section id="billing" className="bg-card rounded-md border border-border shadow-sm p-6">
            <BillingSettings />
          </section>
          
          {/* Team Section */}
          <section id="team" className="bg-card rounded-md border border-border shadow-sm p-6">
            <TeamSettings />
          </section>
          
          {/* Notifications Section */}
          <section id="notifications" className="bg-card rounded-md border border-border shadow-sm p-6">
            <NotificationsSettings />
          </section>
          
          {/* Security Section */}
          <section id="security" className="bg-card rounded-md border border-border shadow-sm p-6">
            <SecuritySettings />
          </section>
          
          {/* Data Management Section */}
          <section id="data-management" className="bg-card rounded-md border border-border shadow-sm p-6">
            <DataManagementSettings />
          </section>
          
          {/* Danger Zone Section */}
          <section id="danger-zone" className="bg-card rounded-md border border-border shadow-sm p-6">
            <DangerZoneSettings />
          </section>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceSettingsPage;
