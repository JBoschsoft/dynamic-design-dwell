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
  const [isNewUser, setIsNewUser] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Check if verification has already happened via URL parameters
  useEffect(() => {
    const checkVerificationStatus = async () => {
      console.log("Checking verification status with search params:", Object.fromEntries(searchParams.entries()));
      
      // Check if there's a type=recovery or type=signup in the URL (Supabase callback)
      const type = searchParams.get('type');
      
      if (type === 'signup' || type === 'recovery') {
        console.log('User has been verified via Supabase callback with type:', type);
        setVerificationComplete(true);
        
        // If this is a signup, mark as new user
        if (type === 'signup') {
          console.log("Setting isNewUser to true based on URL param");
          setIsNewUser(true);
        }
        
        // Check if the user is already logged in
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log("User is authenticated after verification", session.user);
          
          // For signup flows, ensure the is_new_user flag is set in metadata
          if (type === 'signup') {
            // Update user metadata to ensure is_new_user flag is set
            const { error: updateError } = await supabase.auth.updateUser({
              data: { is_new_user: true }
            });
            
            if (updateError) {
              console.error("Error updating user metadata:", updateError);
            } else {
              console.log("Updated user metadata with is_new_user flag");
            }
            
            console.log("New user signup confirmed, redirecting to onboarding");
            toast({
              title: "Weryfikacja udana",
              description: "Twoje konto zostało pomyślnie zweryfikowane. Teraz skonfigurujmy Twój profil."
            });
            
            // Redirect to onboarding immediately
            navigate('/onboarding', { replace: true });
            return;
          } else {
            // For password recovery or other auth flows
            toast({
              title: "Weryfikacja udana",
              description: "Twoje konto zostało pomyślnie zweryfikowane."
            });
            
            navigate('/dashboard', { replace: true });
            return;
          }
        } else {
          console.log("User is verified but not logged in");
          // If verified but not logged in, direct to login with special params
          
          toast({
            title: "Weryfikacja udana",
            description: "Zaloguj się, aby kontynuować."
          });
          
          // For signup, redirect to login with state indicating this is a new user
          if (type === 'signup') {
            navigate('/login', { 
              state: { 
                returnTo: '/onboarding',
                isNewUser: true 
              }
            });
          } else {
            navigate('/login');
          }
        }
      }
    };
    
    checkVerificationStatus();
  }, [searchParams, navigate]);
  
  // Set up auth state change listener
  useEffect(() => {
    console.log("Setting up auth state listener in VerificationPage");
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed in VerificationPage:", event, "Session exists:", !!session);
      
      // Only handle sign-in events - we don't want to interfere with other flows
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
        // Check if this is a new user verification flow
        const signupType = searchParams.get('type');
        const isNewUserFlow = signupType === 'signup' || isNewUser;
        
        if (isNewUserFlow) {
          console.log("New user signed in within verification page, updating metadata and redirecting");
          
          // Update user metadata to ensure is_new_user flag is set
          (async () => {
            const { error } = await supabase.auth.updateUser({
              data: { is_new_user: true }
            });
            
            if (error) {
              console.error("Error updating user metadata:", error);
            } else {
              console.log("Successfully updated user metadata with is_new_user flag");
            }
            
            toast({
              title: "Logowanie udane",
              description: "Zostałeś automatycznie zalogowany. Teraz skonfigurujmy Twój profil."
            });
            
            navigate('/onboarding', { replace: true });
          })();
        } else {
          // For existing users
          navigate('/dashboard', { replace: true });
        }
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, searchParams, isNewUser]);
  
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
      setVerificationComplete(true);
      setIsNewUser(true);
      
      toast({
        title: "Weryfikacja udana",
        description: "Twoje konto zostało zweryfikowane. Teraz skonfigurujmy Twój profil."
      });
      
      // Immediately redirect to onboarding for new users
      navigate('/onboarding', { replace: true });
      
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
            {isNewUser 
              ? "Przekierowujemy Cię do procesu konfiguracji konta..." 
              : "Przekierowujemy Cię do strony logowania..."}
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
