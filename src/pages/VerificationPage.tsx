
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Mail } from 'lucide-react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const VerificationPage = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // In a real implementation, we would verify the OTP with Supabase here
      // For now, we'll just show a success message and redirect to login
      
      toast({
        title: "Weryfikacja udana",
        description: "Twoje konto zostało zweryfikowane. Możesz się teraz zalogować."
      });
      
      // Redirect to login page after successful verification
      setTimeout(() => navigate('/login'), 2000);
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
