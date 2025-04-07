import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockCampaigns } from '@/components/campaigns/mockData';
import { Campaign } from '@/components/campaigns/types';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { useToast } from '@/hooks/use-toast';
import { Edit } from 'lucide-react';
import CampaignInfo from '@/components/campaigns/CampaignInfo';
import CampaignStatusCard from '@/components/campaigns/CampaignStatusCard';
import ScreeningStatusCard from '@/components/campaigns/ScreeningStatusCard';
import CandidatesInCampaignTable from '@/components/campaigns/CandidatesInCampaignTable';
import PhoneScreeningsTable from '@/components/campaigns/PhoneScreeningsTable';
import ScreeningSettings from '@/components/campaigns/ScreeningSettings';
import RecruitmentTeam from '@/components/campaigns/RecruitmentTeam';
import EditCampaignDialog from '@/components/campaigns/EditCampaignDialog';

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
  reminderTime: 24, // hours before screening,
};

const CampaignDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState(mockCandidates);
  const [phoneScreenings, setPhoneScreenings] = useState(mockPhoneScreenings);
  const [screeningSettings, setScreeningSettings] = useState(mockScreeningSettings);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Mock data for screening stats
  const [screeningCandidatesCount] = useState(2);
  const [candidatesWithManagerCount] = useState(1);
  const [tokensUsed] = useState(150);
  
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
    setIsEditDialogOpen(true);
  };

  const handleSaveCampaign = (updatedCampaign: Campaign) => {
    const campaignIndex = mockCampaigns.findIndex(c => c.id === campaign?.id);
    if (campaignIndex !== -1) {
      mockCampaigns[campaignIndex] = updatedCampaign;
      setCampaign(updatedCampaign);
    }
  };

  const handleAddCandidate = () => {
    toast({
      title: "Funkcja w przygotowaniu",
      description: "Dodawanie kandydatów będzie dostępne wkrótce"
    });
  };

  const handleScheduleScreening = () => {
    toast({
      title: "Funkcja w przygotowaniu",
      description: "Planowanie rozmów telefonicznych będzie dostępne wkrótce"
    });
  };

  const handleModifyScreeningParameters = () => {
    toast({
      title: "Funkcja w przygotowaniu",
      description: "Modyfikacja parametrów screeningu będzie dostępna wkrótce"
    });
  };

  const handleEditScreeningQuestions = () => {
    toast({
      title: "Funkcja w przygotowaniu",
      description: "Edycja pytań screeningowych będzie dostępna wkrótce"
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {campaign.name}
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
          <CampaignInfo campaign={campaign} />
        </div>
        
        <div className="col-span-1 space-y-6">
          <CampaignStatusCard 
            campaign={campaign} 
            candidatesCount={candidates.length} 
          />
          <ScreeningStatusCard
            campaign={campaign}
            screeningCandidatesCount={screeningCandidatesCount}
            candidatesWithManagerCount={candidatesWithManagerCount}
            tokensUsed={tokensUsed}
          />
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Zarządzanie kampanią</h2>
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
              <CandidatesInCampaignTable 
                candidates={candidates}
                onAddCandidate={handleAddCandidate}
              />
            </TabsContent>
            
            <TabsContent value="phone-screenings" className="py-4">
              <PhoneScreeningsTable 
                phoneScreenings={phoneScreenings}
                onScheduleScreening={handleScheduleScreening}
              />
            </TabsContent>
            
            <TabsContent value="settings" className="py-4">
              <ScreeningSettings 
                screeningSettings={screeningSettings}
                onModifyParameters={handleModifyScreeningParameters}
                onEditQuestions={handleEditScreeningQuestions}
              />
            </TabsContent>
            
            <TabsContent value="team" className="py-4">
              <RecruitmentTeam />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {campaign && (
        <EditCampaignDialog
          campaign={campaign}
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSave={handleSaveCampaign}
        />
      )}
    </div>
  );
};

export default CampaignDetailsPage;
