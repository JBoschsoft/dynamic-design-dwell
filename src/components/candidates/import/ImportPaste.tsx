
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription, Button, Textarea } from '@/components/ui';
import { FormItem, FormLabel } from '@/components/ui/form';
import { ImportPasteProps } from '../types';

const ImportPaste: React.FC<ImportPasteProps> = ({ pastedText, onPastedTextChange }) => {
  return (
    <div className="space-y-4">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Format danych</AlertTitle>
        <AlertDescription>
          Wklej dane w formacie CSV lub w formie tekstowej, gdzie każdy wiersz reprezentuje jednego kandydata, 
          a wartości są oddzielone przecinkami lub tabulatorami.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-2">
        <FormItem>
          <FormLabel>Wklej dane o kandydatach</FormLabel>
          <Textarea 
            placeholder="Imię i nazwisko, Email, Telefon, Stanowisko&#10;Jan Kowalski, jan@example.com, +48 123 456 789, Developer" 
            value={pastedText}
            onChange={(e) => onPastedTextChange(e.target.value)}
            className="min-h-[200px]"
          />
          <p className="text-xs text-muted-foreground">
            Dane zostaną automatycznie przetworzone do odpowiedniego formatu.
          </p>
        </FormItem>
      </div>
      
      <div className="flex items-center gap-2 mt-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            const sampleData = "Jan Kowalski, jan@example.com, +48 123 456 789, Frontend Developer\nAnna Nowak, anna@example.com, +48 987 654 321, UX Designer";
            onPastedTextChange(sampleData);
          }}
        >
          Wstaw przykładowe dane
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onPastedTextChange('')}
        >
          Wyczyść
        </Button>
      </div>
    </div>
  );
};

export default ImportPaste;
