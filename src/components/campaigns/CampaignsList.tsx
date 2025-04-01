
import React, { useState } from 'react';
import { CampaignsListProps, Campaign } from './types';
import { mockCampaigns } from './mockData';
import CampaignsSearch from './CampaignsSearch';
import CampaignsTable from './CampaignsTable';
import PaginationControls from './PaginationControls';
import CampaignForm from './CampaignForm';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui';
import { useToast } from '@/hooks/use-toast';

const CampaignsList: React.FC<CampaignsListProps> = ({ refreshTrigger }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshList, setRefreshList] = useState(0);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Filter campaigns based on search query
  const filteredCampaigns = mockCampaigns.filter(campaign => {
    const searchFields = [
      campaign.name.toLowerCase(),
      campaign.position.toLowerCase(),
      campaign.department.toLowerCase(),
      campaign.location.toLowerCase()
    ].join(' ');
    
    return searchFields.includes(searchQuery.toLowerCase());
  });
  
  // Calculate pagination
  const totalCampaigns = filteredCampaigns.length;
  const totalPages = Math.ceil(totalCampaigns / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCampaigns);
  const paginatedCampaigns = filteredCampaigns.slice(startIndex, endIndex);

  const handlePageSizeChange = (value: string) => {
    const newPageSize = parseInt(value);
    setPageSize(newPageSize);
    // Reset to first page when changing page size
    setCurrentPage(1);
  };
  
  const handleCampaignAdded = () => {
    setRefreshList(prev => prev + 1);
    setCurrentPage(1); // Go to first page to see the new campaign
    toast({
      title: "Kampania utworzona",
      description: "Nowa kampania rekrutacyjna została pomyślnie utworzona.",
    });
  };
  
  const handleEditCampaign = (id: string) => {
    setSelectedCampaignId(id);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteCampaign = (id: string) => {
    setSelectedCampaignId(id);
    setIsDeleteDialogOpen(true);
  };
  
  const handleEditSubmit = () => {
    setIsEditDialogOpen(false);
    toast({
      title: "Kampania zaktualizowana",
      description: "Kampania rekrutacyjna została pomyślnie zaktualizowana.",
    });
  };
  
  const handleDeleteConfirm = () => {
    setIsDeleteDialogOpen(false);
    setRefreshList(prev => prev + 1);
    toast({
      title: "Kampania usunięta",
      description: "Kampania rekrutacyjna została pomyślnie usunięta.",
      variant: "destructive",
    });
  };
  
  // Find the selected campaign for editing
  const selectedCampaign = selectedCampaignId
    ? mockCampaigns.find(c => c.id === selectedCampaignId)
    : undefined;

  return (
    <div className="space-y-4">
      <CampaignsSearch 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery}
        onCampaignAdded={handleCampaignAdded}
      />
      
      <CampaignsTable 
        campaigns={paginatedCampaigns} 
        allCampaigns={filteredCampaigns}
        onEditCampaign={handleEditCampaign}
        onDeleteCampaign={handleDeleteCampaign}
      />
      
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        startIndex={startIndex}
        endIndex={endIndex}
        totalCampaigns={totalCampaigns}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
      />
      
      {/* Edit Campaign Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edytuj kampanię rekrutacyjną</DialogTitle>
            <DialogDescription>
              Zaktualizuj szczegóły kampanii rekrutacyjnej.
            </DialogDescription>
          </DialogHeader>
          
          {selectedCampaign && (
            <CampaignForm 
              initialData={{
                name: selectedCampaign.name,
                position: selectedCampaign.position,
                department: selectedCampaign.department,
                location: selectedCampaign.location,
                startDate: new Date(selectedCampaign.startDate),
                endDate: selectedCampaign.endDate ? new Date(selectedCampaign.endDate) : undefined,
                status: selectedCampaign.status,
                description: selectedCampaign.description,
                requirements: selectedCampaign.requirements,
                responsibilities: selectedCampaign.responsibilities,
              }}
              onSubmit={handleEditSubmit} 
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno chcesz usunąć tę kampanię?</AlertDialogTitle>
            <AlertDialogDescription>
              Ta akcja jest nieodwracalna. Spowoduje to trwałe usunięcie kampanii
              rekrutacyjnej i wszystkich powiązanych danych.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CampaignsList;
