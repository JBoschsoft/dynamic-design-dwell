
import React, { useState } from 'react';
import { 
  Button, 
  Alert, AlertDescription,
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Label, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui";
import { Plus, Trash2, Info, ArrowRight, Loader2, Users, AlertCircle } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";

interface TeamMember {
  email: string;
  role: 'administrator' | 'specialist';
}

interface TeamInvitationStepProps {
  onNext: (teamMembers: TeamMember[]) => void;
  onPrevious: () => void;
  checkEmailExists?: (email: string) => Promise<boolean>;
  workspaceId?: string | null;
}

const ROLE_DESCRIPTIONS = {
  'administrator': 'Pełny dostęp do wszystkich funkcji systemu, możliwość zarządzania użytkownikami',
  'specialist': 'Dostęp do większości funkcji rekrutacyjnych, bez możliwości zarządzania użytkownikami'
};

const ROLE_LABELS = {
  'administrator': 'Administrator',
  'specialist': 'Specjalista'
};

const TeamInvitationStep: React.FC<TeamInvitationStepProps> = ({ 
  onNext, 
  onPrevious, 
  checkEmailExists,
  workspaceId
}) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { email: '', role: 'specialist' }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  const [emailErrors, setEmailErrors] = useState<{[index: number]: string}>({});
  
  const form = useForm({
    defaultValues: {
      teamMembers: [{ email: '', role: 'specialist' }]
    }
  });

  const handleAddMember = () => {
    setTeamMembers([...teamMembers, { email: '', role: 'specialist' }]);
  };

  const handleRemoveMember = (index: number) => {
    if (teamMembers.length > 1) {
      setTeamMembers(teamMembers.filter((_, i) => i !== index));
      
      // Also remove any errors for this index
      const newErrors = { ...emailErrors };
      delete newErrors[index];
      setEmailErrors(newErrors);
    } else {
      // If it's the last member, just clear the email field
      const updatedMembers = [...teamMembers];
      updatedMembers[index].email = '';
      setTeamMembers(updatedMembers);
      
      // Clear any errors for this index
      const newErrors = { ...emailErrors };
      delete newErrors[index];
      setEmailErrors(newErrors);
      
      toast({
        title: "Ostatni członek zespołu",
        description: "Możesz pozostawić to pole puste, jeśli nie chcesz dodawać członków zespołu.",
      });
    }
  };

  const handleEmailChange = async (index: number, email: string) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index].email = email;
    setTeamMembers(updatedMembers);
    
    // Clear any existing error for this index
    if (emailErrors[index]) {
      const newErrors = { ...emailErrors };
      delete newErrors[index];
      setEmailErrors(newErrors);
    }
    
    // Check if email already exists when email is valid and blur event happens
    if (email.trim() !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && checkEmailExists) {
      const exists = await checkEmailExists(email);
      if (exists) {
        setEmailErrors({
          ...emailErrors,
          [index]: 'Ten adres email już istnieje w systemie'
        });
      }
    }
  };

  const handleRoleChange = (index: number, role: 'administrator' | 'specialist') => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index].role = role;
    setTeamMembers(updatedMembers);
  };

  const validateEmails = () => {
    // Filter out empty emails first
    const nonEmptyMembers = teamMembers.filter(member => member.email.trim() !== '');
    
    // If all are empty, we'll handle this in handleSubmit
    if (nonEmptyMembers.length === 0) {
      return true;
    }

    const newErrors: {[index: number]: string} = {};
    let hasErrors = false;
    
    // Check for invalid email formats
    teamMembers.forEach((member, index) => {
      // Skip empty emails
      if (member.email.trim() === '') {
        return;
      }
      
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) {
        newErrors[index] = 'Nieprawidłowy format adresu email';
        hasErrors = true;
      }
      
      // If we already know this email exists
      if (emailErrors[index]) {
        newErrors[index] = emailErrors[index];
        hasErrors = true;
      }
    });
    
    // Check for duplicates within the form
    const emails = nonEmptyMembers.map(member => member.email.toLowerCase());
    emails.forEach((email, index) => {
      const originalIndex = teamMembers.findIndex(m => m.email.toLowerCase() === email);
      const duplicateIndex = emails.indexOf(email);
      
      if (duplicateIndex !== index) {
        newErrors[originalIndex] = 'Ten adres email jest już na liście';
        hasErrors = true;
      }
    });
    
    setEmailErrors(newErrors);
    return !hasErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if there are any non-empty team members
    const nonEmptyMembers = teamMembers.filter(member => member.email.trim() !== '');
    
    // If no team members were added, ask for confirmation
    if (nonEmptyMembers.length === 0) {
      setConfirmDialogOpen(true);
      return;
    }
    
    if (!validateEmails()) {
      toast({
        variant: "destructive",
        title: "Błędne dane",
        description: "Popraw błędy w formularzach przed kontynuowaniem."
      });
      return;
    }
    
    if (!workspaceId) {
      toast({
        variant: "destructive",
        title: "Błąd",
        description: "Brak identyfikatora workspace. Spróbuj ponownie później."
      });
      return;
    }

    setIsLoading(true);

    try {
      // Pass the non-empty team members to onNext
      onNext(nonEmptyMembers);
    } catch (error) {
      toast({
        title: "Błąd wysyłania zaproszeń",
        description: "Wystąpił problem podczas wysyłania zaproszeń. Spróbuj ponownie.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  const handleSkipInvitations = () => {
    setConfirmDialogOpen(false);
    onNext([]);
  };

  const handleContinueAddingMembers = () => {
    setConfirmDialogOpen(false);
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md w-full max-w-2xl">
      <div className="flex items-center justify-center mb-6">
        <div className="bg-primary/10 p-3 rounded-full">
          <Users className="h-6 w-6 text-primary" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-center mb-2">
        Zaproś członków zespołu
      </h2>
      
      <p className="text-gray-600 text-center mb-8">
        Zaproś współpracowników do wspólnego korzystania z platformy. Ten krok jest opcjonalny.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="border-primary/20 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <span>Członkowie zespołu</span>
              <div className="ml-auto text-sm font-normal text-muted-foreground">
                {teamMembers.length} {teamMembers.length === 1 ? 'osoba' : 
                  teamMembers.length < 5 ? 'osoby' : 'osób'}
              </div>
            </CardTitle>
            <CardDescription>
              Dodaj osoby, które będą korzystać z systemu. Każdy członek zespołu otrzyma email z zaproszeniem.
              Ten krok jest opcjonalny.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {teamMembers.map((member, index) => (
              <div key={index} className="flex items-center gap-2 p-3 rounded-md bg-gray-50 border border-gray-100 hover:border-primary/30 transition-colors">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveMember(index)}
                  className="text-gray-400 hover:text-red-500 transition-colors self-center"
                  aria-label="Usuń członka zespołu"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                
                <div className="flex-1">
                  <Label htmlFor={`email-${index}`} className="mb-1 block text-sm font-medium">
                    Adres email
                  </Label>
                  <div className="relative">
                    <Input
                      id={`email-${index}`}
                      type="email"
                      value={member.email}
                      onChange={(e) => handleEmailChange(index, e.target.value)}
                      onBlur={async (e) => {
                        // Check email existence on blur
                        const email = e.target.value.trim();
                        if (email && checkEmailExists) {
                          const exists = await checkEmailExists(email);
                          if (exists) {
                            setEmailErrors({
                              ...emailErrors,
                              [index]: 'Ten adres email już istnieje w systemie'
                            });
                          }
                        }
                      }}
                      placeholder="email@firma.pl"
                      className={`bg-white focus:border-primary ${emailErrors[index] ? 'border-red-500' : ''}`}
                    />
                    {emailErrors[index] && (
                      <div className="flex items-center mt-1 text-xs text-red-500">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        {emailErrors[index]}
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-1/3">
                  <Label htmlFor={`role-${index}`} className="text-sm font-medium mb-1 block">
                    Rola
                  </Label>
                  <Select
                    value={member.role}
                    onValueChange={(value) => handleRoleChange(index, value as any)}
                  >
                    <SelectTrigger id={`role-${index}`} className="bg-white focus:border-primary">
                      <SelectValue placeholder="Wybierz rolę" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="administrator">{ROLE_LABELS['administrator']}</SelectItem>
                      <SelectItem value="specialist">{ROLE_LABELS['specialist']}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {index === teamMembers.length - 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleAddMember}
                    className="text-gray-400 hover:text-primary transition-colors self-center"
                    aria-label="Dodaj kolejnego członka zespołu"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
        
        <Alert className="bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-700">
            Zaproszeni użytkownicy otrzymają email z tytułem "Dołącz do workspace'a na ProstyScreening.ai"
            wraz z linkiem aktywacyjnym ważnym przez 7 dni.
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            className="px-5"
          >
            Wstecz
          </Button>
          
          <Button
            type="submit"
            disabled={isLoading || Object.keys(emailErrors).length > 0}
            className="px-5 bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Wysyłanie...
              </>
            ) : (
              <>
                {teamMembers.some(m => m.email.trim() !== '') ? 
                  'Wyślij zaproszenia' : 'Przejdź dalej'} <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
      
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Brak dodanych członków zespołu</AlertDialogTitle>
            <AlertDialogDescription>
              Nie dodałeś żadnych członków zespołu. Czy na pewno chcesz przejść dalej bez zapraszania współpracowników?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleContinueAddingMembers}>
              Nie, chcę dodać członków
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSkipInvitations}>
              Tak, przejdź do panelu głównego
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TeamInvitationStep;
