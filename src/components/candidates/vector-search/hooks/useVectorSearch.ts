
import { useState, useEffect } from 'react';
import { 
  validateSearchQuery, 
  performVectorSearch, 
  validateCampaignData, 
  createCampaignApi 
} from '../VectorSearchService';
import { toast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';

interface Candidate {
  id: string;
  name: string;
  relevance: number;
  skills: string[];
}

export const useVectorSearch = () => {
  const [searchQuery, setSearchQuery] = useState(() => {
    const saved = localStorage.getItem('vectorSearch.query');
    return saved || '';
  });
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Candidate[]>(() => {
    try {
      const saved = localStorage.getItem('vectorSearch.results');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('vectorSearch.selectedCandidates');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  const [campaignName, setCampaignName] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Persist state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('vectorSearch.query', searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    localStorage.setItem('vectorSearch.results', JSON.stringify(searchResults));
  }, [searchResults]);

  useEffect(() => {
    localStorage.setItem('vectorSearch.selectedCandidates', JSON.stringify(selectedCandidates));
  }, [selectedCandidates]);

  // Check if we're returning from a candidate profile
  useEffect(() => {
    if (location.state?.from === 'candidateProfile') {
      // Data is already restored from localStorage, no need to do anything else
      console.log('Returning from candidate profile, selections restored');
    }
  }, [location]);

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
      // Don't clear selections when performing a new search
      // This allows users to search for different candidates and add them to the same selection
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
  
  // New functions for select all functionality
  const selectAllCandidates = () => {
    const allIds = searchResults.map(candidate => candidate.id);
    setSelectedCandidates(allIds);
  };
  
  const deselectAllCandidates = () => {
    setSelectedCandidates([]);
  };
  
  // Check if all candidates are selected
  const areAllSelected = searchResults.length > 0 && 
    selectedCandidates.length === searchResults.length;

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
    selectAllCandidates,
    deselectAllCandidates,
    areAllSelected,
    createCampaign,
    navigateToCandidateProfile
  };
};
