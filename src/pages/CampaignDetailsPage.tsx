
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
  Building2 
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';

const CampaignDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
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
                  <span>{campaign.candidatesCount}</span>
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="candidates">Kandydaci ({campaign.candidatesCount})</TabsTrigger>
              <TabsTrigger value="team">Zespół rekrutacyjny</TabsTrigger>
              <TabsTrigger value="settings">Ustawienia</TabsTrigger>
            </TabsList>
            
            <TabsContent value="candidates" className="py-4">
              <div className="text-center py-10">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg mb-1">Brak kandydatów</h3>
                <p className="text-muted-foreground mb-4">
                  Ta kampania nie ma jeszcze przypisanych kandydatów.
                </p>
                <Button>
                  Dodaj kandydatów
                </Button>
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
            
            <TabsContent value="settings" className="py-4">
              <div className="space-y-4">
                <h3 className="font-medium">Ustawienia kampanii</h3>
                <p className="text-muted-foreground">
                  Tutaj znajdą się dodatkowe ustawienia kampanii rekrutacyjnej.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignDetailsPage;
