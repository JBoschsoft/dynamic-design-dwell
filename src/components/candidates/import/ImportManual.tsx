
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription, Button, Textarea } from '@/components/ui';
import { FormItem, FormLabel } from '@/components/ui/form';
import { ImportManualProps } from '../types';

const ImportManual: React.FC<ImportManualProps> = ({ manualInput, onManualInputChange }) => {
  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Format danych</AlertTitle>
        <AlertDescription>
          Wprowadź ręcznie dane kandydatów. Każdy wiersz powinien zawierać jednego kandydata w formacie:
          Imię i nazwisko, Email, Telefon, Stanowisko
        </AlertDescription>
      </Alert>
      
      <div className="space-y-2">
        <FormItem>
          <FormLabel>Wprowadź dane kandydatów ręcznie</FormLabel>
          <Textarea 
            placeholder="Wprowadź dane kandydatów (jeden kandydat w linii)&#10;Przykład: Jan Kowalski, jan@example.com, +48 123 456 789, Developer" 
            value={manualInput}
            onChange={(e) => onManualInputChange(e.target.value)}
            className="min-h-[200px]"
          />
          <p className="text-xs text-muted-foreground">
            Każdy wiersz powinien reprezentować jednego kandydata w formacie: Imię i nazwisko, Email, Telefon, Stanowisko
          </p>
        </FormItem>
      </div>
      
      <div className="mt-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            const currentInput = manualInput.trim();
            const newCandidate = "\nJan Kowalski, jan@example.com, +48 123 456 789, Developer";
            onManualInputChange(currentInput ? currentInput + newCandidate : newCandidate.trim());
          }}
        >
          Dodaj przykładowego kandydata
        </Button>
      </div>
    </div>
  );
};

export default ImportManual;
