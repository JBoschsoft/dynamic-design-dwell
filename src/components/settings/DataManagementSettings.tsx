
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Progress
} from '@/components/ui';
import { toast } from '@/hooks/use-toast';
import { 
  Upload, 
  Download, 
  FileText, 
  Database, 
  Calendar, 
  RefreshCcw, 
  HardDrive, 
  CheckCircle2 
} from 'lucide-react';

const DataManagementSettings = () => {
  const handleImportData = () => {
    toast({
      title: "Import danych rozpoczęty",
      description: "Otrzymasz powiadomienie, gdy proces zostanie zakończony.",
    });
  };

  const handleExportData = () => {
    toast({
      title: "Eksport danych rozpoczęty",
      description: "Plik zostanie wygenerowany i będzie gotowy do pobrania.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Zarządzanie danymi</h2>
        <p className="text-sm text-muted-foreground">
          Importuj, eksportuj i zarządzaj danymi w systemie.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import danych</CardTitle>
          <CardDescription>
            Importuj dane kandydatów i ofert pracy z zewnętrznych źródeł.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="import-type">Typ importu</Label>
            <Select defaultValue="candidates">
              <SelectTrigger id="import-type">
                <SelectValue placeholder="Wybierz typ danych" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="candidates">Kandydaci</SelectItem>
                <SelectItem value="jobs">Oferty pracy</SelectItem>
                <SelectItem value="interviews">Wywiady</SelectItem>
                <SelectItem value="all">Wszystkie dane</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="import-format">Format pliku</Label>
            <Select defaultValue="csv">
              <SelectTrigger id="import-format">
                <SelectValue placeholder="Wybierz format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Plik do importu</Label>
            <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-center mb-2">
                Przeciągnij i upuść plik tutaj lub
              </p>
              <Button size="sm">Wybierz plik</Button>
              <p className="text-xs text-muted-foreground mt-2">
                Maksymalny rozmiar pliku: 10MB
              </p>
            </div>
          </div>
          
          <div className="pt-2">
            <Button onClick={handleImportData}>Rozpocznij import</Button>
          </div>
        </CardContent>
        <CardFooter>
          <div className="text-xs text-muted-foreground">
            Pobierz szablon pliku:
            <button className="ml-1 text-primary hover:underline inline-flex items-center">
              CSV
              <Download className="ml-1 h-3 w-3" />
            </button>
            <span className="mx-1">|</span>
            <button className="text-primary hover:underline inline-flex items-center">
              Excel
              <Download className="ml-1 h-3 w-3" />
            </button>
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Eksport danych</CardTitle>
          <CardDescription>
            Eksportuj dane z systemu do zewnętrznych plików.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="export-type">Typ eksportu</Label>
            <Select defaultValue="candidates">
              <SelectTrigger id="export-type">
                <SelectValue placeholder="Wybierz typ danych" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="candidates">Kandydaci</SelectItem>
                <SelectItem value="jobs">Oferty pracy</SelectItem>
                <SelectItem value="interviews">Wywiady</SelectItem>
                <SelectItem value="all">Wszystkie dane</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="export-format">Format pliku</Label>
            <Select defaultValue="csv">
              <SelectTrigger id="export-format">
                <SelectValue placeholder="Wybierz format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="xlsx">Excel (XLSX)</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date-range">Zakres dat</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input id="date-from" type="date" />
              <Input id="date-to" type="date" />
            </div>
          </div>
          
          <div className="pt-2">
            <Button onClick={handleExportData}>Rozpocznij eksport</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zarządzanie przechowywaniem danych</CardTitle>
          <CardDescription>
            Skonfiguruj zasady przechowywania i archiwizacji danych.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="retention-period">Okres przechowywania danych kandydatów</Label>
            <Select defaultValue="24">
              <SelectTrigger id="retention-period">
                <SelectValue placeholder="Wybierz okres" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 miesięcy</SelectItem>
                <SelectItem value="12">12 miesięcy</SelectItem>
                <SelectItem value="24">24 miesiące</SelectItem>
                <SelectItem value="36">36 miesięcy</SelectItem>
                <SelectItem value="forever">Bezterminowo</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Po tym okresie dane będą automatycznie anonimizowane lub usuwane.
            </p>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="archive-automatically">Automatyczna archiwizacja</Label>
              <input type="checkbox" id="archive-automatically" className="h-4 w-4 text-primary" />
            </div>
            <p className="text-xs text-muted-foreground">
              Automatycznie archiwizuj zamknięte rekrutacje po 30 dniach.
            </p>
          </div>
          
          <div className="pt-2">
            <Button>Zapisz ustawienia</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Statystyki przechowywania</CardTitle>
          <CardDescription>
            Przegląd wykorzystania przestrzeni dyskowej i limitów.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Wykorzystanie przestrzeni</Label>
              <span className="text-sm">4.2 GB / 10 GB</span>
            </div>
            <Progress value={42} className="h-2" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="flex gap-2 items-start">
              <div className="bg-primary/10 p-2 rounded-md">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Dokumenty</p>
                <p className="text-xs text-muted-foreground">2.1 GB</p>
              </div>
            </div>
            
            <div className="flex gap-2 items-start">
              <div className="bg-primary/10 p-2 rounded-md">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Dane systemu</p>
                <p className="text-xs text-muted-foreground">1.4 GB</p>
              </div>
            </div>
            
            <div className="flex gap-2 items-start">
              <div className="bg-primary/10 p-2 rounded-md">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Historia</p>
                <p className="text-xs text-muted-foreground">0.4 GB</p>
              </div>
            </div>
            
            <div className="flex gap-2 items-start">
              <div className="bg-primary/10 p-2 rounded-md">
                <HardDrive className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Inne</p>
                <p className="text-xs text-muted-foreground">0.3 GB</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" size="sm" className="gap-1">
            <RefreshCcw className="h-4 w-4" />
            Odśwież
          </Button>
          <Button size="sm" className="gap-1">
            <CheckCircle2 className="h-4 w-4" />
            Zwiększ limit
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DataManagementSettings;
