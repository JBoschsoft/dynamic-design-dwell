
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ReloadIcon } from '@radix-ui/react-icons';

interface SearchCriteriaProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: () => void;
  isSearching: boolean;
}

const SearchCriteria: React.FC<SearchCriteriaProps> = ({
  searchQuery,
  setSearchQuery,
  handleSearch,
  isSearching
}) => {
  // Handle enter key press to submit search
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Kryteria wyszukiwania</CardTitle>
        <CardDescription>
          Opisz szczegółowo jakiego rodzaju kandydatów poszukujesz. Im bardziej szczegółowy opis, tym lepsze wyniki.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-2 flex-1 flex flex-col">
          <Textarea
            placeholder="Np. 'Szukam programisty Java z 5-letnim doświadczeniem w bankowości i znajomością Spring Boot. Kandydat powinien mieć doświadczenie w prowadzeniu zespołu i komunikować się płynnie po angielsku.'"
            className="min-h-[120px] flex-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <p className="text-xs text-muted-foreground">
            Wskazówka: Wyszukiwanie wektorowe znajdzie kandydatów najbardziej pasujących do Twojego opisu, nawet jeśli nie zawierają dokładnie tych samych słów kluczowych.
          </p>
        </div>
        <Button 
          onClick={handleSearch} 
          className="w-full mt-4" 
          disabled={isSearching || !searchQuery.trim()}
        >
          {isSearching ? (
            <>
              <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              Wyszukiwanie...
            </>
          ) : (
            'Wyszukaj kandydatów'
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SearchCriteria;
