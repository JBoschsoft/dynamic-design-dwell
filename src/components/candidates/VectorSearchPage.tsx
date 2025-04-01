
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
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
          
          <Card>
            <CardHeader>
              <CardTitle>Jak działa wyszukiwanie kandydatów</CardTitle>
              <CardDescription>
                Wyszukiwanie semantyczne pozwala na znalezienie pasujących kandydatów nawet jeśli użyto innych sformułowań.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm">
                  Wpisz dokładnie, jakiego kandydata szukasz. Możesz użyć naturalnego języka, opisując umiejętności, doświadczenie, wykształcenie, itp.
                </p>
                <p className="text-sm">
                  Przykłady zapytań:
                </p>
                <ul className="text-sm list-disc pl-5 space-y-1">
                  <li>Doświadczony frontend developer ze znajomością React i TypeScript</li>
                  <li>Product Manager z doświadczeniem w branży fintech</li>
                  <li>Inżynier DevOps znający Kubernetes i AWS</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default VectorSearchPage;
