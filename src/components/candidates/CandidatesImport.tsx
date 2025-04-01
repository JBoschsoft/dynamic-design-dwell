
import React, { useState } from 'react';
import { FileUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui';
import { toast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { CandidatesImportProps } from './types';
import ImportCSV from './import/ImportCSV';
import ImportPaste from './import/ImportPaste';
import ImportManual from './import/ImportManual';
import ImportATS from './import/ImportATS';

const CandidatesImport: React.FC<CandidatesImportProps> = ({ onImportSuccess }) => {
  const [importMethod, setImportMethod] = useState('csv');
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [selectedAts, setSelectedAts] = useState('');
  const [atsApiKey, setAtsApiKey] = useState('');
  const [atsProjectId, setAtsProjectId] = useState('');
  
  // Add form handling with react-hook-form
  const form = useForm({
    defaultValues: {
      importMethod: 'csv',
      pastedText: '',
      manualInput: '',
      selectedAts: '',
      atsApiKey: '',
      atsProjectId: '',
    }
  });

  const handleImport = async () => {
    setIsImporting(true);
    
    try {
      // Simulate API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Show success message
      toast({
        title: "Import zakończony powodzeniem",
        description: "Kandydaci zostali zaimportowani do systemu.",
      });
      
      // Reset form state
      setSelectedFile(null);
      setPastedText('');
      setManualInput('');
      setSelectedAts('');
      setAtsApiKey('');
      setAtsProjectId('');
      
      // Notify parent component
      if (onImportSuccess) {
        onImportSuccess();
      }
    } catch (error) {
      toast({
        title: "Błąd importu",
        description: "Nie udało się zaimportować kandydatów. Spróbuj ponownie.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const isSubmitDisabled = () => {
    switch(importMethod) {
      case 'csv':
        return !selectedFile;
      case 'paste':
        return !pastedText.trim();
      case 'manual':
        return !manualInput.trim();
      case 'ats':
        return !selectedAts || (selectedAts === 'custom' && (!atsApiKey || !atsProjectId));
      default:
        return true;
    }
  };

  return (
    <Form {...form}>
      <div className="space-y-6">
        <Tabs defaultValue="csv" value={importMethod} onValueChange={setImportMethod} className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="csv">Plik CSV</TabsTrigger>
            <TabsTrigger value="paste">Wklej dane</TabsTrigger>
            <TabsTrigger value="manual">Wprowadź ręcznie</TabsTrigger>
            <TabsTrigger value="ats">Integracja ATS</TabsTrigger>
          </TabsList>
          
          <TabsContent value="csv" className="space-y-4">
            <ImportCSV onFileSelect={setSelectedFile} selectedFile={selectedFile} />
          </TabsContent>
          
          <TabsContent value="paste" className="space-y-4">
            <ImportPaste pastedText={pastedText} onPastedTextChange={setPastedText} />
          </TabsContent>
          
          <TabsContent value="manual" className="space-y-4">
            <ImportManual manualInput={manualInput} onManualInputChange={setManualInput} />
          </TabsContent>
          
          <TabsContent value="ats" className="space-y-4">
            <ImportATS
              selectedAts={selectedAts}
              onSelectedAtsChange={setSelectedAts}
              atsApiKey={atsApiKey}
              onAtsApiKeyChange={setAtsApiKey}
              atsProjectId={atsProjectId}
              onAtsProjectIdChange={setAtsProjectId}
            />
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => {
            setSelectedFile(null);
            setPastedText('');
            setManualInput('');
            setSelectedAts('');
            setAtsApiKey('');
            setAtsProjectId('');
          }}>
            Wyczyść
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={isSubmitDisabled() || isImporting}
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importowanie...
              </>
            ) : (
              <>
                <FileUp className="mr-2 h-4 w-4" />
                Importuj kandydatów
              </>
            )}
          </Button>
        </div>
      </div>
    </Form>
  );
};

export default CandidatesImport;
