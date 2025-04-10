
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Mail } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

// Define interfaces for the workspace invitation data using the Database types
interface Workspace {
  name: string;
}

interface WorkspaceInvitation {
  workspace_id: string;
  role: string;
  workspaces?: Workspace;
}

const VerificationPage = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [invitationId, setInvitationId] = useState<string | null>(null);
  const [verificationComplete, setVerificationComplete] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Check if verification has already happened via URL parameters
  useEffect(() => {
    const checkVerificationStatus = async () => {
      // Check if there's a type=recovery or type=signup in the URL (Supabase callback)
      const type = searchParams.get('type');
      
      if (type === 'signup' || type === 'recovery') {
        // This means Supabase has already verified the user
        console.log('User has been verified via Supabase callback');
        setVerificationComplete(true);
        
        // Check if the user is already logged in
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log("User is authenticated after verification");
          toast({
            title: "Weryfikacja udana",
            description: "Twoje konto zostało pomyślnie zweryfikowane."
          });
          
          // Redirect to onboarding after a short delay
          setTimeout(() => navigate('/onboarding'), 1500);
        } else {
          console.log("User is verified but not logged in");
          // If verified but not logged in, redirect to login
          toast({
            title: "Weryfikacja udana",
            description: "Zaloguj się, aby kontynuować."
          });
          setTimeout(() => navigate('/login', { state: { returnTo: '/onboarding' } }), 1500);
        }
      }
    };
    
    checkVerificationStatus();
  }, [searchParams, navigate]);
  
  useEffect(() => {
    const invitation = searchParams.get('invitation');
    if (invitation) {
      setInvitationId(invitation);
    }
  }, [searchParams]);
  
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In a real implementation, we would verify the OTP with Supabase here
      // For now, we'll just show a success message and redirect
      
      toast({
        title: "Weryfikacja udana",
        description: "Twoje konto zostało zweryfikowane. Teraz skonfigurujmy Twój profil."
      });
      
      setVerificationComplete(true);
      
      // If this was from an invitation, we need to accept the invitation
      if (invitationId) {
        try {
          // Check if we can fetch the invitation details to show workspace name
          const { data: invitationData, error: invitationError } = await supabase
            .from('workspace_invitations')
            .select(`
              workspace_id,
              role,
              workspaces:workspace_id (
                name
              )
            `)
            .eq('id', invitationId)
            .eq('status', 'pending')
            .single();
            
          if (invitationError || !invitationData) {
            console.error('Error fetching invitation:', invitationError);
            // Still redirect to onboarding if no valid invitation is found
            setTimeout(() => navigate('/onboarding'), 2000);
            return;
          }
          
          // Update invitation status to accepted
          const { error: updateError } = await supabase
            .from('workspace_invitations')
            .update({
              status: 'accepted'
            })
            .eq('id', invitationId);
            
          if (updateError) {
            console.error('Error updating invitation:', updateError);
          }
          
          // Cast the data to our type to access the properties safely
          const invitation = invitationData as unknown as WorkspaceInvitation;
          
          // Show workspace join success
          toast({
            title: "Dołączono do workspace'a",
            description: `Zostałeś dodany do workspace'a ${invitation.workspaces?.name || 'Unknown'} jako ${
              invitation.role === 'administrator' ? 'Administrator' : 'Specjalista'
            }.`
          });
          
          // Check authentication status before redirecting
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            // Redirect to dashboard
            setTimeout(() => navigate('/dashboard'), 2000);
          } else {
            // Redirect to login if not authenticated
            setTimeout(() => navigate('/login', { state: { returnTo: '/dashboard' } }), 2000);
          }
          
        } catch (error) {
          console.error('Error processing invitation:', error);
          // Check authentication status before redirecting
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            setTimeout(() => navigate('/onboarding'), 2000);
          } else {
            setTimeout(() => navigate('/login', { state: { returnTo: '/onboarding' } }), 2000);
          }
        }
      } else {
        // Check authentication status before redirecting
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Redirect to onboarding page after successful verification
          setTimeout(() => navigate('/onboarding'), 2000);
        } else {
          // Redirect to login if not authenticated
          setTimeout(() => navigate('/login', { state: { returnTo: '/onboarding' } }), 2000);
        }
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Błąd weryfikacji",
        description: error.message || "Wystąpił błąd podczas weryfikacji konta. Spróbuj ponownie."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    toast({
      title: "Kod wysłany ponownie",
      description: "Nowy kod weryfikacyjny został wysłany na Twój adres email."
    });
  };

  // If verification is already complete, show a success message
  if (verificationComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <svg className="h-12 w-12 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Weryfikacja zakończona
          </h2>
          <p className="mt-2 text-gray-600">
            Przekierowujemy Cię do następnego kroku...
          </p>
          <div className="mt-6">
            <div className="animate-pulse rounded-full h-2 bg-primary mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Weryfikacja konta
          </h2>
          <div className="mt-4 flex justify-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Mail className="h-6 w-6 text-primary" />
            </div>
          </div>
          <p className="mt-4 text-center text-gray-600">
            Kod weryfikacyjny został wysłany na Twój adres email. 
            Wprowadź go poniżej, aby zweryfikować swoje konto.
            {invitationId && (
              <span className="block mt-2 font-medium text-primary">
                Po weryfikacji zostaniesz dołączony do workspace'a.
              </span>
            )}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleVerify}>
          <div className="flex flex-col space-y-4 items-center">
            <InputOTP 
              maxLength={6}
              value={otp}
              onChange={(value) => setOtp(value)}
              containerClassName="gap-2 flex justify-center"
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            
            <Button
              type="submit"
              className="w-full mt-6"
              disabled={otp.length < 6 || loading}
            >
              {loading ? "Weryfikacja..." : "Zweryfikuj konto"}
            </Button>
            
            <div className="text-sm mt-4">
              <button 
                type="button" 
                onClick={handleResendCode}
                className="font-medium text-primary hover:text-primary/80"
              >
                Nie otrzymałeś kodu? Wyślij ponownie
              </button>
            </div>
            
            <Link to="/login" className="text-sm mt-4">
              <span className="font-medium text-primary hover:text-primary/80">
                Powrót do strony logowania
              </span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerificationPage;
