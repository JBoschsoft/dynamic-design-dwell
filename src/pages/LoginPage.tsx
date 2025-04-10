
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

interface LocationState {
  returnTo?: string;
  isNewUser?: boolean;
}

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const returnTo = state?.returnTo || '/dashboard';
  const isNewUser = state?.isNewUser || false;

  useEffect(() => {
    console.log("Login page loaded with state:", state);
    console.log("isNewUser from state:", isNewUser);
    console.log("returnTo from state:", returnTo);
  }, [state, isNewUser, returnTo]);

  useEffect(() => {
    const checkAuth = async () => {
      setAuthChecking(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log("User already logged in, session:", session);
          console.log("User metadata:", session.user.user_metadata);
          
          // Look for is_new_user flag in user metadata
          const isNewUserMeta = session.user.user_metadata?.is_new_user === true;
          
          if (isNewUserMeta || isNewUser) {
            console.log("New user detected, redirecting to onboarding");
            
            // Update user metadata to ensure is_new_user flag is set
            await supabase.auth.updateUser({
              data: { is_new_user: true }
            });
            
            navigate('/onboarding', { replace: true });
          } else {
            console.log("Existing user, redirecting to:", returnTo);
            navigate(returnTo, { replace: true });
          }
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
      } finally {
        setAuthChecking(false);
      }
    };
    
    checkAuth();
  }, [navigate, returnTo, isNewUser]);

  useEffect(() => {
    console.log("Setting up auth state listener in LoginPage");
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed in LoginPage:", event, "Session exists:", !!session);
      
      if (session) {
        const isNewUserMeta = session.user.user_metadata?.is_new_user === true;
        const shouldGoToOnboarding = isNewUserMeta || isNewUser;
        
        if (shouldGoToOnboarding) {
          console.log("New user signed in, navigating to onboarding");
          
          // Update user metadata to ensure is_new_user flag is set
          (async () => {
            await supabase.auth.updateUser({
              data: { is_new_user: true }
            });
            
            toast({
              title: "Zalogowano pomyślnie",
              description: "Zostałeś automatycznie zalogowany. Teraz skonfigurujmy Twój profil."
            });
            
            navigate('/onboarding', { replace: true });
          })();
        } else {
          console.log("Existing user signed in, navigating to:", returnTo);
          toast({
            title: "Zalogowano pomyślnie",
            description: "Zostałeś automatycznie zalogowany."
          });
          navigate(returnTo, { replace: true });
        }
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, returnTo, isNewUser]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        throw error;
      }
      
      console.log("Login successful, checking if new user:", data?.user?.user_metadata?.is_new_user);
      
      // Let the auth state listener handle the redirection
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Błąd logowania",
        description: error.message || "Wystąpił błąd podczas logowania. Spróbuj ponownie."
      });
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      let redirectOptions = {};
      
      // If this is a new user, we need to pass that information through to the redirect
      if (isNewUser) {
        redirectOptions = {
          redirectTo: `${window.location.origin}/onboarding`,
        };
      } else {
        redirectOptions = {
          redirectTo: `${window.location.origin}${returnTo}`,
        };
      }
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: redirectOptions,
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Błąd logowania",
        description: error.message || "Wystąpił błąd podczas logowania przez Google."
      });
    }
  };

  const handleMicrosoftLogin = async () => {
    try {
      let redirectOptions = {};
      
      // If this is a new user, we need to pass that information through to the redirect
      if (isNewUser) {
        redirectOptions = {
          redirectTo: `${window.location.origin}/onboarding`,
        };
      } else {
        redirectOptions = {
          redirectTo: `${window.location.origin}${returnTo}`,
        };
      }
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: redirectOptions,
      });
      
      if (error) throw error;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Błąd logowania",
        description: error.message || "Wystąpił błąd podczas logowania przez Microsoft."
      });
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600">Sprawdzanie sesji...</p>
        </div>
      </div>
    );
  }

  // If the user was redirected from verification and is a new user, show a special message
  const wasVerified = state?.isNewUser === true;
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {wasVerified ? "Weryfikacja udana! Zaloguj się" : "Zaloguj się do konta"}
          </h2>
          {wasVerified && (
            <p className="mt-2 text-center text-sm text-green-600">
              Twoje konto zostało pomyślnie zweryfikowane. Zaloguj się, aby kontynuować konfigurację.
            </p>
          )}
          <p className="mt-2 text-center text-sm text-gray-600">
            Lub{' '}
            <Link to="/signup" className="font-medium text-primary hover:text-primary/80">
              zarejestruj nowe konto
            </Link>
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline" 
              type="button" 
              onClick={handleGoogleLogin}
              className="w-full py-2 border border-gray-300 flex justify-center items-center space-x-2 transition-all"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Google</span>
            </Button>
            
            <Button 
              variant="outline"
              type="button" 
              onClick={handleMicrosoftLogin}
              className="w-full py-2 border border-gray-300 flex justify-center items-center space-x-2 transition-all"
            >
              <svg width="20" height="20" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                <path fill="#f35325" d="M1 1h10v10H1z"/>
                <path fill="#81bc06" d="M12 1h10v10H12z"/>
                <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                <path fill="#ffba08" d="M12 12h10v10H12z"/>
              </svg>
              <span>Microsoft</span>
            </Button>
          </div>

          <div className="flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink px-4 text-sm text-gray-500">lub kontynuuj przez email</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          <form className="space-y-6" onSubmit={handleEmailLogin}>
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Adres email
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="email"
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Hasło
                </Label>
                <div className="text-sm">
                  <Link to="/reset-password" className="font-medium text-primary hover:text-primary/80">
                    Zapomniałeś hasła?
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="pl-10 pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Logowanie..." : "Zaloguj się"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
