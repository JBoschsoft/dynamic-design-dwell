
import React from 'react';
import { LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage, Button } from '@/components/ui';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
  const navigate = useNavigate();

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

  return (
    <div className="flex justify-between items-center p-4">
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src="/placeholder.svg" alt="Avatar" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div className="text-sm">
          <p className="font-medium">Jan Kowalski</p>
          <p className="text-xs text-muted-foreground">Administrator</p>
        </div>
      </div>
      
      <Button variant="ghost" size="icon" onClick={handleLogout}>
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default UserProfile;
