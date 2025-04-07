
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, Button } from '@/components/ui';
import { Eye, Download, FileText } from 'lucide-react';
import { formatDate } from './utils';

interface CandidateCVProps {
  fullName: string;
  appliedAt: Date;
  onViewCV: () => void;
  onDownloadCV: () => void;
}

const CandidateCV: React.FC<CandidateCVProps> = ({ fullName, appliedAt, onViewCV, onDownloadCV }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>CV / Resume</CardTitle>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={onViewCV}
          >
            <Eye className="h-4 w-4" />
            <span>Wyświetl CV</span>
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={onDownloadCV}
          >
            <Download className="h-4 w-4" />
            <span>Pobierz CV</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-md p-4 bg-muted/50">
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="bg-gray-100 rounded-md w-full sm:w-40 h-52 flex items-center justify-center border">
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium mb-2">CV - {fullName}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Przesłane {formatDate(appliedAt)}
              </p>
              <div className="space-y-2">
                <div className="text-sm">
                  <span className="font-medium">Format:</span> PDF
                </div>
                <div className="text-sm">
                  <span className="font-medium">Rozmiar:</span> 1.2 MB
                </div>
                <div className="text-sm">
                  <span className="font-medium">Język:</span> Polski
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-medium mb-2">Kluczowe umiejętności z CV</h4>
            <div className="flex flex-wrap gap-2">
              {['Zarządzanie zespołem', 'Excel', 'Analiza danych', 'Prezentacje', 'Negocjacje', 'Obsługa klienta'].map((skill, index) => (
                <div key={index} className="bg-secondary px-3 py-1 rounded-full text-xs">
                  {skill}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CandidateCV;
