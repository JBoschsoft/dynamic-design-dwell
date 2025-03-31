import React from 'react';
import { Button } from "@/components/ui/button";
const HeroSection = () => {
  return <section className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight text-gray-900 mb-4">
                ZAUTOMATYZUJ<br />
                SCREENING<br />
                KANDYDATÓW
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl">
                Przeprowadzaj wstępne rozmowy przez AI, integruj wiele 
                kanałów komunikacji i otrzymuj szczegółowe analizy w czasie 
                rzeczywistym.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <Button className="bg-primary hover:bg-primary-700 px-6 py-6 h-auto">
                Rozpocznij za darmo
              </Button>
              <Button variant="outline" className="text-gray-800 border-gray-300 hover:bg-gray-50 px-6 py-6 h-auto">
                Umów prezentację
              </Button>
            </div>
          </div>
          
          <div className="flex-1">
            <img alt="Dashboard Preview" className="w-full max-w-lg mx-auto rounded-lg shadow-lg" src="https://picsum.photos/536/354" />
          </div>
        </div>
      </div>
    </section>;
};
export default HeroSection;