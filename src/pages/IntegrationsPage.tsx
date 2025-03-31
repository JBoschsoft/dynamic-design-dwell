
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";

const IntegrationCard = ({ 
  name, 
  logo, 
  description 
}: { 
  name: string; 
  logo: string; 
  description: string 
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4 mb-4">
        <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center">
          <span className="text-lg font-bold text-gray-500">{logo}</span>
        </div>
        <h3 className="font-bold text-xl">{name}</h3>
      </div>
      <p className="text-gray-600 mb-4">{description}</p>
      <Button variant="outline" className="border-primary text-primary hover:bg-primary-50 transition-colors duration-300 font-semibold">
        Dowiedz się więcej
      </Button>
    </div>
  );
};

const IntegrationsPage = () => {
  const integrations = [
    {
      name: "Workday",
      logo: "WD",
      description: "Pełna integracja z Workday umożliwiająca synchronizację danych kandydatów i stanowisk."
    },
    {
      name: "SAP SuccessFactors",
      logo: "SF",
      description: "Zintegruj screening AI z procesami rekrutacyjnymi w SAP SuccessFactors."
    },
    {
      name: "Oracle HCM",
      logo: "OH",
      description: "Bezproblemowa integracja z Oracle Human Capital Management."
    },
    {
      name: "Lever",
      logo: "LV",
      description: "Połącz ProstyScreening.ai z platformą Lever, aby usprawnić proces rekrutacji."
    },
    {
      name: "Greenhouse",
      logo: "GH",
      description: "Integracja z Greenhouse pozwala na automatyczne przesyłanie wyników screeningu."
    },
    {
      name: "Teamtailor",
      logo: "TT",
      description: "Łatwa integracja z Teamtailor dla pełnej synchronizacji danych."
    },
    {
      name: "BambooHR",
      logo: "BH",
      description: "Połącz ProstyScreening.ai z BambooHR, aby usprawnić proces onboardingu."
    },
    {
      name: "Slack",
      logo: "SL",
      description: "Otrzymuj powiadomienia o nowych kandydatach bezpośrednio na Slacku."
    },
    {
      name: "Microsoft Teams",
      logo: "MT",
      description: "Integracja z Teams umożliwiająca współpracę zespołu rekrutacyjnego."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <h1 className="text-4xl font-bold mb-4">Integracje</h1>
            <p className="text-lg text-gray-600">
              ProstyScreening.ai integruje się z popularnymi systemami HR i ATS, umożliwiając płynne włączenie do istniejących procesów rekrutacyjnych.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {integrations.map((integration, index) => (
              <IntegrationCard 
                key={index}
                name={integration.name}
                logo={integration.logo}
                description={integration.description}
              />
            ))}
          </div>
          
          <div className="bg-primary-50 rounded-lg p-8 max-w-3xl mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">Nie widzisz potrzebnej integracji?</h2>
              <p className="text-gray-600">
                Potrzebujesz niestandardowej integracji? Nasz zespół może pomóc w stworzeniu dedykowanego rozwiązania.
              </p>
            </div>
            <div className="flex justify-center">
              <Button className="bg-primary hover:bg-primary-700 transition-colors duration-300 font-semibold">
                Skontaktuj się z nami
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default IntegrationsPage;
