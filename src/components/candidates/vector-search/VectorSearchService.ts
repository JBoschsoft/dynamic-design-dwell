
import { toast } from '@/hooks/use-toast';

interface Candidate {
  id: string;
  name: string;
  relevance: number;
  skills: string[];
}

export const performVectorSearch = async (searchQuery: string): Promise<Candidate[]> => {
  return new Promise((resolve) => {
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
      
      resolve(mockResults);
      
      toast({
        title: "Wyszukiwanie zakończone",
        description: `Znaleziono ${mockResults.length} pasujących kandydatów.`,
      });
    }, 1500);
  });
};

export const validateSearchQuery = (query: string): boolean => {
  return !!query.trim();
};

export const validateCampaignData = (campaignName: string, selectedCandidates: string[]): boolean => {
  if (!campaignName) {
    toast({
      title: "Brak nazwy kampanii",
      description: "Podaj nazwę kampanii",
      variant: "destructive"
    });
    return false;
  }
  
  if (selectedCandidates.length === 0) {
    toast({
      title: "Brak wybranych kandydatów",
      description: "Wybierz co najmniej jednego kandydata",
      variant: "destructive"
    });
    return false;
  }
  
  return true;
};

export const createCampaignApi = (campaignName: string, campaignDescription: string, selectedCandidates: string[]): Promise<void> => {
  return new Promise((resolve) => {
    // In a real app, this would create a campaign in the database
    setTimeout(() => {
      toast({
        title: "Kampania utworzona",
        description: `Kampania "${campaignName}" z ${selectedCandidates.length} kandydatami została utworzona.`
      });
      resolve();
    }, 500);
  });
};
