
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
import { Search, Eye } from 'lucide-react';

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
  toggleCandidateSelection: (id: string) => void;
  navigateToCandidateProfile: (candidateId: string) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({
  searchResults,
  isSearching,
  selectedCandidates,
  toggleCandidateSelection,
  navigateToCandidateProfile
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Wyniki wyszukiwania</CardTitle>
        <CardDescription>
          {searchResults.length 
            ? `Znaleziono ${searchResults.length} kandydatów pasujących do Twoich kryteriów.` 
            : "Użyj formularza powyżej, aby wyszukać kandydatów."}
        </CardDescription>
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
            {searchResults.map(candidate => (
              <div 
                key={candidate.id}
                className={`p-4 border rounded-lg flex items-start justify-between transition-colors ${
                  selectedCandidates.includes(candidate.id) ? 'bg-primary/5 border-primary/30' : ''
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{candidate.name}</h3>
                    <Badge>{Math.round(candidate.relevance * 100)}% zgodności</Badge>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {candidate.skills.map((skill: string) => (
                      <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => navigateToCandidateProfile(candidate.id)}>
                    <Eye className="h-4 w-4 mr-1" />
                    Profil
                  </Button>
                  <Button 
                    variant={selectedCandidates.includes(candidate.id) ? "default" : "outline"} 
                    size="sm"
                    onClick={() => toggleCandidateSelection(candidate.id)}
                  >
                    {selectedCandidates.includes(candidate.id) ? 'Wybrano' : 'Wybierz'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SearchResults;
