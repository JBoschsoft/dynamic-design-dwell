
import React from 'react';
import { 
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  Separator,
  Badge
} from '@/components/ui';
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  CheckCircle2,
  ClipboardList
} from 'lucide-react';
import { Campaign } from '@/components/campaigns/types';
import { format, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';

interface CampaignInfoProps {
  campaign: Campaign;
}

const CampaignInfo: React.FC<CampaignInfoProps> = ({ campaign }) => {
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
        <CardTitle>Informacje o stanowisku</CardTitle>
        <CardDescription>
          Szczegółowe informacje o stanowisku i wymaganiach
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Briefcase className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Stanowisko</p>
              <p>{campaign.position}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Dział</p>
              <p>{campaign.department}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Lokalizacja</p>
              <p>{campaign.location}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Okres rekrutacji</p>
              <p>{formatDate(campaign.startDate)} - {campaign.endDate ? formatDate(campaign.endDate) : 'Nie określono'}</p>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="font-medium mb-2">Opis stanowiska</h3>
          <p className="text-sm">{campaign.description}</p>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Wymagania</h3>
          <ul className="space-y-1">
            {campaign.requirements.map((req, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h3 className="font-medium mb-2">Obowiązki</h3>
          <ul className="space-y-1">
            {campaign.responsibilities.map((resp, index) => (
              <li key={index} className="flex items-start space-x-2 text-sm">
                <ClipboardList className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>{resp}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaignInfo;
