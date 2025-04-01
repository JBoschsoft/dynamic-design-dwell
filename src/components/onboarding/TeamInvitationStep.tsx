
import React, { useState } from 'react';
import { 
  Button, 
  Alert, AlertDescription,
  Card, CardContent, CardHeader, CardTitle, CardDescription,
  Label, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
} from "@/components/ui";
import { Plus, Trash2, Info, ArrowRight, Loader2, HelpCircle } from 'lucide-react';
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
    // Check for empty emails
    const emptyEmails = teamMembers.some(member => !member.email.trim());
    if (emptyEmails) {
      toast({
        title: "Brak adresu email",
        description: "Wszystkie adresy email muszą być wypełnione.",
        variant: "destructive"
      });
      return false;
    }

    // Check for valid email format
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

    // Check for duplicate emails
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

    // Simulate sending invitations
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
    <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-2xl">
      <h2 className="text-2xl font-bold text-center mb-2">
        Zaproś członków zespołu
      </h2>
      
      <p className="text-gray-600 text-center mb-8">
        Zaproś współpracowników do wspólnego korzystania z platformy
      </p>
      
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Członkowie zespołu</CardTitle>
            <CardDescription>
              Dodaj osoby, które będą korzystać z systemu. Każdy członek zespołu otrzyma email z zaproszeniem.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {teamMembers.map((member, index) => (
              <div key={index} className="flex items-center gap-2 p-3 rounded-md bg-gray-50 border border-gray-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveMember(index)}
                  className="text-gray-400 hover:text-red-500"
                  aria-label="Usuń członka zespołu"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                
                <div className="flex-1">
                  <Label htmlFor={`email-${index}`} className="mb-1 block">
                    Adres email
                  </Label>
                  <Input
                    id={`email-${index}`}
                    type="email"
                    value={member.email}
                    onChange={(e) => handleEmailChange(index, e.target.value)}
                    placeholder="email@firma.pl"
                    className="bg-white"
                  />
                </div>
                <div className="w-1/3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Label htmlFor={`role-${index}`}>
                      Rola
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="cursor-help">
                            <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p><strong>Dyrektor HR:</strong> {ROLE_DESCRIPTIONS['hr-director']}</p>
                          <p><strong>Specjalista HR:</strong> {ROLE_DESCRIPTIONS['hr-specialist']}</p>
                          <p><strong>Rekruter:</strong> {ROLE_DESCRIPTIONS['recruiter']}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Select
                    value={member.role}
                    onValueChange={(value) => handleRoleChange(index, value as any)}
                  >
                    <SelectTrigger id={`role-${index}`} className="bg-white">
                      <SelectValue placeholder="Wybierz rolę" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hr-director">Dyrektor HR</SelectItem>
                      <SelectItem value="hr-specialist">Specjalista HR</SelectItem>
                      <SelectItem value="recruiter">Rekruter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {index === teamMembers.length - 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleAddMember}
                    className="text-gray-400 hover:text-primary"
                    aria-label="Dodaj kolejnego członka zespołu"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
        
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Zaproszeni użytkownicy otrzymają email z tytułem "Dołącz do workspace'a na ProstyScreening.ai"
            wraz z linkiem aktywacyjnym ważnym przez 7 dni.
          </AlertDescription>
        </Alert>
        
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
          >
            Wstecz
          </Button>
          
          <Button
            type="submit"
            disabled={isLoading}
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
