
import React, { useState, useRef } from 'react';
import { 
  Card, CardContent, CardDescription, CardHeader, CardTitle,
  Tabs, TabsContent, TabsList, TabsTrigger,
  Button, Input, Textarea, Alert, AlertTitle, AlertDescription,
  Form, FormField, FormItem, FormLabel, FormControl, FormDescription,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui';
import { Upload, FileUp, Copy, FileText, LinkIcon, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface CandidatesImportProps {
  onImportSuccess?: () => void;
}

const CandidatesImport: React.FC<CandidatesImportProps> = ({ onImportSuccess }) => {
  const [importMethod, setImportMethod] = useState('csv');
  const [isImporting, setIsImporting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [manualInput, setManualInput] = useState('');
  const [selectedAts, setSelectedAts] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

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
        return !selectedAts;
      default:
        return true;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="csv" value={importMethod} onValueChange={setImportMethod} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="csv">Plik CSV</TabsTrigger>
          <TabsTrigger value="paste">Wklej dane</TabsTrigger>
          <TabsTrigger value="manual">Wprowadź ręcznie</TabsTrigger>
          <TabsTrigger value="ats">Integracja ATS</TabsTrigger>
        </TabsList>
        
        <TabsContent value="csv" className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Format pliku CSV</AlertTitle>
            <AlertDescription>
              Upewnij się, że plik CSV zawiera następujące kolumny: Imię i nazwisko, Email, Telefon, Stanowisko.
              Pierwsza linia powinna zawierać nagłówki kolumn.
            </AlertDescription>
          </Alert>
          
          <div 
            className="border-2 border-dashed rounded-lg p-12 text-center hover:bg-muted/50 transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              accept=".csv" 
              className="hidden" 
              onChange={handleFileSelection}
            />
            
            <div className="mx-auto flex flex-col items-center justify-center gap-1">
              <div className="rounded-full bg-primary/10 p-3">
                <Upload className="h-10 w-10 text-primary" />
              </div>
              
              {selectedFile ? (
                <>
                  <div className="mt-4 text-sm font-medium">
                    Wybrany plik: {selectedFile.name}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Kliknij, aby wybrać inny plik lub upuść go tutaj
                  </p>
                </>
              ) : (
                <>
                  <div className="mt-4 text-sm font-medium">
                    Upuść plik tutaj lub kliknij, aby wybrać
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Akceptujemy tylko pliki CSV
                  </p>
                </>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="paste" className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Format danych</AlertTitle>
            <AlertDescription>
              Wklej dane w formacie CSV lub w formie tekstowej, gdzie każdy wiersz reprezentuje jednego kandydata, 
              a wartości są oddzielone przecinkami lub tabulatorami.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <FormLabel>Wklej dane o kandydatach</FormLabel>
            <Textarea 
              placeholder="Imię i nazwisko, Email, Telefon, Stanowisko&#10;Jan Kowalski, jan@example.com, +48 123 456 789, Developer" 
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              className="min-h-[200px]"
            />
            <p className="text-xs text-muted-foreground">
              Dane zostaną automatycznie przetworzone do odpowiedniego formatu.
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="manual" className="space-y-4">
          <div className="space-y-2">
            <FormLabel>Wprowadź dane kandydatów ręcznie</FormLabel>
            <Textarea 
              placeholder="Wprowadź dane kandydatów (jeden kandydat w linii)&#10;Przykład: Jan Kowalski, jan@example.com, +48 123 456 789, Developer" 
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              className="min-h-[200px]"
            />
            <p className="text-xs text-muted-foreground">
              Każdy wiersz powinien reprezentować jednego kandydata w formacie: Imię i nazwisko, Email, Telefon, Stanowisko
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="ats" className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Integracja z systemami ATS</AlertTitle>
            <AlertDescription>
              Zaimportuj kandydatów bezpośrednio z zintegrowanego systemu ATS. Upewnij się, że posiadasz odpowiednie uprawnienia.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <FormLabel>Wybierz system ATS</FormLabel>
              <Select value={selectedAts} onValueChange={setSelectedAts}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz system ATS" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teamtailor">Teamtailor</SelectItem>
                  <SelectItem value="erecruiter">eRecruiter</SelectItem>
                  <SelectItem value="workable">Workable</SelectItem>
                  <SelectItem value="lever">Lever</SelectItem>
                  <SelectItem value="greenhouse">Greenhouse</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {selectedAts && (
              <div className="space-y-2">
                <FormLabel>Wybierz źródło danych</FormLabel>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz źródło danych" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Wszyscy kandydaci</SelectItem>
                    <SelectItem value="new">Nowe aplikacje</SelectItem>
                    <SelectItem value="active">Aktywni kandydaci</SelectItem>
                    <SelectItem value="archive">Archiwum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => {
          setSelectedFile(null);
          setPastedText('');
          setManualInput('');
          setSelectedAts('');
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
  );
};

export default CandidatesImport;
