
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { calculateTokenPrice, calculateTotalPrice } from '@/components/onboarding/utils';

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

// Define a workspace type with the new fields
interface Workspace {
  id: string;
  name: string;
  industry: string;
  company_size: string;
  token_balance?: number;
  balance_auto_topup?: boolean;
  stripe_customer_id?: string;
  admin_email?: string;
  admin_phone?: string;
  created_at?: string;
}

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Company information state
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState('pl'); // Default to Poland
  
  // Legal agreements state
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [currentAgreement, setCurrentAgreement] = useState<'tos' | 'privacy' | 'msa'>('tos');
  const [tosAgreed, setTosAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [msaAgreed, setMsaAgreed] = useState(false);
  
  // Payment state
  const [paymentType, setPaymentType] = useState<'one-time' | 'auto-recharge'>('auto-recharge');
  const [tokenAmount, setTokenAmount] = useState([50]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  const [autoRechargeAmount, setAutoRechargeAmount] = useState([50]);
  const [userEmail, setUserEmail] = useState('');
  
  // Enhanced Stripe configuration for PaymentElement
  const stripeOptions = {
    mode: 'payment' as const,
    amount: paymentType === 'one-time' 
      ? parseInt(calculateTotalPrice(tokenAmount[0]).toString()) * 100
      : parseInt(calculateTotalPrice(autoRechargeAmount[0]).toString()) * 100,
    currency: 'pln',
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
    loader: 'auto' as const,
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };
    
    fetchUser();
  }, []);

  useEffect(() => {
    const stepParam = searchParams.get('step');
    if (stepParam) {
      const stepNumber = parseInt(stepParam);
      if (!isNaN(stepNumber) && stepNumber >= 1 && stepNumber <= 6) {
        setCurrentStep(stepNumber);
      }
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
      const tokens = searchParams.get('tokens') || (paymentType === 'one-time' ? tokenAmount[0] : autoRechargeAmount[0]);
      toast({
        title: "Płatność zakończona sukcesem",
        description: `Twoje konto zostało pomyślnie doładowane o ${tokens} tokenów.`
      });
      setPaymentSuccess(true);
      setTimeout(() => {
        setCurrentStep(3);
        navigate(`/onboarding?step=3`, { replace: true });
      }, 1000);
    }
  }, [searchParams, navigate, paymentType, tokenAmount, autoRechargeAmount]);
  
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
  
  const handlePaymentSuccess = (paymentType: string, amount: number) => {
    toast({
      title: "Płatność zakończona sukcesem",
      description: `Twoje konto zostało pomyślnie doładowane o ${amount} tokenów.`
    });
    setPaymentSuccess(true);
    setTimeout(() => {
      setCurrentStep(3);
      navigate(`/onboarding?step=3`, { replace: true });
    }, 1000);
  };
  
  const handleOpenCheckout = () => {
    setCheckoutDialogOpen(true);
  };
  
  const skipPayment = async () => {
    try {
      setPaymentLoading(true);
      
      const { data: memberData, error: memberError } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id || '')
        .single();
          
      if (memberData?.workspace_id) {
        await supabase
          .from('workspaces')
          .update({ 
            token_balance: 5,
            balance_auto_topup: false
          })
          .eq('id', memberData.workspace_id);
          
        toast({
          title: "Pominięto płatność",
          description: "Przyznano startowe 5 tokenów do konta. Możesz doładować więcej w każdej chwili."
        });
        
        setPaymentSuccess(true);
        
        setTimeout(() => {
          setCurrentStep(3);
          navigate(`/onboarding?step=3`, { replace: true });
        }, 500);
      }
    } catch (error) {
      console.error("Error updating token balance:", error);
      toast({
        variant: "destructive",
        title: "Błąd",
        description: "Nie udało się przyznać startowych tokenów. Spróbuj ponownie."
      });
    } finally {
      setPaymentLoading(false);
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
      
      setLoading(true);
      
      try {
        // Get the current authenticated user to obtain email
        const { data: { user } } = await supabase.auth.getUser();
        const userEmail = user?.email || '';
        
        // Create workspace with admin using RPC function
        const { data, error } = await supabase.rpc('create_workspace_with_admin', {
          workspace_name: companyName,
          workspace_industry: industry,
          workspace_company_size: companySize,
          user_phone_number: phoneNumber,
          user_country_code: countryCode
        });
        
        if (error) throw error;
        
        console.log("Workspace created with ID:", data);
        
        // Now that we have proper RLS policies, update the workspace admin details
        if (data && userEmail) {
          const updateData: Partial<Workspace> = {
            admin_email: userEmail,
            admin_phone: phoneNumber
          };
          
          const { error: updateError } = await supabase.from('workspaces')
            .update(updateData)
            .eq('id', data);
          
          if (updateError) {
            console.error("Error updating workspace with admin details:", updateError);
            // Continue with the flow even if this update fails
          }
        }
        
        toast({
          title: "Dane firmy zapisane",
          description: "Pomyślnie zapisano informacje o firmie."
        });
        
        setCurrentStep(2);
        navigate(`/onboarding?step=2`, { replace: true });
        
      } catch (error: any) {
        toast({
          variant: "destructive",
          title: "Błąd zapisu",
          description: error.message || "Wystąpił błąd podczas zapisywania informacji o firmie."
        });
      } finally {
        setLoading(false);
      }
    } else if (currentStep === 2) {
      setCurrentStep(3);
      navigate(`/onboarding?step=3`, { replace: true });
    } else if (currentStep === 3) {
      setCurrentStep(4);
      navigate(`/onboarding?step=4`, { replace: true });
    } else if (currentStep === 4) {
      setCurrentStep(5);
      navigate(`/onboarding?step=5`, { replace: true });
    } else if (currentStep === 5) {
      setCurrentStep(6);
      navigate(`/onboarding?step=6`, { replace: true });
    } else if (currentStep === 6) {
      navigate('/dashboard');
    }
  };
  
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      navigate(`/onboarding?step=${newStep}`, { replace: true });
    }
  };
  
  const openAgreement = (type: 'tos' | 'privacy' | 'msa') => {
    setCurrentAgreement(type);
    setLegalModalOpen(true);
  };
  
  const handleConfirmOneTimePayment = () => {
    setConfirmDialogOpen(false);
    handleOpenCheckout();
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
            autoRechargeAmount={autoRechargeAmount}
            setAutoRechargeAmount={setAutoRechargeAmount}
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
            paymentLoading={paymentLoading}
            paymentSuccess={paymentSuccess}
            onOpenCheckout={handleOpenCheckout}
            onSkipPayment={skipPayment}
          />
        )}
        
        {currentStep === 3 && (
          <SuccessStep 
            paymentType={paymentType}
            tokenAmount={tokenAmount}
            autoRechargeAmount={autoRechargeAmount}
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
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
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
      
      {checkoutDialogOpen && (
        <Elements stripe={stripePromise} options={stripeOptions}>
          <StripeCheckoutForm
            open={checkoutDialogOpen}
            onOpenChange={setCheckoutDialogOpen}
            paymentType={paymentType}
            tokenAmount={paymentType === 'one-time' ? tokenAmount : autoRechargeAmount}
            onSuccess={handlePaymentSuccess}
          />
        </Elements>
      )}
    </div>
  );
};

export default OnboardingPage;
