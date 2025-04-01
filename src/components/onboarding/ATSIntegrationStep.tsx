
import React, { useState } from 'react';
import { 
  Button, 
  Card, 
  CardContent,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ArrowRight,
  ArrowLeft,
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Alert,
  AlertDescription
} from "@/components/ui";

interface ATSIntegrationStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

const ATSIntegrationStep: React.FC<ATSIntegrationStepProps> = ({ onNext, onPrevious }) => {
  const [integrationType, setIntegrationType] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [apiUrl, setApiUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate integration process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    onNext();
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-2xl">
      <h2 className="text-2xl font-bold text-center mb-6">
        Integracja z ATS
      </h2>
      
      <p className="text-gray-600 text-center mb-8">
        Połącz z istniejącym systemem ATS lub skonfiguruj integrację ręcznie.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="integration-type">Typ integracji</Label>
          <Select 
            value={integrationType} 
            onValueChange={setIntegrationType}
          >
            <SelectTrigger id="integration-type">
              <SelectValue placeholder="Wybierz system ATS" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="workable">Workable</SelectItem>
              <SelectItem value="lever">Lever</SelectItem>
              <SelectItem value="greenhouse">Greenhouse</SelectItem>
              <SelectItem value="bamboohr">BambooHR</SelectItem>
              <SelectItem value="oracle">Oracle HCM</SelectItem>
              <SelectItem value="sap">SAP SuccessFactors</SelectItem>
              <SelectItem value="custom">Niestandardowa integracja</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Wybierz system ATS, z którym chcesz się zintegrować
          </p>
        </div>
        
        {integrationType && (
          <>
            <div className="space-y-2">
              <Label htmlFor="api-key">Klucz API</Label>
              <Input 
                id="api-key" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Wprowadź klucz API" 
              />
              <p className="text-sm text-muted-foreground">
                Klucz API znajdziesz w ustawieniach swojego konta ATS
              </p>
            </div>
            
            {integrationType === 'custom' && (
              <div className="space-y-2">
                <Label htmlFor="api-url">URL API</Label>
                <Input 
                  id="api-url" 
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  placeholder="https://api.example.com/v1" 
                />
                <p className="text-sm text-muted-foreground">
                  Wprowadź bazowy URL do API twojego systemu ATS
                </p>
              </div>
            )}
            
            <Alert>
              <AlertDescription>
                Integracja z systemem ATS pozwoli na automatyczne pobieranie danych o kandydatach
                i synchronizację statusów rekrutacyjnych.
              </AlertDescription>
            </Alert>
            
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="permissions">
                <AccordionTrigger>Wymagane uprawnienia</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    <li>Odczyt kandydatów</li>
                    <li>Odczyt stanowisk</li>
                    <li>Aktualizacja statusów rekrutacyjnych</li>
                    <li>Dodawanie notatek</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </>
        )}
        
        <div className="flex justify-between pt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onPrevious}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Wstecz
          </Button>
          
          <Button 
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Konfigurowanie..." : (
              <>
                Dalej <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ATSIntegrationStep;
