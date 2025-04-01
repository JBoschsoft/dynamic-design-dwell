
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
    // For now, we'll simulate results with more data to demonstrate pagination
    setTimeout(() => {
      // Generate 45 mock results to demonstrate pagination
      const mockResults: Candidate[] = [];
      const skillSets = [
        ['React', 'TypeScript', 'Node.js'],
        ['JavaScript', 'React', 'CSS'],
        ['React', 'Redux', 'GraphQL'],
        ['React', 'NextJS', 'Tailwind'],
        ['Angular', 'TypeScript', 'RxJS'],
        ['Vue.js', 'JavaScript', 'Vuex'],
        ['PHP', 'Laravel', 'MySQL'],
        ['Python', 'Django', 'PostgreSQL'],
        ['Java', 'Spring', 'Hibernate']
      ];
      
      const firstNames = ['Jan', 'Anna', 'Piotr', 'Karolina', 'Tomasz', 'Magdalena', 'Paweł', 'Alicja', 'Michał'];
      const lastNames = ['Kowalski', 'Nowak', 'Wiśniewski', 'Wójcik', 'Kowalczyk', 'Kamińska', 'Lewandowski', 'Zielińska', 'Szymański'];
      
      for (let i = 1; i <= 45; i++) {
        const firstNameIndex = Math.floor(Math.random() * firstNames.length);
        const lastNameIndex = Math.floor(Math.random() * lastNames.length);
        const skillSetIndex = Math.floor(Math.random() * skillSets.length);
        
        mockResults.push({
          id: i.toString(),
          name: `${firstNames[firstNameIndex]} ${lastNames[lastNameIndex]}`,
          relevance: 0.95 - (i * 0.01), // Decreasing relevance
          skills: skillSets[skillSetIndex]
        });
      }
      
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
