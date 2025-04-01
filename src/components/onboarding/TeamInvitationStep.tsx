
import React, { useState } from 'react';
import { 
  Button, 
  Alert, AlertDescription,
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Label, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui";
import { Plus, Trash2, Info, ArrowRight, Loader2, Users } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";

interface TeamMember {
  email: string;
  role: 'hr-director' | 'hr-specialist' | 'recruiter';
}

interface TeamInvitationStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

const ROLE_DESCRIPTIONS = {
  'hr-director': 'Pełny dostęp do wszystkich funkcji systemu, możliwość zarządzania użytkownikami',
  'hr-specialist': 'Dostęp do większości funkcji rekrutacyjnych, bez możliwości zarządzania użytkownikami',
  'recruiter': 'Podstawowy dostęp do funkcji rekrutacyjnych'
};

const ROLE_LABELS = {
  'hr-director': 'Dyrektor HR',
  'hr-specialist': 'Specjalista HR',
  'recruiter': 'Rekruter'
};

const TeamInvitationStep: React.FC<TeamInvitationStepProps> = ({ onNext, onPrevious }) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { email: '', role: 'hr-specialist' }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const form = useForm({
    defaultValues: {
      teamMembers: [{ email: '', role: 'hr-specialist' }]
    }
  });

  const handleAddMember = () => {
    setTeamMembers([...teamMembers, { email: '', role: 'hr-specialist' }]);
  };

  const handleRemoveMember = (index: number) => {
    if (teamMembers.length > 1) {
      setTeamMembers(teamMembers.filter((_, i) => i !== index));
    } else {
      toast({
        title: "Nie można usunąć",
        description: "Musisz mieć co najmniej jednego członka zespołu.",
        variant: "destructive"
      });
    }
  };

  const handleEmailChange = (index: number, email: string) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index].email = email;
    setTeamMembers(updatedMembers);
  };

  const handleRoleChange = (index: number, role: 'hr-director' | 'hr-specialist' | 'recruiter') => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index].role = role;
    setTeamMembers(updatedMembers);
  };

  const validateEmails = () => {
    const emptyEmails = teamMembers.some(member => !member.email.trim());
    if (emptyEmails) {
      toast({
        title: "Brak adresu email",
        description: "Wszystkie adresy email muszą być wypełnione.",
        variant: "destructive"
      });
      return false;
    }

    const invalidEmails = teamMembers.some(
      member => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)
    );
    if (invalidEmails) {
      toast({
        title: "Nieprawidłowy format email",
        description: "Jeden lub więcej adresów email ma nieprawidłowy format.",
        variant: "destructive"
      });
      return false;
    }

    const emails = teamMembers.map(member => member.email.toLowerCase());
    const hasDuplicates = emails.some((email, index) => emails.indexOf(email) !== index);
    if (hasDuplicates) {
      toast({
        title: "Zduplikowane adresy email",
        description: "Każdy adres email musi być unikalny.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmails()) {
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Zaproszenia wysłane",
        description: `Wysłano zaproszenia do ${teamMembers.length} członków zespołu.`,
      });
      
      onNext();
    } catch (error) {
      toast({
        title: "Błąd wysyłania zaproszeń",
        description: "Wystąpił problem podczas wysyłania zaproszeń. Spróbuj ponownie.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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
        Zaproś współpracowników do wspólnego korzystania z platformy
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
                  <Input
                    id={`email-${index}`}
                    type="email"
                    value={member.email}
                    onChange={(e) => handleEmailChange(index, e.target.value)}
                    placeholder="email@firma.pl"
                    className="bg-white focus:border-primary"
                  />
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
                      <SelectItem value="hr-director">{ROLE_LABELS['hr-director']}</SelectItem>
                      <SelectItem value="hr-specialist">{ROLE_LABELS['hr-specialist']}</SelectItem>
                      <SelectItem value="recruiter">{ROLE_LABELS['recruiter']}</SelectItem>
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
            disabled={isLoading}
            className="px-5 bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Wysyłanie...
              </>
            ) : (
              <>
                Wyślij zaproszenia <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TeamInvitationStep;
