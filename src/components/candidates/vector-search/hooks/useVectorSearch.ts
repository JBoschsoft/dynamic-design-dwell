
import { useState } from 'react';
import { 
  validateSearchQuery, 
  performVectorSearch, 
  validateCampaignData, 
  createCampaignApi 
} from '../VectorSearchService';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Candidate {
  id: string;
  name: string;
  relevance: number;
  skills: string[];
}

export const useVectorSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Candidate[]>([]);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [campaignName, setCampaignName] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!validateSearchQuery(searchQuery)) {
      toast({
        title: "Błąd wyszukiwania",
        description: "Podaj kryteria wyszukiwania",
        variant: "destructive"
      });
      return;
    }
    
    setIsSearching(true);
    
    try {
      const results = await performVectorSearch(searchQuery);
      setSearchResults(results);
    } catch (error) {
      toast({
        title: "Błąd wyszukiwania",
        description: "Wystąpił problem podczas wyszukiwania kandydatów",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const toggleCandidateSelection = (id: string) => {
    setSelectedCandidates(prev => 
      prev.includes(id) 
        ? prev.filter(candidateId => candidateId !== id)
        : [...prev, id]
    );
  };

  const createCampaign = async () => {
    if (!validateCampaignData(campaignName, selectedCandidates)) {
      return;
    }
    
    try {
      await createCampaignApi(campaignName, campaignDescription, selectedCandidates);
      
      // Reset form
      setCampaignName('');
      setCampaignDescription('');
      setSelectedCandidates([]);
    } catch (error) {
      toast({
        title: "Błąd tworzenia kampanii",
        description: "Wystąpił problem podczas tworzenia kampanii",
        variant: "destructive"
      });
    }
  };

  const navigateToCandidateProfile = (candidateId: string) => {
    // Navigate to candidate profile with state to remember the source
    navigate(`/dashboard/candidates/${candidateId}`, {
      state: { 
        from: 'vectorSearch',
        returnPath: '/dashboard/candidates/search'
      }
    });
  };

  return {
    searchQuery,
    setSearchQuery,
    isSearching,
    searchResults,
    selectedCandidates,
    campaignName,
    setCampaignName,
    campaignDescription,
    setCampaignDescription,
    handleSearch,
    toggleCandidateSelection,
    createCampaign,
    navigateToCandidateProfile
  };
};
