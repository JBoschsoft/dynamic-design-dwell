
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Mail } from 'lucide-react';

const ResetPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      
      if (error) {
        throw error;
      }
      
      setSuccess(true);
      toast({
        title: "Link resetujący hasło wysłany",
        description: "Sprawdź swoją skrzynkę email, aby zresetować hasło."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Błąd resetowania hasła",
        description: error.message || "Wystąpił błąd podczas wysyłania linku resetującego hasło. Spróbuj ponownie."
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
            Reset hasła
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Wyślemy Ci link do zresetowania hasła
          </p>
        </div>

        {success ? (
          <div className="text-center">
            <div className="my-8 p-4 bg-green-50 rounded-md">
              <p className="text-green-800">
                Link do resetowania hasła został wysłany na adres: <strong>{email}</strong>
              </p>
              <p className="text-sm text-green-700 mt-2">
                Sprawdź swoją skrzynkę email, aby kontynuować proces resetowania hasła.
              </p>
            </div>
            <Link to="/login">
              <Button variant="outline" className="mt-4">
                Powrót do logowania
              </Button>
            </Link>
          </div>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div>
              <Label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">
                Adres email
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="reset-email"
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

            <div className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? "Wysyłanie..." : "Wyślij link resetujący"}
              </Button>
              
              <Link to="/login">
                <Button variant="outline" className="w-full">
                  Powrót do logowania
                </Button>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;
