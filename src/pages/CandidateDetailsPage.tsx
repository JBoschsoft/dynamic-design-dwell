
import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Button, Popover, PopoverContent, PopoverTrigger } from '@/components/ui';
import { mockCandidates } from '@/components/candidates/mockData';
import { Users, Briefcase, Phone, Calendar, FileText } from 'lucide-react';
import EditableBasicInfo from '@/components/candidates/EditableBasicInfo';
import LinkedinSearch from '@/components/candidates/LinkedinSearch';
import LinkedinProfileDisplay from '@/components/candidates/LinkedinProfileData';
import { LinkedinProfileData, CandidateHistoryEvent } from '@/components/candidates/types';
import CandidateHistory from '@/components/candidates/CandidateHistory';
import CandidateNotes from '@/components/candidates/CandidateNotes';
import CandidateCV from '@/components/candidates/CandidateCV';
import ProfessionalDetails from '@/components/candidates/ProfessionalDetails';

interface NoteEntry {
  id: string;
  text: string;
  createdAt: Date;
  createdBy: string;
}

const CandidateDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [notes, setNotes] = useState<NoteEntry[]>([
    {
      id: '1',
      text: 'Kandydat był bardzo zainteresowany pozycją i dobrze wypadł podczas rozmowy technicznej.',
      createdAt: new Date(),
      createdBy: 'Anna Kowalska'
    }
  ]);
  const [linkedinData, setLinkedinData] = useState<LinkedinProfileData | null>(null);
  const [candidate, setCandidate] = useState(mockCandidates.find(c => c.id === id));
  
  // Define candidate history
  const candidateHistory: CandidateHistoryEvent[] = [
    {
      id: '1',
      title: 'Aplikacja złożona',
      description: 'Kandydat złożył aplikację',
      date: candidate?.appliedAt || new Date(),
      icon: Users
    },
    {
      id: '2',
      title: 'Screening telefoniczny',
      description: 'Pozytywny wynik screeningu',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      icon: Phone
    },
    {
      id: '3',
      title: 'Rozmowa kwalifikacyjna',
      description: 'Zaplanowana rozmowa z zespołem',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      icon: Calendar
    },
    {
      id: '4',
      title: 'Zadanie testowe',
      description: 'Zadanie zostało przesłane do kandydata',
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      icon: FileText
    }
  ];
  
  useEffect(() => {
    window.scrollTo(0, 0);
    console.log('CandidateDetailsPage location state:', location.state);
  }, []);
  
  const returnPath = location.state?.returnPath || '/dashboard/candidates';
  const fromSource = location.state?.from || '';
  
  if (!candidate) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Kandydat nie znaleziony</h1>
        <p>Nie można znaleźć kandydata o podanym ID.</p>
      </div>
    );
  }
  
  const fullName = `${candidate.firstName} ${candidate.lastName}`;

  const handleUpdateCandidate = (updatedData: Partial<typeof candidate>) => {
    setCandidate(prev => {
      if (!prev) return prev;
      return { ...prev, ...updatedData };
    });
    // In a real application, you would save this to your backend
    console.log('Updated candidate data:', { ...candidate, ...updatedData });
  };
  
  const handleLinkedinDataFetched = (data: LinkedinProfileData) => {
    setLinkedinData(data);
    // Optionally update candidate data with LinkedIn info
    handleUpdateCandidate({
      linkedin: data.profileUrl,
      jobTitle: data.headline,
      // Add other fields as needed
    });
  };

  const handleAddNote = (noteText: string) => {
    const newNote: NoteEntry = {
      id: Date.now().toString(),
      text: noteText,
      createdAt: new Date(),
      createdBy: 'Jan Nowak'
    };
    
    setNotes([newNote, ...notes]);
  };

  const handleDownloadCV = () => {
    console.log('Downloading CV for', fullName);
  };

  const handleViewCV = () => {
    console.log('Viewing CV for', fullName);
    window.open('#', '_blank');
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{fullName}</h1>
        
        <div className="flex items-center gap-2">
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
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informacje podstawowe</CardTitle>
            </CardHeader>
            <CardContent>
              <EditableBasicInfo 
                candidate={candidate} 
                onUpdate={handleUpdateCandidate}
              />
            </CardContent>
          </Card>
          
          <ProfessionalDetails candidate={candidate} />
          
          <LinkedinSearch onDataFetched={handleLinkedinDataFetched} />
          
          {linkedinData && (
            <Card>
              <CardHeader>
                <CardTitle>Dane z LinkedIn</CardTitle>
              </CardHeader>
              <CardContent>
                <LinkedinProfileDisplay data={linkedinData} />
              </CardContent>
            </Card>
          )}
          
          <CandidateNotes notes={notes} onAddNote={handleAddNote} />
          
          <CandidateCV 
            fullName={fullName} 
            appliedAt={candidate.appliedAt}
            onViewCV={handleViewCV}
            onDownloadCV={handleDownloadCV}
          />
        </div>
        
        <div className="w-full md:w-80 lg:w-96 space-y-6">
          <CandidateHistory history={candidateHistory} />
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailsPage;
