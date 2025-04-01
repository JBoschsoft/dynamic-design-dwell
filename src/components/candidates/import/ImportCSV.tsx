
import React, { useRef } from 'react';
import { AlertCircle, Upload } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui';
import { ImportCSVProps } from '../types';

const ImportCSV: React.FC<ImportCSVProps> = ({ onFileSelect, selectedFile }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-4">
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
          onChange={(e) => e.target.files && onFileSelect(e.target.files[0])}
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
    </div>
  );
};

export default ImportCSV;
