import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  PaymentElement,
  LinkAuthenticationElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
} from '@/components/ui';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface CheckoutFormProps {
  clientSecret: string | null;
  amount: number;
  onSuccess: (paymentType: string, amount: number) => void;
  paymentType: 'one-time' | 'subscription';
}

interface PaymentDetails {
  id: string;
  email: string;
}

const PaymentDetails = ({ details }: { details: PaymentDetails | null }) => {
  if (!details) {
    return <p>Brak danych płatności.</p>;
  }

  return (
    <div>
      <p>ID płatności: {details.id}</p>
      <p>Email: {details.email}</p>
    </div>
  );
};

const PriceLabel = ({ amount }: { amount: number }) => {
  return (
    <div className="text-sm text-muted-foreground">
      Do zapłaty: {amount} PLN
    </div>
  );
};

const CheckoutForm = ({ 
  clientSecret, 
  amount, 
  onSuccess,
  paymentType 
}: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();

    if (!stripe || !elements) {
      toast({
        variant: "destructive",
        title: "Błąd",
        description: "Stripe.js nie został załadowany."
      });
      return;
    }

    setIsLoading(true);

    stripe.confirmPayment({
      elements,
      confirmParams: {
        redirect: 'if_required'
      }
    }).then((result) => {
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Błąd płatności",
          description: result.error.message || "Wystąpił błąd podczas przetwarzania płatności."
        });
      } else if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
        toast({
          title: "Płatność zakończona sukcesem",
          description: "Dziękujemy za dokonanie płatności!"
        });
        onSuccess(paymentType, amount);
      }
      setIsLoading(false);
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <LinkAuthenticationElement />
      <PaymentElement />
      <Button disabled={isLoading || !stripe || !elements} className="w-full mt-4">
        {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Przetwarzanie...</> : "Zapłać"}
      </Button>
    </form>
  );
};

interface StripeCheckoutFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentType: 'one-time' | 'subscription';
  tokenAmount: number[];
  onSuccess: (paymentType: string, amount: number) => void;
}

const StripeCheckoutForm = ({
  open,
  onOpenChange,
  paymentType,
  tokenAmount,
  onSuccess
}: StripeCheckoutFormProps) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);

  useEffect(() => {
    const fetchClientSecret = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await supabase
          .functions
          .invoke('create-payment-intent', {
            body: {
              amount: paymentType === 'one-time' ? tokenAmount[0] : tokenAmount[0],
              currency: 'pln',
              paymentType: paymentType
            }
          });

        if (response.error) {
          console.error("Error from Supabase function:", response.error);
          setError(response.error.message || 'Wystąpił błąd podczas tworzenia płatności.');
        } else if (response.data && response.data.clientSecret) {
          setClientSecret(response.data.clientSecret);
          setPaymentDetails(response.data.paymentDetails || null);
        } else {
          setError('Nie udało się pobrać sekretu klienta.');
        }
      } catch (e: any) {
        console.error("Error fetching client secret:", e);
        setError(e.message || 'Wystąpił błąd podczas pobierania informacji o płatności.');
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchClientSecret();
    } else {
      setClientSecret(null);
      setIsLoading(false);
    }
  }, [open, paymentType, tokenAmount]);

  const handleSuccess = (paymentType: string, amount: number) => {
    onSuccess(paymentType, amount);
    onOpenChange(false);
  };

  const options = clientSecret ? {
    clientSecret,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: '#1a56db',
        colorBackground: '#ffffff',
        colorText: '#30313d',
        colorDanger: '#df1b41',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
        spacingUnit: '4px',
        borderRadius: '4px'
      }
    },
    locale: 'pl'
  } as const : undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {paymentType === 'one-time' ? 'Jednorazowa płatność' : 'Ustawienie płatności cyklicznych'}
          </DialogTitle>
          <DialogDescription>
            {paymentType === 'one-time' 
              ? `Doładuj swoje konto o ${tokenAmount[0]} tokenów.` 
              : 'Skonfiguruj automatyczne płatności, które doładują Twoje konto, gdy liczba tokenów spadnie poniżej 10.'}
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p>Przygotowywanie płatności...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-destructive">
            <AlertCircle className="h-8 w-8 mb-2" />
            <p>{error}</p>
          </div>
        ) : clientSecret && paymentDetails ? (
          <Elements 
            stripe={stripePromise} 
            options={options}
          >
            <CheckoutForm 
              clientSecret={clientSecret}
              amount={tokenAmount[0]}
              onSuccess={handleSuccess}
              paymentType={paymentType}
            />
          </Elements>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

export default StripeCheckoutForm;
