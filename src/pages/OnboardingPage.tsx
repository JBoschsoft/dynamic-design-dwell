
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

// Load Stripe
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [currentAgreement, setCurrentAgreement] = useState<'tos' | 'privacy' | 'msa'>('tos');
  const [tosAgreed, setTosAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [msaAgreed, setMsaAgreed] = useState(false);
  
  const [paymentType, setPaymentType] = useState<'one-time' | 'subscription'>('subscription');
  const [tokenAmount, setTokenAmount] = useState([50]);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [checkoutDialogOpen, setCheckoutDialogOpen] = useState(false);
  
  const [subscriptionAmount, setSubscriptionAmount] = useState([50]);
  
  useEffect(() => {
    const stepParam = searchParams.get('step');
    if (stepParam) {
      setCurrentStep(parseInt(stepParam));
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
    }, 2000);
  };
  
  const proceedToPayment = async () => {
    setCheckoutDialogOpen(true);
  };
  
  const handleNextStep = async () => {
    if (currentStep === 1) {
      if (!companyName || !industry || !companySize) {
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
        await new Promise(resolve => setTimeout(resolve, 1000));
        
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
    } else if (currentStep === 2) {
      // For payment step, we always want to go to step 3 (ATS Integration)
      setCurrentStep(3);
    } else if (currentStep === 3) {
      // ATS Integration step completed - go to final step
      setCurrentStep(4);
    } else if (currentStep === 4) {
      // Final success step - redirect to dashboard
      navigate('/dashboard');
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
  
  const stripeOptions = {
    appearance: {
      theme: 'stripe' as const, // Explicitly type as 'stripe' literal
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
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <ProgressBar currentStep={currentStep} totalSteps={4} />
      
      <div className="flex-1 flex items-center justify-center p-4">
        {currentStep === 1 && (
          <CompanyInfoStep 
            companyName={companyName}
            setCompanyName={setCompanyName}
            industry={industry}
            setIndustry={setIndustry}
            companySize={companySize}
            setCompanySize={setCompanySize}
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
          />
        )}
        
        {currentStep === 3 && (
          <ATSIntegrationStep 
            onNext={handleNextStep}
            onPrevious={handlePreviousStep}
          />
        )}
        
        {currentStep === 4 && (
          <SuccessStep 
            paymentType={paymentType}
            tokenAmount={tokenAmount}
            subscriptionAmount={subscriptionAmount}
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
      
      <Elements stripe={stripePromise} options={stripeOptions}>
        <StripeCheckoutForm
          open={checkoutDialogOpen}
          onOpenChange={setCheckoutDialogOpen}
          paymentType={paymentType}
          tokenAmount={paymentType === 'one-time' ? tokenAmount : subscriptionAmount}
          onSuccess={handlePaymentSuccess}
        />
      </Elements>
    </div>
  );
};

export default OnboardingPage;
