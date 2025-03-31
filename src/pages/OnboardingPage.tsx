
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Building2, ArrowRight, FileText, CheckCircle2 } from 'lucide-react';

const industries = [
  "IT & Software",
  "Healthcare",
  "Finance & Banking",
  "Retail",
  "Manufacturing",
  "Education",
  "Government",
  "Media & Entertainment",
  "Transportation & Logistics",
  "Energy & Utilities",
  "Telecommunications",
  "Other"
];

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Company setup form state
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  
  // Legal agreement states
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [currentAgreement, setCurrentAgreement] = useState<'tos' | 'privacy' | 'msa'>('tos');
  const [tosAgreed, setTosAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [msaAgreed, setMsaAgreed] = useState(false);
  
  const allAgreementsAccepted = tosAgreed && privacyAgreed && msaAgreed;
  
  const handleNextStep = async () => {
    if (!companyName || !industry || !companySize) {
      toast({
        variant: "destructive",
        title: "Uzupełnij wszystkie pola",
        description: "Wypełnij wszystkie wymagane informacje o firmie."
      });
      return;
    }
    
    if (!allAgreementsAccepted) {
      setCurrentAgreement('tos');
      setLegalModalOpen(true);
      return;
    }
    
    setLoading(true);
    
    try {
      // Here you would typically save the company information to Supabase
      // For now, we'll just simulate a delay and proceed to the next step
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For now just show a toast, in a real implementation you'd proceed to step 2
      toast({
        title: "Dane firmy zapisane",
        description: "Pomyślnie zapisano informacje o firmie."
      });
      
      // In a full implementation you would set the current step to 2
      // setCurrentStep(2);
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Błąd zapisu",
        description: error.message || "Wystąpił błąd podczas zapisywania informacji o firmie."
      });
    } finally {
      setLoading(false);
    }
  };
  
  const openAgreement = (type: 'tos' | 'privacy' | 'msa') => {
    setCurrentAgreement(type);
    setLegalModalOpen(true);
  };
  
  const handleAgreeToCurrentAgreement = () => {
    if (currentAgreement === 'tos') {
      setTosAgreed(true);
      if (!privacyAgreed) {
        setCurrentAgreement('privacy');
        return;
      } else if (!msaAgreed) {
        setCurrentAgreement('msa');
        return;
      }
    } else if (currentAgreement === 'privacy') {
      setPrivacyAgreed(true);
      if (!msaAgreed) {
        setCurrentAgreement('msa');
        return;
      }
    } else if (currentAgreement === 'msa') {
      setMsaAgreed(true);
    }
    
    setLegalModalOpen(false);
    
    if (allAgreementsAccepted || (currentAgreement === 'msa' && !msaAgreed)) {
      toast({
        title: "Warunki zaakceptowane",
        description: "Dziękujemy za zapoznanie się i akceptację wszystkich warunków."
      });
    }
  };
  
  const getAgreementTitle = () => {
    switch (currentAgreement) {
      case 'tos': return "Warunki korzystania z usługi";
      case 'privacy': return "Polityka prywatności";
      case 'msa': return "Umowa ramowa o świadczenie usług";
    }
  };
  
  const getAgreementDescription = () => {
    switch (currentAgreement) {
      case 'tos': return "Przeczytaj uważnie poniższe warunki korzystania z usługi przed kontynuowaniem.";
      case 'privacy': return "Zapoznaj się z polityką prywatności opisującą przetwarzanie danych osobowych.";
      case 'msa': return "Przeczytaj umowę ramową określającą szczegóły świadczenia usług.";
    }
  };
  
  const renderAgreementContent = () => {
    switch (currentAgreement) {
      case 'tos':
        return (
          <div className="space-y-4 my-6 text-sm">
            <h3 className="font-semibold">1. Wprowadzenie</h3>
            <p>
              Niniejsze Warunki Korzystania z Usługi („Warunki") regulują dostęp i korzystanie z platformy ProstyScreening.ai („Usługa"). 
              Korzystając z Usługi, zgadzasz się przestrzegać i być związanym niniejszymi Warunkami.
            </p>
            
            <h3 className="font-semibold">2. Opis Usługi</h3>
            <p>
              ProstyScreening.ai to platforma do automatyzacji procesów rekrutacyjnych, która pomaga firmom skuteczniej zarządzać i oceniać kandydatów.
              Usługa obejmuje narzędzia do analizy CV, przeprowadzania testów kompetencji, zarządzania procesem rekrutacji oraz generowania raportów.
            </p>
            
            <h3 className="font-semibold">3. Zobowiązania Użytkownika</h3>
            <p>
              Użytkownik zobowiązuje się do:
              <ul className="list-disc ml-6 mt-2">
                <li>Przestrzegania wszystkich obowiązujących przepisów prawa</li>
                <li>Niewykorzystywania Usługi do celów niezgodnych z prawem</li>
                <li>Nienaruszania praw innych użytkowników</li>
                <li>Zachowania poufności danych dostępowych do konta</li>
              </ul>
            </p>
            
            <h3 className="font-semibold">4. Odpowiedzialność</h3>
            <p>
              ProstyScreening.ai nie ponosi odpowiedzialności za:
              <ul className="list-disc ml-6 mt-2">
                <li>Decyzje podejmowane przez Użytkownika na podstawie danych z Usługi</li>
                <li>Przerwy w dostępie do Usługi wynikające z przyczyn technicznych</li>
                <li>Szkody wynikające z nieprawidłowego korzystania z Usługi</li>
              </ul>
            </p>
          </div>
        );
      case 'privacy':
        return (
          <div className="space-y-4 my-6 text-sm">
            <h3 className="font-semibold">1. Administrator Danych</h3>
            <p>
              Administratorem danych osobowych jest ProstyScreening.ai. Dane przetwarzane są zgodnie z obowiązującym prawem, 
              w szczególności z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. (RODO).
            </p>
            
            <h3 className="font-semibold">2. Gromadzone Dane</h3>
            <p>
              Gromadzimy różne rodzaje informacji o użytkownikach naszej Strony i Usługi, w tym:
              <ul className="list-disc ml-6 mt-2">
                <li>Dane osobowe: Imię, nazwisko, adres e-mail, numer telefonu i inne dane kontaktowe</li>
                <li>Dane o firmie: Nazwa firmy, adres, branża i inne informacje dotyczące organizacji</li>
                <li>Dane o korzystaniu: Informacje o tym, w jaki sposób użytkownik korzysta z naszej Strony i Usługi</li>
              </ul>
            </p>
            
            <h3 className="font-semibold">3. Cel Przetwarzania Danych</h3>
            <p>
              Wykorzystujemy zebrane dane w następujących celach:
              <ul className="list-disc ml-6 mt-2">
                <li>Świadczenie, utrzymanie i doskonalenie naszej Usługi</li>
                <li>Obsługa konta użytkownika i zapewnienie obsługi klienta</li>
                <li>Przesyłanie informacji technicznych, aktualizacji i powiadomień</li>
                <li>Komunikacja z użytkownikiem</li>
              </ul>
            </p>
            
            <h3 className="font-semibold">4. Prawa Użytkowników</h3>
            <p>
              Użytkownicy mają prawo do:
              <ul className="list-disc ml-6 mt-2">
                <li>Dostępu do swoich danych osobowych</li>
                <li>Sprostowania nieprawidłowych danych</li>
                <li>Usunięcia danych (prawo do bycia zapomnianym)</li>
                <li>Ograniczenia przetwarzania danych</li>
                <li>Przenoszenia danych</li>
                <li>Sprzeciwu wobec przetwarzania</li>
              </ul>
            </p>
          </div>
        );
      case 'msa':
        return (
          <div className="space-y-4 my-6 text-sm">
            <h3 className="font-semibold">1. Przedmiot Umowy</h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam hendrerit nisi sed sollicitudin pellentesque. 
              Nunc posuere purus rhoncus pulvinar aliquam. Ut aliquet tristique nisl vitae volutpat. 
              Nulla aliquet porttitor venenatis. Donec a dui et dui fringilla consectetur id nec massa.
            </p>
            
            <h3 className="font-semibold">2. Zakres Świadczonych Usług</h3>
            <p>
              Aliquam erat volutpat. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, 
              totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
              <ul className="list-disc ml-6 mt-2">
                <li>Nemo enim ipsam voluptatem quia voluptas sit aspernatur</li>
                <li>Aut odit aut fugit, sed quia consequuntur magni dolores</li>
                <li>Quis nostrum exercitationem ullam corporis suscipit laboriosam</li>
              </ul>
            </p>
            
            <h3 className="font-semibold">3. Wynagrodzenie i Płatności</h3>
            <p>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, 
              totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
              Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.
            </p>
            
            <h3 className="font-semibold">4. Okres Obowiązywania i Rozwiązanie Umowy</h3>
            <p>
              At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti 
              atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident,
              similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.
            </p>
            
            <h3 className="font-semibold">5. Poufność</h3>
            <p>
              Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi 
              optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, 
              omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis.
            </p>
          </div>
        );
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Progress indicator */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Konfiguracja konta</h1>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div
                    key={step}
                    className={`h-2 w-12 rounded-full ${
                      step === currentStep
                        ? 'bg-primary'
                        : step < currentStep
                        ? 'bg-green-500'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">Krok {currentStep} z 5</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-2xl">
          <div className="flex items-center justify-center mb-6">
            <div className="rounded-full bg-primary/10 p-3">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-6">
            Konfiguracja firmy
          </h2>
          
          <p className="text-gray-600 text-center mb-8">
            Wprowadź podstawowe informacje o swojej firmie, aby dostosować platformę do Twoich potrzeb.
          </p>
          
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="company-name">Nazwa firmy</Label>
              <Input
                id="company-name"
                placeholder="Wprowadź nazwę firmy"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="industry">Branża</Label>
              <Select value={industry} onValueChange={setIndustry}>
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Wybierz branżę" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((ind) => (
                    <SelectItem key={ind} value={ind}>
                      {ind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company-size">Wielkość firmy</Label>
              <Select value={companySize} onValueChange={setCompanySize}>
                <SelectTrigger id="company-size">
                  <SelectValue placeholder="Wybierz wielkość firmy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-10">1-10 pracowników</SelectItem>
                  <SelectItem value="11-50">11-50 pracowników</SelectItem>
                  <SelectItem value="51-200">51-200 pracowników</SelectItem>
                  <SelectItem value="201-500">201-500 pracowników</SelectItem>
                  <SelectItem value="501+">Ponad 500 pracowników</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="pt-4 space-y-3">
              <div className="text-sm font-medium mb-2">Akceptacja warunków:</div>
              
              <div className="flex items-center">
                <div className={`mr-2 ${tosAgreed ? 'text-green-500' : 'text-gray-400'}`}>
                  {tosAgreed ? <CheckCircle2 size={20} /> : <FileText size={20} />}
                </div>
                <button
                  type="button"
                  onClick={() => openAgreement('tos')}
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  {tosAgreed ? 'Warunki korzystania z usługi zaakceptowane' : 'Zapoznaj się z warunkami korzystania z usługi'}
                </button>
              </div>
              
              <div className="flex items-center">
                <div className={`mr-2 ${privacyAgreed ? 'text-green-500' : 'text-gray-400'}`}>
                  {privacyAgreed ? <CheckCircle2 size={20} /> : <FileText size={20} />}
                </div>
                <button
                  type="button"
                  onClick={() => openAgreement('privacy')}
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  {privacyAgreed ? 'Polityka prywatności zaakceptowana' : 'Zapoznaj się z polityką prywatności'}
                </button>
              </div>
              
              <div className="flex items-center">
                <div className={`mr-2 ${msaAgreed ? 'text-green-500' : 'text-gray-400'}`}>
                  {msaAgreed ? <CheckCircle2 size={20} /> : <FileText size={20} />}
                </div>
                <button
                  type="button"
                  onClick={() => openAgreement('msa')}
                  className="text-primary hover:text-primary/80 text-sm font-medium"
                >
                  {msaAgreed ? 'Umowa ramowa zaakceptowana' : 'Zapoznaj się z umową ramową'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <Button 
              onClick={handleNextStep}
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                "Zapisywanie danych..."
              ) : (
                <>
                  Dalej <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Legal agreements modal */}
      <Dialog open={legalModalOpen} onOpenChange={setLegalModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{getAgreementTitle()}</DialogTitle>
            <DialogDescription>{getAgreementDescription()}</DialogDescription>
          </DialogHeader>
          
          {renderAgreementContent()}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setLegalModalOpen(false)}>
              Zamknij
            </Button>
            <Button onClick={handleAgreeToCurrentAgreement}>
              Akceptuję {currentAgreement === 'tos' ? 'warunki' : currentAgreement === 'privacy' ? 'politykę' : 'umowę'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OnboardingPage;
