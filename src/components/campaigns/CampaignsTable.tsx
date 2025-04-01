
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CampaignsTableProps, Campaign } from './types';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';
import { MoreVertical, Edit, Trash2, Copy, Eye, Archive } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';

const CampaignsTable: React.FC<CampaignsTableProps> = ({ 
  campaigns, 
  allCampaigns,
  onEditCampaign,
  onDeleteCampaign
}) => {
  const navigate = useNavigate();
  
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
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '–';
    return format(parseISO(dateString), 'd MMM yyyy', { locale: pl });
  };
  
  const handleViewCampaign = (id: string) => {
    navigate(`/dashboard/campaigns/${id}`);
  };
  
  const handleDuplicateCampaign = (id: string) => {
    // Implementation will be added later
    console.log('Duplicate campaign:', id);
  };

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          {allCampaigns.length === 0 
            ? "Nie masz jeszcze żadnych kampanii rekrutacyjnych. Kliknij 'Dodaj kampanię', aby utworzyć pierwszą!"
            : "Brak wyników dla podanych kryteriów wyszukiwania."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nazwa kampanii</TableHead>
            <TableHead>Stanowisko</TableHead>
            <TableHead>Dział</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Data rozpoczęcia</TableHead>
            <TableHead>Data zakończenia</TableHead>
            <TableHead>Lokalizacja</TableHead>
            <TableHead className="text-center">Kandydaci</TableHead>
            <TableHead className="w-[80px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => (
            <TableRow 
              key={campaign.id}
              className="cursor-pointer"
              onClick={() => handleViewCampaign(campaign.id)}
            >
              <TableCell className="font-medium">{campaign.name}</TableCell>
              <TableCell>{campaign.position}</TableCell>
              <TableCell>{campaign.department}</TableCell>
              <TableCell>{getStatusBadge(campaign.status)}</TableCell>
              <TableCell>{formatDate(campaign.startDate)}</TableCell>
              <TableCell>{formatDate(campaign.endDate)}</TableCell>
              <TableCell>{campaign.location}</TableCell>
              <TableCell className="text-center">{campaign.candidatesCount}</TableCell>
              <TableCell className="text-right p-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      handleViewCampaign(campaign.id);
                    }}>
                      <Eye className="mr-2 h-4 w-4" />
                      <span>Szczegóły</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onEditCampaign(campaign.id);
                    }}>
                      <Edit className="mr-2 h-4 w-4" />
                      <span>Edytuj</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicateCampaign(campaign.id);
                    }}>
                      <Copy className="mr-2 h-4 w-4" />
                      <span>Duplikuj</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive" 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCampaign(campaign.id);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      <span>Usuń</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CampaignsTable;
