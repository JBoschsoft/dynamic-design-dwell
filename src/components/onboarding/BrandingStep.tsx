
import React, { useState, useRef, ChangeEvent } from 'react';
import { 
  Button, 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  Input,
  Label,
  ArrowRight,
  Textarea,
  Loader2
} from "@/components/ui";
import { Upload, Palette } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface BrandingStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

const BrandingStep: React.FC<BrandingStepProps> = ({ onNext, onPrevious }) => {
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState<string>('#1a56db');
  const [secondaryColor, setSecondaryColor] = useState<string>('#4338ca');
  const [accentColor, setAccentColor] = useState<string>('#6366f1');
  const [emailSignature, setEmailSignature] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file type
      if (!file.type.match('image.*')) {
        toast({
          variant: "destructive",
          title: "Niewłaściwy format pliku",
          description: "Proszę wybrać plik obrazu (JPG, PNG, GIF, etc.)"
        });
        return;
      }
      
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Plik jest za duży",
          description: "Maksymalny rozmiar pliku to 2MB"
        });
        return;
      }
      
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      toast({
        title: "Logo przesłane",
        description: "Logo firmy zostało pomyślnie przesłane"
      });
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Simulate API call to save branding settings
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Branding zapisany",
        description: "Ustawienia brandingu zostały pomyślnie zapisane"
      });
      
      onNext();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Błąd zapisu",
        description: error.message || "Wystąpił błąd podczas zapisywania ustawień brandingu"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md w-full max-w-2xl">
      <div className="flex items-center justify-center mb-6">
        <div className="bg-primary/10 p-3 rounded-full">
          <Palette className="h-6 w-6 text-primary" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-center mb-2">
        Konfiguracja brandingu
      </h2>
      
      <p className="text-gray-600 text-center mb-8">
        Dostosuj wygląd swojej przestrzeni roboczej, dodając logo firmy, wybierając kolory i ustawiając podpis e-mail.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-primary/20 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Logo firmy</CardTitle>
            <CardDescription>
              Dodaj logo firmy, które będzie wyświetlane w aplikacji.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="mt-2">
              <input
                type="file"
                id="logo"
                ref={fileInputRef}
                onChange={handleLogoChange}
                className="hidden"
                accept="image/*"
              />
              
              {logoPreview ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative w-48 h-48 border rounded-md overflow-hidden flex items-center justify-center bg-gray-50">
                    <img 
                      src={logoPreview} 
                      alt="Company logo preview" 
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={triggerFileInput}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Zmień logo
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  <div 
                    onClick={triggerFileInput}
                    className="w-48 h-48 border-2 border-dashed rounded-md border-gray-300 flex items-center justify-center cursor-pointer hover:border-primary transition-colors"
                  >
                    <div className="text-center p-4">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-2 text-sm font-medium text-gray-600">
                        Prześlij logo firmy
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        PNG, JPG, GIF do 2MB
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={triggerFileInput}
                    className="w-full"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Prześlij logo
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-primary/20 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Paleta kolorów</CardTitle>
            <CardDescription>
              Wybierz kolory, które najlepiej odzwierciedlają twoją markę
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor" className="text-sm">Kolor główny</Label>
                <div className="flex">
                  <div 
                    className="w-10 h-10 rounded-l-md border border-r-0 border-input" 
                    style={{ backgroundColor: primaryColor }}
                  />
                  <Input
                    id="primaryColor"
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full rounded-l-none"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="secondaryColor" className="text-sm">Kolor drugorzędny</Label>
                <div className="flex">
                  <div 
                    className="w-10 h-10 rounded-l-md border border-r-0 border-input" 
                    style={{ backgroundColor: secondaryColor }}
                  />
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-full rounded-l-none"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="accentColor" className="text-sm">Kolor akcentujący</Label>
                <div className="flex">
                  <div 
                    className="w-10 h-10 rounded-l-md border border-r-0 border-input" 
                    style={{ backgroundColor: accentColor }}
                  />
                  <Input
                    id="accentColor"
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-full rounded-l-none"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-4 rounded-md" style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor}, ${accentColor})` }}>
              <div className="bg-white p-3 rounded shadow-sm">
                <span className="text-sm">Podgląd palety kolorów</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-primary/20 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Podpis e-mail</CardTitle>
            <CardDescription>
              Ustaw domyślny podpis, który będzie używany w komunikacji e-mail
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Textarea
              id="emailSignature"
              value={emailSignature}
              onChange={(e) => setEmailSignature(e.target.value)}
              placeholder="Z poważaniem,&#10;[Imię i Nazwisko]&#10;[Stanowisko]&#10;[Nazwa firmy]&#10;[Telefon]"
              className="min-h-[150px] mt-4 bg-white focus:border-primary"
            />
          </CardContent>
        </Card>
        
        <div className="flex justify-between pt-4">  
          <Button 
            type="button" 
            variant="outline" 
            onClick={onPrevious}
            className="px-5"
          >
            Wstecz
          </Button>
          
          <Button 
            type="submit"
            disabled={isLoading}
            className="px-5 bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Zapisywanie...
              </>
            ) : (
              <>
                Dalej <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BrandingStep;
