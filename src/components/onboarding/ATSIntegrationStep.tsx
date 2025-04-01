
import React, { useState } from 'react';
import { 
  Button,
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Form, FormField, FormItem, FormLabel, FormControl, FormDescription,
  Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Alert, AlertTitle, AlertDescription,
  CheckCircle2, AlertCircle, ArrowRight, Loader2
} from "@/components/ui";

interface ATSIntegrationStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

const ATSIntegrationStep: React.FC<ATSIntegrationStepProps> = ({
  onNext,
  onPrevious
}) => {
  const [atsProvider, setAtsProvider] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [apiEndpoint, setApiEndpoint] = useState<string>('');
  const [testing, setTesting] = useState<boolean>(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleTestConnection = async () => {
    // Validate inputs
    if (!atsProvider) {
      setTestStatus('error');
      setErrorMessage('Wybierz dostawcę ATS');
      return;
    }

    if (!apiKey) {
      setTestStatus('error');
      setErrorMessage('Wprowadź klucz API');
      return;
    }

    if (atsProvider === 'other' && !apiEndpoint) {
      setTestStatus('error');
      setErrorMessage('Wprowadź endpoint API');
      return;
    }

    setTesting(true);
    setTestStatus('idle');
    setErrorMessage('');

    try {
      // Simulate API connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes we'll simulate a successful connection
      setTestStatus('success');
    } catch (error: any) {
      setTestStatus('error');
      setErrorMessage(error.message || 'Wystąpił nieznany błąd podczas testowania połączenia');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-2xl">
      <h2 className="text-2xl font-bold mb-6">Integracja z ATS</h2>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Konfiguracja systemu rekrutacyjnego</CardTitle>
          <CardDescription>
            Połącz swój system rekrutacyjny (ATS) aby umożliwić automatyczne importowanie kandydatów
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <FormLabel>Wybierz dostawcę ATS</FormLabel>
              <Select value={atsProvider} onValueChange={setAtsProvider}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz system ATS" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="teamtailor">Teamtailor</SelectItem>
                  <SelectItem value="erecruiter">Erecruiter</SelectItem>
                  <SelectItem value="workable">Workable</SelectItem>
                  <SelectItem value="lever">Lever</SelectItem>
                  <SelectItem value="greenhouse">Greenhouse</SelectItem>
                  <SelectItem value="other">Inny system</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <FormLabel htmlFor="apiKey">Klucz API</FormLabel>
              <Input 
                id="apiKey" 
                type="password" 
                value={apiKey} 
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Wprowadź klucz API twojego systemu ATS"
              />
              <FormDescription>
                Klucz API znajduje się w ustawieniach twojego konta ATS, w sekcji integracji lub API
              </FormDescription>
            </div>

            {atsProvider === 'other' && (
              <div className="space-y-2">
                <FormLabel htmlFor="apiEndpoint">Endpoint API</FormLabel>
                <Input 
                  id="apiEndpoint" 
                  type="text" 
                  value={apiEndpoint} 
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  placeholder="np. https://api.twojsystem.com/v1"
                />
              </div>
            )}

            <Button 
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleTestConnection}
              disabled={testing}
            >
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Testowanie połączenia...
                </>
              ) : (
                <>Testuj połączenie</>
              )}
            </Button>

            {testStatus === 'success' && (
              <Alert variant="default" className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-800">Połączenie udane</AlertTitle>
                <AlertDescription className="text-green-700">
                  Pomyślnie połączono z systemem ATS. Możesz teraz przejść do następnego kroku.
                </AlertDescription>
              </Alert>
            )}

            {testStatus === 'error' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Błąd połączenia</AlertTitle>
                <AlertDescription>
                  {errorMessage || 'Sprawdź poprawność wprowadzonych danych i spróbuj ponownie.'}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {testStatus === 'success' && (
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <p className="text-center text-sm text-gray-600">
            Twój system ATS został pomyślnie zintegrowany. Możesz teraz przejść do następnego kroku aby skonfigurować import kandydatów.
          </p>
        </div>
      )}

      <div className="flex justify-between gap-4">
        <Button 
          variant="outline" 
          onClick={onPrevious}
        >
          Wróć
        </Button>
        <Button 
          onClick={onNext} 
          disabled={testStatus !== 'success'}
        >
          Przejdź dalej <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ATSIntegrationStep;
