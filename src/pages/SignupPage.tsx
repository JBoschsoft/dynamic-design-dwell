import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    
    if (password.length >= 8) strength += 1;
    
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
  }, [password]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/onboarding');
      }
    };
    
    checkAuth();
  }, [navigate]);

  const preventCopyPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    toast({
      variant: "destructive",
      title: "Operacja zabroniona",
      description: "Kopiowanie i wklejanie haseł jest wyłączone ze względów bezpieczeństwa."
    });
    return false;
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength <= 2) return "Słabe";
    if (passwordStrength <= 3) return "Średnie";
    if (passwordStrength <= 4) return "Dobre";
    return "Silne";
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength === 0) return "bg-gray-200";
    if (passwordStrength <= 2) return "bg-red-500";
    if (passwordStrength <= 3) return "bg-yellow-500";
    if (passwordStrength <= 4) return "bg-blue-500";
    return "bg-green-500";
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Błąd rejestracji",
        description: "Hasła nie są identyczne. Proszę spróbować ponownie."
      });
      return;
    }
    
    if (passwordStrength < 3) {
      toast({
        variant: "destructive",
        title: "Zbyt słabe hasło",
        description: "Twoje hasło jest zbyt słabe. Użyj kombinacji dużych i małych liter, cyfr oraz znaków specjalnych."
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/verification`,
          data: {
            is_new_user: true,
            email_verification_sent: true
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      console.log("Signup successful:", data);
      
      toast({
        title: "Rejestracja udana",
        description: "Wysłaliśmy link potwierdzający na Twój adres email. Sprawdź swoją skrzynkę, aby dokończyć rejestrację."
      });
      
      navigate('/verification');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Błąd rejestracji",
        description: error.message || "Wystąpił błąd podczas rejestracji. Spróbuj ponownie."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Stwórz nowe konto
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Lub{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary/80">
              zaloguj się do istniejącego konta
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1">
                Adres email
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="pl-10"
                  placeholder="twoj@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1">
                Hasło
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="signup-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onCopy={preventCopyPaste}
                  onPaste={preventCopyPaste}
                  onCut={preventCopyPaste}
                />
                <div 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
              
              {password && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`${getPasswordStrengthColor()} h-2.5 rounded-full`} 
                      style={{ width: `${(passwordStrength / 5) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs mt-1 text-gray-600">
                    Siła hasła: <span className="font-medium">{getPasswordStrengthText()}</span>
                  </p>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Potwierdź hasło
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onCopy={preventCopyPaste}
                  onPaste={preventCopyPaste}
                  onCut={preventCopyPaste}
                />
                <div 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </div>
              </div>
              {password && confirmPassword && password !== confirmPassword && (
                <p className="text-xs mt-1 text-red-500">
                  Hasła nie są identyczne.
                </p>
              )}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Tworzenie konta..." : "Zarejestruj się"}
          </Button>
          
          <p className="text-xs text-center text-gray-500 mt-4">
            Twoje dane są bezpieczne z ProstyScreening.ai. Używamy zaawansowanych technik szyfrowania,
            aby zapewnić najwyższy poziom bezpieczeństwa.
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
