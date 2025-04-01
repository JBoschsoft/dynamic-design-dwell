
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

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
  const examplePhrases = [
    "Senior React Developer",
    "3+ lata doświadczenia",
    "TypeScript",
    "biegły angielski", 
    "zarządzanie zespołem"
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kryteria wyszukiwania</CardTitle>
        <CardDescription>
          Opisz szczegółowo jakiego kandydata szukasz, uwzględniając umiejętności, doświadczenie i inne wymagania.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="vector-search">Opis wymagań</Label>
            <Textarea 
              id="vector-search"
              placeholder="Np. Doświadczony programista React z 3+ lat doświadczenia w TypeScript, znajomością Next.js, zarządzaniem stanem za pomocą Redux i doświadczeniem w testowaniu z Jest i Cypress..."
              className="min-h-[150px] mt-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div>
            <Label>Przykładowe frazy</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {examplePhrases.map((phrase, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className="cursor-pointer" 
                  onClick={() => setSearchQuery(prev => prev + " " + phrase)}
                >
                  {phrase}
                </Badge>
              ))}
            </div>
          </div>
          
          <Button onClick={handleSearch} disabled={isSearching} className="w-full">
            <Search className="mr-2 h-4 w-4" />
            {isSearching ? 'Wyszukiwanie...' : 'Wyszukaj kandydatów'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchCriteria;
