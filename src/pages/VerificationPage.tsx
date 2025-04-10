
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Mail } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const VerificationPage = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract email from location state or query params
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const emailParam = queryParams.get('email');
    
    // Try to get email from state first, then from query params
    const emailFromState = location.state?.email;
    const finalEmail = emailFromState || emailParam;
    
    if (finalEmail) {
      setEmail(finalEmail);
      console.log("Email set for verification:", finalEmail);
    } else {
      console.log("No email found for verification");
    }
    
    // Check if user is already authenticated
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        const { user } = data.session;
        console.log("User already authenticated:", user.id);
        
        // Check if user is new and should be redirected to onboarding
        if (user.user_metadata?.is_new_user === true) {
          console.log("New user detected, redirecting to onboarding");
          navigate('/onboarding');
        } else {
          console.log("Existing user detected, redirecting to dashboard");
          navigate('/dashboard');
        }
      }
    };
    
    checkSession();
  }, [location, navigate]);
  
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        variant: "destructive",
        title: "Brak adresu email",
        description: "Nie można zweryfikować konta bez adresu email."
      });
      return;
    }
    
    if (otp.length !== 6) {
      toast({
        variant: "destructive",
        title: "Nieprawidłowy kod",
        description: "Kod weryfikacyjny musi mieć 6 cyfr."
      });
      return;
    }
    
    setLoading(true);
    
    try {
      console.log("Verifying OTP for email:", email);
      
      // Implement actual OTP verification with Supabase
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'signup'
      });
      
      if (error) throw error;
      
      toast({
        title: "Weryfikacja udana",
        description: "Twoje konto zostało zweryfikowane. Teraz skonfigurujmy Twój profil."
      });
      
      // Redirect to onboarding page after successful verification
      navigate('/onboarding');
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
    if (!email) {
      toast({
        variant: "destructive",
        title: "Brak adresu email",
        description: "Nie można wysłać kodu bez adresu email."
      });
      return;
    }
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });
      
      if (error) throw error;
      
      toast({
        title: "Kod wysłany ponownie",
        description: "Nowy kod weryfikacyjny został wysłany na Twój adres email."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Błąd wysyłania",
        description: error.message || "Nie udało się wysłać kodu weryfikacyjnego. Spróbuj ponownie."
      });
    }
  };

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
            {email ? (
              <>Kod weryfikacyjny został wysłany na adres <span className="font-medium">{email}</span>.</>
            ) : (
              <>Kod weryfikacyjny został wysłany na Twój adres email.</>
            )}
            Wprowadź go poniżej, aby zweryfikować swoje konto.
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
