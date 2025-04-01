
import React, { useState } from 'react';
import CampaignsList from '@/components/campaigns/CampaignsList';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';

const CampaignsPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kampanie rekrutacyjne</h1>
          <p className="text-muted-foreground">
            Zarządzaj kampaniami rekrutacyjnymi, przeglądaj aktywne procesy i analizuj postępy.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Wszystkie kampanie</CardTitle>
          <CardDescription>
            Przeglądaj, filtruj i zarządzaj kampaniami rekrutacyjnymi w firmie.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CampaignsList refreshTrigger={refreshTrigger} />
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignsPage;
