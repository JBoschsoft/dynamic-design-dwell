
import React, { useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Button, Popover, PopoverContent, PopoverTrigger, Textarea, Form, FormField, FormItem, FormControl } from '@/components/ui';
import { Input } from '@/components/ui/input';
import { mockCandidates } from '@/components/candidates/mockData';
import { formatDate } from '@/components/candidates/utils';
import { Users, Briefcase, CheckCircle2, FileText, Clock, Phone, Calendar, MessageSquare, Pen, Download, Eye, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';

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
  const [isAddingNote, setIsAddingNote] = useState(false);
  
  const form = useForm<{ noteText: string }>({
    defaultValues: {
      noteText: ''
    }
  });
  
  // Extract return path and source from location state
  const returnPath = location.state?.returnPath || '/dashboard/candidates';
  const fromSource = location.state?.from || '';
  
  // Function to handle back navigation with state preservation
  const handleBackNavigation = () => {
    navigate(returnPath, {
      state: { 
        from: 'candidateProfile',
        // Pass any other state that might be needed
      }
    });
  };
  
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

  // Mock candidate history events for the timeline
  const candidateHistory = [
    {
      id: 1,
      type: 'import',
      title: 'Dodano do systemu',
      description: 'Kandydat został zaimportowany do systemu',
      date: candidate.appliedAt,
      icon: Clock
    },
    {
      id: 2,
      type: 'campaign',
      title: 'Dodano do kampanii',
      description: 'Dodano do kampanii "Frontend Developer"',
      date: new Date(candidate.appliedAt.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days after
      icon: Briefcase
    },
    {
      id: 3,
      type: 'screening',
      title: 'Wstępna rozmowa telefoniczna',
      description: 'Wynik: Pozytywny. Kandydat wykazał zainteresowanie ofertą.',
      date: new Date(candidate.appliedAt.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days after
      icon: Phone
    },
    {
      id: 4,
      type: 'interview',
      title: 'Rozmowa techniczna',
      description: 'Wynik: Pozytywny. Kandydat ma odpowiednie umiejętności techniczne.',
      date: new Date(candidate.appliedAt.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days after
      icon: Calendar
    },
    {
      id: 5,
      type: 'feedback',
      title: 'Informacja zwrotna',
      description: 'Wysłano informację zwrotną z decyzją pozytywną.',
      date: new Date(candidate.appliedAt.getTime() + 15 * 24 * 60 * 60 * 1000), // 15 days after
      icon: MessageSquare
    }
  ].sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date descending (newest first)
  
  const handleAddNote = (data: { noteText: string }) => {
    if (data.noteText.trim()) {
      const newNote: NoteEntry = {
        id: Date.now().toString(),
        text: data.noteText,
        createdAt: new Date(),
        createdBy: 'Jan Nowak' // In a real app, this would be the current user
      };
      
      setNotes([newNote, ...notes]);
      setIsAddingNote(false);
      form.reset();
    }
  };

  const handleDownloadCV = () => {
    // In a real app, this would trigger a download of the actual CV file
    console.log('Downloading CV for', fullName);
    // Implementation would depend on how files are stored (e.g., using browser's download API)
  };

  const handleViewCV = () => {
    // In a real app, this would open the CV in a new window or tab
    console.log('Viewing CV for', fullName);
    window.open('#', '_blank'); // Replace '#' with actual CV URL in a real app
  };
  
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBackNavigation}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Powrót</span>
          </Button>
          <h1 className="text-2xl font-bold">{fullName}</h1>
        </div>
        
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
      
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-6">
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
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Notatki</CardTitle>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => setIsAddingNote(true)}
              >
                <Pen className="h-4 w-4" />
                <span>Dodaj notatkę</span>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAddingNote && (
                <div className="mb-6 border rounded-md p-4 bg-muted/30">
                  <form onSubmit={form.handleSubmit(handleAddNote)}>
                    <div className="mb-3">
                      <Textarea
                        placeholder="Wpisz notatkę..."
                        className="w-full min-h-[100px]"
                        {...form.register('noteText')}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setIsAddingNote(false);
                          form.reset();
                        }}
                      >
                        Anuluj
                      </Button>
                      <Button type="submit" size="sm">
                        Zapisz
                      </Button>
                    </div>
                  </form>
                </div>
              )}
              
              {notes.length > 0 ? (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className="border rounded-md p-4">
                      <p className="whitespace-pre-wrap mb-3">{note.text}</p>
                      <div className="text-xs text-muted-foreground flex justify-between">
                        <span>{note.createdBy}</span>
                        <span>{formatDate(note.createdAt)} {note.createdAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground italic">Brak notatek</p>
              )}
            </CardContent>
          </Card>
          
          {/* CV/Resume section moved to the bottom */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>CV / Resume</CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={handleViewCV}
                >
                  <Eye className="h-4 w-4" />
                  <span>Wyświetl CV</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={handleDownloadCV}
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
        </div>
        
        <div className="w-full md:w-80 lg:w-96 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Historia kandydata</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {candidateHistory.map((event, index) => (
                  <div key={event.id} className="relative pl-8">
                    {index < candidateHistory.length - 1 && (
                      <div className="absolute left-3.5 top-8 bottom-0 w-px bg-border" />
                    )}
                    
                    <div className="absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full border bg-background">
                      <event.icon className="h-4 w-4 text-primary" />
                    </div>
                    
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground mb-1">
                        {event.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(event.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CandidateDetailsPage;
