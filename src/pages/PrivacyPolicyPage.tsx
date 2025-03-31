
import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-8">Polityka Prywatności</h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="lead text-gray-600 mb-8">
                Ostatnia aktualizacja: 1 czerwca 2023
              </p>
              
              <h2>1. Wprowadzenie</h2>
              <p>
                ProstyScreening.ai ("my", "nas", "nasz") szanuje prywatność użytkowników i zobowiązuje się do jej 
                ochrony. Niniejsza Polityka Prywatności wyjaśnia, w jaki sposób gromadzimy, wykorzystujemy i 
                udostępniamy informacje o użytkownikach naszej strony internetowej prostyscreening.ai 
                ("Strona") oraz naszej platformy rekrutacyjnej ("Usługa").
              </p>
              
              <h2>2. Gromadzone dane</h2>
              <p>
                Gromadzimy różne rodzaje informacji o użytkownikach naszej Strony i Usługi, w tym:
              </p>
              <ul>
                <li>
                  <strong>Dane osobowe</strong>: Imię, nazwisko, adres e-mail, numer telefonu i inne dane 
                  kontaktowe podawane podczas rejestracji, zakładania konta lub komunikacji z nami.
                </li>
                <li>
                  <strong>Dane o firmie</strong>: Nazwa firmy, adres, branża i inne informacje dotyczące 
                  organizacji użytkownika.
                </li>
                <li>
                  <strong>Dane o korzystaniu</strong>: Informacje o tym, w jaki sposób użytkownik korzysta 
                  z naszej Strony i Usługi, w tym dane o ruchu, dane logowania, odwiedzane strony, czas 
                  spędzony na Stronie i inne statystyki.
                </li>
              </ul>
              
              <h2>3. Cel przetwarzania danych</h2>
              <p>
                Wykorzystujemy zebrane dane w następujących celach:
              </p>
              <ul>
                <li>Świadczenie, utrzymanie i doskonalenie naszej Usługi</li>
                <li>Obsługa konta użytkownika i zapewnienie obsługi klienta</li>
                <li>Przesyłanie informacji technicznych, aktualizacji i powiadomień związanych z bezpieczeństwem</li>
                <li>Komunikacja z użytkownikiem, w tym przesyłanie wiadomości związanych z usługą, marketingowych i promocyjnych</li>
                <li>Monitorowanie korzystania z naszej Usługi</li>
                <li>Wykrywanie, zapobieganie i rozwiązywanie problemów technicznych</li>
              </ul>
              
              <h2>4. Udostępnianie danych</h2>
              <p>
                Możemy udostępniać dane osobowe użytkowników w następujących okolicznościach:
              </p>
              <ul>
                <li>Z dostawcami usług, którzy pomagają nam prowadzić naszą działalność i Usługę</li>
                <li>Z podmiotami stowarzyszonymi, partnerami lub spółkami zależnymi</li>
                <li>W przypadku fuzji, sprzedaży aktywów firmy, finansowania lub przejęcia całości lub części naszej działalności</li>
                <li>Za zgodą użytkownika w innych celach ujawnionych w momencie przekazywania danych</li>
                <li>Jeśli jest to wymagane przez prawo lub w odpowiedzi na ważne zapytania prawne</li>
              </ul>
              
              <h2>5. Bezpieczeństwo danych</h2>
              <p>
                Bezpieczeństwo danych użytkowników jest dla nas priorytetem. Stosujemy odpowiednie środki 
                techniczne i organizacyjne, aby chronić dane osobowe przed przypadkowym lub bezprawnym 
                zniszczeniem, utratą, zmianą, nieuprawnionym ujawnieniem lub dostępem.
              </p>
              
              <h2>6. Prawa użytkowników</h2>
              <p>
                Użytkownicy mają prawo do:
              </p>
              <ul>
                <li>Dostępu do swoich danych osobowych</li>
                <li>Sprostowania nieprawidłowych danych</li>
                <li>Usunięcia danych (prawo do bycia zapomnianym)</li>
                <li>Ograniczenia przetwarzania danych</li>
                <li>Przenoszenia danych</li>
                <li>Sprzeciwu wobec przetwarzania</li>
                <li>Wycofania zgody w dowolnym momencie</li>
              </ul>
              
              <h2>7. Kontakt</h2>
              <p>
                W przypadku pytań dotyczących niniejszej Polityki Prywatności lub przetwarzania danych 
                przez ProstyScreening.ai, prosimy o kontakt:
              </p>
              <p>
                Email: privacy@prostyscreening.ai<br />
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

export default PrivacyPolicyPage;
