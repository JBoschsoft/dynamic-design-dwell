import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2 } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

// Import components
import ProgressBar from '@/components/onboarding/ProgressBar';
import CompanyInfoStep from '@/components/onboarding/CompanyInfoStep';
import PaymentStep from '@/components/onboarding/PaymentStep';
import SuccessStep from '@/components/onboarding/SuccessStep';
import LegalAgreementsModal from '@/components/onboarding/LegalAgreementsModal';
import PaymentConfirmDialog from '@/components/onboarding/PaymentConfirmDialog';
import StripeCheckoutForm from '@/components/onboarding/StripeCheckoutForm';
import ATSIntegrationStep from '@/components/onboarding/ATSIntegrationStep';
import BrandingStep from '@/components/onboarding/BrandingStep';
import TeamInvitationStep from '@/components/onboarding/TeamInvitationStep';

// Load Stripe
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Company info state
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('PL');
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  
  // Legal agreements state
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [currentAgreement, setCurrentAgreement] = useState<'tos' | 'privacy' | 'msa'>('tos');
  const [tosAgreed, setTosAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [msaAgreed, setMsaAgreed] = useState(false);
  
  // Payment state
  const [paymentType, setPaymentType] = useState<'one-time' | 'subscription'>('subscription');
  const [tokenAmount, setTokenAmount] = useState([50]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [stripeCustomerId, setStripeCustomerId] = useState<string | null>(null);
  
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  
  const [subscriptionAmount, setSubscriptionAmount] = useState([50]);
  
  // Team invitations state
  const [invitationsSent, setInvitationsSent] = useState(false);
  
  // Stripe configuration
  const stripeOptions = {
    appearance: {
      theme: 'stripe' as const,
      variables: {
        colorPrimary: '#6366f1',
        colorBackground: '#ffffff',
        colorText: '#303238',
        colorDanger: '#ef4444',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '4px',
      },
    },
  };
  
  useEffect(() => {
    const stepParam = searchParams.get('step');
    if (stepParam) {
      setCurrentStep(parseInt(stepParam));
    }
    
    const wid = searchParams.get('workspace');
    if (wid) {
      setWorkspaceId(wid);
    }
    
    const canceled = searchParams.get('canceled');
    if (canceled === 'true') {
      toast({
        variant: "destructive",
        title: "Płatność anulowana",
        description: "Płatność została anulowana. Możesz spróbować ponownie."
      });
    }
    
    const success = searchParams.get('success');
    if (success === 'true') {
      const tokens = searchParams.get('tokens') || (paymentType === 'one-time' ? tokenAmount[0] : subscriptionAmount[0]);
      const stripeId = searchParams.get('customer');
      
      if (stripeId) {
        setStripeCustomerId(stripeId);
      }
      
      toast({
        title: "Płatność zakończona sukcesem",
        description: `Twoje konto zostało pomyślnie doładowane o ${tokens} tokenów.`
      });
      
      setPaymentSuccess(true);
      setTimeout(() => {
        setCurrentStep(3);
      }, 2000);
    }
  }, [searchParams, navigate, paymentType, tokenAmount, subscriptionAmount]);
  
  // Update workspace with stripe customer ID when it becomes available
  useEffect(() => {
    if (stripeCustomerId && workspaceId && paymentSuccess) {
      updateWorkspacePayment();
    }
  }, [stripeCustomerId, workspaceId, paymentSuccess]);
  
  const updateWorkspacePayment = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('update-workspace-payment', {
        body: {
          workspaceId,
          stripeCustomerId
        },
      });
      
      if (error) {
        console.error('Error updating workspace payment:', error);
      }
    } catch (error) {
      console.error('Error updating workspace payment:', error);
    }
  };
  
  const handleAgreeToCurrentAgreement = () => {
    if (currentAgreement === 'tos') {
      setTosAgreed(true);
      if (!privacyAgreed) {
        setCurrentAgreement('privacy');
        return;
      } else if (!msaAgreed) {
        setCurrentAgreement('msa');
        return;
      }
    } else if (currentAgreement === 'privacy') {
      setPrivacyAgreed(true);
      if (!msaAgreed) {
        setCurrentAgreement('msa');
        return;
      }
    } else if (currentAgreement === 'msa') {
      setMsaAgreed(true);
    }
    
    setLegalModalOpen(false);
    
    if (tosAgreed && privacyAgreed && msaAgreed) {
      toast({
        title: "Warunki zaakceptowane",
        description: "Dziękujemy za zapoznanie się i akceptację wszystkich warunków."
      });
    }
  };
  
  const handlePaymentSuccess = (paymentType: string, amount: number, customerId?: string) => {
    if (customerId) {
      setStripeCustomerId(customerId);
    }
    
    toast({
      title: "Płatność zakończona sukcesem",
      description: `Twoje konto zostało pomyślnie doładowane o ${amount} tokenów.`
    });
    
    setPaymentSuccess(true);
    setTimeout(() => {
      setCurrentStep(3);
    }, 2000);
  };
  
  const handleOpenCheckout = () => {
    // Reset any previous errors before opening the checkout
    setCheckoutDialogOpen(true);
  };
  
  const proceedToPayment = async () => {
    setCheckoutDialogOpen(true);
  };

  const createWorkspace = async () => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-workspace', {
        body: {
          companyName,
          industry,
          companySize,
          phoneNumber,
          countryCode
        },
      });
      
      if (error) {
        throw error;
      }
      
      // Store the workspace ID
      if (data?.workspaceId) {
        setWorkspaceId(data.workspaceId);
        
        // Update URL with workspace ID
        navigate(`/onboarding?step=2&workspace=${data.workspaceId}`, { replace: true });
      }
      
      toast({
        title: "Dane firmy zapisane",
        description: "Pomyślnie zapisano informacje o firmie."
      });
      
      setCurrentStep(2);
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Błąd zapisu",
        description: error.message || "Wystąpił błąd podczas zapisywania informacji o firmie."
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSendInvitations = async (teamMembers: { email: string; role: 'administrator' | 'specialist' }[]) => {
    if (!workspaceId) {
      toast({
        variant: "destructive",
        title: "Błąd",
        description: "Brak identyfikatora workspace. Spróbuj ponownie później."
      });
      return;
    }
    
    // Filter out empty emails
    const validMembers = teamMembers.filter(member => member.email.trim() !== '');
    
    if (validMembers.length === 0) {
      // No valid members to invite, just proceed
      setInvitationsSent(true);
      navigate('/dashboard');
      return;
    }
    
    try {
      const { data, error } = await supabase.functions.invoke('invite-user', {
        body: {
          workspaceId,
          invites: validMembers
        },
      });
      
      if (error) {
        throw error;
      }
      
      // Check for individual invitation results
      const successCount = data?.results.filter((r: any) => r.status === 'success').length || 0;
      
      if (successCount > 0) {
        toast({
          title: "Zaproszenia wysłane",
          description: `Wysłano ${successCount} zaproszeń do członków zespołu.`
        });
      } else {
        toast({
          variant: "destructive",
          title: "Nie wysłano zaproszeń",
          description: "Nie udało się wysłać żadnych zaproszeń. Sprawdź adresy email i spróbuj ponownie."
        });
        return;
      }
      
      setInvitationsSent(true);
      navigate('/dashboard');
      
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Błąd wysyłania zaproszeń",
        description: error.message || "Wystąpił błąd podczas wysyłania zaproszeń."
      });
    }
  };
  
  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (!companyName || !industry || !companySize || !phoneNumber) {
        toast({
          variant: "destructive",
          title: "Uzupełnij wszystkie pola",
          description: "Wypełnij wszystkie wymagane informacje o firmie."
        });
        return;
      }
      
      if (!tosAgreed || !privacyAgreed || !msaAgreed) {
        setCurrentAgreement('tos');
        setLegalModalOpen(true);
        return;
      }
      
      // Create workspace and proceed to next step
      await createWorkspace();
      
    } else if (currentStep === 2) {
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // Fix: Explicitly navigate to step 4 when leaving the success screen
      setCurrentStep(4);
      // Update URL with the new step
      navigate(`/onboarding?step=4${workspaceId ? `&workspace=${workspaceId}` : ''}`, { replace: true });
    } else if (currentStep === 4) {
      setCurrentStep(5);
    } else if (currentStep === 5) {
      setCurrentStep(6);
    }
  };
  
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const openAgreement = (type: 'tos' | 'privacy' | 'msa') => {
    setCurrentAgreement(type);
    setLegalModalOpen(true);
  };
  
  const handleConfirmOneTimePayment = () => {
    setConfirmDialogOpen(false);
    proceedToPayment();
  };
  
  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.functions.invoke('check-email', {
        body: { email }
      });
      
      if (error) {
        console.error('Error checking email:', error);
        return false;
      }
      
      return data?.exists || false;
    } catch (error) {
      console.error('Error checking email:', error);
      return false;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ProgressBar currentStep={currentStep} totalSteps={6} />
      
      <div className="flex-1 flex items-center justify-center p-4">
        {currentStep === 1 && (
          <CompanyInfoStep 
            companyName={companyName}
            setCompanyName={setCompanyName}
            industry={industry}
            setIndustry={setIndustry}
            companySize={companySize}
            setCompanySize={setCompanySize}
            phoneNumber={phoneNumber}
            setPhoneNumber={setPhoneNumber}
            countryCode={countryCode}
            setCountryCode={setCountryCode}
            tosAgreed={tosAgreed}
            privacyAgreed={privacyAgreed}
            msaAgreed={msaAgreed}
            onOpenAgreement={openAgreement}
            onNext={handleNextStep}
            loading={loading}
          />
        )}
        
        {currentStep === 2 && (
          <PaymentStep 
            paymentType={paymentType}
            setPaymentType={setPaymentType}
            tokenAmount={tokenAmount}
            setTokenAmount={setTokenAmount}
            subscriptionAmount={subscriptionAmount}
            setSubscriptionAmount={setSubscriptionAmount}
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
            paymentLoading={paymentLoading}
            paymentSuccess={paymentSuccess}
            onOpenCheckout={handleOpenCheckout}
            workspaceId={workspaceId}
          />
        )}
        
        {currentStep === 3 && (
          <SuccessStep 
            paymentType={paymentType}
            tokenAmount={tokenAmount}
            subscriptionAmount={subscriptionAmount}
            onNext={handleNextStep}
          />
        )}
        
        {currentStep === 4 && (
          <ATSIntegrationStep 
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
          />
        )}
        
        {currentStep === 5 && (
          <BrandingStep 
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
          />
        )}
        
        {currentStep === 6 && (
          <TeamInvitationStep 
            onNext={handleSendInvitations}
            onPrevious={handlePreviousStep}
            checkEmailExists={checkEmailExists}
            workspaceId={workspaceId}
          />
        )}
      </div>
      
      <LegalAgreementsModal 
        open={legalModalOpen}
        onOpenChange={setLegalModalOpen}
        currentAgreement={currentAgreement}
        onAgree={handleAgreeToCurrentAgreement}
      />
      
      <PaymentConfirmDialog 
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        onConfirm={handleConfirmOneTimePayment}
      />
      
      {/* Each time the dialog is opened, a new Stripe Elements instance is created with fresh state */}
      {checkoutDialogOpen && (
        <Elements stripe={stripePromise} options={stripeOptions}>
          <StripeCheckoutForm
            open={checkoutDialogOpen}
            onOpenChange={setCheckoutDialogOpen}
            paymentType={paymentType}
            tokenAmount={paymentType === 'one-time' ? tokenAmount : subscriptionAmount}
            onSuccess={handlePaymentSuccess}
            workspaceId={workspaceId}
          />
        </Elements>
      )}
    </div>
  );
};

export default OnboardingPage;
