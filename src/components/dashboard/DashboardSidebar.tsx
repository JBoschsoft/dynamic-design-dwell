import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Users, 
  Briefcase, 
  Search, 
  BarChart, 
  Settings, 
  LogOut, 
  HelpCircle,
  Building2,
  Palette,
  Link as LinkIcon,
  CreditCard,
  Bell,
  Lock,
  Database,
  Trash2,
  User,
  Clock,
  ChevronDown,
  ChevronRight,
  UserRound
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
import { Button } from '@/components/ui';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { mockCandidates } from '@/components/candidates/mockData';

interface RecentCandidate {
  id: string;
  firstName: string;
  lastName: string;
  viewedAt: Date;
}

const DashboardSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const sectionId = searchParams.get('section');
  
  const [recentCandidates, setRecentCandidates] = useState<RecentCandidate[]>(() => {
    const saved = localStorage.getItem('recentlyViewedCandidates');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isRecentCandidatesOpen, setIsRecentCandidatesOpen] = useState(false);
  const [activeSettingsSection, setActiveSettingsSection] = useState<string | null>(sectionId);
  const [isSettingsAccordionOpen, setIsSettingsAccordionOpen] = useState(location.pathname === '/dashboard/settings');
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isCandidatesListPage = location.pathname === '/dashboard/candidates';
  const isCandidateSearchPage = location.pathname === '/dashboard/candidates/search';
  const isCandidatePath = location.pathname.startsWith('/dashboard/candidates');
  const isSpecificCandidate = location.pathname.includes('/dashboard/candidates/') && id;
  const isSettingsPage = location.pathname === '/dashboard/settings';
  
  const currentCandidate = isSpecificCandidate ? 
    mockCandidates.find(c => c.id === id) : null;
    
  useEffect(() => {
    if (currentCandidate && id) {
      const newRecentCandidate = {
        id: currentCandidate.id,
        firstName: currentCandidate.firstName,
        lastName: currentCandidate.lastName,
        viewedAt: new Date()
      };
      
      setRecentCandidates(prev => {
        const filtered = prev.filter(c => c.id !== id);
        const updated = [newRecentCandidate, ...filtered];
        const limited = updated.slice(0, 10);
        
        localStorage.setItem('recentlyViewedCandidates', JSON.stringify(limited));
        
        return limited;
      });
    }
  }, [currentCandidate, id]);

  useEffect(() => {
    if (isCandidatesListPage && !isRecentCandidatesOpen) {
      setIsRecentCandidatesOpen(true);
    }
  }, [isCandidatesListPage]);

  useEffect(() => {
    if (isSettingsPage && !isSettingsAccordionOpen) {
      setIsSettingsAccordionOpen(true);
    }
  }, [isSettingsPage]);

  useEffect(() => {
    if (!isSettingsPage) return;

    const handleScroll = () => {
      const sections = document.querySelectorAll('[id^="company-profile"], [id^="branding"], [id^="integrations"], [id^="billing"], [id^="team"], [id^="notifications"], [id^="security"], [id^="data-management"], [id^="danger-zone"]');
      
      let currentSection = null;
      let minDistance = Infinity;
      
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        const distance = Math.abs(rect.top - 100);
        
        if (distance < minDistance) {
          minDistance = distance;
          currentSection = section.id;
        }
      });
      
      if (currentSection) {
        setActiveSettingsSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isSettingsPage]);

  const handleCandidatesClick = () => {
    navigate('/dashboard/candidates');
  };

  const handleToggleAccordion = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRecentCandidatesOpen(prev => !prev);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Wylogowano pomyślnie",
        description: "Zostałeś wylogowany z systemu.",
      });
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Błąd wylogowania",
        description: "Nie udało się wylogować. Spróbuj ponownie.",
        variant: "destructive",
      });
    }
  };

  const settingsItems = [
    { title: 'Profil firmy', icon: Building2, sectionId: 'company-profile' },
    { title: 'Branding', icon: Palette, sectionId: 'branding' },
    { title: 'Integracje', icon: LinkIcon, sectionId: 'integrations' },
    { title: 'Płatności i subskrypcja', icon: CreditCard, sectionId: 'billing' },
    { title: 'Zespół i uprawnienia', icon: Users, sectionId: 'team' },
    { title: 'Powiadomienia', icon: Bell, sectionId: 'notifications' },
    { title: 'Bezpieczeństwo', icon: Lock, sectionId: 'security' },
    { title: 'Zarządzanie danymi', icon: Database, sectionId: 'data-management' },
    { title: 'Strefa zagrożenia', icon: Trash2, sectionId: 'danger-zone' },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2.5">
          <Avatar className="h-8 w-8 bg-primary">
            <AvatarImage src="" alt="Logo" />
            <AvatarFallback className="bg-primary text-primary-foreground">HR</AvatarFallback>
          </Avatar>
          <span className="font-bold text-lg">HR Assist</span>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Nawigacja</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/dashboard')}>
                  <Link to="/dashboard">
                    <LayoutDashboard />
                    <span>Pulpit</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/dashboard/campaigns')}>
                  <Link to="/dashboard/campaigns">
                    <Briefcase />
                    <span>Kampanie rekrutacyjne</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <Collapsible 
                  open={isRecentCandidatesOpen} 
                  onOpenChange={setIsRecentCandidatesOpen}
                >
                  <div className="flex items-center w-full">
                    <SidebarMenuButton 
                      onClick={handleCandidatesClick}
                      className={`flex-1 ${isCandidatePath && !isCandidateSearchPage ? 'font-medium text-sidebar-accent-foreground bg-sidebar-accent' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        <Users />
                        <span>Kandydaci</span>
                      </div>
                    </SidebarMenuButton>
                    
                    {recentCandidates.length > 0 && (
                      <CollapsibleTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 p-0 hover:bg-transparent"
                          onClick={handleToggleAccordion}
                        >
                          {isRecentCandidatesOpen ? 
                            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" /> :
                            <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200" />
                          }
                        </Button>
                      </CollapsibleTrigger>
                    )}
                  </div>
                  
                  {recentCandidates.length > 0 && (
                    <CollapsibleContent className="pl-8 pr-2 pt-1 pb-0">
                      <div className="flex flex-col space-y-1">
                        {isSpecificCandidate && currentCandidate && (
                          <Link 
                            to={`/dashboard/candidates/${id}`}
                            className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md bg-sidebar-accent/50 font-medium"
                          >
                            <User className="h-3 w-3" />
                            <span className="truncate">{`${currentCandidate.firstName} ${currentCandidate.lastName}`}</span>
                          </Link>
                        )}
                        
                        <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground mt-2">
                          <Clock className="h-3 w-3" />
                          <span>Ostatnio przeglądane</span>
                        </div>
                        
                        {recentCandidates
                          .filter(c => !isSpecificCandidate || c.id !== id)
                          .slice(0, 5)
                          .map(candidate => (
                            <Link 
                              key={candidate.id}
                              to={`/dashboard/candidates/${candidate.id}`}
                              className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-accent/30"
                            >
                              <User className="h-3 w-3" />
                              <span className="truncate">{`${candidate.firstName} ${candidate.lastName}`}</span>
                            </Link>
                          ))
                        }
                      </div>
                    </CollapsibleContent>
                  )}
                </Collapsible>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/dashboard/candidates/search')}>
                  <Link to="/dashboard/candidates/search">
                    <Search />
                    <span>Wyszukiwanie kandydatów</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive('/dashboard/analytics')}>
                  <Link to="/dashboard/analytics">
                    <BarChart />
                    <span>Analityka</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Administracja</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Accordion 
                  type="single" 
                  collapsible 
                  className="w-full border-none"
                  value={isSettingsAccordionOpen ? 'settings' : ''}
                  onValueChange={(value) => setIsSettingsAccordionOpen(value === 'settings')}
                >
                  <AccordionItem value="settings" className="border-none">
                    <AccordionTrigger 
                      className={`flex items-center gap-2 w-full px-2 py-2 rounded-md ${isSettingsPage ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'hover:bg-sidebar-accent'}`}
                    >
                      <div className="flex items-center gap-2 flex-1 text-left">
                        <Settings className="h-4 w-4" />
                        <span>Ustawienia workspace</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-8 pr-2 pt-1 pb-0">
                      <div className="flex flex-col space-y-1">
                        {settingsItems.map((item) => (
                          <Link 
                            key={item.sectionId}
                            to={`/dashboard/settings?section=${item.sectionId}`}
                            className={`flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground ${activeSettingsSection === item.sectionId ? 'bg-sidebar-accent/50 text-sidebar-accent-foreground font-medium' : ''}`}
                            onClick={() => setActiveSettingsSection(item.sectionId)}
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a 
                    href="/dokumentacja" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2"
                  >
                    <HelpCircle />
                    <span>Pomoc i wsparcie</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="flex justify-between items-center p-4">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8 bg-primary">
              <AvatarImage src="" alt="Avatar" />
              <AvatarFallback className="bg-primary text-primary-foreground">
                <UserRound className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium">Jan Kowalski</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          </div>
          
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
