
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
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Checkbox,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Input,
  Textarea
} from '@/components/ui';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreVertical, Edit, Trash2, Eye, Plus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

const CampaignsTable: React.FC<CampaignsTableProps> = ({ 
  campaigns, 
  allCampaigns,
  onEditCampaign,
  onDeleteCampaign
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
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

  // New campaign creation state
  const [newFolderName, setNewFolderName] = useState("");
  const [newFolderDescription, setNewFolderDescription] = useState("");
  
  // Save to localStorage whenever selection changes
  useEffect(() => {
    localStorage.setItem('selectedCampaigns', JSON.stringify(selectedCampaigns));
  }, [selectedCampaigns]);
  
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
  
  const handleCreateNewFolder = () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Błąd",
        description: "Nazwa folderu jest wymagana",
        variant: "destructive"
      });
      return;
    }
    
    // Here you would make an API call to create the folder
    toast({
      title: "Sukces",
      description: `Utworzono nowy folder "${newFolderName}" z ${selectedCampaigns.length} kampaniami`
    });
    
    // Reset form
    setNewFolderName("");
    setNewFolderDescription("");
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
              <div className="flex items-center gap-2 ml-4">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Plus className="h-4 w-4" />
                      <span>Utwórz folder</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-72">
                    <div className="space-y-4">
                      <h4 className="font-medium">Utwórz nowy folder</h4>
                      
                      <div className="space-y-2">
                        <label htmlFor="folder-name" className="text-sm font-medium">
                          Nazwa folderu
                        </label>
                        <Input 
                          id="folder-name"
                          value={newFolderName}
                          onChange={(e) => setNewFolderName(e.target.value)}
                          placeholder="Wprowadź nazwę folderu"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="folder-description" className="text-sm font-medium">
                          Opis folderu
                        </label>
                        <Textarea 
                          id="folder-description"
                          value={newFolderDescription}
                          onChange={(e) => setNewFolderDescription(e.target.value)}
                          placeholder="Wprowadź opis folderu"
                          rows={3}
                        />
                      </div>
                      
                      <div className="pt-2">
                        <Button onClick={handleCreateNewFolder} className="w-full">
                          Utwórz folder
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            )}
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox 
                  checked={areAllCampaignsSelected}
                  onCheckedChange={handleSelectAllChange}
                  aria-label="Zaznacz wszystkie kampanie"
                  data-state={areSomeCampaignsSelected ? "indeterminate" : areAllCampaignsSelected ? "checked" : "unchecked"}
                  className={indeterminateClass}
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
                  <Checkbox 
                    checked={selectedCampaigns.includes(campaign.id)}
                    onCheckedChange={(checked) => handleCheckboxChange(campaign.id, !!checked)}
                    aria-label={`Zaznacz kampanię ${campaign.name}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{campaign.name}</TableCell>
                <TableCell>{campaign.position}</TableCell>
                <TableCell>{campaign.owner || 'Nie przypisano'}</TableCell>
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
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(campaign.id);
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Potwierdzenie usunięcia</AlertDialogTitle>
            <AlertDialogDescription>
              Czy na pewno chcesz usunąć tę kampanię? Tej operacji nie można cofnąć.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Usuń
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CampaignsTable;
