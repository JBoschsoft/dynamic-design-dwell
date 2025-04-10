
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  Button, Label, Loader2, Card, CardContent, Alert, AlertCircle
} from "@/components/ui";
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { calculateTokenPrice, calculateTotalPrice } from './utils';
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

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
  const [connectionError, setConnectionError] = useState(false);
  
  useEffect(() => {
    if (open) {
      setClientSecret(null);
      setIntentId(null);
      setError(null);
      setRetryCount(0);
      setProcessingSetupConfirmation(false);
      setConnectionError(false);
      
      fetchPaymentIntent();
    }
  }, [open]);
  
  const fetchPaymentIntent = async () => {
    setLoading(true);
    setError(null);
    setConnectionError(false);
    
    try {
      console.log(`Fetching ${paymentType} payment intent for ${tokenAmount[0]} tokens`);
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          paymentType: paymentType,
          tokenAmount: tokenAmount[0]
        }
      });
      
      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(`Error invoking payment function: ${error.message}`);
      }
      
      if (!data) {
        throw new Error("No data received from payment service");
      }
      
      if (data?.error) {
        console.error("Payment service error:", data.error);
        throw new Error(data.error);
      }
      
      if (data?.clientSecret) {
        console.log("Received new client secret:", data.clientSecret.substring(0, 10) + "...");
        console.log("Intent ID:", data.id);
        setClientSecret(data.clientSecret);
        setIntentId(data.id);
      } else {
        throw new Error("Nie otrzymano klucza klienta od serwera płatności");
      }
    } catch (error: any) {
      console.error('Error fetching payment intent:', error);
      
      if (error.message?.includes('Failed to fetch') || 
          error.message?.includes('Network Error') ||
          error.message?.includes('ERR_BLOCKED_BY_CLIENT') ||
          error.message?.includes('AbortError')) {
        setConnectionError(true);
        setError('Błąd połączenia z systemem płatności. Proszę sprawdzić połączenie internetowe lub wyłączyć blokady (np. adblock).');
      } else {
        setError(error.message || 'Wystąpił nieoczekiwany błąd podczas inicjalizacji płatności');
      }
      
      toast({
        variant: "destructive",
        title: "Błąd inicjalizacji płatności",
        description: error.message?.includes('ERR_BLOCKED_BY_CLIENT') 
          ? "Wykryto blokadę połączenia do Stripe (ERR_BLOCKED_BY_CLIENT). Wyłącz AdBlock i inne blokady, aby kontynuować."
          : (error.message || "Nie można nawiązać połączenia z systemem płatności. Spróbuj ponownie."),
      });
    } finally {
      setLoading(false);
    }
  };
  
  const updateTokenBalance = async (amount: number) => {
    try {
      const { data: memberData, error: memberError } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id || '')
        .single();
      
      if (memberError || !memberData?.workspace_id) {
        console.error("Error finding workspace:", memberError);
        return;
      }
      
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('id', memberData.workspace_id)
        .maybeSingle();
      
      if (workspaceError) {
        console.error("Error fetching workspace data:", workspaceError);
        return;
      }
      
      const currentBalance = workspaceData?.token_balance ?? 5;
      const newBalance = currentBalance + amount;
      
      const { error: updateError } = await supabase
        .from('workspaces')
        .update({ token_balance: newBalance })
        .eq('id', memberData.workspace_id);
      
      if (updateError) {
        console.error("Error updating token balance:", updateError);
      } else {
        console.log(`Token balance updated from ${currentBalance} to ${newBalance}`);
      }
    } catch (error) {
      console.error("Error updating token balance:", error);
    }
  };
  
  const createInitialCharge = async (paymentMethodId: string) => {
    setProcessingSetupConfirmation(true);
    
    try {
      console.log("Creating initial charge with payment method:", paymentMethodId);
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          paymentType: 'subscription',
          tokenAmount: tokenAmount[0],
          paymentMethodId
        }
      });
      
      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(`Error processing payment: ${error.message}`);
      }
      
      if (data?.error) {
        console.error("Payment service error:", data.error);
        throw new Error(data.error);
      }
      
      console.log("Initial charge created:", data);
      
      await updateTokenBalance(tokenAmount[0]);
      
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
      setError("Stripe nie został załadowany. Odśwież stronę i spróbuj ponownie.");
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
      cardElement.update({});
      
      let result;
      
      if (paymentType === 'one-time') {
        if (!clientSecret) {
          throw new Error("Brak klucza klienta dla płatności");
        }
        
        console.log("Confirming one-time payment with card element");
        result = await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          }
        });
        
        if (result.error) {
          throw new Error(result.error.message || "Wystąpił błąd podczas przetwarzania płatności");
        }
        
        console.log("Payment result:", result);
        
        if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
          await updateTokenBalance(tokenAmount[0]);
          
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
          throw new Error("Płatność nie została zakończona pomyślnie.");
        }
      } else {
        if (!clientSecret) {
          throw new Error("Brak klucza klienta dla subskrypcji");
        }
        
        console.log("Confirming subscription setup with card element");
        result = await stripe.confirmCardSetup(clientSecret, {
          payment_method: {
            card: cardElement,
          }
        });
        
        if (result.error) {
          throw new Error(result.error.message || "Wystąpił błąd podczas przetwarzania płatności");
        }
        
        console.log("Setup result:", result);
        
        const setupResult = result.setupIntent;
        
        if (setupResult && setupResult.payment_method) {
          await createInitialCharge(setupResult.payment_method);
        } else {
          throw new Error("Brak informacji o metodzie płatności");
        }
      }
      
    } catch (error: any) {
      console.error('Payment error:', error);
      
      const intentExpiredError = 
        error.message?.includes("No such setupintent") || 
        error.message?.includes("No such payment_intent") ||
        error.message?.includes("expired");
      
      if (intentExpiredError && retryCount < 3) {
        setRetryCount(prev => prev + 1);
        setError("Sesja płatności wygasła - odświeżamy dane płatności, spróbuj ponownie za chwilę.");
        
        if (cardElement) {
          cardElement.clear();
        }
        
        await fetchPaymentIntent();
      } else {
        setError(error.message || 'Wystąpił nieoczekiwany błąd podczas przetwarzania płatności');
        
        toast({
          variant: "destructive",
          title: "Błąd płatności",
          description: error.message || "Wystąpił błąd podczas przetwarzania płatności. Spróbuj ponownie.",
        });
        
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
          
          {connectionError && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                <div>
                  <h3 className="font-medium">Wykryto blokadę połączenia do systemu płatności!</h3>
                  <p className="text-sm mt-1">
                    Strona płatności Stripe jest blokowana przez Twój przeglądarkę. Aby kontynuować, wykonaj następujące kroki:
                    <ul className="list-disc pl-5 mt-1 space-y-1">
                      <li>Wyłącz rozszerzenia blokujące reklamy (AdBlock, uBlock Origin itp.)</li>
                      <li>Wyłącz blokady JavaScript i ciasteczek</li>
                      <li>Sprawdź czy zapora sieciowa nie blokuje połączeń</li>
                      <li>Spróbuj odświeżyć stronę lub użyć trybu incognito</li>
                    </ul>
                  </p>
                  <div className="mt-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fetchPaymentIntent()}
                      disabled={loading}
                      className="text-xs"
                    >
                      {loading ? (
                        <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Próbuję ponownie...</>
                      ) : (
                        <>Spróbuj ponownie po wyłączeniu blokad</>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
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
          
          {error && !connectionError && (
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
              disabled={loading || !clientSecret || processingSetupConfirmation || connectionError}
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
