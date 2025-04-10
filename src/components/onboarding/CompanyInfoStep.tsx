
import React, { useState } from 'react';
import { 
  Button,
  Input,
  Label,
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  FileText, CheckCircle2, Building2, ArrowRight, Loader2, Search,
  Command, CommandInput, CommandEmpty, CommandGroup, CommandItem
} from "@/components/ui";
import { toast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import 'react-phone-input-2/lib/style.css';

interface CompanyInfoStepProps {
  companyName: string;
  setCompanyName: (value: string) => void;
  industry: string;
  setIndustry: (value: string) => void;
  companySize: string;
  setCompanySize: (value: string) => void;
  phoneNumber: string;
  setPhoneNumber: (value: string) => void;
  countryCode: string;
  setCountryCode: (value: string) => void;
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

// European countries + USA with flag emoji
const countries = [
  { code: "al", name: "Albania", flag: "🇦🇱" },
  { code: "ad", name: "Andorra", flag: "🇦🇩" },
  { code: "at", name: "Austria", flag: "🇦🇹" },
  { code: "by", name: "Belarus", flag: "🇧🇾" },
  { code: "be", name: "Belgium", flag: "🇧🇪" },
  { code: "ba", name: "Bosnia and Herzegovina", flag: "🇧🇦" },
  { code: "bg", name: "Bulgaria", flag: "🇧🇬" },
  { code: "hr", name: "Croatia", flag: "🇭🇷" },
  { code: "cy", name: "Cyprus", flag: "🇨🇾" },
  { code: "cz", name: "Czech Republic", flag: "🇨🇿" },
  { code: "dk", name: "Denmark", flag: "🇩🇰" },
  { code: "ee", name: "Estonia", flag: "🇪🇪" },
  { code: "fi", name: "Finland", flag: "🇫🇮" },
  { code: "fr", name: "France", flag: "🇫🇷" },
  { code: "de", name: "Germany", flag: "🇩🇪" },
  { code: "gr", name: "Greece", flag: "🇬🇷" },
  { code: "hu", name: "Hungary", flag: "🇭🇺" },
  { code: "is", name: "Iceland", flag: "🇮🇸" },
  { code: "ie", name: "Ireland", flag: "🇮🇪" },
  { code: "it", name: "Italy", flag: "🇮🇹" },
  { code: "lv", name: "Latvia", flag: "🇱🇻" },
  { code: "li", name: "Liechtenstein", flag: "🇱🇮" },
  { code: "lt", name: "Lithuania", flag: "🇱🇹" },
  { code: "lu", name: "Luxembourg", flag: "🇱🇺" },
  { code: "mt", name: "Malta", flag: "🇲🇹" },
  { code: "md", name: "Moldova", flag: "🇲🇩" },
  { code: "mc", name: "Monaco", flag: "🇲🇨" },
  { code: "me", name: "Montenegro", flag: "🇲🇪" },
  { code: "nl", name: "Netherlands", flag: "🇳🇱" },
  { code: "mk", name: "North Macedonia", flag: "🇲🇰" },
  { code: "no", name: "Norway", flag: "🇳🇴" },
  { code: "pl", name: "Poland", flag: "🇵🇱" },
  { code: "pt", name: "Portugal", flag: "🇵🇹" },
  { code: "ro", name: "Romania", flag: "🇷🇴" },
  { code: "ru", name: "Russia", flag: "🇷🇺" },
  { code: "sm", name: "San Marino", flag: "🇸🇲" },
  { code: "rs", name: "Serbia", flag: "🇷🇸" },
  { code: "sk", name: "Slovakia", flag: "🇸🇰" },
  { code: "si", name: "Slovenia", flag: "🇸🇮" },
  { code: "es", name: "Spain", flag: "🇪🇸" },
  { code: "se", name: "Sweden", flag: "🇸🇪" },
  { code: "ch", name: "Switzerland", flag: "🇨🇭" },
  { code: "ua", name: "Ukraine", flag: "🇺🇦" },
  { code: "gb", name: "United Kingdom", flag: "🇬🇧" },
  { code: "va", name: "Vatican City", flag: "🇻🇦" },
  { code: "us", name: "United States", flag: "🇺🇸" }
];

const CompanyInfoStep: React.FC<CompanyInfoStepProps> = ({
  companyName,
  setCompanyName,
  industry,
  setIndustry,
  companySize,
  setCompanySize,
  phoneNumber,
  setPhoneNumber,
  countryCode,
  setCountryCode,
  tosAgreed,
  privacyAgreed,
  msaAgreed,
  onOpenAgreement,
  onNext,
  loading
}) => {
  const [open, setOpen] = useState(false);
  const [industryOpen, setIndustryOpen] = useState(false);
  const [companySizeOpen, setCompanySizeOpen] = useState(false);
  const [countrySearchQuery, setCountrySearchQuery] = useState("");
  const [industrySearchQuery, setIndustrySearchQuery] = useState("");
  
  const filteredCountries = countries.filter(country => 
    country.name.toLowerCase().includes(countrySearchQuery.toLowerCase()) ||
    country.code.toLowerCase().includes(countrySearchQuery.toLowerCase())
  );

  const filteredIndustries = industries.filter(industry => 
    industry.toLowerCase().includes(industrySearchQuery.toLowerCase())
  );
  
  const handleNextStep = () => {
    if (!companyName || !industry || !companySize || !phoneNumber) {
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
            <Popover open={industryOpen} onOpenChange={setIndustryOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={industryOpen}
                  aria-label="Select industry"
                  className="w-full justify-between bg-white focus:border-primary"
                >
                  {industry ? industry : "Wybierz branżę"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput 
                    placeholder="Szukaj branży..." 
                    value={industrySearchQuery}
                    onValueChange={setIndustrySearchQuery}
                  />
                  <CommandEmpty>Nie znaleziono pasujących branż.</CommandEmpty>
                  <CommandGroup className="max-h-[300px] overflow-y-auto">
                    {filteredIndustries.map((ind) => (
                      <CommandItem
                        key={ind}
                        value={ind}
                        onSelect={() => {
                          setIndustry(ind);
                          setIndustryOpen(false);
                          setIndustrySearchQuery("");
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            industry === ind ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {ind}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company-size">Wielkość firmy</Label>
            <Popover open={companySizeOpen} onOpenChange={setCompanySizeOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={companySizeOpen}
                  aria-label="Select company size"
                  className="w-full justify-between bg-white focus:border-primary"
                >
                  {companySize ? (
                    companySize === "1-10" 
                      ? "1-10 pracowników" 
                      : companySize === "11-50"
                        ? "11-50 pracowników"
                        : companySize === "51-200"
                          ? "51-200 pracowników"
                          : companySize === "201-500"
                            ? "201-500 pracowników"
                            : "Ponad 500 pracowników"
                  ) : "Wybierz wielkość firmy"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandGroup>
                    <CommandItem onSelect={() => {
                      setCompanySize("1-10");
                      setCompanySizeOpen(false);
                    }}>
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          companySize === "1-10" ? "opacity-100" : "opacity-0"
                        )}
                      />
                      1-10 pracowników
                    </CommandItem>
                    <CommandItem onSelect={() => {
                      setCompanySize("11-50");
                      setCompanySizeOpen(false);
                    }}>
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          companySize === "11-50" ? "opacity-100" : "opacity-0"
                        )}
                      />
                      11-50 pracowników
                    </CommandItem>
                    <CommandItem onSelect={() => {
                      setCompanySize("51-200");
                      setCompanySizeOpen(false);
                    }}>
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          companySize === "51-200" ? "opacity-100" : "opacity-0"
                        )}
                      />
                      51-200 pracowników
                    </CommandItem>
                    <CommandItem onSelect={() => {
                      setCompanySize("201-500");
                      setCompanySizeOpen(false);
                    }}>
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          companySize === "201-500" ? "opacity-100" : "opacity-0"
                        )}
                      />
                      201-500 pracowników
                    </CommandItem>
                    <CommandItem onSelect={() => {
                      setCompanySize("501+");
                      setCompanySizeOpen(false);
                    }}>
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          companySize === "501+" ? "opacity-100" : "opacity-0"
                        )}
                      />
                      Ponad 500 pracowników
                    </CommandItem>
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone-number">Numer telefonu</Label>
            <div className="flex">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    aria-label="Select a country"
                    className="w-[140px] justify-between bg-white focus:border-primary"
                  >
                    {countryCode ? (
                      <>
                        <span className="mr-1">
                          {countries.find(c => c.code === countryCode)?.flag}
                        </span>
                        {countries.find(c => c.code === countryCode)?.name}
                      </>
                    ) : (
                      "Wybierz kraj"
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Szukaj kraju..." 
                      value={countrySearchQuery}
                      onValueChange={setCountrySearchQuery}
                    />
                    <CommandEmpty>Nie znaleziono pasującego kraju.</CommandEmpty>
                    <CommandGroup className="max-h-[300px] overflow-y-auto">
                      {filteredCountries.map((country) => (
                        <CommandItem
                          key={country.code}
                          value={country.code}
                          onSelect={() => {
                            setCountryCode(country.code);
                            setOpen(false);
                            setCountrySearchQuery("");
                          }}
                        >
                          <span className="mr-2">{country.flag}</span>
                          <span>{country.name}</span>
                          <Check
                            className={cn(
                              "ml-auto h-4 w-4",
                              countryCode === country.code ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                </PopoverContent>
              </Popover>
              <Input 
                id="phone-number"
                type="tel"
                placeholder="Wprowadź numer telefonu"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                className="flex-1 ml-2 bg-white focus:border-primary"
              />
            </div>
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
