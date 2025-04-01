
import React from 'react';
import { 
  Bell, 
  MessageSquare, 
  User,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { 
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Badge,
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/components/ui';
import { Link } from 'react-router-dom';

const DashboardHeader = () => {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-end gap-4 border-b bg-background px-6">
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative rounded-full border-0 hover:bg-gray-100">
              <Bell className="h-5 w-5 text-gray-600" />
              <Badge className="absolute -right-1 -top-1 h-5 w-5 p-0 text-[10px] flex items-center justify-center">
                3
              </Badge>
              <span className="sr-only">Powiadomienia</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="py-2 text-base">Powiadomienia</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-auto">
              {[1, 2, 3].map((i) => (
                <DropdownMenuItem key={i} className="cursor-pointer p-4 hover:bg-gray-50">
                  <div className="flex items-start gap-3 text-sm">
                    <div className="rounded-full bg-primary/10 p-2">
                      <MessageSquare className="h-4 w-4 text-primary" />
                    </div>
                    <div className="grid gap-1">
                      <p className="font-medium">Nowa wiadomość</p>
                      <p className="line-clamp-1 text-xs text-muted-foreground">
                        Otrzymałeś nową wiadomość od kandydata Jan Nowak
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {i === 1 ? "5 minut temu" : i === 2 ? "30 minut temu" : "2 godziny temu"}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="cursor-pointer justify-center py-2 font-medium text-primary hover:bg-gray-50">
              <Link to="/dashboard/notifications">
                Zobacz wszystkie
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-0 rounded-full p-0 hover:bg-gray-100">
              <Avatar className="h-9 w-9">
                <AvatarImage src="https://github.com/shadcn.png" alt="Profile" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <span className="sr-only">Profil użytkownika</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-48">
            <div className="flex items-center gap-2 p-2">
              <Avatar className="h-10 w-10">
                <AvatarImage src="https://github.com/shadcn.png" alt="Profile" />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">Jan Kowalski</p>
                <p className="text-xs text-muted-foreground">jan.kowalski@example.com</p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="py-2 cursor-pointer hover:bg-gray-50">
              <Link to="/dashboard/profile">
                <User className="mr-2 h-4 w-4" />
                <span>Profil</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="py-2 cursor-pointer hover:bg-gray-50">
              <Link to="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Ustawienia</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="py-2 cursor-pointer hover:bg-gray-50">
              <Link to="/dashboard/help">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Pomoc</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="py-2 cursor-pointer hover:bg-gray-50 text-red-600 hover:text-red-700">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Wyloguj</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default DashboardHeader;
