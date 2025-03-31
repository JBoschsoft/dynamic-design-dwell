
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Search } from 'lucide-react';

const DocumentationPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl font-bold mb-6 text-center">Dokumentacja</h1>
            <p className="text-lg text-gray-600 text-center mb-8">
              Znajdź wszystkie informacje potrzebne do efektywnego korzystania z ProstyScreening.ai
            </p>
            
            <div className="relative">
              <input 
                type="text" 
                placeholder="Wyszukaj w dokumentacji..."
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-xl mb-2">Pierwsze kroki</h3>
              <p className="text-gray-600 mb-4">
                Przewodnik dla nowych użytkowników - konfiguracja konta, podstawowe funkcje, pierwsze screningi.
              </p>
              <a href="#" className="text-primary font-semibold hover:underline">Zobacz więcej →</a>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-xl mb-2">Integracje</h3>
              <p className="text-gray-600 mb-4">
                Szczegółowe przewodniki dotyczące integracji z popularnymi systemami ATS i HRIS.
              </p>
              <a href="#" className="text-primary font-semibold hover:underline">Zobacz więcej →</a>
            </div>
            
            <div className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <h3 className="font-bold text-xl mb-2">API</h3>
              <p className="text-gray-600 mb-4">
                Dokumentacja API ProstyScreening.ai dla deweloperów i zaawansowanych użytkowników.
              </p>
              <a href="#" className="text-primary font-semibold hover:underline">Zobacz więcej →</a>
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Popularne tematy</h2>
            
            <div className="space-y-6">
              {[
                "Jak utworzyć szablon screeningu?",
                "Integracja z systemem ATS",
                "Analiza wyników i raportowanie",
                "Ustawienia preferencji screeningu",
                "Zarządzanie bazą pytań"
              ].map((topic, index) => (
                <div key={index} className="border-b border-gray-200 pb-4">
                  <a href="#" className="text-lg font-medium hover:text-primary transition-colors">
                    {topic}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DocumentationPage;
