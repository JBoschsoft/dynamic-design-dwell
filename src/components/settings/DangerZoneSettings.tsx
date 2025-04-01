
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  Button,
  Input,
  Label,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Separator
} from '@/components/ui';
import { toast } from '@/hooks/use-toast';
import { AlertTriangle, Trash2, FileX, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const DangerZoneSettings = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const handleExportData = () => {
    // In a real app, this would trigger a data export
    toast({
      title: "Eksport danych rozpoczęty",
      description: "Twoje dane zostaną wyeksportowane i wysłane na Twój adres email.",
    });
  };

  const handleDeleteWorkspace = async () => {
    try {
      setIsDeleting(true);
      // In a real app, this would delete the workspace
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate success
      toast({
        title: "Workspace usunięty",
        description: "Twój workspace został pomyślnie usunięty.",
        variant: "destructive",
      });
      
      // Log out the user
      await supabase.auth.signOut();
      
      // Redirect to home page
      navigate('/');
    } catch (error) {
      console.error('Error deleting workspace:', error);
      toast({
        title: "Błąd",
        description: "Nie udało się usunąć workspace. Spróbuj ponownie później.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Strefa zagrożenia</h2>
        <p className="text-sm text-muted-foreground">
          Te akcje są nieodwracalne. Prosimy o ostrożność.
        </p>
      </div>

      <Card>
        <CardHeader className="bg-amber-50 border-b border-amber-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <CardTitle className="text-amber-700">Operacje potencjalnie niebezpieczne</CardTitle>
          </div>
          <CardDescription className="text-amber-600">
            Poniższe działania mogą spowodować utratę danych lub inne problemy.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-6">
            <div className="flex items-start justify-between gap-4 p-4 border rounded-md">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-base font-medium">Eksportuj dane workspace</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Pobierz wszystkie dane związane z Twoim workspace w formacie CSV lub JSON.
                </p>
              </div>
              <Button variant="outline" onClick={handleExportData}>
                Eksportuj dane
              </Button>
            </div>

            <div className="flex items-start justify-between gap-4 p-4 border rounded-md">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <FileX className="h-5 w-5 text-muted-foreground" />
                  <h3 className="text-base font-medium">Wyczyść wszystkie dane</h3>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Usuń wszystkie dane z workspace, zachowując konfigurację i ustawienia.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-amber-600 border-amber-200 hover:bg-amber-50">
                    Wyczyść dane
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Czy na pewno chcesz wyczyścić wszystkie dane?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Ta akcja usunie wszystkie dane z Twojego workspace, w tym kandydatów, oferty pracy i inne rekordy.
                      Nie będzie można ich odzyskać. Ustawienia workspace zostaną zachowane.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Anuluj</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-amber-600 hover:bg-amber-700"
                      onClick={() => {
                        toast({
                          title: "Dane wyczyszczone",
                          description: "Wszystkie dane zostały usunięte z Twojego workspace.",
                          variant: "destructive",
                        });
                      }}
                    >
                      Wyczyść dane
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            <Separator className="my-2" />

            <div className="flex items-start justify-between gap-4 p-4 border border-red-200 rounded-md bg-red-50">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-red-600" />
                  <h3 className="text-base font-medium text-red-700">Usuń workspace</h3>
                </div>
                <p className="text-sm text-red-600 mt-1">
                  Trwale usuń ten workspace i wszystkie związane z nim dane. Ta akcja jest nieodwracalna.
                </p>
              </div>
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    Usuń workspace
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Czy na pewno chcesz usunąć ten workspace?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Ta akcja trwale usunie Twój workspace, wszystkie dane, oferty pracy, kandydatów i ustawienia.
                      Nie będzie można ich odzyskać. Wszyscy użytkownicy utracą dostęp.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="py-4">
                    <Label htmlFor="confirm" className="text-sm font-medium">
                      Wpisz <span className="font-mono bg-muted px-1">USUŃ WORKSPACE</span> aby potwierdzić
                    </Label>
                    <Input 
                      id="confirm" 
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      className="mt-2"
                      placeholder="USUŃ WORKSPACE"
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Anuluj</AlertDialogCancel>
                    <Button 
                      variant="destructive"
                      disabled={confirmText !== 'USUŃ WORKSPACE' || isDeleting}
                      onClick={handleDeleteWorkspace}
                    >
                      {isDeleting ? 'Usuwanie...' : 'Usuń permanentnie'}
                    </Button>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DangerZoneSettings;
