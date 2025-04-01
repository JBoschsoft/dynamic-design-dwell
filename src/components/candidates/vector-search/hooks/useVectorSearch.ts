
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
  // New state for pagination
  const [currentPage, setCurrentPage] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('vectorSearch.currentPage');
      return saved ? parseInt(saved) : 1;
    } catch (e) {
      return 1;
    }
  });
  const [pageSize, setPageSize] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('vectorSearch.pageSize');
      return saved ? parseInt(saved) : 10;
    } catch (e) {
      return 10;
    }
  });
  const [lastViewedCandidateId, setLastViewedCandidateId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('vectorSearch.lastViewedCandidateId');
      return saved || null;
    } catch (e) {
      return null;
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

  // Save pagination information
  useEffect(() => {
    localStorage.setItem('vectorSearch.currentPage', currentPage.toString());
  }, [currentPage]);

  useEffect(() => {
    localStorage.setItem('vectorSearch.pageSize', pageSize.toString());
  }, [pageSize]);

  useEffect(() => {
    if (lastViewedCandidateId) {
      localStorage.setItem('vectorSearch.lastViewedCandidateId', lastViewedCandidateId);
    }
  }, [lastViewedCandidateId]);

  // Check if we're returning from a candidate profile
  useEffect(() => {
    if (location.state?.from === 'candidateProfile') {
      // Data is already restored from localStorage, no need to do anything else
      console.log('Returning from candidate profile, selections and pagination restored');
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
    // Save the last viewed candidate ID before navigating
    setLastViewedCandidateId(candidateId);
    
    // Navigate to candidate profile with state to remember the source
    navigate(`/dashboard/candidates/${candidateId}`, {
      state: { 
        from: 'vectorSearch',
        returnPath: '/dashboard/candidates/search'
      }
    });
  };

  // Method to handle page changes
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Method to handle page size changes
  const handlePageSizeChange = (newSize: string) => {
    const size = parseInt(newSize);
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  return {
    searchQuery,
    setSearchQuery,
    isSearching,
    searchResults,
    selectedCandidates,
    currentPage,
    pageSize,
    lastViewedCandidateId,
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
    navigateToCandidateProfile,
    handlePageChange,
    handlePageSizeChange,
    setLastViewedCandidateId
  };
};
