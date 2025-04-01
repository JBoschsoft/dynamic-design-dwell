
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  Button, Label, Loader2, Card, CardContent
} from "@/components/ui";
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { calculateTokenPrice, calculateTotalPrice } from './utils';
import { supabase } from "@/integrations/supabase/client";

interface StripeCheckoutFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentType: 'one-time' | 'subscription';
  tokenAmount: number[];
  onSuccess?: (paymentType: string, amount: number) => void;
}

const StripeCheckoutForm: React.FC<StripeCheckoutFormProps> = ({
  open,
  onOpenChange,
  paymentType,
  tokenAmount,
  onSuccess
}) => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [intentId, setIntentId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [processingSetupConfirmation, setProcessingSetupConfirmation] = useState(false);
  
  // Always get a fresh payment intent when the dialog opens
  useEffect(() => {
    if (open) {
      // Reset state when dialog opens
      setClientSecret(null);
      setIntentId(null);
      setError(null);
      setRetryCount(0);
      setProcessingSetupConfirmation(false);
      
      fetchPaymentIntent();
    }
  }, [open]);
  
  const fetchPaymentIntent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Call Supabase Edge Function to create a payment intent
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          paymentType: paymentType,
          tokenAmount: tokenAmount[0]
        }
      });
      
      if (error) throw error;
      
      if (data?.clientSecret) {
        console.log("Received new client secret:", data.clientSecret);
        console.log("Intent ID:", data.id);
        setClientSecret(data.clientSecret);
        setIntentId(data.id);
      } else {
        throw new Error("Nie otrzymano klucza klienta od serwera płatności");
      }
    } catch (error: any) {
      console.error('Error fetching payment intent:', error);
      setError(error.message || 'Wystąpił nieoczekiwany błąd podczas inicjalizacji płatności');
      
      toast({
        variant: "destructive",
        title: "Błąd inicjalizacji płatności",
        description: error.message || "Nie można nawiązać połączenia z systemem płatności. Spróbuj ponownie.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const createInitialCharge = async (paymentMethodId: string) => {
    setProcessingSetupConfirmation(true);
    
    try {
      // Call the edge function to create an initial charge for subscription users
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          paymentType: 'subscription',
          tokenAmount: tokenAmount[0],
          paymentMethodId
        }
      });
      
      if (error) throw error;
      
      console.log("Initial charge created:", data);
      
      // Handle successful payment
      if (onSuccess) {
        onSuccess(paymentType, tokenAmount[0]);
      }
      
      onOpenChange(false);
      
      navigate(`/onboarding?success=true&tokens=${tokenAmount[0]}`);
      
      toast({
        title: "Płatność zrealizowana",
        description: `Twoje konto zostało pomyślnie doładowane o ${tokenAmount[0]} tokenów. Automatyczne doładowywanie zostało aktywowane.`,
      });
      
    } catch (error: any) {
      console.error("Error creating initial charge:", error);
      setError(error.message || "Wystąpił błąd podczas przetwarzania płatności początkowej");
      
      toast({
        variant: "destructive",
        title: "Błąd płatności",
        description: error.message || "Wystąpił błąd podczas przetwarzania płatności. Spróbuj ponownie.",
      });
    } finally {
      setProcessingSetupConfirmation(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    const cardElement = elements.getElement(CardElement);
    
    if (!cardElement) {
      setError('Nie można znaleźć elementu karty');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Clear the card element state before confirmation
      cardElement.update({});
      
      // Confirm payment/setup based on payment type
      let result;
      
      if (paymentType === 'one-time') {
        if (!clientSecret) {
          throw new Error("Brak klucza klienta dla płatności");
        }
        
        result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          }
        });
        
        if (result.error) {
          throw new Error(result.error.message || "Wystąpił błąd podczas przetwarzania płatności");
        }
        
        // Handle successful payment
        if (onSuccess) {
          onSuccess(paymentType, tokenAmount[0]);
        }
        
        onOpenChange(false);
        
        navigate(`/onboarding?success=true&tokens=${tokenAmount[0]}`);
        
        toast({
          title: "Płatność zrealizowana",
          description: `Twoje konto zostało pomyślnie doładowane o ${tokenAmount[0]} tokenów`,
        });
        
      } else {
        if (!clientSecret) {
          throw new Error("Brak klucza klienta dla subskrypcji");
        }
        
        // Confirm the setup intent with the card element
        result = await stripe.confirmCardSetup(clientSecret, {
          payment_method: {
            card: cardElement,
          }
        });
        
        if (result.error) {
          throw new Error(result.error.message || "Wystąpił błąd podczas przetwarzania płatności");
        }
        
        // For subscription, we need to now create an initial charge with the stored payment method
        const setupResult = result.setupIntent;
        
        if (setupResult && setupResult.payment_method) {
          await createInitialCharge(setupResult.payment_method);
        } else {
          throw new Error("Brak informacji o metodzie płatności");
        }
      }
      
    } catch (error: any) {
      console.error('Payment error:', error);
      
      // Check if the error is due to an expired or invalid setup/payment intent
      const intentExpiredError = 
        error.message?.includes("No such setupintent") || 
        error.message?.includes("No such payment_intent") ||
        error.message?.includes("expired");
      
      if (intentExpiredError && retryCount < 3) {
        // Get a new intent and increment retry count
        setRetryCount(prev => prev + 1);
        setError("Sesja płatności wygasła - odświeżamy dane płatności, spróbuj ponownie za chwilę.");
        
        // Reset the card input
        if (cardElement) {
          cardElement.clear();
        }
        
        // Get a new payment intent
        await fetchPaymentIntent();
      } else {
        setError(error.message || 'Wystąpił nieoczekiwany błąd podczas przetwarzania płatności');
        
        toast({
          variant: "destructive",
          title: "Błąd płatności",
          description: error.message || "Wystąpił błąd podczas przetwarzania płatności. Spróbuj ponownie.",
        });
        
        // Reset the form if there's an error
        if (cardElement) {
          cardElement.clear();
        }
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Płatność za tokeny</DialogTitle>
          <DialogDescription>
            {paymentType === 'one-time' 
              ? 'Finalizacja jednorazowego zakupu tokenów'
              : 'Ustawienie automatycznej płatności miesięcznej'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Liczba tokenów:</span>
                  <span className="font-medium">{tokenAmount[0]}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Cena za token:</span>
                  <span className="font-medium">{calculateTokenPrice(tokenAmount[0])} PLN</span>
                </div>
                <div className="pt-2 border-t flex justify-between font-semibold">
                  <span>Kwota płatności:</span>
                  <span className="text-primary">{calculateTotalPrice(tokenAmount[0])} PLN</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="space-y-2">
            <Label>Dane karty płatniczej</Label>
            <div className="border rounded-md p-3">
              <CardElement 
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#9e2146',
                    },
                  }
                }}
              />
            </div>
          </div>
          
          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}
          
          <div className="text-xs text-gray-500 mt-2">
            {paymentType === 'one-time' 
              ? 'Jednorazowa płatność bez zapisywania danych karty'
              : 'Zapisujemy dane Twojej karty, aby móc automatycznie doładowywać konto gdy liczba tokenów spadnie poniżej 10'
            }
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading || processingSetupConfirmation}
            >
              Anuluj
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !clientSecret || processingSetupConfirmation}
            >
              {loading || processingSetupConfirmation ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {processingSetupConfirmation ? 'Przetwarzanie płatności...' : 'Sprawdzanie...'}
                </>
              ) : (
                `Zapłać ${calculateTotalPrice(tokenAmount[0])} PLN`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StripeCheckoutForm;
