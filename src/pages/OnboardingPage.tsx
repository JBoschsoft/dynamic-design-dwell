
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
  
  // Legal agreement state
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalAgreed, setLegalAgreed] = useState(false);
  
  const handleNextStep = async () => {
    if (!companyName || !industry || !companySize) {
      toast({
        variant: "destructive",
        title: "Uzupełnij wszystkie pola",
        description: "Wypełnij wszystkie wymagane informacje o firmie."
      });
      return;
    }
    
    if (!legalAgreed) {
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
  
  const handleLegalAgree = () => {
    setLegalAgreed(true);
    setLegalModalOpen(false);
    
    toast({
      title: "Warunki zaakceptowane",
      description: "Dziękujemy za zapoznanie się i akceptację warunków."
    });
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
            
            <div className="pt-4 flex items-center">
              <div className={`mr-2 ${legalAgreed ? 'text-green-500' : 'text-gray-400'}`}>
                {legalAgreed ? <CheckCircle2 size={20} /> : <FileText size={20} />}
              </div>
              <button
                type="button"
                onClick={() => setLegalModalOpen(true)}
                className="text-primary hover:text-primary/80 text-sm font-medium"
              >
                {legalAgreed ? 'Warunki zaakceptowane' : 'Przeczytaj i zaakceptuj warunki korzystania'}
              </button>
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
            <DialogTitle>Warunki korzystania z usługi</DialogTitle>
            <DialogDescription>
              Przeczytaj uważnie poniższe warunki przed kontynuowaniem.
            </DialogDescription>
          </DialogHeader>
          
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
            
            <h3 className="font-semibold">3. Ochrona Danych</h3>
            <p>
              Administratorem danych osobowych jest ProstyScreening.ai. Dane przetwarzane są zgodnie z obowiązującym prawem, 
              w szczególności z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. (RODO).
            </p>
            
            <h3 className="font-semibold">4. Zobowiązania Użytkownika</h3>
            <p>
              Użytkownik zobowiązuje się do:
              <ul className="list-disc ml-6 mt-2">
                <li>Przestrzegania wszystkich obowiązujących przepisów prawa</li>
                <li>Niewykorzystywania Usługi do celów niezgodnych z prawem</li>
                <li>Nienaruszania praw innych użytkowników</li>
                <li>Zachowania poufności danych dostępowych do konta</li>
              </ul>
            </p>
            
            <h3 className="font-semibold">5. Odpowiedzialność</h3>
            <p>
              ProstyScreening.ai nie ponosi odpowiedzialności za:
              <ul className="list-disc ml-6 mt-2">
                <li>Decyzje podejmowane przez Użytkownika na podstawie danych z Usługi</li>
                <li>Przerwy w dostępie do Usługi wynikające z przyczyn technicznych</li>
                <li>Szkody wynikające z nieprawidłowego korzystania z Usługi</li>
              </ul>
            </p>
            
            <h3 className="font-semibold">6. Zmiany Warunków</h3>
            <p>
              ProstyScreening.ai zastrzega sobie prawo do zmiany Warunków w dowolnym czasie. 
              Użytkownicy zostaną powiadomieni o zmianach za pośrednictwem poczty elektronicznej lub poprzez powiadomienie w Usłudze.
            </p>
            
            <h3 className="font-semibold">7. Rozwiązanie Umowy</h3>
            <p>
              Każda ze stron może rozwiązać umowę z zachowaniem okresu wypowiedzenia określonego w planie subskrypcyjnym. 
              ProstyScreening.ai może zawiesić lub zakończyć dostęp do Usługi w przypadku naruszenia niniejszych Warunków.
            </p>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setLegalModalOpen(false)}>
              Zamknij
            </Button>
            <Button onClick={handleLegalAgree}>
              Akceptuję warunki
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OnboardingPage;
