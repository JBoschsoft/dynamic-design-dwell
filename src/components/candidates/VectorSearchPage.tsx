
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { Search, Calendar, Briefcase, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const VectorSearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [campaignName, setCampaignName] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Błąd wyszukiwania",
        description: "Podaj kryteria wyszukiwania",
        variant: "destructive"
      });
      return;
    }
    
    setIsSearching(true);
    
    // This would be replaced with an actual API call to a vector search endpoint
    // For now, we'll simulate results
    setTimeout(() => {
      const mockResults = [
        { id: '1', name: 'Jan Kowalski', relevance: 0.92, skills: ['React', 'TypeScript', 'Node.js'] },
        { id: '2', name: 'Anna Nowak', relevance: 0.87, skills: ['JavaScript', 'React', 'CSS'] },
        { id: '3', name: 'Piotr Wiśniewski', relevance: 0.84, skills: ['React', 'Redux', 'GraphQL'] },
        { id: '4', name: 'Karolina Wójcik', relevance: 0.79, skills: ['React', 'NextJS', 'Tailwind'] },
        { id: '5', name: 'Tomasz Kowalczyk', relevance: 0.75, skills: ['Angular', 'TypeScript', 'RxJS'] },
      ];
      
      setSearchResults(mockResults);
      setIsSearching(false);
      
      toast({
        title: "Wyszukiwanie zakończone",
        description: `Znaleziono ${mockResults.length} pasujących kandydatów.`,
      });
    }, 1500);
  };

  const toggleCandidateSelection = (id: string) => {
    setSelectedCandidates(prev => 
      prev.includes(id) 
        ? prev.filter(candidateId => candidateId !== id)
        : [...prev, id]
    );
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
    
    // Reset form
    setCampaignName('');
    setCampaignDescription('');
    setSelectedCandidates([]);
  };

  const setupScreening = () => {
    if (selectedCandidates.length === 0) {
      toast({
        title: "Brak wybranych kandydatów",
        description: "Wybierz co najmniej jednego kandydata",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Akcja w trakcie implementacji",
      description: "Funkcja ustawiania screeningu będzie dostępna wkrótce.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Wyszukiwanie kandydatów</h1>
        <p className="text-muted-foreground">
          Użyj wyszukiwania wektorowego, aby znaleźć idealnie pasujących kandydatów do Twoich wymagań.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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
                  <Badge variant="outline" className="cursor-pointer" onClick={() => setSearchQuery(prev => prev + " Senior React Developer")}>Senior React Developer</Badge>
                  <Badge variant="outline" className="cursor-pointer" onClick={() => setSearchQuery(prev => prev + " 3+ lata doświadczenia")}>3+ lata doświadczenia</Badge>
                  <Badge variant="outline" className="cursor-pointer" onClick={() => setSearchQuery(prev => prev + " TypeScript")}>TypeScript</Badge>
                  <Badge variant="outline" className="cursor-pointer" onClick={() => setSearchQuery(prev => prev + " biegły angielski")}>biegły angielski</Badge>
                  <Badge variant="outline" className="cursor-pointer" onClick={() => setSearchQuery(prev => prev + " zarządzanie zespołem")}>zarządzanie zespołem</Badge>
                </div>
              </div>
              
              <Button onClick={handleSearch} disabled={isSearching} className="w-full">
                <Search className="mr-2 h-4 w-4" />
                {isSearching ? 'Wyszukiwanie...' : 'Wyszukaj kandydatów'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Akcje dla wybranych kandydatów</CardTitle>
            <CardDescription>
              Wybierz co najmniej jednego kandydata z wyników, aby wykonać akcje
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="campaign-name">Nazwa kampanii rekrutacyjnej</Label>
                <Input 
                  id="campaign-name"
                  placeholder="Np. Frontend Developer - maj 2023"
                  className="mt-2"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="campaign-desc">Opis kampanii (opcjonalnie)</Label>
                <Textarea 
                  id="campaign-desc"
                  placeholder="Krótki opis kampanii rekrutacyjnej..."
                  className="mt-2"
                  value={campaignDescription}
                  onChange={(e) => setCampaignDescription(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col space-y-2">
                <Button 
                  onClick={createCampaign} 
                  disabled={selectedCandidates.length === 0}
                  variant="outline"
                >
                  <Briefcase className="mr-2 h-4 w-4" />
                  Utwórz kampanię ({selectedCandidates.length})
                </Button>
                
                <Button 
                  onClick={setupScreening} 
                  disabled={selectedCandidates.length === 0}
                  variant="outline"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Zaplanuj screeningi ({selectedCandidates.length})
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                    <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/candidates/${candidate.id}`)}>
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
    </div>
  );
};

export default VectorSearchPage;
