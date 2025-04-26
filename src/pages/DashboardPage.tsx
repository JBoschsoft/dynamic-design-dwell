
import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { toast } from "@/hooks/use-toast";
import { getUserWorkspaceData } from '@/integrations/supabase/workspace-utils';

const DashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkWorkspace = async () => {
      try {
        setIsLoading(true);
        const workspace = await getUserWorkspaceData();
        
        if (!workspace) {
          toast({
            variant: "destructive",
            title: "Błąd dostępu",
            description: "Nie znaleziono informacji o firmie. Skontaktuj się z administratorem."
          });
        }
        
      } catch (error) {
        console.error('Error checking workspace:', error);
        toast({
          variant: "destructive",
          title: "Błąd",
          description: "Wystąpił problem podczas ładowania danych. Spróbuj odświeżyć stronę."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    checkWorkspace();
  }, []);
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <DashboardSidebar />
        <SidebarInset>
          <DashboardHeader />
          <div className="flex-1 p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Outlet />
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardPage;
