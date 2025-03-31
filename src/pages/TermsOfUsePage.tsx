
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const TermsOfUsePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Warunki Użytkowania</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="lead text-gray-600 mb-8">
                Ostatnia aktualizacja: 1 czerwca 2023
              </p>
              
              <h2>1. Wprowadzenie</h2>
              <p>
                Niniejsze Warunki Użytkowania („Warunki") regulują korzystanie ze strony internetowej 
                prostyscreening.ai („Strona") oraz platformy rekrutacyjnej ProstyScreening.ai („Usługa") 
                oferowanych przez ProstyScreening.ai („Spółka", „my", „nas" lub „nasz").
              </p>
              <p>
                Korzystając z naszej Strony i Usługi, użytkownik akceptuje niniejsze Warunki w całości. 
                Jeśli użytkownik nie zgadza się z którymkolwiek z postanowień niniejszych Warunków, 
                nie powinien korzystać z naszej Strony i Usługi.
              </p>
              
              <h2>2. Korzystanie z Usługi</h2>
              <p>
                ProstyScreening.ai udziela użytkownikowi osobistej, niewyłącznej, nieprzekazywalnej i 
                niezbywialnej licencji na korzystanie z Usługi zgodnie z niniejszymi Warunkami.
              </p>
              <p>
                Użytkownik zobowiązuje się:
              </p>
              <ul>
                <li>Tworzyć i utrzymywać tylko jedno konto</li>
                <li>Zapewnić dokładne, aktualne i kompletne informacje podczas rejestracji</li>
                <li>Chronić bezpieczeństwo swojego konta i hasła</li>
                <li>Niezwłocznie powiadomić nas o wszelkich naruszeniach bezpieczeństwa lub nieautoryzowanym korzystaniu z konta</li>
                <li>Ponosić odpowiedzialność za wszystkie działania podejmowane na koncie</li>
                <li>Przestrzegać wszystkich obowiązujących przepisów prawa podczas korzystania z Usługi</li>
              </ul>
              
              <h2>3. Ograniczenia</h2>
              <p>
                Użytkownik nie może:
              </p>
              <ul>
                <li>Używać Usługi w sposób niezgodny z prawem lub nieuczciwy</li>
                <li>Próbować uzyskać nieautoryzowany dostęp do naszych systemów lub zakłócać ich działanie</li>
                <li>Zbierać ani gromadzić danych innych użytkowników</li>
                <li>Wykorzystywać Usługi do wysyłania niezamówionych materiałów marketingowych</li>
                <li>Używać Usługi do dyskryminacji przy zatrudnianiu lub w sposób naruszający przepisy prawa pracy</li>
                <li>Wprowadzać do systemów wirusów, trojanów lub innych szkodliwych kodów</li>
                <li>Korzystać z automatycznych skryptów do zbierania informacji lub innej interakcji z Usługą</li>
              </ul>
              
              <h2>4. Prawa własności intelektualnej</h2>
              <p>
                Usługa, w tym jej treść, funkcje i funkcjonalności, są własnością Spółki i są chronione 
                przez prawa autorskie, znaki towarowe, patenty, tajemnice handlowe i inne prawa własności 
                intelektualnej.
              </p>
              <p>
                Użytkownik nie może kopiować, modyfikować, rozpowszechniać, sprzedawać, wynajmować, 
                pożyczać ani tworzyć dzieł pochodnych na podstawie naszej Usługi bez naszej wyraźnej 
                pisemnej zgody.
              </p>
              
              <h2>5. Opłaty i płatności</h2>
              <p>
                Korzystanie z niektórych funkcji Usługi może wymagać uiszczenia opłat. Wszystkie opłaty są 
                podane w cenniku dostępnym na naszej Stronie i mogą ulec zmianie za powiadomieniem.
              </p>
              <p>
                Płatności są przetwarzane przez naszych zaufanych partnerów płatniczych. Akceptując niniejsze 
                Warunki, użytkownik wyraża zgodę na obciążenie wskazanej metody płatności.
              </p>
              
              <h2>6. Ograniczenie odpowiedzialności</h2>
              <p>
                W maksymalnym zakresie dozwolonym przez prawo, Spółka nie ponosi odpowiedzialności za jakiekolwiek 
                szkody bezpośrednie, pośrednie, przypadkowe, szczególne, wynikowe lub przykładowe, w tym utratę 
                zysków, danych, wartości firmy lub inne straty niematerialne, wynikające z:
              </p>
              <ul>
                <li>Korzystania lub niemożności korzystania z Usługi</li>
                <li>Wszelkich zmian wprowadzonych do Usługi</li>
                <li>Nieautoryzowanego dostępu do danych użytkownika</li>
                <li>Oświadczeń lub zachowań jakiejkolwiek strony trzeciej w ramach Usługi</li>
              </ul>
              
              <h2>7. Zmiany Warunków</h2>
              <p>
                Zastrzegamy sobie prawo do zmiany lub zastąpienia niniejszych Warunków w dowolnym momencie 
                według własnego uznania. Będziemy informować o istotnych zmianach za pomocą powiadomienia na 
                naszej Stronie.
              </p>
              <p>
                Dalsze korzystanie z Usługi po wprowadzeniu zmian oznacza akceptację nowych Warunków.
              </p>
              
              <h2>8. Kontakt</h2>
              <p>
                W przypadku pytań dotyczących niniejszych Warunków, prosimy o kontakt:
              </p>
              <p>
                Email: legal@prostyscreening.ai<br />
                Adres: ul. Przykładowa 123, 00-001 Warszawa
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfUsePage;
