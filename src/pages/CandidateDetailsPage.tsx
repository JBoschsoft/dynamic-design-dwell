
import React from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Button, Popover, PopoverContent, PopoverTrigger } from '@/components/ui';
import { mockCandidates } from '@/components/candidates/mockData';
import { formatDate } from '@/components/candidates/utils';
import { Users, Briefcase, CheckCircle2, FileText } from 'lucide-react';

const CandidateDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // Find the candidate from the mock data
  const candidate = mockCandidates.find(c => c.id === id);
  
  if (!candidate) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Kandydat nie znaleziony</h1>
        <p>Nie można znaleźć kandydata o podanym ID.</p>
      </div>
    );
  }
  
  // Create full name from firstName and lastName
  const fullName = `${candidate.firstName} ${candidate.lastName}`;
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{fullName}</h1>
        
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>Przypisz właściciela</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <div className="space-y-2">
                <h4 className="font-medium">Wybierz właściciela</h4>
                <p className="text-xs text-muted-foreground">To be implemented</p>
              </div>
            </PopoverContent>
          </Popover>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Briefcase className="h-4 w-4" />
                <span>Dodaj do kampanii</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <div className="space-y-2">
                <h4 className="font-medium">Wybierz kampanię</h4>
                <p className="text-xs text-muted-foreground">To be implemented</p>
              </div>
            </PopoverContent>
          </Popover>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                <span>Rozpocznij screening</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <div className="space-y-2">
                <h4 className="font-medium">Wybierz workflow</h4>
                <p className="text-xs text-muted-foreground">To be implemented</p>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      
      <div className="flex flex-col space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informacje podstawowe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p>{candidate.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Telefon</p>
              <p>{candidate.phone}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1
                ${candidate.stage === 'Nowy' ? 'bg-blue-100 text-blue-800' : ''}
                ${candidate.stage === 'Screening' ? 'bg-purple-100 text-purple-800' : ''}
                ${candidate.stage === 'Wywiad' ? 'bg-amber-100 text-amber-800' : ''}
                ${candidate.stage === 'Oferta' ? 'bg-green-100 text-green-800' : ''}
                ${candidate.stage === 'Zatrudniony' ? 'bg-emerald-100 text-emerald-800' : ''}
                ${candidate.stage === 'Odrzucony' ? 'bg-red-100 text-red-800' : ''}
              `}>
                {candidate.stage}
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Źródło</p>
              <p>{candidate.source}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Data aplikacji</p>
              <p>{formatDate(candidate.appliedAt)}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Szczegóły zawodowe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {candidate.jobTitle && (
              <div>
                <p className="text-sm text-muted-foreground">Stanowisko</p>
                <p>{candidate.jobTitle}</p>
              </div>
            )}
            {candidate.experience && (
              <div>
                <p className="text-sm text-muted-foreground">Doświadczenie</p>
                <p>{candidate.experience}</p>
              </div>
            )}
            {candidate.education && (
              <div>
                <p className="text-sm text-muted-foreground">Wykształcenie</p>
                <p>{candidate.education}</p>
              </div>
            )}
            {candidate.salary && (
              <div>
                <p className="text-sm text-muted-foreground">Oczekiwane wynagrodzenie</p>
                <p>{candidate.salary}</p>
              </div>
            )}
            {candidate.availability && (
              <div>
                <p className="text-sm text-muted-foreground">Dostępność</p>
                <p>{candidate.availability}</p>
              </div>
            )}
            {candidate.linkedin && (
              <div>
                <p className="text-sm text-muted-foreground">LinkedIn</p>
                <a href={candidate.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {candidate.linkedin}
                </a>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* New CV section */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>CV / Resume</CardTitle>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span>Pobierz CV</span>
            </Button>
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
                    Przesłane {formatDate(candidate.appliedAt)}
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
        
        <Card>
          <CardHeader>
            <CardTitle>Notatki</CardTitle>
          </CardHeader>
          <CardContent>
            {candidate.notes ? (
              <p className="whitespace-pre-wrap">{candidate.notes}</p>
            ) : (
              <p className="text-muted-foreground italic">Brak notatek</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CandidateDetailsPage;
