
import React, { useState, useEffect } from 'react';
import { CandidatesListProps } from './types';
import { mockCandidates } from './mockData';
import CandidatesSearch from './CandidatesSearch';
import CandidatesTable from './CandidatesTable';
import PaginationControls from './PaginationControls';
import { useLocation } from 'react-router-dom';

const CandidatesList: React.FC<CandidatesListProps> = ({ refreshTrigger }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Initialize pagination state from localStorage
  const [pageSize, setPageSize] = useState(() => {
    try {
      const saved = localStorage.getItem('candidatesList.pageSize');
      return saved ? parseInt(saved) : 10;
    } catch (e) {
      return 10;
    }
  });
  
  const [currentPage, setCurrentPage] = useState(() => {
    try {
      const saved = localStorage.getItem('candidatesList.currentPage');
      return saved ? parseInt(saved) : 1;
    } catch (e) {
      return 1;
    }
  });
  
  const [refreshList, setRefreshList] = useState(0);
  const location = useLocation();
  
  // Save pagination state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('candidatesList.currentPage', currentPage.toString());
  }, [currentPage]);
  
  useEffect(() => {
    localStorage.setItem('candidatesList.pageSize', pageSize.toString());
  }, [pageSize]);
  
  // Filter candidates based on search query
  const filteredCandidates = mockCandidates.filter(candidate => {
    const fullName = `${candidate.firstName} ${candidate.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase()) || 
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.phone.toLowerCase().includes(searchQuery.toLowerCase());
  });
  
  // Calculate pagination
  const totalCandidates = filteredCandidates.length;
  const totalPages = Math.ceil(totalCandidates / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCandidates);
  const paginatedCandidates = filteredCandidates.slice(startIndex, endIndex);

  const handlePageSizeChange = (value: string) => {
    const newPageSize = parseInt(value);
    setPageSize(newPageSize);
    // Reset to first page when changing page size
    setCurrentPage(1);
  };
  
  const handleCandidateAdded = () => {
    setRefreshList(prev => prev + 1);
    setCurrentPage(1); // Go to first page to see the new candidate
  };

  return (
    <div className="space-y-4">
      <CandidatesSearch 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery}
        onCandidateAdded={handleCandidateAdded}
      />
      
      <CandidatesTable 
        candidates={paginatedCandidates} 
        allCandidates={filteredCandidates} 
      />
      
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        startIndex={startIndex}
        endIndex={endIndex}
        totalCandidates={totalCandidates}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  );
};

export default CandidatesList;
