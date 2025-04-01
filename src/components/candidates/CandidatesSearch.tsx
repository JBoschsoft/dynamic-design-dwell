import React, { useState } from 'react';
import { Input, Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui';
import { Search, Filter, UserPlus, X } from 'lucide-react';
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
  
  const navigate = useNavigate();
  
  // Filter state
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  
  const handleAddCandidate = () => {
    setShowAddCandidateForm(true);
  };
  
  const handleCandidateSubmit = (candidateData: Omit<Candidate, 'id'>) => {
    const newCandidate: Candidate = {
      id: uuidv4(),
      ...candidateData
    };
    
    mockCandidates.unshift(newCandidate);
    
    setShowAddCandidateForm(false);
    
    if (onCandidateAdded) {
      onCandidateAdded();
    }
    
    toast({
      title: "Kandydat dodany",
      description: `${newCandidate.firstName} ${newCandidate.lastName} został dodany do systemu.`,
    });
    
    navigate(`/dashboard/candidates/${newCandidate.id}`);
  };
  
  const applyFilters = () => {
    toast({
      title: "Filtry zastosowane",
      description: "Lista kandydatów została odfiltrowana."
    });
    
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
