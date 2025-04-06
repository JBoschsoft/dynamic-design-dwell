
import React from 'react';
import { 
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  Badge
} from '@/components/ui';
import { Users, Mail } from 'lucide-react';
import { Campaign } from '@/components/campaigns/types';
import { format, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';

interface CampaignStatusCardProps {
  campaign: Campaign;
  candidatesCount: number;
}

const CampaignStatusCard: React.FC<CampaignStatusCardProps> = ({ campaign, candidatesCount }) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nie określono';
    return format(parseISO(dateString), 'd MMMM yyyy', { locale: pl });
  };
  
  const getStatusBadge = (status: Campaign['status']) => {
    switch(status) {
      case 'active':
        return <Badge className="bg-green-500">Aktywna</Badge>;
      case 'draft':
        return <Badge variant="outline">Szkic</Badge>;
      case 'closed':
        return <Badge variant="secondary">Zakończona</Badge>;
      case 'paused':
        return <Badge variant="destructive">Wstrzymana</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Status kampanii</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium">Status</div>
          <div>{getStatusBadge(campaign.status)}</div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium">Kandydaci</div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            <span>{candidatesCount}</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium">Hiring Manager</div>
          <div className="flex items-center text-sm">
            <Mail className="h-4 w-4 mr-1 text-muted-foreground" />
            <span>{campaign.owner || 'Nie przypisano'}</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium">Data utworzenia</div>
          <div className="text-sm">{formatDate(campaign.createdAt)}</div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium">Ostatnia aktualizacja</div>
          <div className="text-sm">{formatDate(campaign.updatedAt)}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaignStatusCard;
