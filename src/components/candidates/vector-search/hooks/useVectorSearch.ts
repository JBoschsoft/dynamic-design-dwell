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
  const [scrollPosition, setScrollPosition] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('vectorSearch.scrollPosition');
      return saved ? parseInt(saved) : 0;
    } catch (e) {
      return 0;
    }
  });

  const [campaignName, setCampaignName] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('vectorSearch.query', searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    localStorage.setItem('vectorSearch.results', JSON.stringify(searchResults));
  }, [searchResults]);

  useEffect(() => {
    localStorage.setItem('vectorSearch.selectedCandidates', JSON.stringify(selectedCandidates));
  }, [selectedCandidates]);

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

  useEffect(() => {
    if (location.state?.from === 'candidateProfile') {
      setTimeout(() => {
        const savedScrollPosition = parseInt(localStorage.getItem('vectorSearch.scrollPosition') || '0');
        console.log('Restoring scroll position to:', savedScrollPosition);
        window.scrollTo(0, savedScrollPosition);
        
        if (lastViewedCandidateId) {
          const element = document.getElementById(`candidate-${lastViewedCandidateId}`);
          if (element) {
            console.log('Highlighting last viewed candidate:', lastViewedCandidateId);
            element.scrollIntoView({ block: 'center', behavior: 'auto' });
            element.classList.add('highlight-candidate');
            setTimeout(() => {
              element.classList.remove('highlight-candidate');
            }, 2000);
          }
        }
      }, 300);
    }
  }, [location, lastViewedCandidateId]);

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
  
  const selectAllCandidates = () => {
    const allIds = searchResults.map(candidate => candidate.id);
    setSelectedCandidates(allIds);
  };
  
  const deselectAllCandidates = () => {
    setSelectedCandidates([]);
  };
  
  const areAllSelected = searchResults.length > 0 && 
    selectedCandidates.length === searchResults.length;

  const createCampaign = async () => {
    if (!validateCampaignData(campaignName, selectedCandidates)) {
      return;
    }
    
    try {
      await createCampaignApi(campaignName, campaignDescription, selectedCandidates);
      
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
    const currentPosition = window.scrollY;
    console.log('Saving scroll position:', currentPosition);
    localStorage.setItem('vectorSearch.scrollPosition', currentPosition.toString());
    setScrollPosition(currentPosition);
    setLastViewedCandidateId(candidateId);
    
    navigate(`/dashboard/candidates/${candidateId}`, {
      state: { 
        from: 'vectorSearch',
        returnPath: '/dashboard/candidates/search'
      }
    });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newSize: string) => {
    const size = parseInt(newSize);
    setPageSize(size);
    setCurrentPage(1);
  };

  useEffect(() => {
    localStorage.setItem('vectorSearch.scrollPosition', scrollPosition.toString());
  }, [scrollPosition]);

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
    setLastViewedCandidateId,
    scrollPosition,
    setScrollPosition
  };
};
