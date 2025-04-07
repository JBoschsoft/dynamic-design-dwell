
import React from 'react';
import { 
  Button, 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui';
import { Campaign } from './types';
import { useToast } from '@/hooks/use-toast';
import StatusBadge from './StatusBadge';

interface BulkActionsProps {
  selectedCampaigns: string[];
  setSelectedCampaigns: React.Dispatch<React.SetStateAction<string[]>>;
}

const BulkActions: React.FC<BulkActionsProps> = ({ selectedCampaigns, setSelectedCampaigns }) => {
  const { toast } = useToast();
  
  const handleChangeStatus = (newStatus: Campaign['status']) => {
    if (selectedCampaigns.length === 0) return;
    
    // Here you would make an API call to update the campaigns statuses
    toast({
      title: "Status zaktualizowany",
      description: `Zmieniono status ${selectedCampaigns.length} kampanii`
    });
    
    // Clear selection after action
    setSelectedCampaigns([]);
  };

  return (
    <div className="flex items-center gap-2 ml-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            Zmień status
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="min-w-[180px]">
          <DropdownMenuItem onClick={() => handleChangeStatus('active')}>
            <StatusBadge status="active" />
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleChangeStatus('paused')}>
            <StatusBadge status="paused" />
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleChangeStatus('draft')}>
            <StatusBadge status="draft" />
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleChangeStatus('closed')}>
            <StatusBadge status="closed" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default BulkActions;
