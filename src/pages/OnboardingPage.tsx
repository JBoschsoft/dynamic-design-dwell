
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, ArrowRight, FileText, CheckCircle2, CreditCard, ArrowLeft, DollarSign, Gauge, Repeat } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

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
  
  // Payment options state
  const [paymentType, setPaymentType] = useState<'one-time' | 'subscription'>('subscription');
  const [tokenAmount, setTokenAmount] = useState([25]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  // Payment form state for subscription
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');
  
  const allAgreementsAccepted = tosAgreed && privacyAgreed && msaAgreed;
  
  // Calculate token price based on quantity
  const calculateTokenPrice = (quantity: number) => {
    return quantity >= 50 ? 5 : 8;
  };
  
  // Calculate total price for tokens
  const calculateTotalPrice = () => {
    const tokenPrice = calculateTokenPrice(tokenAmount[0]);
    return tokenAmount[0] * tokenPrice;
  };
  
  // Format token amount and price for slider
  const formatTokenValue = (value: number[]) => {
    const amount = value[0];
    const price = calculateTokenPrice(amount);
    return `${amount} tokenów (${price} PLN/token)`;
  };
  
  const handleNextStep = async () => {
    if (currentStep === 1) {
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
        
        toast({
          title: "Dane firmy zapisane",
          description: "Pomyślnie zapisano informacje o firmie."
        });
        
        setCurrentStep(2);
        
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Błąd zapisu",
          description: error.message || "Wystąpił błąd podczas zapisywania informacji o firmie."
        });
      } finally {
        setLoading(false);
      }
    } else if (currentStep === 2) {
      // Form validation for subscription payment
      if (paymentType === 'subscription') {
        if (!cardNumber || !cardExpiry || !cardCvc || !nameOnCard) {
          toast({
            variant: "destructive",
            title: "Uzupełnij dane płatności",
            description: "Wypełnij wszystkie wymagane informacje płatności."
          });
          return;
        }
      }
      
      // Handle payment processing
      setPaymentLoading(true);
      
      try {
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        setPaymentSuccess(true);
        
        toast({
          title: "Płatność zakończona sukcesem",
          description: paymentType === 'one-time' 
            ? `Pomyślnie zakupiono ${tokenAmount[0]} tokenów za ${calculateTotalPrice()} PLN.` 
            : "Pomyślnie aktywowano automatyczne płatności. Karta zostanie obciążona, gdy liczba tokenów spadnie poniżej 10."
        });
        
        // Wait a bit before proceeding to next step
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCurrentStep(3);
        
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Błąd płatności",
          description: error.message || "Wystąpił błąd podczas przetwarzania płatności."
        });
      } finally {
        setPaymentLoading(false);
      }
    }
  };
  
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
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
    
    if (tosAgreed && privacyAgreed && msaAgreed) {
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
  
  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };
  
  // Format card expiry date
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    
    if (v.length > 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }
    
    return value;
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
        {currentStep === 1 && (
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
        )}

        {currentStep === 2 && (
          <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-2xl">
            <div className="flex items-center justify-center mb-6">
              <div className="rounded-full bg-primary/10 p-3">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-center mb-6">
              Wybierz plan płatności
            </h2>
            
            <p className="text-gray-600 text-center mb-8">
              Aby aktywować funkcje platformy, wybierz preferowany wariant płatności.
            </p>
            
            <div className="space-y-6">
              <RadioGroup 
                value={paymentType} 
                onValueChange={(value) => setPaymentType(value as 'one-time' | 'subscription')}
                className="space-y-4"
              >
                <div className={`border rounded-lg p-4 transition-all duration-300 ${paymentType === 'one-time' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="one-time" id="one-time" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="one-time" className="text-base font-medium flex items-center">
                        <DollarSign className="mr-2 h-5 w-5" />
                        Kup tokeny jednorazowo
                      </Label>
                      
                      {paymentType === 'one-time' && (
                        <div className="mt-6 space-y-6 animate-fade-in">
                          <div className="space-y-4">
                            <div className="flex justify-between text-sm text-gray-500">
                              <span>1 token</span>
                              <span>1000 tokenów</span>
                            </div>
                            <Slider 
                              value={tokenAmount} 
                              onValueChange={setTokenAmount}
                              min={1}
                              max={1000}
                              step={1}
                              showValue={true}
                              formatValue={formatTokenValue}
                              className="py-4"
                            />
                          </div>
                          
                          <Card className="border border-primary/20">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg flex items-center">
                                <Gauge className="mr-2 h-5 w-5 text-primary" />
                                Podsumowanie zakupu
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="flex justify-between">
                                <span>Ilość tokenów:</span>
                                <span className="font-medium">{tokenAmount[0]}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Cena za token:</span>
                                <span className="font-medium">{calculateTokenPrice(tokenAmount[0])} PLN</span>
                              </div>
                              <div className="border-t pt-2 mt-2 flex justify-between text-lg font-bold">
                                <span>Razem do zapłaty:</span>
                                <span className="text-primary">{calculateTotalPrice()} PLN</span>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <div className="space-y-4 pt-2">
                            <div className="space-y-2">
                              <Label htmlFor="one-time-name">Imię i nazwisko na karcie</Label>
                              <Input
                                id="one-time-name"
                                placeholder="Jan Kowalski"
                                value={nameOnCard}
                                onChange={(e) => setNameOnCard(e.target.value)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="one-time-card-number">Numer karty</Label>
                              <Input
                                id="one-time-card-number"
                                placeholder="1234 5678 9012 3456"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                maxLength={19}
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="one-time-card-expiry">Data ważności</Label>
                                <Input
                                  id="one-time-card-expiry"
                                  placeholder="MM/YY"
                                  value={cardExpiry}
                                  onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                                  maxLength={5}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="one-time-card-cvc">Kod CVC</Label>
                                <Input
                                  id="one-time-card-cvc"
                                  placeholder="123"
                                  value={cardCvc}
                                  onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').substring(0, 3))}
                                  maxLength={3}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className={`border rounded-lg p-4 transition-all duration-300 ${paymentType === 'subscription' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
                  <div className="flex items-start space-x-3">
                    <RadioGroupItem value="subscription" id="subscription" className="mt-1" />
                    <div className="flex-1">
                      <Label htmlFor="subscription" className="text-base font-medium flex items-center">
                        <Repeat className="mr-2 h-5 w-5" />
                        Włącz automatyczne płatności
                      </Label>
                      
                      {paymentType === 'subscription' && (
                        <div className="mt-6 space-y-4 animate-fade-in">
                          <div className="bg-blue-50 border border-blue-100 rounded-md p-4 flex items-start text-sm">
                            <CheckCircle2 className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                            <p>Twoja karta zostanie automatycznie obciążona, gdy liczba dostępnych tokenów spadnie poniżej <strong>10</strong>. Zostanie wtedy doładowanych <strong>50 tokenów</strong> (250 PLN).</p>
                          </div>
                          
                          <Card className="border border-primary/20">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg flex items-center">
                                <Gauge className="mr-2 h-5 w-5 text-primary" />
                                Automatyczne płatności
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                              <div className="flex justify-between">
                                <span>Próg doładowania:</span>
                                <span className="font-medium">poniżej 10 tokenów</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Ilość tokenów:</span>
                                <span className="font-medium">50 tokenów</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Cena za token:</span>
                                <span className="font-medium">5 PLN</span>
                              </div>
                              <div className="border-t pt-2 mt-2 flex justify-between text-lg font-bold">
                                <span>Kwota doładowania:</span>
                                <span className="text-primary">250 PLN</span>
                              </div>
                            </CardContent>
                          </Card>
                          
                          <div className="space-y-4 pt-2">
                            <div className="space-y-2">
                              <Label htmlFor="name-on-card">Imię i nazwisko na karcie</Label>
                              <Input
                                id="name-on-card"
                                placeholder="Jan Kowalski"
                                value={nameOnCard}
                                onChange={(e) => setNameOnCard(e.target.value)}
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="card-number">Numer karty</Label>
                              <Input
                                id="card-number"
                                placeholder="1234 5678 9012 3456"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                maxLength={19}
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <Label htmlFor="card-expiry">Data ważności</Label>
                                <Input
                                  id="card-expiry"
                                  placeholder="MM/YY"
                                  value={cardExpiry}
                                  onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                                  maxLength={5}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="card-cvc">Kod CVC</Label>
                                <Input
                                  id="card-cvc"
                                  placeholder="123"
                                  value={cardCvc}
                                  onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, '').substring(0, 3))}
                                  maxLength={3}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </RadioGroup>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-600 mt-8">
                <p className="flex items-center">
                  <DollarSign size={18} className="mr-2 text-gray-400" />
                  Płatność zostanie przetworzona bezpiecznie. Wybrany plan można zmienić w dowolnym momencie w ustawieniach konta.
                </p>
              </div>
            </div>
            
            <div className="mt-8 flex space-x-3">
              <Button 
                variant="outline"
                onClick={handlePreviousStep}
                className="w-1/3"
                disabled={paymentLoading || paymentSuccess}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Wstecz
              </Button>
              
              <Button 
                onClick={handleNextStep}
                className="w-2/3"
                disabled={paymentLoading || paymentSuccess}
              >
                {paymentLoading ? (
                  "Przetwarzanie płatności..."
                ) : paymentSuccess ? (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Płatność zakończona sukcesem
                  </>
                ) : (
                  <>
                    Zapłać i kontynuuj <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
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
