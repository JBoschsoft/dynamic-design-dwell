
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  Button, Label, Loader2, Card, CardContent
} from "@/components/ui";
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { calculateTokenPrice, calculateTotalPrice } from './utils';
import { supabase } from "@/integrations/supabase/client";
import { updateTokenBalance } from './PaymentService';

interface StripeCheckoutFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentType: 'one-time' | 'auto-recharge';
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
  
  const [sessionId] = useState(`checkout-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardElementReady, setCardElementReady] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Logger function for consistent logging
  const log = useCallback((message: string, data?: any) => {
    if (data) {
      console.log(`[CHECKOUT-${sessionId}] ${message}`, data);
    } else {
      console.log(`[CHECKOUT-${sessionId}] ${message}`);
    }
  }, [sessionId]);
  
  useEffect(() => {
    if (open) {
      log('Checkout dialog opened');
      setError(null);
      setLoading(false);
      setCardElementReady(false);
      setClientSecret(null);
      setPaymentIntentId(null);
      setCustomerId(null);
      setRetryCount(0);
      
      // Create payment intent when the dialog opens
      createPaymentIntent();
    }
  }, [open]);

  const createPaymentIntent = async () => {
    setLoading(true);
    try {
      log('Creating payment intent');
      const timestamp = Date.now(); // Current timestamp to prevent caching
      const { data, error: functionError } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          paymentType,
          tokenAmount: tokenAmount[0],
          sessionId,
          timestamp
        }
      });
      
      if (functionError) {
        log('Function error:', functionError);
        throw new Error(`Error invoking payment function: ${functionError.message}`);
      }
      
      if (!data || data.error) {
        log('Payment service error:', data?.error || 'No data received');
        throw new Error(data?.error || "Nie otrzymano odpowiedzi z serwera płatności");
      }
      
      log('Payment intent received:', { 
        id: data.id, 
        clientSecret: data.clientSecret ? 'exists' : 'missing',
        customerId: data.customerId
      });
      
      if (!data.clientSecret) {
        throw new Error("Brak klucza klienta dla płatności");
      }
      
      setClientSecret(data.clientSecret);
      setPaymentIntentId(data.id);
      if (data.customerId) {
        setCustomerId(data.customerId);
      }
    } catch (error) {
      log('Error creating payment intent:', error);
      setError(error.message || 'Wystąpił nieoczekiwany błąd podczas inicjalizacji płatności');
      toast({
        variant: "destructive",
        title: "Błąd płatności",
        description: error.message || "Wystąpił błąd podczas inicjalizacji płatności. Spróbuj ponownie.",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    log('Payment form submitted');
    
    if (!stripe || !elements) {
      setError("Stripe nie został załadowany. Odśwież stronę i spróbuj ponownie.");
      return;
    }
    
    if (!cardElementReady) {
      setError('Element karty nie jest gotowy. Proszę poczekać lub odświeżyć stronę.');
      return;
    }
    
    if (!clientSecret) {
      setError('Brak klucza klienta. Proszę odświeżyć stronę i spróbować ponownie.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error("Element karty nie został znaleziony");
      }
      
      // First create a payment method from the card element
      log('Creating payment method from card element');
      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: 'Lovable Customer',
        },
      });
      
      if (paymentMethodError) {
        log('Error creating payment method:', paymentMethodError);
        throw paymentMethodError;
      }
      
      log('Payment method created successfully:', paymentMethod.id);
      
      // Now attach the payment method to the payment intent
      log('Attaching payment method to payment intent');
      const { error: attachError } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethod.id,
      });
      
      if (attachError) {
        // Handle specific error for missing payment intent
        if (attachError.type === 'invalid_request_error' && 
            attachError.message?.includes('No such payment_intent')) {
          
          log('Payment intent not found, retrying with fresh intent');
          // If we've tried less than 2 times, create a new payment intent and retry
          if (retryCount < 2) {
            setRetryCount(prev => prev + 1);
            await createPaymentIntent();
            setLoading(false);
            return; // Exit this attempt and let the user retry with the new intent
          }
        }
        
        log('Payment confirmation error:', attachError);
        throw attachError;
      }
      
      // Check the payment intent status
      log('Checking payment intent status');
      const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);
      
      log('Payment intent status:', paymentIntent?.status);
      
      if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing')) {
        log('Payment successful! Updating token balance.');
        const balanceUpdated = await updateTokenBalance(tokenAmount[0], paymentType, log);
        
        if (!balanceUpdated) {
          log('Failed to update token balance');
          throw new Error("Nie udało się zaktualizować salda tokenów");
        }
        
        log('Token balance updated successfully');
        
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
        throw new Error(`Płatność wymaga dodatkowej weryfikacji. Status: ${paymentIntent?.status || 'nieznany'}`);
      }
    } catch (error) {
      log('Payment error:', error);
      setError(error.message || 'Wystąpił nieoczekiwany błąd podczas przetwarzania płatności');
      
      toast({
        variant: "destructive",
        title: "Błąd płatności",
        description: error.message || "Wystąpił błąd podczas przetwarzania płatności. Spróbuj ponownie.",
      });
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
              : 'Ustawienie automatycznego doładowywania tokenów'
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
                onChange={(e) => {
                  if (e.error) {
                    log('Card element error:', e.error);
                    setError(e.error.message || null);
                  } else {
                    setError(null);
                  }
                  setCardElementReady(e.complete);
                  if (e.complete) {
                    log('Card element complete');
                  }
                }}
                onReady={() => {
                  log('Card element ready');
                }}
              />
            </div>
            <div className="text-xs text-gray-500">
              Do testów użyj numeru karty: 4242 4242 4242 4242, dowolnej przyszłej daty ważności (MM/RR) i dowolnego CVC (3 cyfry)
            </div>
          </div>
          
          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}
          
          <div className="text-xs text-gray-500 mt-2">
            {paymentType === 'one-time' 
              ? 'Realizacja jednorazowej płatności'
              : 'Zapisujemy dane Twojej karty, aby móc automatycznie doładowywać konto gdy liczba tokenów spadnie poniżej 10'
            }
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                log('Payment cancelled by user');
                onOpenChange(false);
              }}
              disabled={loading}
            >
              Anuluj
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !stripe || !elements || !cardElementReady || !clientSecret}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Przetwarzanie płatności...
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
