
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  Button,
  Input,
  Label,
  Switch,
  Separator,
  Alert,
  AlertDescription,
  AlertTitle
} from '@/components/ui';
import { toast } from '@/hooks/use-toast';
import { 
  Lock, 
  Shield, 
  Key, 
  Smartphone, 
  AlertTriangle, 
  Eye, 
  EyeOff 
} from 'lucide-react';

const SecuritySettings = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Hasło zostało zmienione",
      description: "Twoje hasło zostało pomyślnie zaktualizowane.",
    });
  };

  const handleEnable2FA = () => {
    toast({
      title: "Weryfikacja dwuetapowa włączona",
      description: "Twoje konto jest teraz lepiej zabezpieczone.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Bezpieczeństwo</h2>
        <p className="text-sm text-muted-foreground">
          Zarządzaj ustawieniami bezpieczeństwa swojego konta.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Zmiana hasła</CardTitle>
          <CardDescription>
            Aktualizuj swoje hasło regularnie, aby zwiększyć bezpieczeństwo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="current-password">Aktualne hasło</Label>
              <div className="relative">
                <Input
                  id="current-password"
                  type={showPassword ? "text" : "password"}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Ukryj hasło" : "Pokaż hasło"}
                  </span>
                </Button>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="new-password">Nowe hasło</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showNewPassword ? "text" : "password"}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="sr-only">
                    {showNewPassword ? "Ukryj hasło" : "Pokaż hasło"}
                  </span>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Hasło musi zawierać co najmniej 8 znaków, w tym wielką literę, cyfrę i znak specjalny.
              </p>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">Potwierdź nowe hasło</Label>
              <Input
                id="confirm-password"
                type="password"
                required
              />
            </div>
            
            <Button type="submit">
              Zmień hasło
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Weryfikacja dwuetapowa (2FA)</CardTitle>
          <CardDescription>
            Dodaj dodatkową warstwę zabezpieczeń do swojego konta.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <Label htmlFor="enable-2fa">Włącz weryfikację dwuetapową</Label>
            </div>
            <Switch id="enable-2fa" onCheckedChange={handleEnable2FA} />
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Metody weryfikacji</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input type="radio" id="app-authenticator" name="2fa-method" className="h-4 w-4 text-primary" />
                <Label htmlFor="app-authenticator">Aplikacja uwierzytelniająca (np. Google Authenticator)</Label>
              </div>
              <div className="flex items-center gap-2">
                <input type="radio" id="sms-code" name="2fa-method" className="h-4 w-4 text-primary" />
                <Label htmlFor="sms-code">Kody SMS</Label>
              </div>
            </div>
          </div>
          
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Ważne</AlertTitle>
            <AlertDescription>
              Zachowaj kody zapasowe w bezpiecznym miejscu. Będziesz ich potrzebować, jeśli stracisz dostęp do głównej metody weryfikacji.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sesje i urządzenia</CardTitle>
          <CardDescription>
            Przeglądaj i zarządzaj aktywnymi sesjami na różnych urządzeniach.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-start justify-between p-4 rounded-md border">
              <div className="flex gap-3">
                <div className="bg-primary/10 p-2 rounded-md">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">iPhone 13 Pro - Safari</h3>
                  <p className="text-xs text-muted-foreground">Warszawa, Polska</p>
                  <p className="text-xs text-muted-foreground mt-1">Ostatnia aktywność: 14 maja 2023, 15:30</p>
                  <div className="mt-1 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1"></span>
                    Aktywna sesja
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Wyloguj
              </Button>
            </div>
            
            <div className="flex items-start justify-between p-4 rounded-md border">
              <div className="flex gap-3">
                <div className="bg-primary/10 p-2 rounded-md">
                  <Lock className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">MacBook Pro - Chrome</h3>
                  <p className="text-xs text-muted-foreground">Warszawa, Polska</p>
                  <p className="text-xs text-muted-foreground mt-1">Ostatnia aktywność: 14 maja 2023, 15:45</p>
                  <div className="mt-1 inline-flex items-center rounded-full border border-green-200 bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 mr-1"></span>
                    Bieżąca sesja
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                Bieżące
              </Button>
            </div>
          </div>
          
          <Button variant="destructive" className="w-full">
            Wyloguj ze wszystkich urządzeń
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historia logowania</CardTitle>
          <CardDescription>
            Przegląd ostatnich prób logowania do Twojego konta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between p-2 text-sm">
              <div>
                <p className="font-medium">Pomyślne logowanie</p>
                <p className="text-xs text-muted-foreground">Warszawa, Polska (IP: 188.147.xx.xx)</p>
              </div>
              <div className="text-right">
                <p>14 maja 2023</p>
                <p className="text-xs text-muted-foreground">15:30</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-between p-2 text-sm">
              <div>
                <p className="font-medium">Pomyślne logowanie</p>
                <p className="text-xs text-muted-foreground">Warszawa, Polska (IP: 188.147.xx.xx)</p>
              </div>
              <div className="text-right">
                <p>13 maja 2023</p>
                <p className="text-xs text-muted-foreground">09:15</p>
              </div>
            </div>
            
            <Separator />
            
            <div className="flex justify-between p-2 text-sm">
              <div>
                <p className="font-medium text-amber-600">Nieudane logowanie</p>
                <p className="text-xs text-muted-foreground">Berlin, Niemcy (IP: 92.45.xx.xx)</p>
              </div>
              <div className="text-right">
                <p>12 maja 2023</p>
                <p className="text-xs text-muted-foreground">23:42</p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="link" className="mx-auto">
            Zobacz pełną historię logowań
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SecuritySettings;
