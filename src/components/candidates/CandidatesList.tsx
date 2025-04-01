
import React, { useState } from 'react';
import { CandidatesListProps } from './types';
import { mockCandidates } from './mockData';
import CandidatesSearch from './CandidatesSearch';
import CandidatesTable from './CandidatesTable';
import PaginationControls from './PaginationControls';

const CandidatesList: React.FC<CandidatesListProps> = ({ refreshTrigger }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('appliedAt');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Filter candidates based on search query
  const filteredCandidates = mockCandidates.filter(candidate => 
    candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.position.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
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

  return (
    <div className="space-y-4">
      <CandidatesSearch 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery} 
      />
      
      <CandidatesTable candidates={paginatedCandidates} />
      
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
