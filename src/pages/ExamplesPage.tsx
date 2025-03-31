
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";

const ExampleCard = ({ title, description, image }: { title: string; description: string; image: string }) => {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <img src={image} alt={title} className="w-full h-48 object-cover" />
      <div className="p-6">
        <h3 className="font-bold text-xl mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <Button className="w-full bg-primary hover:bg-primary-700 transition-colors duration-300 font-semibold">
          Zobacz szczegóły
        </Button>
      </div>
    </div>
  );
};

const ExamplesPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6">
            <h1 className="text-4xl font-bold mb-4">Przykłady wdrożeń</h1>
            <p className="text-lg text-gray-600 mb-12 max-w-3xl">
              Zobacz, jak firmy różnych branż usprawniły swoje procesy rekrutacyjne dzięki ProstyScreening.ai.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <ExampleCard 
                title="Firma IT - 200+ pracowników"
                description="Redukcja czasu rekrutacji o 68% i zwiększenie jakości kandydatów o 45%."
                image="https://picsum.photos/id/1/500/300"
              />
              <ExampleCard 
                title="Sieć handlowa - 500+ pracowników"
                description="Zautomatyzowanie 85% wstępnych rozmów kwalifikacyjnych, oszczędność ponad 120 godzin miesięcznie."
                image="https://picsum.photos/id/2/500/300"
              />
              <ExampleCard 
                title="Agencja rekrutacyjna"
                description="Zwiększenie przepustowości procesu rekrutacyjnego o 300% bez dodatkowych zasobów."
                image="https://picsum.photos/id/3/500/300"
              />
              <ExampleCard 
                title="Startup technologiczny"
                description="Ustrukturyzowanie procesu rekrutacyjnego i redukcja błędów w ocenie kandydatów o 40%."
                image="https://picsum.photos/id/4/500/300"
              />
              <ExampleCard 
                title="Firma produkcyjna"
                description="Skrócenie czasu zatrudnienia z 45 do 12 dni i poprawa doświadczeń kandydatów."
                image="https://picsum.photos/id/5/500/300"
              />
              <ExampleCard 
                title="Firma usługowa"
                description="Zautomatyzowanie screeningu CV i wstępnych rozmów, zwiększenie efektywności działu HR o 75%."
                image="https://picsum.photos/id/6/500/300"
              />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ExamplesPage;
