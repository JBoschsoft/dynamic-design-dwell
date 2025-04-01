
import React, { useState } from 'react';
import { Input, Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui';
import { Search, Filter, UserPlus, X, Briefcase, Users, Calendar, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import CandidateForm from './CandidateForm';
import { Candidate } from './types';
import { mockCandidates } from './mockData';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface CandidatesSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onCandidateAdded?: () => void;
}

const CandidatesSearch: React.FC<CandidatesSearchProps> = ({ 
  searchQuery, 
  onSearchChange,
  onCandidateAdded
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showAddCandidateForm, setShowAddCandidateForm] = useState(false);
  const [showVectorSearch, setShowVectorSearch] = useState(false);
  const [showCampaignDialog, setShowCampaignDialog] = useState(false);
  const [advancedQuery, setAdvancedQuery] = useState('');
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const navigate = useNavigate();
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  
  const handleAddCandidate = () => {
    setShowAddCandidateForm(true);
  };
  
  const handleVectorSearch = () => {
    if (!advancedQuery.trim()) {
      toast({
        title: "Błąd wyszukiwania",
        description: "Podaj kryteria wyszukiwania",
        variant: "destructive"
      });
      return;
    }
    
    setIsSearching(true);
    
    // In a real implementation, this would be a call to a vector search endpoint
    // For now, we'll simulate a search with a timeout
    setTimeout(() => {
      toast({
        title: "Wyszukiwanie zakończone",
        description: `Znaleziono ${Math.floor(Math.random() * 10) + 1} pasujących kandydatów.`,
      });
      setIsSearching(false);
    }, 1500);
  };
  
  const handleCandidateSubmit = (candidateData: Omit<Candidate, 'id'>) => {
    // In a real application, this would be an API call
    const newCandidate: Candidate = {
      id: uuidv4(),
      ...candidateData
    };
    
    // Add to mock data (in a real app, this would be an API call)
    mockCandidates.unshift(newCandidate);
    
    // Close the form
    setShowAddCandidateForm(false);
    
    // Notify parent component to refresh the list
    if (onCandidateAdded) {
      onCandidateAdded();
    }
    
    toast({
      title: "Kandydat dodany",
      description: `${newCandidate.firstName} ${newCandidate.lastName} został dodany do systemu.`,
    });
    
    // Navigate to candidate details page
    navigate(`/dashboard/candidates/${newCandidate.id}`);
  };
  
  const applyFilters = () => {
    toast({
      title: "Filtry zastosowane",
      description: "Lista kandydatów została odfiltrowana."
    });
    
    // In a real application, we would apply these filters to a query
    console.log("Applied filters:", { statusFilter, sourceFilter, dateFromFilter, dateToFilter });
  };
  
  const resetFilters = () => {
    setStatusFilter('');
    setSourceFilter('');
    setDateFromFilter('');
    setDateToFilter('');
    
    toast({
      title: "Filtry zresetowane",
      description: "Wszystkie filtry zostały usunięte."
    });
  };

  const createCampaign = () => {
    if (!campaignName) {
      toast({
        title: "Brak nazwy kampanii",
        description: "Podaj nazwę kampanii",
        variant: "destructive"
      });
      return;
    }
    
    if (selectedCandidates.length === 0) {
      toast({
        title: "Brak wybranych kandydatów",
        description: "Wybierz co najmniej jednego kandydata",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, this would create a campaign in the database
    toast({
      title: "Kampania utworzona",
      description: `Kampania "${campaignName}" z ${selectedCandidates.length} kandydatami została utworzona.`
    });
    
    setShowCampaignDialog(false);
    setCampaignName('');
    setCampaignDescription('');
    setSelectedCandidates([]);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Szukaj kandydatów..." 
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                <span>Filtry</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Filtruj kandydatów</DialogTitle>
                <DialogDescription>
                  Wybierz kryteria filtrowania listy kandydatów.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <select 
                    id="status" 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Wszystkie</option>
                    <option value="Nowy">Nowy</option>
                    <option value="Screening">Screening</option>
                    <option value="Wywiad">Wywiad</option>
                    <option value="Oferta">Oferta</option>
                    <option value="Zatrudniony">Zatrudniony</option>
                    <option value="Odrzucony">Odrzucony</option>
                  </select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="source">Źródło</Label>
                  <select 
                    id="source"
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Wszystkie</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="Strona firmowa">Strona firmowa</option>
                    <option value="Polecenie">Polecenie</option>
                    <option value="Teamtailor">Teamtailor</option>
                    <option value="eRecruiter">eRecruiter</option>
                    <option value="Inne">Inne</option>
                  </select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="date-from">Data aplikacji (od)</Label>
                  <Input 
                    id="date-from" 
                    type="date" 
                    value={dateFromFilter}
                    onChange={(e) => setDateFromFilter(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="date-to">Data aplikacji (do)</Label>
                  <Input 
                    id="date-to" 
                    type="date"
                    value={dateToFilter}
                    onChange={(e) => setDateToFilter(e.target.value)}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={resetFilters}>
                  Resetuj
                </Button>
                <Button onClick={applyFilters}>
                  Zastosuj filtry
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showVectorSearch} onOpenChange={setShowVectorSearch}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Search className="h-4 w-4" />
                <span>Wyszukiwanie zaawansowane</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Wyszukiwanie zaawansowane</DialogTitle>
                <DialogDescription>
                  Opisz dokładnie jakiego kandydata szukasz. System wykorzysta wyszukiwanie wektorowe aby znaleźć najbardziej pasujących kandydatów.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="search-query">Kryteria wyszukiwania</Label>
                  <Textarea 
                    id="search-query" 
                    placeholder="Np. Doświadczony programista Java z minimum 5 lat doświadczenia, znający Spring Boot i Kubernetes, pracujący w metodyce Agile, biegle mówiący po angielsku..."
                    value={advancedQuery}
                    onChange={(e) => setAdvancedQuery(e.target.value)}
                    className="min-h-[120px]"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label>Przykładowe frazy</Label>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="cursor-pointer" onClick={() => setAdvancedQuery(prev => prev + " Senior React Developer")}>Senior React Developer</Badge>
                    <Badge variant="outline" className="cursor-pointer" onClick={() => setAdvancedQuery(prev => prev + " 3+ lata doświadczenia")}>3+ lata doświadczenia</Badge>
                    <Badge variant="outline" className="cursor-pointer" onClick={() => setAdvancedQuery(prev => prev + " TypeScript")}>TypeScript</Badge>
                    <Badge variant="outline" className="cursor-pointer" onClick={() => setAdvancedQuery(prev => prev + " biegły angielski")}>biegły angielski</Badge>
                    <Badge variant="outline" className="cursor-pointer" onClick={() => setAdvancedQuery(prev => prev + " zarządzanie zespołem")}>zarządzanie zespołem</Badge>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowVectorSearch(false)}>
                  Anuluj
                </Button>
                <Button onClick={handleVectorSearch} disabled={isSearching}>
                  {isSearching ? 'Wyszukiwanie...' : 'Znajdź kandydatów'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showCampaignDialog} onOpenChange={setShowCampaignDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Briefcase className="h-4 w-4" />
                <span>Utwórz kampanię</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nowa kampania rekrutacyjna</DialogTitle>
                <DialogDescription>
                  Utwórz nową kampanię rekrutacyjną i dodaj do niej wybranych kandydatów.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="campaign-name">Nazwa kampanii</Label>
                  <Input 
                    id="campaign-name" 
                    placeholder="Np. Rekrutacja Frontend Developer Q2 2023"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="campaign-description">Opis kampanii (opcjonalnie)</Label>
                  <Textarea 
                    id="campaign-description" 
                    placeholder="Krótki opis kampanii rekrutacyjnej..."
                    value={campaignDescription}
                    onChange={(e) => setCampaignDescription(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label>Wybrani kandydaci (0)</Label>
                  <div className="border rounded-md p-2 min-h-[100px] max-h-[200px] overflow-y-auto">
                    <p className="text-sm text-muted-foreground">
                      Zaznacz kandydatów na liście, aby dodać ich do kampanii.
                    </p>
                  </div>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCampaignDialog(false)}>
                  Anuluj
                </Button>
                <Button onClick={createCampaign}>
                  Utwórz kampanię
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button size="sm" className="gap-2" onClick={handleAddCandidate}>
            <UserPlus className="h-4 w-4" />
            <span>Dodaj kandydata</span>
          </Button>
        </div>
      </div>
      
      <CandidateForm 
        isOpen={showAddCandidateForm} 
        onClose={() => setShowAddCandidateForm(false)} 
        onSubmit={handleCandidateSubmit} 
      />
    </div>
  );
};

export default CandidatesSearch;
