
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockCampaigns } from '@/components/campaigns/mockData';
import { Campaign } from '@/components/campaigns/types';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Badge,
  Separator,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { 
  Edit, 
  Users, 
  Calendar, 
  MapPin, 
  ClipboardList, 
  CheckCircle2, 
  Briefcase, 
  Building2,
  Phone,
  Settings,
  UserPlus,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';

// Mock data for candidates in this campaign
const mockCandidates = [
  {
    id: '1',
    name: 'Jan Kowalski',
    email: 'jan.kowalski@example.com',
    phone: '+48 123 456 789',
    status: 'new',
    appliedDate: '2025-03-01T10:00:00Z',
    source: 'LinkedIn',
    rating: 4
  },
  {
    id: '2',
    name: 'Anna Nowak',
    email: 'anna.nowak@example.com',
    phone: '+48 987 654 321',
    status: 'screening',
    appliedDate: '2025-03-03T14:30:00Z',
    source: 'Polecenie',
    rating: 3
  },
  {
    id: '3',
    name: 'Piotr Wiśniewski',
    email: 'piotr.wisniewski@example.com',
    phone: '+48 555 123 456',
    status: 'interview',
    appliedDate: '2025-03-05T09:15:00Z',
    source: 'Pracuj.pl',
    rating: 5
  }
];

// Mock data for phone screenings
const mockPhoneScreenings = [
  {
    id: '1',
    candidateId: '2',
    candidateName: 'Anna Nowak',
    date: '2025-03-15T13:00:00Z',
    duration: 15,
    result: 'positive',
    notes: 'Dobra komunikacja, odpowiednie doświadczenie',
    skills: ['Java', 'SQL', 'Spring'],
    interviewer: 'Marek Kowalczyk'
  },
  {
    id: '2',
    candidateId: '3',
    candidateName: 'Piotr Wiśniewski',
    date: '2025-03-16T10:30:00Z',
    duration: 20,
    result: 'positive',
    notes: 'Bardzo dobre doświadczenie techniczne, wymaga dalszej weryfikacji umiejętności kierowniczych',
    skills: ['React', 'TypeScript', 'Node.js'],
    interviewer: 'Agnieszka Nowakowska'
  }
];

// Mock phone screening settings
const mockScreeningSettings = {
  defaultDuration: 15,
  questions: [
    'Opisz swoje doświadczenie w podobnych projektach',
    'Jakie są Twoje oczekiwania finansowe?',
    'Kiedy możesz rozpocząć pracę?',
    'Jakie znasz technologie związane z tym stanowiskiem?'
  ],
  automaticReminders: true,
  reminderTime: 24, // hours before screening
};

const CampaignDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState(mockCandidates);
  const [phoneScreenings, setPhoneScreenings] = useState(mockPhoneScreenings);
  const [screeningSettings, setScreeningSettings] = useState(mockScreeningSettings);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchCampaign = () => {
      setLoading(true);
      setTimeout(() => {
        const foundCampaign = mockCampaigns.find(c => c.id === id);
        if (foundCampaign) {
          setCampaign(foundCampaign);
        } else {
          toast({
            title: "Kampania nie znaleziona",
            description: "Nie mogliśmy znaleźć szukanej kampanii",
            variant: "destructive"
          });
        }
        setLoading(false);
      }, 300);
    };
    
    fetchCampaign();
  }, [id, toast]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!campaign) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-lg text-muted-foreground">Kampania nie została znaleziona</p>
        <Button onClick={() => navigate('/dashboard/campaigns')}>
          Wróć do listy kampanii
        </Button>
      </div>
    );
  }

  const handleEditCampaign = () => {
    navigate(`/dashboard/campaigns/edit/${campaign.id}`);
  };

  const handleAddCandidate = () => {
    toast({
      title: "Funkcja w przygotowaniu",
      description: "Dodawanie kandydatów będzie dostępne wkrótce"
    });
  };
  
  const getStatusBadge = (status: Campaign['status']) => {
    switch(status) {
      case 'active':
        return <Badge className="bg-green-500">Aktywna</Badge>;
      case 'draft':
        return <Badge variant="outline">Szkic</Badge>;
      case 'closed':
        return <Badge variant="secondary">Zakończona</Badge>;
      case 'paused':
        return <Badge variant="destructive">Wstrzymana</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nie określono';
    return format(parseISO(dateString), 'd MMMM yyyy', { locale: pl });
  };

  const formatDateTime = (dateString: string) => {
    return format(parseISO(dateString), 'd MMMM yyyy, HH:mm', { locale: pl });
  };

  const getCandidateStatusBadge = (status: string) => {
    switch(status) {
      case 'new':
        return <Badge variant="outline">Nowy</Badge>;
      case 'screening':
        return <Badge className="bg-blue-500">Screening</Badge>;
      case 'interview':
        return <Badge className="bg-purple-500">Wywiad</Badge>;
      case 'offer':
        return <Badge className="bg-amber-500">Oferta</Badge>;
      case 'hired':
        return <Badge className="bg-green-500">Zatrudniony</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Odrzucony</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getScreeningResultBadge = (result: string) => {
    switch(result) {
      case 'positive':
        return <Badge className="bg-green-500">Pozytywny</Badge>;
      case 'negative':
        return <Badge variant="destructive">Negatywny</Badge>;
      case 'neutral':
        return <Badge variant="secondary">Neutralny</Badge>;
      default:
        return <Badge variant="outline">{result}</Badge>;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
            {campaign.name}
            {getStatusBadge(campaign.status)}
          </h1>
          <p className="text-muted-foreground">
            Szczegóły kampanii rekrutacyjnej
          </p>
        </div>
        
        <Button onClick={handleEditCampaign}>
          <Edit className="mr-2 h-4 w-4" />
          Edytuj kampanię
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informacje o stanowisku</CardTitle>
              <CardDescription>
                Szczegółowe informacje o stanowisku i wymaganiach
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Stanowisko</p>
                    <p>{campaign.position}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Dział</p>
                    <p>{campaign.department}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Lokalizacja</p>
                    <p>{campaign.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Okres rekrutacji</p>
                    <p>{formatDate(campaign.startDate)} - {campaign.endDate ? formatDate(campaign.endDate) : 'Nie określono'}</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="font-medium mb-2">Opis stanowiska</h3>
                <p className="text-sm">{campaign.description}</p>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Wymagania</h3>
                <ul className="space-y-1">
                  {campaign.requirements.map((req, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Obowiązki</h3>
                <ul className="space-y-1">
                  {campaign.responsibilities.map((resp, index) => (
                    <li key={index} className="flex items-start space-x-2 text-sm">
                      <ClipboardList className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status kampanii</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium">Status</div>
                <div>{getStatusBadge(campaign.status)}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium">Kandydaci</div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  <span>{candidates.length}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium">Data utworzenia</div>
                <div className="text-sm">{formatDate(campaign.createdAt)}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm font-medium">Ostatnia aktualizacja</div>
                <div className="text-sm">{formatDate(campaign.updatedAt)}</div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Zarządzanie kampanią</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="candidates">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="candidates">Kandydaci ({candidates.length})</TabsTrigger>
              <TabsTrigger value="phone-screenings">Rozmowy telefoniczne ({phoneScreenings.length})</TabsTrigger>
              <TabsTrigger value="settings">Ustawienia screeningu</TabsTrigger>
              <TabsTrigger value="team">Zespół rekrutacyjny</TabsTrigger>
            </TabsList>
            
            <TabsContent value="candidates" className="py-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Lista kandydatów</h3>
                <Button onClick={handleAddCandidate}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Dodaj kandydata
                </Button>
              </div>
              
              {candidates.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Imię i nazwisko</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Telefon</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Data aplikacji</TableHead>
                        <TableHead>Źródło</TableHead>
                        <TableHead>Ocena</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {candidates.map((candidate) => (
                        <TableRow key={candidate.id} className="cursor-pointer">
                          <TableCell className="font-medium">{candidate.name}</TableCell>
                          <TableCell>{candidate.email}</TableCell>
                          <TableCell>{candidate.phone}</TableCell>
                          <TableCell>{getCandidateStatusBadge(candidate.status)}</TableCell>
                          <TableCell>{formatDate(candidate.appliedDate)}</TableCell>
                          <TableCell>{candidate.source}</TableCell>
                          <TableCell>
                            <div className="flex">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <svg 
                                  key={i}
                                  xmlns="http://www.w3.org/2000/svg" 
                                  width="16" 
                                  height="16" 
                                  viewBox="0 0 24 24" 
                                  fill={i < candidate.rating ? "currentColor" : "none"} 
                                  stroke="currentColor" 
                                  strokeWidth="2" 
                                  strokeLinecap="round" 
                                  strokeLinejoin="round" 
                                  className={i < candidate.rating ? "text-yellow-400" : "text-gray-300"}
                                >
                                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg mb-1">Brak kandydatów</h3>
                  <p className="text-muted-foreground mb-4">
                    Ta kampania nie ma jeszcze przypisanych kandydatów.
                  </p>
                  <Button onClick={handleAddCandidate}>
                    Dodaj kandydatów
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="phone-screenings" className="py-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Rozmowy telefoniczne</h3>
                <Button variant="outline">
                  <Phone className="mr-2 h-4 w-4" />
                  Zaplanuj rozmowę
                </Button>
              </div>
              
              {phoneScreenings.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Kandydat</TableHead>
                        <TableHead>Data i godzina</TableHead>
                        <TableHead>Czas trwania (min)</TableHead>
                        <TableHead>Wynik</TableHead>
                        <TableHead>Rekruter</TableHead>
                        <TableHead>Umiejętności</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {phoneScreenings.map((screening) => (
                        <TableRow key={screening.id} className="cursor-pointer">
                          <TableCell className="font-medium">{screening.candidateName}</TableCell>
                          <TableCell>{formatDateTime(screening.date)}</TableCell>
                          <TableCell>{screening.duration}</TableCell>
                          <TableCell>{getScreeningResultBadge(screening.result)}</TableCell>
                          <TableCell>{screening.interviewer}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {screening.skills.map((skill, index) => (
                                <Badge key={index} variant="outline" className="bg-gray-100">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-10">
                  <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg mb-1">Brak rozmów telefonicznych</h3>
                  <p className="text-muted-foreground mb-4">
                    Dla tej kampanii nie przeprowadzono jeszcze żadnych rozmów telefonicznych.
                  </p>
                  <Button variant="outline">
                    Zaplanuj pierwszą rozmowę
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="settings" className="py-4">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Ustawienia rozmów telefonicznych</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Podstawowe parametry</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Domyślny czas rozmowy</span>
                          <span>{screeningSettings.defaultDuration} minut</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Automatyczne przypomnienia</span>
                          <Badge variant={screeningSettings.automaticReminders ? "default" : "outline"}>
                            {screeningSettings.automaticReminders ? "Włączone" : "Wyłączone"}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-medium">Czas przypomnienia</span>
                          <span>{screeningSettings.reminderTime} godz. przed rozmową</span>
                        </div>
                        <Button variant="outline" className="w-full">
                          <Settings className="mr-2 h-4 w-4" />
                          Modyfikuj parametry
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Pytania screeningowe</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <ul className="list-disc pl-5 space-y-2">
                          {screeningSettings.questions.map((question, index) => (
                            <li key={index} className="text-sm">{question}</li>
                          ))}
                        </ul>
                        <Button variant="outline" className="w-full">
                          <Edit className="mr-2 h-4 w-4" />
                          Edytuj pytania
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="team" className="py-4">
              <div className="text-center py-10">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg mb-1">Brak zespołu rekrutacyjnego</h3>
                <p className="text-muted-foreground mb-4">
                  Dodaj członków zespołu odpowiedzialnych za tę kampanię rekrutacyjną.
                </p>
                <Button>
                  Dodaj członków zespołu
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignDetailsPage;
