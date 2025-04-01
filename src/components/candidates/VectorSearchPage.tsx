
import React from 'react';
import SearchCriteria from './vector-search/SearchCriteria';
import CampaignActions from './vector-search/CampaignActions';
import SearchResults from './vector-search/SearchResults';
import { useVectorSearch } from './vector-search/hooks/useVectorSearch';

const VectorSearchPage = () => {
  const {
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
  } = useVectorSearch();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Wyszukiwanie kandydatów</h1>
        <p className="text-muted-foreground">
          Użyj wyszukiwania wektorowego, aby znaleźć idealnie pasujących kandydatów do Twoich wymagań.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <SearchCriteria 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
          isSearching={isSearching}
        />

        <CampaignActions 
          selectedCandidates={selectedCandidates}
          campaignName={campaignName}
          setCampaignName={setCampaignName}
          campaignDescription={campaignDescription}
          setCampaignDescription={setCampaignDescription}
          createCampaign={createCampaign}
        />
      </div>

      <SearchResults 
        searchResults={searchResults}
        isSearching={isSearching}
        selectedCandidates={selectedCandidates}
        toggleCandidateSelection={toggleCandidateSelection}
        navigateToCandidateProfile={navigateToCandidateProfile}
      />
    </div>
  );
};

export default VectorSearchPage;
