
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <section className="py-20">
          <div className="container mx-auto px-4 md:px-6">
            <h1 className="text-4xl font-bold mb-8">O nas</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div>
                <p className="text-lg text-gray-700 mb-6">
                  ProstyScreening.ai to innowacyjna firma technologiczna, która powstała z misją 
                  zrewolucjonizowania procesu rekrutacji dla firm każdej wielkości.
                </p>
                <p className="text-lg text-gray-700 mb-6">
                  Nasza platforma wykorzystuje zaawansowane algorytmy sztucznej inteligencji 
                  do automatyzacji wstępnych rozmów kwalifikacyjnych, oszczędzając czas
                  i zasoby rekruterów.
                </p>
                <p className="text-lg text-gray-700">
                  Założona w 2021 roku, firma szybko zyskała uznanie na rynku rozwiązań HR-tech 
                  dzięki skuteczności i łatwości wdrożenia naszego oprogramowania.
                </p>
              </div>
              
              <div className="flex items-center justify-center">
                <img src="https://picsum.photos/600/400" alt="Team at work" className="rounded-lg shadow-md" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
