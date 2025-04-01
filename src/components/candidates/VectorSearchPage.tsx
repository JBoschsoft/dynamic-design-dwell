
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
      
      <div className="grid gap-6 md:grid-cols-5">
        <div className="md:col-span-3 space-y-6">
          <SearchCriteria 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            isSearching={isSearching}
            handleSearch={handleSearch}
          />
          
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
        
        <div className="md:col-span-2 space-y-6">
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
    </div>
  );
};

export default VectorSearchPage;
