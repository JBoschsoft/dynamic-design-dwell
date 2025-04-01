import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { CandidateTableProps } from './types';
import { formatDate } from './utils';
import { useNavigate } from 'react-router-dom';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Button,
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui';
import { Users, Briefcase } from 'lucide-react';

const CandidatesTable: React.FC<CandidateTableProps> = ({ candidates, allCandidates }) => {
  const navigate = useNavigate();
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  
  const handleRowDoubleClick = (candidateId: string) => {
    navigate(`/dashboard/candidates/${candidateId}`);
  };

  const handleCheckboxChange = (candidateId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedCandidates(prev => [...prev, candidateId]);
    } else {
      setSelectedCandidates(prev => prev.filter(id => id !== candidateId));
    }
  };

  const handleSelectAllChange = (isChecked: boolean) => {
    if (isChecked) {
      const idsToSelect = allCandidates ? allCandidates.map(candidate => candidate.id) : candidates.map(candidate => candidate.id);
      setSelectedCandidates(idsToSelect);
    } else {
      setSelectedCandidates([]);
    }
  };

  const areAllCurrentPageCandidatesSelected = 
    candidates.length > 0 && 
    candidates.every(candidate => selectedCandidates.includes(candidate.id));
  
  const areAllCandidatesSelected = allCandidates
    ? allCandidates.length > 0 && selectedCandidates.length === allCandidates.length
    : areAllCurrentPageCandidatesSelected;
    
  const areSomeCandidatesSelected = selectedCandidates.length > 0 && !areAllCandidatesSelected;

  const indeterminateClass = areSomeCandidatesSelected 
    ? "data-[state=indeterminate]:bg-primary/50 data-[state=indeterminate]:opacity-100" 
    : "";

  return (
    <div className="rounded-md border">
      {selectedCandidates.length > 0 && (
        <div className="bg-muted/80 p-2 border-b flex items-center gap-2">
          <span className="text-sm font-medium">
            {selectedCandidates.length} zaznaczonych
          </span>
          
          <div className="flex items-center gap-2 ml-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>Przypisz właściciela</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56">
                <div className="space-y-2">
                  <h4 className="font-medium">Wybierz właściciela</h4>
                  <p className="text-xs text-muted-foreground">To be implemented</p>
                </div>
              </PopoverContent>
            </Popover>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  <span>Dodaj do kampanii</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56">
                <div className="space-y-2">
                  <h4 className="font-medium">Wybierz kampanię</h4>
                  <p className="text-xs text-muted-foreground">To be implemented</p>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox 
                checked={areAllCandidatesSelected}
                onCheckedChange={handleSelectAllChange}
                aria-label="Zaznacz wszystkich kandydatów"
                data-state={areSomeCandidatesSelected ? "indeterminate" : areAllCandidatesSelected ? "checked" : "unchecked"}
                className={indeterminateClass}
              />
            </TableHead>
            <TableHead>Nazwa</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefon</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidates.length > 0 ? (
            candidates.map((candidate) => (
              <TableRow 
                key={candidate.id} 
                className="cursor-pointer hover:bg-muted/50"
                onDoubleClick={() => handleRowDoubleClick(candidate.id)}
              >
                <TableCell className="w-12">
                  <Checkbox 
                    checked={selectedCandidates.includes(candidate.id)}
                    onCheckedChange={(checked) => handleCheckboxChange(candidate.id, !!checked)}
                    aria-label={`Zaznacz kandydata ${candidate.firstName} ${candidate.lastName}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{`${candidate.firstName} ${candidate.lastName}`}</TableCell>
                <TableCell>{candidate.email}</TableCell>
                <TableCell>{candidate.phone}</TableCell>
                <TableCell>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${candidate.stage === 'Nowy' ? 'bg-blue-100 text-blue-800' : ''}
                    ${candidate.stage === 'Screening' ? 'bg-purple-100 text-purple-800' : ''}
                    ${candidate.stage === 'Wywiad' ? 'bg-amber-100 text-amber-800' : ''}
                    ${candidate.stage === 'Oferta' ? 'bg-green-100 text-green-800' : ''}
                    ${candidate.stage === 'Zatrudniony' ? 'bg-emerald-100 text-emerald-800' : ''}
                    ${candidate.stage === 'Odrzucony' ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {candidate.stage}
                  </div>
                </TableCell>
                <TableCell>{formatDate(candidate.appliedAt)}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Brak wyników dla podanych kryteriów wyszukiwania.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CandidatesTable;
