
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, CheckSquare } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import PaginationControls from '../../candidates/PaginationControls';

interface Candidate {
  id: string;
  name: string;
  relevance: number;
  skills: string[];
}

interface SearchResultsProps {
  searchResults: Candidate[];
  isSearching: boolean;
  selectedCandidates: string[];
  currentPage: number;
  pageSize: number;
  lastViewedCandidateId: string | null;
  toggleCandidateSelection: (id: string) => void;
  navigateToCandidateProfile: (candidateId: string) => void;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (size: string) => void;
  selectAllCandidates?: () => void;
  deselectAllCandidates?: () => void;
  areAllSelected?: boolean;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  searchResults,
  isSearching,
  selectedCandidates,
  currentPage,
  pageSize,
  lastViewedCandidateId,
  toggleCandidateSelection,
  navigateToCandidateProfile,
  handlePageChange,
  handlePageSizeChange,
  selectAllCandidates,
  deselectAllCandidates,
  areAllSelected
}) => {
  // Calculate pagination values
  const totalResults = searchResults.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalResults);
  const currentResults = searchResults.slice(startIndex, endIndex);
  
  // Handle select all toggle
  const handleSelectAllToggle = () => {
    if (areAllSelected) {
      deselectAllCandidates?.();
    } else {
      selectAllCandidates?.();
    }
  };

  // Handle row click
  const handleRowClick = (id: string, e: React.MouseEvent) => {
    // Only toggle if the click didn't originate from the button area
    if (!(e.target instanceof HTMLElement && e.target.closest('.profile-button'))) {
      toggleCandidateSelection(id);
    }
  };

  // Scroll into view for last viewed candidate when results load
  React.useEffect(() => {
    if (lastViewedCandidateId && searchResults.length > 0) {
      const candidateElement = document.getElementById(`candidate-${lastViewedCandidateId}`);
      if (candidateElement) {
        setTimeout(() => {
          candidateElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [lastViewedCandidateId, searchResults, currentResults]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Wyniki wyszukiwania</CardTitle>
            <CardDescription>
              {searchResults.length 
                ? `Znaleziono ${searchResults.length} kandydatów pasujących do Twoich kryteriów.` 
                : "Użyj formularza powyżej, aby wyszukać kandydatów."}
            </CardDescription>
          </div>
          {searchResults.length > 0 && (
            <div className="flex items-center gap-2">
              <Checkbox 
                id="select-all" 
                checked={areAllSelected} 
                onCheckedChange={handleSelectAllToggle}
              />
              <label htmlFor="select-all" className="text-sm cursor-pointer">
                Zaznacz wszystkich
              </label>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {searchResults.length === 0 && !isSearching ? (
          <div className="text-center py-8">
            <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Wpisz kryteria wyszukiwania i kliknij "Wyszukaj kandydatów", aby znaleźć pasujących kandydatów.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {currentResults.map(candidate => (
              <div 
                key={candidate.id}
                id={`candidate-${candidate.id}`}
                className={`p-4 border rounded-lg flex items-start justify-between transition-colors cursor-pointer ${
                  selectedCandidates.includes(candidate.id) ? 'bg-primary/5 border-primary/30' : ''
                } ${lastViewedCandidateId === candidate.id ? 'ring-2 ring-primary/50' : ''}`}
                onClick={(e) => handleRowClick(candidate.id, e)}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={selectedCandidates.includes(candidate.id)}
                      onCheckedChange={() => toggleCandidateSelection(candidate.id)}
                      className="mr-1"
                      onClick={(e) => e.stopPropagation()} // Prevent row click from firing
                    />
                    <h3 className="font-medium">{candidate.name}</h3>
                    <Badge>{Math.round(candidate.relevance * 100)}% zgodności</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {candidate.skills.map((skill: string) => (
                      <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 profile-button">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToCandidateProfile(candidate.id);
                    }}
                    className="profile-button"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Profil
                  </Button>
                </div>
              </div>
            ))}
            
            {/* Pagination controls */}
            {searchResults.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <PaginationControls
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                  startIndex={startIndex}
                  endIndex={endIndex}
                  totalCandidates={totalResults}
                  pageSize={pageSize}
                  onPageSizeChange={handlePageSizeChange}
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchResults;
