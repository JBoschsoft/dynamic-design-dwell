
import React, { useState, useEffect } from 'react';
import CandidatesList from '@/components/candidates/CandidatesList';
import CandidatesImport from '@/components/candidates/CandidatesImport';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { useLocation } from 'react-router-dom';

const CandidatesPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const location = useLocation();

  const handleImportSuccess = () => {
    // Increment to trigger a refresh of the candidates list
    setRefreshTrigger(prev => prev + 1);
  };

  // Set the default tab based on URL search params
  const [activeTab, setActiveTab] = useState('list');
  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab === 'import') {
      setActiveTab('import');
    } else {
      setActiveTab('list');
    }
  }, [location]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kandydaci</h1>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Lista kandydatów</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="list">Lista kandydatów</TabsTrigger>
              <TabsTrigger value="import">Import kandydatów</TabsTrigger>
            </TabsList>
            
            <TabsContent value="list" className="mt-0">
              <CandidatesList refreshTrigger={refreshTrigger} />
            </TabsContent>
            
            <TabsContent value="import" className="mt-0">
              <CandidatesImport onImportSuccess={handleImportSuccess} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CandidatesPage;
