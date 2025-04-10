
import React, { useState } from 'react';
import { 
  Button,
  Input,
  Label,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  FileText, CheckCircle2, Building2, ArrowRight, Loader2
} from "@/components/ui";
import { toast } from "@/hooks/use-toast";

interface CompanyInfoStepProps {
  companyName: string;
  setCompanyName: (value: string) => void;
  industry: string;
  setIndustry: (value: string) => void;
  companySize: string;
  setCompanySize: (value: string) => void;
  tosAgreed: boolean;
  privacyAgreed: boolean;
  msaAgreed: boolean;
  onOpenAgreement: (type: 'tos' | 'privacy' | 'msa') => void;
  onNext: () => void;
  loading: boolean;
}

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

const CompanyInfoStep: React.FC<CompanyInfoStepProps> = ({
  companyName,
  setCompanyName,
  industry,
  setIndustry,
  companySize,
  setCompanySize,
  tosAgreed,
  privacyAgreed,
  msaAgreed,
  onOpenAgreement,
  onNext,
  loading
}) => {
  
  const handleNextStep = () => {
    if (!companyName || !industry || !companySize) {
      toast({
        variant: "destructive",
        title: "Uzupełnij wszystkie pola",
        description: "Wypełnij wszystkie wymagane informacje o firmie."
      });
      return;
    }

    const allAgreementsAccepted = tosAgreed && privacyAgreed && msaAgreed;
    
    if (!allAgreementsAccepted) {
      onOpenAgreement('tos');
      return;
    }
    
    onNext();
  };
  
  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md w-full max-w-2xl">
      <div className="flex items-center justify-center mb-6">
        <div className="bg-primary/10 p-3 rounded-full">
          <Building2 className="h-6 w-6 text-primary" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-center mb-2">
        Konfiguracja firmy
      </h2>
      
      <p className="text-gray-600 text-center mb-8">
        Wprowadź podstawowe informacje o swojej firmie, aby dostosować platformę do Twoich potrzeb.
      </p>
      
      <Card className="border-primary/20 shadow-sm mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Informacje o firmie</CardTitle>
          <CardDescription>
            Podaj podstawowe dane o Twojej firmie
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="space-y-2">
            <Label htmlFor="company-name">Nazwa firmy</Label>
            <Input 
              id="company-name" 
              placeholder="Wprowadź nazwę firmy" 
              value={companyName} 
              onChange={e => setCompanyName(e.target.value)}
              className="bg-white focus:border-primary"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="industry">Branża</Label>
            <Select value={industry} onValueChange={setIndustry}>
              <SelectTrigger id="industry" className="bg-white focus:border-primary">
                <SelectValue placeholder="Wybierz branżę" />
              </SelectTrigger>
              <SelectContent>
                {industries.map(ind => (
                  <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company-size">Wielkość firmy</Label>
            <Select value={companySize} onValueChange={setCompanySize}>
              <SelectTrigger id="company-size" className="bg-white focus:border-primary">
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
        </CardContent>
      </Card>
      
      <Card className="border-primary/20 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Akceptacja warunków</CardTitle>
          <CardDescription>
            Zapoznaj się i zaakceptuj niezbędne warunki korzystania z serwisu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <div className="flex items-center">
            <div className={`mr-2 ${tosAgreed ? 'text-green-500' : 'text-gray-400'}`}>
              {tosAgreed ? <CheckCircle2 size={20} /> : <FileText size={20} />}
            </div>
            <button 
              type="button" 
              onClick={() => onOpenAgreement('tos')}
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
              onClick={() => onOpenAgreement('privacy')} 
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
              onClick={() => onOpenAgreement('msa')} 
              className="text-primary hover:text-primary/80 text-sm font-medium"
            >
              {msaAgreed ? 'Umowa ramowa zaakceptowana' : 'Zapoznaj się z umową ramową'}
            </button>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end pt-6">
        <Button onClick={handleNextStep} className="px-5 bg-primary hover:bg-primary/90" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Zapisywanie danych...
            </>
          ) : (
            <>
              Dalej <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default CompanyInfoStep;
