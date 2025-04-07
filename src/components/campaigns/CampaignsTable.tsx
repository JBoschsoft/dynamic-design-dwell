
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CampaignsTableProps, Campaign } from './types';
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui';
import StatusBadge from './StatusBadge';
import BulkActions from './BulkActions';
import CampaignActions from './CampaignActions';
import DeleteCampaignDialog from './DeleteCampaignDialog';
import { formatDate, SelectAllCheckbox, CampaignCheckbox } from './CampaignsTableHelpers';

const CampaignsTable: React.FC<CampaignsTableProps> = ({ 
  campaigns, 
  allCampaigns,
  onEditCampaign,
  onDeleteCampaign
}) => {
  const navigate = useNavigate();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null);
  
  // Initialize from localStorage instead of empty array
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('selectedCampaigns');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error loading selected campaigns from localStorage:', e);
      return [];
    }
  });
  
  // Save to localStorage whenever selection changes
  useEffect(() => {
    localStorage.setItem('selectedCampaigns', JSON.stringify(selectedCampaigns));
  }, [selectedCampaigns]);
  
  const handleViewCampaign = (id: string) => {
    navigate(`/dashboard/campaigns/${id}`);
  };

  const handleDeleteClick = (id: string) => {
    setCampaignToDelete(id);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = () => {
    if (campaignToDelete) {
      onDeleteCampaign(campaignToDelete);
      setDeleteDialogOpen(false);
      setCampaignToDelete(null);
    }
  };

  const handleCheckboxChange = (campaignId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedCampaigns(prev => [...prev, campaignId]);
    } else {
      setSelectedCampaigns(prev => prev.filter(id => id !== campaignId));
    }
  };

  const handleSelectAllChange = (isChecked: boolean) => {
    if (isChecked) {
      const idsToSelect = allCampaigns ? allCampaigns.map(campaign => campaign.id) : campaigns.map(campaign => campaign.id);
      setSelectedCampaigns(idsToSelect);
    } else {
      setSelectedCampaigns([]);
    }
  };
  
  const areAllCurrentPageCampaignsSelected = 
    campaigns.length > 0 && 
    campaigns.every(campaign => selectedCampaigns.includes(campaign.id));
  
  const areAllCampaignsSelected = allCampaigns
    ? allCampaigns.length > 0 && selectedCampaigns.length === allCampaigns.length
    : areAllCurrentPageCampaignsSelected;
    
  const areSomeCampaignsSelected = selectedCampaigns.length > 0 && !areAllCampaignsSelected;

  const indeterminateClass = areSomeCampaignsSelected 
    ? "data-[state=indeterminate]:bg-primary/50 data-[state=indeterminate]:opacity-100" 
    : "";

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
    <>
      <div className="rounded-md border">
        <div className="bg-muted/80 p-2 border-b flex items-center justify-between h-14">
          <div className="flex items-center gap-2 flex-grow-0">
            {selectedCampaigns.length > 0 ? (
              <span className="text-sm font-medium">
                {selectedCampaigns.length} zaznaczonych
              </span>
            ) : (
              <span className="text-sm font-medium">
                Wybierz kampanie, aby wykonać akcje grupowe
              </span>
            )}
            
            {selectedCampaigns.length > 0 && (
              <BulkActions 
                selectedCampaigns={selectedCampaigns} 
                setSelectedCampaigns={setSelectedCampaigns} 
              />
            )}
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <SelectAllCheckbox
                  checked={areAllCampaignsSelected}
                  indeterminate={areSomeCampaignsSelected}
                  onChange={handleSelectAllChange}
                  indeterminateClass={indeterminateClass}
                />
              </TableHead>
              <TableHead>Nazwa kampanii</TableHead>
              <TableHead>Stanowisko</TableHead>
              <TableHead>Właściciel kampanii</TableHead>
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
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleViewCampaign(campaign.id)}
              >
                <TableCell className="w-12" onClick={(e) => e.stopPropagation()}>
                  <CampaignCheckbox
                    campaignId={campaign.id}
                    isSelected={selectedCampaigns.includes(campaign.id)}
                    onSelectionChange={handleCheckboxChange}
                  />
                </TableCell>
                <TableCell className="font-medium">{campaign.name}</TableCell>
                <TableCell>{campaign.position}</TableCell>
                <TableCell>{campaign.owner || 'Nie przypisano'}</TableCell>
                <TableCell><StatusBadge status={campaign.status} /></TableCell>
                <TableCell>{formatDate(campaign.startDate)}</TableCell>
                <TableCell>{formatDate(campaign.endDate)}</TableCell>
                <TableCell>{campaign.location}</TableCell>
                <TableCell className="text-center">{campaign.candidatesCount}</TableCell>
                <TableCell className="text-right p-0">
                  <CampaignActions
                    campaignId={campaign.id}
                    onEditCampaign={onEditCampaign}
                    onDeleteClick={handleDeleteClick}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DeleteCampaignDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirmDelete={confirmDelete}
      />
    </>
  );
};

export default CampaignsTable;
