
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Check } from 'lucide-react';

const FeatureItem = ({ text }: { text: string }) => {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="mt-1 bg-primary rounded-full flex items-center justify-center h-5 w-5 flex-shrink-0">
        <Check size={14} className="text-white" />
      </div>
      <p className="text-gray-700">{text}</p>
    </div>
  );
};

const SoftwarePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <h1 className="text-4xl font-bold mb-4 text-center">Nasze oprogramowanie</h1>
            <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto text-center">
              Poznaj możliwości platformy ProstyScreening.ai i przekonaj się, jak może usprawnić
              procesy rekrutacyjne w Twojej firmie.
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div>
                <h2 className="text-2xl font-bold mb-6">Główne funkcje</h2>
                
                <div className="space-y-2">
                  <FeatureItem text="Automatyczne przesiewanie kandydatów oparte na sztucznej inteligencji" />
                  <FeatureItem text="Wstępne rozmowy kwalifikacyjne przeprowadzane przez AI" />
                  <FeatureItem text="Integracja z popularnymi systemami ATS i HRIS" />
                  <FeatureItem text="Wielokanałowa komunikacja (email, SMS, chat)" />
                  <FeatureItem text="Zaawansowana analityka i raporty w czasie rzeczywistym" />
                  <FeatureItem text="Personalizacja pytań i kryteriów oceny" />
                  <FeatureItem text="Automatyczne planowanie spotkań z kandydatami" />
                  <FeatureItem text="Możliwość tworzenia własnych szablonów rozmów" />
                </div>
                
                <div className="mt-8">
                  <Button className="bg-primary hover:bg-primary-700 transition-colors duration-300 px-6 py-6 h-auto font-semibold">
                    Umów prezentację produktu
                  </Button>
                </div>
              </div>
              
              <div className="rounded-lg overflow-hidden shadow-lg">
                <img 
                  src="https://picsum.photos/800/600" 
                  alt="Dashboard ProstyScreening.ai" 
                  className="w-full h-auto" 
                />
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold mb-16 text-center">Jak to działa?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-xl">1</span>
                </div>
                <h3 className="font-bold text-xl mb-2">Konfiguracja</h3>
                <p className="text-gray-600">
                  Dostosuj pytania, kryteria oceny i procesy do swoich potrzeb rekrutacyjnych.
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-xl">2</span>
                </div>
                <h3 className="font-bold text-xl mb-2">Automatyzacja</h3>
                <p className="text-gray-600">
                  AI przeprowadza wstępne rozmowy i ocenia kandydatów według Twoich kryteriów.
                </p>
              </div>
              
              <div className="text-center p-6">
                <div className="bg-primary-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold text-xl">3</span>
                </div>
                <h3 className="font-bold text-xl mb-2">Analiza</h3>
                <p className="text-gray-600">
                  Otrzymuj szczegółowe raporty i rekomendacje dotyczące każdego kandydata.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SoftwarePage;
