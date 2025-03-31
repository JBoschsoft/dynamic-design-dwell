
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6">
            <h1 className="text-4xl font-bold mb-4">Kontakt</h1>
            <p className="text-lg text-gray-600 mb-12 max-w-3xl">
              Masz pytania dotyczące naszego oprogramowania? Chcesz umówić prezentację? 
              Wypełnij formularz lub skontaktuj się z nami bezpośrednio.
            </p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div>
                <form className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Imię i nazwisko</label>
                    <input 
                      type="text" 
                      id="name" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Jan Kowalski"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email</label>
                    <input 
                      type="email" 
                      id="email" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="jan.kowalski@firma.pl"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="company" className="block text-gray-700 font-medium mb-2">Firma</label>
                    <input 
                      type="text" 
                      id="company" 
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Nazwa firmy"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Wiadomość</label>
                    <textarea 
                      id="message" 
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Twoja wiadomość..."
                    ></textarea>
                  </div>
                  
                  <Button type="submit" className="bg-primary hover:bg-primary-700 transition-colors duration-300 px-6 py-3 h-auto font-semibold">
                    Wyślij wiadomość
                  </Button>
                </form>
              </div>
              
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-bold mb-2">Dane kontaktowe</h3>
                  <div className="space-y-2 text-gray-700">
                    <p>Email: kontakt@prostyscreening.ai</p>
                    <p>Telefon: +48 123 456 789</p>
                    <p>Adres: ul. Przykładowa 123, 00-001 Warszawa</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-bold mb-2">Godziny pracy</h3>
                  <p className="text-gray-700">Pon-Pt: 9:00 - 17:00</p>
                </div>
                
                <div className="h-64 bg-gray-200 rounded-lg">
                  {/* This would be replaced with an actual map component */}
                  <div className="h-full w-full flex items-center justify-center text-gray-500">
                    Mapa lokalizacji
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
