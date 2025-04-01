
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { mockCandidates } from '@/components/candidates/mockData';
import { formatDate } from '@/components/candidates/utils';

const CandidateDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Find the candidate from the mock data
  const candidate = mockCandidates.find(c => c.id === id);
  
  if (!candidate) {
    return (
      <div className="p-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={() => navigate('/dashboard/candidates')} className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Powrót
          </Button>
          <h1 className="text-2xl font-bold">Kandydat nie znaleziony</h1>
        </div>
        <p>Nie można znaleźć kandydata o podanym ID.</p>
      </div>
    );
  }
  
  // Create full name from firstName and lastName
  const fullName = `${candidate.firstName} ${candidate.lastName}`;
  
  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => navigate('/dashboard/candidates')} className="mr-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Powrót
        </Button>
        <h1 className="text-2xl font-bold">{fullName}</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
