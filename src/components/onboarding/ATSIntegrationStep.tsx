
import React, { useState } from 'react';
import { toast } from "@/hooks/use-toast";
import { 
  Button, 
  Card, 
  CardContent,
  Input,
  Label,
  ArrowRight,
  Alert,
  AlertDescription,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "@/components/ui";

interface ATSIntegrationStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

const ATSIntegrationStep: React.FC<ATSIntegrationStepProps> = ({ onNext, onPrevious }) => {
  const [selectedAts, setSelectedAts] = useState<string>('teamtailor');
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [testSuccessful, setTestSuccessful] = useState<boolean | null>(null);

  // Updated to simply proceed to the next step without testing
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  const testConnection = async () => {
    if (!apiKey) {
      toast({
        variant: "destructive",
        title: "Brak klucza API",
        description: "Wprowadź klucz API, aby przetestować połączenie."
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API test
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 80% chance of success for demo purposes
      const isSuccess = Math.random() > 0.2;
      
      if (isSuccess) {
        toast({
          title: "Połączenie udane",
          description: "Pomyślnie połączono z systemem ATS.",
        });
        setTestSuccessful(true);
      } else {
        throw new Error("Błąd autoryzacji. Sprawdź swój klucz API.");
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Błąd połączenia",
        description: error.message || "Nie udało się połączyć z systemem ATS. Sprawdź swój klucz API."
      });
      setTestSuccessful(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-2xl">
      <h2 className="text-2xl font-bold text-center mb-6">
        Integracja z ATS
      </h2>
      
      <p className="text-gray-600 text-center mb-8">
        Połącz z istniejącym systemem ATS, aby automatycznie pobierać dane o kandydatach.
      </p>
      
      <Tabs 
        defaultValue="teamtailor" 
        value={selectedAts}
        onValueChange={setSelectedAts}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="teamtailor">Team Tailor</TabsTrigger>
          <TabsTrigger value="erecruiter">eRecruiter</TabsTrigger>
        </TabsList>
        
        <TabsContent value="teamtailor" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-2">Team Tailor API</h3>
              <p className="text-gray-600 mb-4">
                Aby zintegrować się z Team Tailor, wykonaj następujące kroki:
              </p>
              
              <ol className="list-decimal pl-5 space-y-2 mb-4">
                <li>Zaloguj się do panelu administracyjnego Team Tailor</li>
                <li>Przejdź do ustawień integracji (Settings &gt; Integrations)</li>
                <li>Utwórz nowy klucz API (Create API key)</li>
                <li>Skopiuj wygenerowany klucz i wklej go poniżej</li>
              </ol>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="teamtailor-api-key">Klucz API Team Tailor</Label>
                  <div className="flex">
                    <Input 
                      id="teamtailor-api-key" 
                      value={apiKey}
                      onChange={(e) => {
                        setApiKey(e.target.value);
                        setTestSuccessful(null);
                      }}
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" 
                      className="flex-1 mr-2"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={testConnection}
                      disabled={isLoading || !apiKey}
                      className="whitespace-nowrap"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Testowanie...
                        </>
                      ) : (
                        'Testuj połączenie'
                      )}
                    </Button>
                  </div>
                  {testSuccessful === true && (
                    <div className="flex items-center text-green-600 text-sm mt-1">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Połączenie udane
                    </div>
                  )}
                  {testSuccessful === false && (
                    <div className="flex items-center text-red-600 text-sm mt-1">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Połączenie nieudane
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="erecruiter" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-2">eRecruiter API</h3>
              <p className="text-gray-600 mb-4">
                Aby zintegrować się z eRecruiter, wykonaj następujące kroki:
              </p>
              
              <ol className="list-decimal pl-5 space-y-2 mb-4">
                <li>Zaloguj się do panelu administracyjnego eRecruiter</li>
                <li>Przejdź do ustawień (Konfiguracja &gt; API)</li>
                <li>Utwórz nowy token dostępu (Dodaj nowy token)</li>
                <li>Skopiuj wygenerowany token i wklej go poniżej</li>
              </ol>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="erecruiter-api-key">Token API eRecruiter</Label>
                  <div className="flex">
                    <Input 
                      id="erecruiter-api-key" 
                      value={apiKey}
                      onChange={(e) => {
                        setApiKey(e.target.value);
                        setTestSuccessful(null);
                      }}
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" 
                      className="flex-1 mr-2"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={testConnection}
                      disabled={isLoading || !apiKey}
                      className="whitespace-nowrap"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Testowanie...
                        </>
                      ) : (
                        'Testuj połączenie'
                      )}
                    </Button>
                  </div>
                  {testSuccessful === true && (
                    <div className="flex items-center text-green-600 text-sm mt-1">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Połączenie udane
                    </div>
                  )}
                  {testSuccessful === false && (
                    <div className="flex items-center text-red-600 text-sm mt-1">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Połączenie nieudane
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Alert className="mt-6">
        <AlertDescription>
          Integracja z systemem ATS pozwoli na automatyczne pobieranie danych o kandydatach
          i synchronizację statusów rekrutacyjnych.
        </AlertDescription>
      </Alert>
      
      <div className="flex justify-between pt-6">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onPrevious}
        >
          Wstecz
        </Button>
        
        <Button 
          type="submit"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? "Konfigurowanie..." : (
            <>
              Dalej <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ATSIntegrationStep;
