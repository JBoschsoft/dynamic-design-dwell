import React, { useState } from 'react';
import { 
  Button, 
  Alert, AlertDescription,
  Card, CardContent, CardHeader, CardTitle,
  Label, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui";
import { PlusCircle, Trash2 } from 'lucide-react';
import { toast } from "@/hooks/use-toast";

interface TeamMember {
  email: string;
  role: 'hr-director' | 'hr-specialist' | 'recruiter';
}

interface TeamInvitationStepProps {
  onNext: () => void;
  onPrevious: () => void;
}

const TeamInvitationStep: React.FC<TeamInvitationStepProps> = ({ onNext, onPrevious }) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { email: '', role: 'hr-specialist' }
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate emails
    const emptyEmails = teamMembers.some(member => !member.email.trim());
    if (emptyEmails) {
      toast({
        title: "Brak adresu email",
        description: "Wszystkie adresy email muszą być wypełnione.",
        variant: "destructive"
      });
      return;
    }

    // Validate email format
    const invalidEmails = teamMembers.some(
      member => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)
    );
    if (invalidEmails) {
      toast({
        title: "Nieprawidłowy format email",
        description: "Jeden lub więcej adresów email ma nieprawidłowy format.",
        variant: "destructive"
      });
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
      <h2 className="text-2xl font-bold text-center mb-6">
        Zaproś członków zespołu
      </h2>
      
      <p className="text-gray-600 text-center mb-8">
        Zaproś współpracowników do wspólnego korzystania z platformy
      </p>
      
      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Członkowie zespołu</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {teamMembers.map((member, index) => (
              <div key={index} className="flex items-end gap-2">
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
                  />
                </div>
                <div className="w-1/3">
                  <Label htmlFor={`role-${index}`} className="mb-1 block">
                    Rola
                  </Label>
                  <Select
                    value={member.role}
                    onValueChange={(value) => handleRoleChange(index, value as any)}
                  >
                    <SelectTrigger id={`role-${index}`}>
                      <SelectValue placeholder="Wybierz rolę" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hr-director">Dyrektor HR</SelectItem>
                      <SelectItem value="hr-specialist">Specjalista HR</SelectItem>
                      <SelectItem value="recruiter">Rekruter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveMember(index)}
                  className="mb-0.5"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={handleAddMember}
              className="w-full mt-2"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Dodaj kolejną osobę
            </Button>
          </CardContent>
        </Card>
        
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Zaproszeni użytkownicy otrzymają email z tytułem "Dołącz do workspace'a na ProstyScreening.ai"
            wraz z linkiem aktywacyjnym.
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
