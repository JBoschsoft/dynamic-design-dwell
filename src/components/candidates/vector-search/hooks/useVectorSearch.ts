
import { useState, useEffect, useRef } from 'react';
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
      console.error('Error parsing search results from localStorage:', e);
      return [];
    }
  });
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('vectorSearch.selectedCandidates');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error parsing selected candidates from localStorage:', e);
      return [];
    }
  });
  const [currentPage, setCurrentPage] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('vectorSearch.currentPage');
      return saved ? parseInt(saved) : 1;
    } catch (e) {
      console.error('Error parsing current page from localStorage:', e);
      return 1;
    }
  });
  const [pageSize, setPageSize] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('vectorSearch.pageSize');
      return saved ? parseInt(saved) : 10;
    } catch (e) {
      console.error('Error parsing page size from localStorage:', e);
      return 10;
    }
  });
  const [lastViewedCandidateId, setLastViewedCandidateId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('vectorSearch.lastViewedCandidateId');
      return saved || null;
    } catch (e) {
      console.error('Error getting last viewed candidate ID from localStorage:', e);
      return null;
    }
  });
  const [scrollPosition, setScrollPosition] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('vectorSearch.scrollPosition');
      return saved ? parseInt(saved) : 0;
    } catch (e) {
      console.error('Error parsing scroll position from localStorage:', e);
      return 0;
    }
  });

  const [campaignName, setCampaignName] = useState('');
  const [campaignDescription, setCampaignDescription] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const initialRenderRef = useRef(true);
  const searchSessionId = useRef(`search-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  // Enhanced logging function with session ID and timestamps
  const log = (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    if (data) {
      console.log(`[VECTOR-SEARCH-${searchSessionId.current}][${timestamp}] ${message}`, data);
    } else {
      console.log(`[VECTOR-SEARCH-${searchSessionId.current}][${timestamp}] ${message}`);
    }
  };

  useEffect(() => {
    log('Initializing vector search hook');
    
    return () => {
      log('Vector search hook unmounted');
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('vectorSearch.query', searchQuery);
    log('Saved search query to localStorage', searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    localStorage.setItem('vectorSearch.results', JSON.stringify(searchResults));
    log('Saved search results to localStorage', { count: searchResults.length });
  }, [searchResults]);

  useEffect(() => {
    localStorage.setItem('vectorSearch.selectedCandidates', JSON.stringify(selectedCandidates));
    log('Saved selected candidates to localStorage', { count: selectedCandidates.length });
  }, [selectedCandidates]);

  useEffect(() => {
    localStorage.setItem('vectorSearch.currentPage', currentPage.toString());
    log('Saved current page to localStorage', currentPage);
  }, [currentPage]);

  useEffect(() => {
    localStorage.setItem('vectorSearch.pageSize', pageSize.toString());
    log('Saved page size to localStorage', pageSize);
  }, [pageSize]);

  useEffect(() => {
    if (lastViewedCandidateId) {
      localStorage.setItem('vectorSearch.lastViewedCandidateId', lastViewedCandidateId);
      log('Saved last viewed candidate ID to localStorage', lastViewedCandidateId);
    }
  }, [lastViewedCandidateId]);

  useEffect(() => {
    if (location.state?.from === 'candidateProfile') {
      if (initialRenderRef.current) {
        const savedScrollPosition = parseInt(localStorage.getItem('vectorSearch.scrollPosition') || '0');
        log('Restoring scroll position', savedScrollPosition);
        window.scrollTo(0, savedScrollPosition);
        
        if (lastViewedCandidateId) {
          log('Looking for last viewed candidate element', lastViewedCandidateId);
          const element = document.getElementById(`candidate-${lastViewedCandidateId}`);
          if (element) {
            log('Highlighting last viewed candidate', lastViewedCandidateId);
            element.scrollIntoView({ block: 'center', behavior: 'instant' });
            element.classList.add('highlight-candidate');
            setTimeout(() => {
              element.classList.remove('highlight-candidate');
            }, 2000);
          } else {
            log('Last viewed candidate element not found', lastViewedCandidateId);
          }
        }
        initialRenderRef.current = false;
      }
    } else {
      initialRenderRef.current = true;
    }
  }, [location, lastViewedCandidateId]);

  const handleSearch = async () => {
    if (!validateSearchQuery(searchQuery)) {
      log('Search validation failed - empty query');
      toast({
        title: "Błąd wyszukiwania",
        description: "Podaj kryteria wyszukiwania",
        variant: "destructive"
      });
      return;
    }
    
    setIsSearching(true);
    log('Starting vector search', { query: searchQuery });
    
    try {
      const results = await performVectorSearch(searchQuery);
      log('Vector search completed', { resultsCount: results.length });
      setSearchResults(results);
    } catch (error) {
      log('Vector search error', error);
      toast({
        title: "Błąd wyszukiwania",
        description: "Wystąpił problem podczas wyszukiwania kandydatów",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
      log('Vector search state reset');
    }
  };

  const toggleCandidateSelection = (id: string) => {
    log('Toggling candidate selection', { id });
    setSelectedCandidates(prev => 
      prev.includes(id) 
        ? prev.filter(candidateId => candidateId !== id)
        : [...prev, id]
    );
  };
  
  const selectAllCandidates = () => {
    const allIds = searchResults.map(candidate => candidate.id);
    log('Selecting all candidates', { count: allIds.length });
    setSelectedCandidates(allIds);
  };
  
  const deselectAllCandidates = () => {
    log('Deselecting all candidates');
    setSelectedCandidates([]);
  };
  
  const areAllSelected = searchResults.length > 0 && 
    selectedCandidates.length === searchResults.length;

  const createCampaign = async () => {
    log('Creating campaign', { name: campaignName, selectedCount: selectedCandidates.length });
    
    if (!validateCampaignData(campaignName, selectedCandidates)) {
      log('Campaign validation failed');
      return;
    }
    
    try {
      log('Calling create campaign API');
      await createCampaignApi(campaignName, campaignDescription, selectedCandidates);
      
      log('Campaign created successfully, resetting form');
      setCampaignName('');
      setCampaignDescription('');
      setSelectedCandidates([]);
    } catch (error) {
      log('Error creating campaign', error);
      toast({
        title: "Błąd tworzenia kampanii",
        description: "Wystąpił problem podczas tworzenia kampanii",
        variant: "destructive"
      });
    }
  };

  const navigateToCandidateProfile = (candidateId: string) => {
    const currentPosition = window.scrollY;
    log('Saving scroll position before navigation', currentPosition);
    localStorage.setItem('vectorSearch.scrollPosition', currentPosition.toString());
    setScrollPosition(currentPosition);
    setLastViewedCandidateId(candidateId);
    
    log('Navigating to candidate profile', { candidateId });
    navigate(`/dashboard/candidates/${candidateId}`, {
      state: { 
        from: 'vectorSearch',
        returnPath: '/dashboard/candidates/search'
      }
    });
  };

  const handlePageChange = (newPage: number) => {
    log('Changing page', { from: currentPage, to: newPage });
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newSize: string) => {
    const size = parseInt(newSize);
    log('Changing page size', { from: pageSize, to: size });
    setPageSize(size);
    setCurrentPage(1);
  };

  useEffect(() => {
    localStorage.setItem('vectorSearch.scrollPosition', scrollPosition.toString());
    log('Updated scroll position in localStorage', scrollPosition);
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
