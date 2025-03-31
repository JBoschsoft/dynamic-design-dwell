
import React from 'react';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
  Button
} from "@/components/ui";

interface LegalAgreementsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAgreement: 'tos' | 'privacy' | 'msa';
  onAgree: () => void;
}

const LegalAgreementsModal: React.FC<LegalAgreementsModalProps> = ({
  open,
  onOpenChange,
  currentAgreement,
  onAgree
}) => {
  
  const getAgreementTitle = () => {
    switch (currentAgreement) {
      case 'tos': return "Warunki korzystania z usługi";
      case 'privacy': return "Polityka prywatności";
      case 'msa': return "Umowa ramowa o świadczenie usług";
    }
  };
  
  const getAgreementDescription = () => {
    switch (currentAgreement) {
      case 'tos': return "Przeczytaj uważnie poniższe warunki korzystania z usługi przed kontynuowaniem.";
      case 'privacy': return "Zapoznaj się z polityką prywatności opisującą przetwarzanie danych osobowych.";
      case 'msa': return "Przeczytaj umowę ramową określającą szczegóły świadczenia usług.";
    }
  };
  
  const renderAgreementContent = () => {
    switch (currentAgreement) {
      case 'tos':
        return <div className="space-y-4 my-6 text-sm">
            <h3 className="font-semibold">1. Wprowadzenie</h3>
            <p>
              Niniejsze Warunki Korzystania z Usługi („Warunki") regulują dostęp i korzystanie z platformy ProstyScreening.ai („Usługa"). 
              Korzystając z Usługi, zgadzasz się przestrzegać i być związanym niniejszymi Warunkami.
            </p>
            
            <h3 className="font-semibold">2. Opis Usługi</h3>
            <p>
              ProstyScreening.ai to platforma do automatyzacji procesów rekrutacyjnych, która pomaga firmom skuteczniej zarządzać i oceniać kandydatów.
              Usługa obejmuje narzędzia do analizy CV, przeprowadzania testów kompetencji, zarządzania procesem rekrutacji oraz generowania raportów.
            </p>
            
            <h3 className="font-semibold">3. Zobowiązania Użytkownika</h3>
            <p>
              Użytkownik zobowiązuje się do:
              <ul className="list-disc ml-6 mt-2">
                <li>Przestrzegania wszystkich obowiązujących przepisów prawa</li>
                <li>Niewykorzystywania Usługi do celów niezgodnych z prawem</li>
                <li>Nienaruszania praw innych użytkowników</li>
                <li>Zachowania poufności danych dostępowych do konta</li>
              </ul>
            </p>
            
            <h3 className="font-semibold">4. Odpowiedzialność</h3>
            <p>
              ProstyScreening.ai nie ponosi odpowiedzialności za:
              <ul className="list-disc ml-6 mt-2">
                <li>Decyzje podejmowane przez Użytkownika na podstawie danych z Usługi</li>
                <li>Przerwy w dostępie do Usługi wynikające z przyczyn technicznych</li>
                <li>Szkody wynikające z nieprawidłowego korzystania z Usługi</li>
              </ul>
            </p>
          </div>;
      case 'privacy':
        return <div className="space-y-4 my-6 text-sm">
            <h3 className="font-semibold">1. Administrator Danych</h3>
            <p>
              Administratorem danych osobowych jest ProstyScreening.ai. Dane przetwarzane są zgodnie z obowiązującym prawem, 
              w szczególności z Rozporządzeniem Parlamentu Europejskiego i Rady (UE) 2016/679 z dnia 27 kwietnia 2016 r. (RODO).
            </p>
            
            <h3 className="font-semibold">2. Gromadzone Dane</h3>
            <p>
              Gromadzimy różne rodzaje informacji o użytkownikach naszej Strony i Usługi, w tym:
              <ul className="list-disc ml-6 mt-2">
                <li>Dane osobowe: Imię, nazwisko, adres e-mail, numer telefonu i inne dane kontaktowe</li>
                <li>Dane o firmie: Nazwa firmy, adres, branża i inne informacje dotyczące organizacji</li>
                <li>Dane o korzystaniu: Informacje o tym, w jaki sposób użytkownik korzysta z naszej Strony i Usługi</li>
              </ul>
            </p>
            
            <h3 className="font-semibold">3. Cel Przetwarzania Danych</h3>
            <p>
              Wykorzystujemy zebrane dane w następujących celach:
              <ul className="list-disc ml-6 mt-2">
                <li>Świadczenie, utrzymanie i doskonalenie naszej Usługi</li>
                <li>Obsługa konta użytkownika i zapewnienie obsługi klienta</li>
                <li>Przesyłanie informacji technicznych, aktualizacji i powiadomień</li>
                <li>Komunikacja z użytkownikiem</li>
              </ul>
            </p>
            
            <h3 className="font-semibold">4. Prawa Użytkowników</h3>
            <p>
              Użytkownicy mają prawo do:
              <ul className="list-disc ml-6 mt-2">
                <li>Dostępu do swoich danych osobowych</li>
                <li>Sprostowania nieprawidłowych danych</li>
                <li>Usunięcia danych (prawo do bycia zapomnianym)</li>
                <li>Ograniczenia przetwarzania danych</li>
                <li>Przenoszenia danych</li>
                <li>Sprzeciwu wobec przetwarzania</li>
              </ul>
            </p>
          </div>;
      case 'msa':
        return <div className="space-y-4 my-6 text-sm">
            <h3 className="font-semibold">1. Przedmiot Umowy</h3>
            <p>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam hendrerit nisi sed sollicitudin pellentesque. 
              Nunc posuere purus rhoncus pulvinar aliquam. Ut aliquet tristique nisl vitae volutpat. 
              Nulla aliquet porttitor venenatis. Donec a dui et dui fringilla consectetur id nec massa.
            </p>
            
            <h3 className="font-semibold">2. Zakres Świadczonych Usług</h3>
            <p>
              Aliquam erat volutpat. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, 
              totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
              <ul className="list-disc ml-6 mt-2">
                <li>Nemo enim ipsam voluptatem quia voluptas sit aspernatur</li>
                <li>Aut odit aut fugit, sed quia consequuntur magni dolores</li>
                <li>Quis nostrum exercitationem ullam corporis suscipit laboriosam</li>
              </ul>
            </p>
            
            <h3 className="font-semibold">3. Wynagrodzenie i Płatności</h3>
            <p>
              Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, 
              totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
              Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.
            </p>
            
            <h3 className="font-semibold">4. Okres Obowiązywania i Rozwiązanie Umowy</h3>
            <p>
              At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti 
              atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident,
              similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.
            </p>
            
            <h3 className="font-semibold">5. Poufność</h3>
            <p>
              Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi 
              optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, 
              omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis.
            </p>
          </div>;
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getAgreementTitle()}</DialogTitle>
          <DialogDescription>{getAgreementDescription()}</DialogDescription>
        </DialogHeader>
        
        {renderAgreementContent()}
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Zamknij
          </Button>
          <Button onClick={onAgree}>
            Akceptuję {currentAgreement === 'tos' ? 'warunki' : currentAgreement === 'privacy' ? 'politykę' : 'umowę'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LegalAgreementsModal;
