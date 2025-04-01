
import React from 'react';
import { useVectorSearch } from './vector-search/hooks/useVectorSearch';
import SearchCriteria from './vector-search/SearchCriteria';
import SearchResults from './vector-search/SearchResults';
import CampaignActions from './vector-search/CampaignActions';

const VectorSearchPage: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    isSearching,
    searchResults,
    selectedCandidates,
    currentPage,
    pageSize,
    lastViewedCandidateId,
    scrollPosition,
    setScrollPosition,
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
    handlePageSizeChange
  } = useVectorSearch();
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Wyszukiwanie kandydatów</h1>
      </div>
      
      {/* Top row with equal height columns */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-full">
          <SearchCriteria 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isSearching={isSearching}
            handleSearch={handleSearch}
          />
        </div>
        
        <div className="h-full">
          <CampaignActions 
            selectedCandidates={selectedCandidates}
            campaignName={campaignName}
            setCampaignName={setCampaignName}
            campaignDescription={campaignDescription}
            setCampaignDescription={setCampaignDescription}
            createCampaign={createCampaign}
          />
        </div>
      </div>
      
      {/* Full width search results */}
      <div className="w-full">
        <SearchResults 
          searchResults={searchResults}
          isSearching={isSearching}
          selectedCandidates={selectedCandidates}
          currentPage={currentPage}
          pageSize={pageSize}
          lastViewedCandidateId={lastViewedCandidateId}
          toggleCandidateSelection={toggleCandidateSelection}
          navigateToCandidateProfile={navigateToCandidateProfile}
          handlePageChange={handlePageChange}
          handlePageSizeChange={handlePageSizeChange}
          selectAllCandidates={selectAllCandidates}
          deselectAllCandidates={deselectAllCandidates}
          areAllSelected={areAllSelected}
        />
      </div>
    </div>
  );
};

export default VectorSearchPage;
