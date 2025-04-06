
import React, { useState } from 'react';
import CampaignsList from '@/components/campaigns/CampaignsList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Toaster } from '@/components/ui/toaster';

const CampaignsPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Kampanie rekrutacyjne</CardTitle>
          <p className="text-muted-foreground text-sm">
            Zarządzaj kampaniami rekrutacyjnymi, przeglądaj aktywne procesy i analizuj postępy.
          </p>
        </CardHeader>
        <CardContent>
          <CampaignsList refreshTrigger={refreshTrigger} />
        </CardContent>
      </Card>
      
      <Toaster />
    </div>
  );
};

export default CampaignsPage;
