
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { CalendarIcon, PlayCircle } from 'lucide-react';

const WebinarsPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <h1 className="text-4xl font-bold mb-8">Webinary</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-primary-50 p-8 rounded-lg">
              <div className="flex items-center gap-2 text-primary font-semibold mb-2">
                <CalendarIcon size={18} />
                <span>Następny webinar: 15 czerwca 2023, 14:00</span>
              </div>
              <h2 className="text-2xl font-bold mb-3">Jak efektywnie przeprowadzać screening kandydatów?</h2>
              <p className="text-gray-600 mb-6">
                Dołącz do naszego webinaru, aby dowiedzieć się, jak wykorzystać AI do wstępnej selekcji kandydatów
                i zwiększyć efektywność procesu rekrutacji.
              </p>
              <Button className="bg-primary hover:bg-primary-700 transition-colors duration-300 font-semibold">
                Zarejestruj się
              </Button>
            </div>
            
            <div className="border border-gray-200 p-8 rounded-lg">
              <div className="flex items-center gap-2 text-gray-500 font-semibold mb-2">
                <CalendarIcon size={18} />
                <span>Webinar już wkrótce</span>
              </div>
              <h2 className="text-2xl font-bold mb-3">Integracja z systemami ATS - najlepsze praktyki</h2>
              <p className="text-gray-600 mb-6">
                Dowiedz się, jak bezproblemowo zintegrować ProstyScreening.ai z istniejącymi w Twojej firmie
                systemami zarządzania rekrutacją.
              </p>
              <Button variant="outline" className="border-primary text-primary hover:bg-primary-50 transition-colors duration-300 font-semibold">
                Otrzymaj powiadomienie
              </Button>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold mb-6">Archiwum webinarów</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="bg-white rounded-lg overflow-hidden shadow-md">
                <div className="relative">
                  <img 
                    src={`https://picsum.photos/600/300?random=${item+10}`} 
                    alt="Webinar" 
                    className="w-full h-40 object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors">
                    <PlayCircle className="text-white w-12 h-12" />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold mb-2">Automatyzacja screeningu kandydatów</h3>
                  <p className="text-gray-500 text-sm">12 kwietnia 2023</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default WebinarsPage;
