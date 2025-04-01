import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  Button,
  Alert,
  AlertDescription,
  AlertTitle,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  Info
} from '@/components/ui';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Initialize Stripe outside component to avoid re-initialization
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface CheckoutFormProps {
  clientSecret: string;
  onSuccess: (paymentType: string, tokenAmount: number) => void;
  onCancel: () => void;
  paymentType: 'one-time' | 'subscription';
  amount: number;
  unitPrice: number;
  totalPrice: number;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  clientSecret,
  onSuccess,
  onCancel,
  paymentType,
  amount,
  unitPrice,
  totalPrice
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe hasn't loaded yet
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      // Handle different payment types
      if (paymentType === 'one-time') {
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: window.location.origin + '/onboarding?step=3&success=true&tokens=' + amount,
          },
          redirect: 'if_required',
        });

        if (error) {
          throw error;
        }

        if (paymentIntent && paymentIntent.status === 'succeeded') {
          setIsSuccess(true);
          // Wait a bit to show success message before calling onSuccess
          setTimeout(() => onSuccess(paymentType, amount), 1500);
        }
      } else {
        // For subscription, just confirm the setup
        const { error, setupIntent } = await stripe.confirmSetup({
          elements,
          confirmParams: {
            return_url: window.location.origin + '/onboarding?step=3&success=true&tokens=' + amount,
          },
          redirect: 'if_required',
        });

        if (error) {
          throw error;
        }

        if (setupIntent && setupIntent.status === 'succeeded') {
          setIsSuccess(true);
          // Wait a bit to show success message before calling onSuccess
          setTimeout(() => onSuccess(paymentType, amount), 1500);
        }
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      setErrorMessage(error.message || 'Wystąpił problem z płatnością. Spróbuj ponownie.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Błąd płatności</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      
      {isSuccess && (
        <Alert variant="default" className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-700">Płatność zakończona sukcesem</AlertTitle>
          <AlertDescription className="text-green-600">
            Twoje konto zostało pomyślnie doładowane o {amount} tokenów.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="rounded-lg border p-4 mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-600">Typ płatności:</span>
          <span className="font-medium">
            {paymentType === 'one-time' ? 'Jednorazowa' : 'Automatyczna'}
          </span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-600">Ilość tokenów:</span>
          <span className="font-medium">{amount}</span>
        </div>
        <div className="flex justify-between mb-2">
          <span className="text-sm text-gray-600">Cena za token:</span>
          <span className="font-medium">{unitPrice} PLN</span>
        </div>
        <div className="border-t pt-2 mt-2 flex justify-between font-bold">
          <span>Do zapłaty:</span>
          <span className="text-primary">{totalPrice} PLN</span>
        </div>
      </div>

      <div className="space-y-6">
        <PaymentElement />
        
        <div className="flex items-start space-x-2 text-xs text-gray-500">
          <div className="mt-0.5"><ShieldCheck className="w-4 h-4 text-primary" /></div>
          <span>
            Płatność jest przetwarzana bezpiecznie przez Stripe. Twoje dane karty nie są przechowywane na naszych serwerach.
          </span>
        </div>
      </div>

      <div className="flex space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          className="w-1/3"
          disabled={isProcessing || isSuccess}
          onClick={onCancel}
        >
          Anuluj
        </Button>
        <Button
          type="submit"
          disabled={!stripe || !elements || isProcessing || isSuccess}
          className="w-2/3"
        >
          {isProcessing ? (
            <span className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Przetwarzanie...
            </span>
          ) : isSuccess ? (
            <span className="flex items-center">
              <CheckCircle2 className="mr-2 h-4 w-4" /> 
              Płatność zakończona
            </span>
          ) : (
            `Zapłać ${totalPrice} PLN`
          )}
        </Button>
      </div>
    </form>
  );
};

interface StripeCheckoutFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentType: 'one-time' | 'subscription';
  tokenAmount: number[];
  onSuccess: (paymentType: string, tokenAmount: number) => void;
}

const StripeCheckoutForm: React.FC<StripeCheckoutFormProps> = ({
  open,
  onOpenChange,
  paymentType,
  tokenAmount,
  onSuccess
}) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<{
    paymentType: 'one-time' | 'subscription';
    amount: number;
    unitPrice: number;
    totalPrice: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset state when dialog opens
    if (open) {
      setError(null);
      setIsLoading(true);
      
      // Fetch client secret from server
      const createIntent = async () => {
        try {
          const amount = tokenAmount[0];
          const { data, error } = await supabase.functions.invoke('create-checkout-session', {
            body: JSON.stringify({
              paymentType,
              tokenAmount: amount,
            }),
          });

          if (error) throw new Error(error.message);
          
          if (data?.clientSecret) {
            setClientSecret(data.clientSecret);
            setPaymentDetails({
              paymentType: data.paymentType,
              amount: data.amount,
              unitPrice: data.unitPrice,
              totalPrice: data.totalPrice
            });
          } else {
            throw new Error('No client secret returned from the server');
          }
        } catch (err: any) {
          console.error('Payment intent creation error:', err);
          setError(err.message || 'Wystąpił problem z inicjalizacją płatności.');
          toast({
            variant: "destructive",
            title: "Błąd inicjalizacji płatności",
            description: err.message || "Wystąpił problem z inicjalizacją płatności. Spróbuj ponownie."
          });
        } finally {
          setIsLoading(false);
        }
      };

      createIntent();
    } else {
      // Reset when closing
      setClientSecret(null);
      setPaymentDetails(null);
    }
  }, [open, paymentType, tokenAmount, supabase]);

  const handleSuccess = (paymentType: string, amount: number) => {
    onSuccess(paymentType, amount);
    // Close the dialog after a delay
    setTimeout(() => onOpenChange(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Dokonaj płatności</DialogTitle>
          <DialogDescription>
            Wprowadź dane karty płatniczej, aby dokończyć proces płatności.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-center text-gray-500">Inicjalizacja płatności...</p>
          </div>
        ) : error ? (
          <div className="py-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Błąd inicjalizacji płatności</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="flex justify-center mt-6">
              <Button onClick={() => onOpenChange(false)}>Zamknij</Button>
            </div>
          </div>
        ) : clientSecret && paymentDetails ? (
          <Elements stripe={stripePromise} options={{ clientSecret, locale: 'pl' }}>
            <CheckoutForm 
              clientSecret={clientSecret}
              onSuccess={handleSuccess}
              onCancel={() => onOpenChange(false)}
              paymentType={paymentDetails.paymentType}
              amount={paymentDetails.amount}
              unitPrice={paymentDetails.unitPrice}
              totalPrice={paymentDetails.totalPrice}
            />
          </Elements>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>Brak danych płatności</AlertTitle>
              <AlertDescription>
                Nie udało się załadować formularza płatności. Spróbuj ponownie później.
              </AlertDescription>
            </Alert>
            <Button onClick={() => onOpenChange(false)} className="mt-4">
              Zamknij
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StripeCheckoutForm;
