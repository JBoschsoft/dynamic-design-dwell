import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription, Button, Input } from '@/components/ui';
import { FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui';
import { toast } from '@/hooks/use-toast';
import { ImportATSProps } from '../types';

const ImportATS: React.FC<ImportATSProps> = ({
  selectedAts, 
  onSelectedAtsChange, 
  atsApiKey, 
  onAtsApiKeyChange, 
  atsProjectId,
  onAtsProjectIdChange
}) => {
  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Integracja z systemami ATS</AlertTitle>
        <AlertDescription>
          Zaimportuj kandydatów bezpośrednio z zintegrowanego systemu ATS. Upewnij się, że posiadasz odpowiednie uprawnienia.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <FormItem>
            <FormLabel>Wybierz system ATS</FormLabel>
            <Select value={selectedAts} onValueChange={onSelectedAtsChange}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz system ATS" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="teamtailor">Teamtailor</SelectItem>
                <SelectItem value="erecruiter">eRecruiter</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        </div>
        
        {selectedAts && (
          <div className="space-y-4">
            <div className="space-y-2">
              <FormItem>
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
              </FormItem>
            </div>
            
            <Alert className="bg-muted border-0">
              <div className="grid grid-cols-[1fr,auto] gap-2 items-center">
                <div>
                  <p className="text-sm font-medium">Status konfiguracji: Nieskonfigurowano</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Przejdź do ustawień integracji, aby skonfigurować dostęp do {selectedAts}.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={() => toast({
                  title: "Przechodzenie do ustawień",
                  description: "Ta funkcja będzie dostępna wkrótce.",
                })}>
                  Konfiguruj
                </Button>
              </div>
            </Alert>
          </div>
        )}
        
        {selectedAts === 'custom' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <FormItem>
                <FormLabel>Klucz API</FormLabel>
                <Input 
                  type="password" 
                  placeholder="Wprowadź klucz API"
                  value={atsApiKey}
                  onChange={(e) => onAtsApiKeyChange(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Klucz API do połączenia z systemem ATS.
                </p>
              </FormItem>
            </div>
            
            <div className="space-y-2">
              <FormItem>
                <FormLabel>ID projektu/stanowiska</FormLabel>
                <Input 
                  placeholder="Wprowadź ID projektu lub stanowiska"
                  value={atsProjectId}
                  onChange={(e) => onAtsProjectIdChange(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Identyfikator projektu lub stanowiska, z którego chcesz zaimportować kandydatów.
                </p>
              </FormItem>
            </div>
            
            <div className="space-y-2">
              <FormItem>
                <FormLabel>Adres URL API</FormLabel>
                <Input 
                  placeholder="https://api.example.com/v1/candidates"
                />
                <p className="text-xs text-muted-foreground">
                  Opcjonalny - adres URL API, jeśli różni się od domyślnego.
                </p>
              </FormItem>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportATS;
