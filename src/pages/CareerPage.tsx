
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Briefcase } from 'lucide-react';

const JobCard = ({ 
  title, 
  location, 
  type, 
  description 
}: { 
  title: string; 
  location: string; 
  type: string; 
  description: string 
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <h3 className="font-bold text-xl mb-3">{title}</h3>
      
      <div className="flex flex-wrap gap-4 mb-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <MapPin size={16} />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={16} />
          <span>{type}</span>
        </div>
      </div>
      
      <p className="text-gray-600 mb-6">{description}</p>
      
      <Button className="bg-primary hover:bg-primary-700 transition-colors duration-300 font-semibold">
        Aplikuj teraz
      </Button>
    </div>
  );
};

const CareerPage = () => {
  const jobs = [
    {
      title: "Senior Frontend Developer",
      location: "Warszawa/Remote",
      type: "Pełny etat",
      description: "Poszukujemy doświadczonego Frontend Developera, który dołączy do naszego zespołu produktowego i będzie rozwijał interfejs użytkownika naszej platformy."
    },
    {
      title: "Backend Developer (Python)",
      location: "Warszawa/Remote",
      type: "Pełny etat",
      description: "Dołącz do naszego zespołu jako Backend Developer i twórz skalowalne rozwiązania oparte na AI dla naszej platformy rekrutacyjnej."
    },
    {
      title: "Product Manager",
      location: "Warszawa",
      type: "Pełny etat",
      description: "Szukamy Product Managera, który będzie odpowiedzialny za rozwój produktu, definicję wizji oraz koordynację prac między zespołami."
    },
    {
      title: "Customer Success Manager",
      location: "Warszawa",
      type: "Pełny etat",
      description: "Będziesz pomagać naszym klientom w uzyskaniu maksymalnych korzyści z naszej platformy, prowadząc szkolenia i zbierając informacje zwrotne."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <section className="py-20 bg-primary-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-4">Kariera w ProstyScreening.ai</h1>
              <p className="text-lg text-gray-600 mb-8">
                Dołącz do zespołu, który rewolucjonizuje branżę rekrutacji dzięki sztucznej inteligencji.
                Szukamy ambitnych i utalentowanych osób, które chcą tworzyć przyszłość HR Tech.
              </p>
              <Button className="bg-primary hover:bg-primary-700 transition-colors duration-300 font-semibold">
                Zobacz otwarte stanowiska
              </Button>
            </div>
          </div>
        </section>
        
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold mb-6">Dlaczego warto dołączyć do nas?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="p-6">
                <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Briefcase className="text-primary" size={24} />
                </div>
                <h3 className="font-bold text-xl mb-2">Rozwój zawodowy</h3>
                <p className="text-gray-600">
                  Oferujemy możliwości rozwoju poprzez pracę nad innowacyjnymi rozwiązaniami oraz regularny feedback.
                </p>
              </div>
              
              <div className="p-6">
                <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Briefcase className="text-primary" size={24} />
                </div>
                <h3 className="font-bold text-xl mb-2">Elastyczność</h3>
                <p className="text-gray-600">
                  Praca hybrydowa, elastyczne godziny i kultura oparta na rezultatach, nie na godzinach spędzonych przy biurku.
                </p>
              </div>
              
              <div className="p-6">
                <div className="bg-primary-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Briefcase className="text-primary" size={24} />
                </div>
                <h3 className="font-bold text-xl mb-2">Wpływ</h3>
                <p className="text-gray-600">
                  Twórz rozwiązania, które mają realny wpływ na procesy rekrutacyjne setek firm i doświadczenia tysięcy kandydatów.
                </p>
              </div>
            </div>
            
            <h2 className="text-3xl font-bold mb-8">Otwarte stanowiska</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {jobs.map((job, index) => (
                <JobCard 
                  key={index}
                  title={job.title}
                  location={job.location}
                  type={job.type}
                  description={job.description}
                />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CareerPage;
