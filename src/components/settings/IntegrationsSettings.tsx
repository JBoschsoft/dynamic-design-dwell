
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  Button,
  Switch,
  Label,
  Input,
  Alert,
  AlertDescription,
  AlertTitle,
  Separator
} from '@/components/ui';
import { toast } from '@/hooks/use-toast';
import { 
  Calendar, 
  Check, 
  ExternalLink, 
  Link as LinkIcon, 
  RefreshCcw, 
  Shield, 
  Unlink, 
  AlertCircle 
} from 'lucide-react';

const IntegrationsSettings = () => {
  const handleConnect = (service: string) => {
    console.log(`Connecting to ${service}`);
    toast({
      title: `Połączono z ${service}`,
      description: "Integracja została pomyślnie skonfigurowana.",
    });
  };

  const handleDisconnect = (service: string) => {
    console.log(`Disconnecting from ${service}`);
    toast({
      title: `Odłączono od ${service}`,
      description: "Integracja została usunięta.",
      variant: "destructive",
    });
  };

  const handleSaveApiKey = (service: string) => {
    console.log(`Saving API key for ${service}`);
    toast({
      title: "Zapisano klucz API",
      description: `Klucz API dla ${service} został zaktualizowany.`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Integracje</h2>
        <p className="text-sm text-muted-foreground">
          Połącz HR Assist z innymi usługami, których używasz.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Systemy ATS</CardTitle>
          <CardDescription>
            Integracja z systemami zarządzania kandydatami (ATS).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start justify-between p-4 rounded-md border">
            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                <LinkIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium">Workable</h3>
                <p className="text-sm text-muted-foreground">
                  Zintegruj się z Workable, aby synchronizować kandydatów i oferty pracy.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-green-500 font-medium">Połączono</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8">
                <RefreshCcw className="h-3 w-3 mr-1" />
                Synchronizuj
              </Button>
              <Button variant="outline" size="sm" className="h-8" onClick={() => handleDisconnect('Workable')}>
                <Unlink className="h-3 w-3 mr-1" />
                Odłącz
              </Button>
            </div>
          </div>

          <div className="flex items-start justify-between p-4 rounded-md border">
            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                <LinkIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium">Lever</h3>
                <p className="text-sm text-muted-foreground">
                  Zintegruj się z Lever, aby synchronizować kandydatów i oferty pracy.
                </p>
              </div>
            </div>
            <div>
              <Button size="sm" className="h-8" onClick={() => handleConnect('Lever')}>
                Połącz
              </Button>
            </div>
          </div>

          <div className="flex items-start justify-between p-4 rounded-md border">
            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                <LinkIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium">Greenhouse</h3>
                <p className="text-sm text-muted-foreground">
                  Zintegruj się z Greenhouse, aby synchronizować kandydatów i oferty pracy.
                </p>
              </div>
            </div>
            <div>
              <Button size="sm" className="h-8" onClick={() => handleConnect('Greenhouse')}>
                Połącz
              </Button>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Potrzebujesz innej integracji?</AlertTitle>
            <AlertDescription>
              Skontaktuj się z naszym zespołem wsparcia, aby uzyskać pomoc w konfiguracji niestandardowej integracji.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Kalendarze</CardTitle>
          <CardDescription>
            Integracja z systemami kalendarzy, aby ułatwić planowanie spotkań.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start justify-between p-4 rounded-md border">
            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium">Google Calendar</h3>
                <p className="text-sm text-muted-foreground">
                  Zintegruj się z Google Calendar, aby synchronizować spotkania.
                </p>
              </div>
            </div>
            <div>
              <Button size="sm" className="h-8" onClick={() => handleConnect('Google Calendar')}>
                Połącz
              </Button>
            </div>
          </div>

          <div className="flex items-start justify-between p-4 rounded-md border">
            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium">Microsoft Outlook</h3>
                <p className="text-sm text-muted-foreground">
                  Zintegruj się z Microsoft Outlook, aby synchronizować spotkania.
                </p>
              </div>
            </div>
            <div>
              <Button size="sm" className="h-8" onClick={() => handleConnect('Microsoft Outlook')}>
                Połącz
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Single Sign-On (SSO)</CardTitle>
          <CardDescription>
            Skonfiguruj logowanie jednokrotne dla Twojej organizacji.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-start justify-between p-4 rounded-md border">
            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium">Google Workspace</h3>
                <p className="text-sm text-muted-foreground">
                  Pozwól użytkownikom logować się za pomocą kont Google Workspace.
                </p>
                <div className="mt-4 flex items-center space-x-2">
                  <Switch id="google-sso" />
                  <Label htmlFor="google-sso">Włącz SSO przez Google</Label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start justify-between p-4 rounded-md border">
            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium">Microsoft Azure AD</h3>
                <p className="text-sm text-muted-foreground">
                  Pozwól użytkownikom logować się za pomocą kont Microsoft.
                </p>
                <div className="mt-4 flex items-center space-x-2">
                  <Switch id="microsoft-sso" />
                  <Label htmlFor="microsoft-sso">Włącz SSO przez Microsoft</Label>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start justify-between p-4 rounded-md border">
            <div className="flex gap-4">
              <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium">SAML/OIDC</h3>
                <p className="text-sm text-muted-foreground">
                  Skonfiguruj własny dostawcę tożsamości poprzez SAML lub OIDC.
                </p>
                <div className="mt-4 space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="idp-url">URL dostawcy tożsamości</Label>
                    <Input id="idp-url" placeholder="https://sso.yourcompany.com/" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="idp-cert">Certyfikat dostawcy</Label>
                    <textarea 
                      id="idp-cert"
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                      placeholder="-----BEGIN CERTIFICATE----- ... -----END CERTIFICATE-----"
                    />
                  </div>
                  <Button size="sm">Zapisz konfigurację SAML</Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-muted-foreground">
            Dowiedz się więcej o
            <a href="#" className="ml-1 text-primary hover:underline inline-flex items-center">
              konfiguracji SSO
              <ExternalLink className="ml-1 h-3 w-3" />
            </a>
          </p>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API</CardTitle>
          <CardDescription>
            Zarządzaj kluczami API do integracji niestandardowych.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="api-key">Klucz API</Label>
            <div className="flex gap-2">
              <Input id="api-key" type="password" value="sk_live_51ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrs" readOnly />
              <Button variant="outline" onClick={() => toast({ title: "Klucz skopiowany do schowka" })}>
                Kopiuj
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Ten klucz API zapewnia pełny dostęp do Twojego konta. Nie udostępniaj go publicznie.
            </p>
          </div>
          
          <Separator className="my-4" />
          
          <div className="grid gap-2">
            <Label htmlFor="webhook-url">URL Webhooka</Label>
            <Input id="webhook-url" placeholder="https://your-app.com/webhook" />
            <p className="text-xs text-muted-foreground">
              URL, pod który będziemy wysyłać powiadomienia o zdarzeniach.
            </p>
          </div>
          
          <Button onClick={() => handleSaveApiKey('Webhooks')}>Zapisz ustawienia API</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationsSettings;
