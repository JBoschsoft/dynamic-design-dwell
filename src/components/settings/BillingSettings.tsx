
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  Button,
  Badge,
  Separator
} from '@/components/ui';
import { CreditCard, Calendar, AlertCircle, Check, Download } from 'lucide-react';

const BillingSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Płatności i subskrypcja</h2>
        <p className="text-sm text-muted-foreground">
          Zarządzaj swoim planem i metodami płatności.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Aktualny plan</CardTitle>
          <CardDescription>
            Szczegóły Twojego aktualnego planu subskrypcji.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Plan Professional</h3>
              <p className="text-sm text-muted-foreground">
                Rozliczanie miesięczne
              </p>
            </div>
            <Badge variant="secondary" className="text-primary px-3 py-1">Aktywny</Badge>
          </div>
          
          <Separator />
          
          <div className="grid gap-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Limit użytkowników</span>
              <span className="font-medium">10 użytkowników</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Limit kampanii rekrutacyjnych</span>
              <span className="font-medium">20 aktywnych</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Limit kandydatów</span>
              <span className="font-medium">Nieograniczony</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Integracje</span>
              <span className="font-medium">Wszystkie dostępne</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Następna płatność</span>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">15 czerwca 2023</span>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center pt-2">
            <div>
              <span className="text-sm font-medium">Miesięczna opłata</span>
              <p className="text-2xl font-bold">149 zł</p>
            </div>
            <div className="space-x-2">
              <Button variant="outline">Zmień plan</Button>
              <Button>Zarządzaj płatnościami</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Metody płatności</CardTitle>
          <CardDescription>
            Zarządzaj kartami i innymi metodami płatności.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center p-4 border rounded-md">
            <div className="flex gap-3 items-center">
              <div className="bg-primary/10 p-2 rounded-md">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-muted-foreground">Wygasa 12/2024</p>
              </div>
              <Badge className="ml-2">Domyślna</Badge>
            </div>
            <Button variant="ghost" size="sm">Edytuj</Button>
          </div>
          
          <Button variant="outline" className="w-full">
            Dodaj metodę płatności
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historia płatności</CardTitle>
          <CardDescription>
            Przeglądaj ostatnie transakcje i pobieraj faktury.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between items-center p-4 border-b">
            <div>
              <p className="font-medium">Plan Professional - Maj 2023</p>
              <p className="text-sm text-muted-foreground">15 maja 2023</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">149 zł</span>
              <Badge variant="outline" className="flex items-center gap-1">
                <Check className="h-3 w-3" /> Opłacone
              </Badge>
              <Button variant="ghost" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex justify-between items-center p-4 border-b">
            <div>
              <p className="font-medium">Plan Professional - Kwiecień 2023</p>
              <p className="text-sm text-muted-foreground">15 kwietnia 2023</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">149 zł</span>
              <Badge variant="outline" className="flex items-center gap-1">
                <Check className="h-3 w-3" /> Opłacone
              </Badge>
              <Button variant="ghost" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex justify-between items-center p-4">
            <div>
              <p className="font-medium">Plan Professional - Marzec 2023</p>
              <p className="text-sm text-muted-foreground">15 marca 2023</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">149 zł</span>
              <Badge variant="outline" className="flex items-center gap-1">
                <Check className="h-3 w-3" /> Opłacone
              </Badge>
              <Button variant="ghost" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="link" className="mx-auto">
            Zobacz wszystkie faktury
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default BillingSettings;
