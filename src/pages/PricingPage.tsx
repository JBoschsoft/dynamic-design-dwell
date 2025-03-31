
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Check } from 'lucide-react';

const PricingTier = ({ 
  name, 
  price, 
  description, 
  features, 
  recommended = false,
  buttonText = "Wybierz plan"
}: { 
  name: string;
  price: string;
  description: string;
  features: string[];
  recommended?: boolean;
  buttonText?: string;
}) => {
  return (
    <div className={`rounded-lg overflow-hidden border ${recommended ? 'border-primary shadow-lg' : 'border-gray-200'} flex flex-col h-full`}>
      {recommended && (
        <div className="bg-primary text-white py-1 text-center text-sm font-medium">
          Rekomendowany
        </div>
      )}
      <div className="p-6 flex-1">
        <h3 className="font-bold text-xl mb-2">{name}</h3>
        <div className="mb-4">
          <span className="text-3xl font-bold">{price}</span>
          {price !== 'Kontakt' && <span className="text-gray-500"> /miesiąc</span>}
        </div>
        <p className="text-gray-600 mb-6">{description}</p>
        
        <ul className="space-y-3 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="mt-1 bg-primary/10 rounded-full flex items-center justify-center h-5 w-5 flex-shrink-0">
                <Check size={14} className="text-primary" />
              </div>
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="p-6 pt-0 mt-auto">
        <Button 
          className={recommended ? "bg-primary hover:bg-primary-700 w-full" : "bg-gray-800 hover:bg-gray-700 w-full"}
          variant={recommended ? "default" : "default"}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

const PricingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold mb-4">Cennik</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Wybierz plan, który najlepiej pasuje do potrzeb Twojej firmy. Wszystkie plany zawierają 14-dniowy okres próbny.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <PricingTier 
              name="Starter"
              price="299 zł"
              description="Idealny dla małych firm, które rozpoczynają przygodę z automatyzacją rekrutacji."
              features={[
                "Do 25 screeningów miesięcznie",
                "1 stanowisko rekruterskie",
                "Podstawowe szablony pytań",
                "Integracja z e-mail",
                "5 GB przestrzeni na załączniki",
                "Podstawowe raportowanie"
              ]}
            />
            
            <PricingTier 
              name="Professional"
              price="699 zł"
              description="Doskonały wybór dla rozwijających się firm z aktywnym działem HR."
              features={[
                "Do 100 screeningów miesięcznie",
                "5 stanowisk rekruterskich",
                "Zaawansowane szablony pytań",
                "Integracja z ATS",
                "20 GB przestrzeni na załączniki",
                "Zaawansowana analityka",
                "Priorytetowe wsparcie"
              ]}
              recommended={true}
            />
            
            <PricingTier 
              name="Enterprise"
              price="Kontakt"
              description="Rozwiązanie dla dużych organizacji z zaawansowanymi potrzebami rekrutacyjnymi."
              features={[
                "Nieograniczona liczba screeningów",
                "Nieograniczona liczba stanowisk",
                "Własne szablony pytań",
                "Pełna integracja z systemami firmy",
                "100 GB przestrzeni na załączniki",
                "Dedykowany opiekun klienta",
                "SLA i wsparcie 24/7",
                "Szkolenia dla zespołu"
              ]}
              buttonText="Skontaktuj się"
            />
          </div>
          
          <div className="bg-gray-50 rounded-lg p-8 max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Potrzebujesz rozwiązania dopasowanego do Twoich potrzeb?</h2>
            <p className="text-gray-600 mb-6">
              Skontaktuj się z nami, aby omówić indywidualną ofertę dla Twojej firmy.
            </p>
            <Button className="bg-primary hover:bg-primary-700 transition-colors duration-300 font-semibold">
              Skontaktuj się
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PricingPage;
