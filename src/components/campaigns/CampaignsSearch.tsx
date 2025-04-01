
import React, { useState } from 'react';
import { CampaignsSearchProps } from './types';
import { 
  Input, 
  Button, 
  Dialog, 
  DialogTrigger, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui';
import { Plus, Search } from 'lucide-react';
import CampaignForm from './CampaignForm';

const CampaignsSearch: React.FC<CampaignsSearchProps> = ({ 
  searchQuery, 
  onSearchChange,
  onCampaignAdded
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCampaignCreated = () => {
    setDialogOpen(false);
    onCampaignAdded();
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 mb-4">
      <div className="relative w-full sm:w-auto sm:flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Szukaj kampanii..."
          className="pl-8 w-full"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Dodaj kampanię
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Utwórz nową kampanię rekrutacyjną</DialogTitle>
            <DialogDescription>
              Wypełnij poniższy formularz, aby utworzyć nową kampanię rekrutacyjną.
              Wszystkie pola oznaczone * są wymagane.
            </DialogDescription>
          </DialogHeader>
          
          <CampaignForm 
            onSubmit={handleCampaignCreated} 
            onCancel={() => setDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CampaignsSearch;
