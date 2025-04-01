
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Briefcase } from 'lucide-react';

interface CampaignActionsProps {
  selectedCandidates: string[];
  campaignName: string;
  setCampaignName: (name: string) => void;
  campaignDescription: string;
  setCampaignDescription: (desc: string) => void;
  createCampaign: () => void;
}

const CampaignActions: React.FC<CampaignActionsProps> = ({
  selectedCandidates,
  campaignName,
  setCampaignName,
  campaignDescription,
  setCampaignDescription,
  createCampaign
}) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Akcje dla wybranych kandydatów</CardTitle>
        <CardDescription>
          Wybierz co najmniej jednego kandydata z wyników, aby wykonać akcje
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="space-y-4 flex-1">
          <div>
            <Label htmlFor="campaign-name">Nazwa kampanii rekrutacyjnej</Label>
            <Input 
              id="campaign-name"
              placeholder="Np. Frontend Developer - maj 2023"
              className="mt-2"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="campaign-desc">Opis kampanii (opcjonalnie)</Label>
            <Textarea 
              id="campaign-desc"
              placeholder="Krótki opis kampanii rekrutacyjnej..."
              className="mt-2"
              value={campaignDescription}
              onChange={(e) => setCampaignDescription(e.target.value)}
            />
          </div>
        </div>
          
        <div className="flex flex-col space-y-2 mt-4">
          <Button 
            onClick={createCampaign} 
            disabled={selectedCandidates.length === 0}
            variant="outline"
          >
            <Briefcase className="mr-2 h-4 w-4" />
            Utwórz kampanię ({selectedCandidates.length})
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaignActions;
