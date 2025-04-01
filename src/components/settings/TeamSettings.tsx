
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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Badge,
  Separator,
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/components/ui';
import { Search, UserPlus, MoreHorizontal, Mail } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const TeamSettings = () => {
  const handleInviteUser = () => {
    toast({
      title: "Zaproszenie wysłane",
      description: "Email z zaproszeniem został wysłany do użytkownika.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Zespół i uprawnienia</h2>
        <p className="text-sm text-muted-foreground">
          Zarządzaj członkami zespołu i ich uprawnieniami w systemie.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Członkowie zespołu</CardTitle>
              <CardDescription>
                Zarządzaj dostępem użytkowników do workspace.
              </CardDescription>
            </div>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Dodaj użytkownika
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Szukaj użytkowników..."
                  className="pl-8"
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtruj według roli" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszystkie role</SelectItem>
                  <SelectItem value="admin">Administratorzy</SelectItem>
                  <SelectItem value="recruiter">Rekruterzy</SelectItem>
                  <SelectItem value="hiring_manager">Hiring Managerowie</SelectItem>
                  <SelectItem value="interviewer">Rekruterzy techniczni</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="rounded-md border">
              <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
                    <tr>
                      <th scope="col" className="px-4 py-3">Użytkownik</th>
                      <th scope="col" className="px-4 py-3">Rola</th>
                      <th scope="col" className="px-4 py-3">Status</th>
                      <th scope="col" className="px-4 py-3">Data dodania</th>
                      <th scope="col" className="px-4 py-3 text-right">Akcje</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white border-b hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/placeholder.svg" alt="Jan Kowalski" />
                            <AvatarFallback>JK</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">Jan Kowalski</p>
                            <p className="text-xs text-muted-foreground">jan.kowalski@example.com</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                          Administrator
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="border-green-300 bg-green-50 text-green-600">
                          Aktywny
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        12 mar 2023
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                    <tr className="bg-white border-b hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/placeholder.svg" alt="Anna Nowak" />
                            <AvatarFallback>AN</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">Anna Nowak</p>
                            <p className="text-xs text-muted-foreground">anna.nowak@example.com</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-600">
                          Rekruter
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="border-green-300 bg-green-50 text-green-600">
                          Aktywny
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        25 kwi 2023
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                    <tr className="bg-white hover:bg-muted/20">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src="/placeholder.svg" alt="Tomasz Wiśniewski" />
                            <AvatarFallback>TW</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">Tomasz Wiśniewski</p>
                            <p className="text-xs text-muted-foreground">tomasz.wisniewski@example.com</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="border-purple-300 bg-purple-50 text-purple-600">
                          Hiring Manager
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="border-amber-300 bg-amber-50 text-amber-600">
                          Oczekujący
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        2 maj 2023
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zaproś nowych członków</CardTitle>
          <CardDescription>
            Zaproś nowych użytkowników do Twojego workspace.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Adres email</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  placeholder="email@example.com"
                  type="email"
                  className="pl-8"
                />
              </div>
              <Select defaultValue="recruiter">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Wybierz rolę" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="recruiter">Rekruter</SelectItem>
                  <SelectItem value="hiring_manager">Hiring Manager</SelectItem>
                  <SelectItem value="interviewer">Rekruter techniczny</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleInviteUser}>Zaproś</Button>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-sm font-medium mb-2">Masowe zaproszenia</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Możesz zaprosić wielu użytkowników jednocześnie, wgrywając plik CSV z ich adresami email.
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline">
                Wgraj plik CSV
              </Button>
              <Button variant="link" className="text-xs">
                Pobierz szablon CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role i uprawnienia</CardTitle>
          <CardDescription>
            Zarządzaj rolami i uprawnieniami w systemie.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Administrator</h3>
            <p className="text-sm text-muted-foreground">
              Pełny dostęp do wszystkich funkcji systemu, w tym ustawień, płatności i zarządzania użytkownikami.
            </p>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Rekruter</h3>
            <p className="text-sm text-muted-foreground">
              Może zarządzać kandydatami, prowadzić procesy rekrutacyjne i komunikować się z kandydatami.
            </p>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Hiring Manager</h3>
            <p className="text-sm text-muted-foreground">
              Może przeglądać i oceniać kandydatów, ale nie może zarządzać ustawieniami systemu.
            </p>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Rekruter techniczny</h3>
            <p className="text-sm text-muted-foreground">
              Dostęp tylko do wyznaczonych kandydatów i możliwość przeprowadzania rozmów technicznych.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            Zarządzaj niestandardowymi rolami
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default TeamSettings;
