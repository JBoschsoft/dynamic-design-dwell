
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Button,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  ArrowLeft, 
  Settings, 
  LogOut, 
  HelpCircle,
  User,
  FileText,
  PlusSquare,
  PlusCircle,
  UserRound
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const DashboardHeader = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const isDashboardHome = location.pathname === '/dashboard' || location.pathname === '/dashboard/';

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Wylogowano pomyślnie",
        description: "Zostałeś wylogowany z systemu.",
      });
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Błąd wylogowania",
        description: "Nie udało się wylogować. Spróbuj ponownie.",
        variant: "destructive",
      });
    }
  };

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  return (
    <header className="flex items-center h-16 px-4 border-b shrink-0 md:px-6">
      <div className="flex items-center gap-4">
        {!isDashboardHome && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate(-1)}
            className="rounded-full flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Powrót</span>
          </Button>
        )}
      </div>
      
      <div className="flex items-center ml-auto gap-4">
        <Button variant="outline" size="sm" className="h-9 md:flex items-center gap-1" onClick={() => setOpen(true)}>
          <Search className="h-4 w-4" />
          <span className="hidden md:inline">Szukaj</span>
          <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs font-medium opacity-100 md:flex">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8 bg-primary">
                <AvatarImage src="" alt="Profile" />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <UserRound className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Jan Kowalski</p>
                <p className="text-xs leading-none text-muted-foreground">jan.kowalski@example.com</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Ustawienia</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a
                href="/dokumentacja"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Pomoc i dokumentacja</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Wyloguj się</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Wyszukaj..." />
        <CommandList>
          <CommandEmpty>Nie znaleziono wyników.</CommandEmpty>
          <CommandGroup heading="Kandydaci">
            <CommandItem onSelect={() => navigate('/dashboard/candidates')}>
              <User className="mr-2 h-4 w-4" />
              <span>Lista kandydatów</span>
            </CommandItem>
            <CommandItem onSelect={() => navigate('/dashboard/candidates/search')}>
              <Search className="mr-2 h-4 w-4" />
              <span>Wyszukiwanie kandydatów</span>
            </CommandItem>
            <CommandItem onSelect={() => navigate('/dashboard/candidates?tab=import')}>
              <PlusSquare className="mr-2 h-4 w-4" />
              <span>Import kandydatów</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Kampanie">
            <CommandItem onSelect={() => navigate('/dashboard/campaigns')}>
              <FileText className="mr-2 h-4 w-4" />
              <span>Wszystkie kampanie</span>
            </CommandItem>
            <CommandItem>
              <PlusCircle className="mr-2 h-4 w-4" />
              <span>Nowa kampania</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Ustawienia">
            <CommandItem onSelect={() => navigate('/dashboard/settings?section=company-profile')}>
              <UserRound className="mr-2 h-4 w-4" />
              <span>Profil firmy</span>
            </CommandItem>
            <CommandItem onSelect={() => navigate('/dashboard/settings?section=team')}>
              <User className="mr-2 h-4 w-4" />
              <span>Zespół</span>
            </CommandItem>
            <CommandItem onSelect={() => navigate('/dashboard/settings?section=billing')}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Płatności</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  );
};

export default DashboardHeader;
