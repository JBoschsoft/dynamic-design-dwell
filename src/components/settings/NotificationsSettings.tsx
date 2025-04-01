
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button,
  Switch,
  Label,
  Separator
} from '@/components/ui';
import { toast } from '@/hooks/use-toast';
import { Bell, MessageSquare, Mail, Calendar } from 'lucide-react';

const NotificationsSettings = () => {
  const handleSaveChanges = () => {
    toast({
      title: "Ustawienia powiadomień zapisane",
      description: "Twoje preferencje powiadomień zostały zaktualizowane.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Powiadomienia</h2>
        <p className="text-sm text-muted-foreground">
          Dostosuj swoje preferencje powiadomień.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Powiadomienia w aplikacji</CardTitle>
          <CardDescription>
            Zarządzaj powiadomieniami wyświetlanymi w aplikacji.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="new-messages">Nowe wiadomości</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Otrzymuj powiadomienia, gdy ktoś wyśle Ci wiadomość.
              </p>
            </div>
            <Switch id="new-messages" defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="new-applications">Nowe aplikacje</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Otrzymuj powiadomienia o nowych aplikacjach kandydatów.
              </p>
            </div>
            <Switch id="new-applications" defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="calendar-reminders">Przypomnienia o spotkaniach</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Otrzymuj przypomnienia o nadchodzących spotkaniach.
              </p>
            </div>
            <Switch id="calendar-reminders" defaultChecked />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Powiadomienia email</CardTitle>
          <CardDescription>
            Wybierz, o czym chcesz być informowany przez email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="daily-digest">Dzienne podsumowanie</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Otrzymuj dzienne podsumowanie aktywności w systemie.
              </p>
            </div>
            <Switch id="daily-digest" defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="new-applications-email">Nowe aplikacje</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Otrzymuj emaile o nowych aplikacjach kandydatów.
              </p>
            </div>
            <Switch id="new-applications-email" defaultChecked />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="team-activity">Aktywność zespołu</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Otrzymuj emaile o działaniach członków zespołu.
              </p>
            </div>
            <Switch id="team-activity" />
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="marketing-emails">Emaile marketingowe</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Otrzymuj emaile o nowych funkcjach, poradach i aktualizacjach.
              </p>
            </div>
            <Switch id="marketing-emails" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Powiadomienia mobilne</CardTitle>
          <CardDescription>
            Zarządzaj powiadomieniami push na urządzeniach mobilnych.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="mobile-notifications">Powiadomienia mobilne</Label>
              <p className="text-sm text-muted-foreground">
                Włącz lub wyłącz wszystkie powiadomienia mobilne.
              </p>
            </div>
            <Switch id="mobile-notifications" defaultChecked />
          </div>
          
          <Button onClick={handleSaveChanges} className="w-full mt-4">
            Zapisz ustawienia powiadomień
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsSettings;
