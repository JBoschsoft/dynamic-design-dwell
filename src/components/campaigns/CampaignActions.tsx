
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from '@/components/ui';
import { MoreVertical, Eye, Edit, Trash2 } from 'lucide-react';

interface CampaignActionsProps {
  campaignId: string;
  onEditCampaign: (id: string) => void;
  onDeleteClick: (id: string) => void;
}

const CampaignActions: React.FC<CampaignActionsProps> = ({ 
  campaignId, 
  onEditCampaign, 
  onDeleteClick 
}) => {
  const navigate = useNavigate();
  
  const handleViewCampaign = () => {
    navigate(`/dashboard/campaigns/${campaignId}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={(e) => {
          e.stopPropagation();
          handleViewCampaign();
        }}>
          <Eye className="mr-2 h-4 w-4" />
          <span>Szczegóły</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => {
          e.stopPropagation();
          onEditCampaign(campaignId);
        }}>
          <Edit className="mr-2 h-4 w-4" />
          <span>Edytuj</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          className="text-destructive focus:text-destructive" 
          onClick={(e) => {
            e.stopPropagation();
            onDeleteClick(campaignId);
          }}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Usuń</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default CampaignActions;
