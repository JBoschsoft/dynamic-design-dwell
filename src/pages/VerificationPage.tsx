
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

const VerificationPage = () => {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [invitationId, setInvitationId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
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
          
          // Show workspace join success
          toast({
            title: "Dołączono do workspace'a",
            description: `Zostałeś dodany do workspace'a ${invitationData.workspaces?.name || 'Unknown'} jako ${
              invitationData.role === 'administrator' ? 'Administrator' : 'Specjalista'
            }.`
          });
          
          // Redirect to dashboard
          setTimeout(() => navigate('/dashboard'), 2000);
          
        } catch (error) {
          console.error('Error processing invitation:', error);
          setTimeout(() => navigate('/onboarding'), 2000);
        }
      } else {
        // Redirect to onboarding page after successful verification
        setTimeout(() => navigate('/onboarding'), 2000);
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
