
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  Button, Label, Loader2, Card, CardContent, Alert, AlertCircle
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

interface PaymentIntent {
  id: string;
  clientSecret: string | null;
  timestamp?: string;
  customerId?: string | null;
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
  const [paymentIntent, setPaymentIntent] = useState<PaymentIntent | null>(null);
  const [processingSetupConfirmation, setProcessingSetupConfirmation] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [networkBlockDetected, setNetworkBlockDetected] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [intentFetchTime, setIntentFetchTime] = useState<Date | null>(null);
  const [intentFailures, setIntentFailures] = useState(0);
  const [isIntentFetching, setIsIntentFetching] = useState(false);
  const [lastFetchTimestamp, setLastFetchTimestamp] = useState(0);
  
  // Clean up state when modal is opened/closed
  useEffect(() => {
    if (open) {
      setPaymentIntent(null);
      setError(null);
      setRetryCount(0);
      setIntentFailures(0);
      setProcessingSetupConfirmation(false);
      setConnectionError(false);
      setCustomerId(null);
      setNetworkBlockDetected(false);
      setIntentFetchTime(null);
      setIsIntentFetching(false);
      setLastFetchTimestamp(0);
      
      // Add a small delay before fetching to ensure state is reset
      const timeout = setTimeout(() => {
        fetchPaymentIntent();
      }, 300);
      
      return () => clearTimeout(timeout);
    }
  }, [open]);
  
  // Check for network issues related to Stripe domains
  useEffect(() => {
    if (networkBlockDetected) return;
    
    const checkStripeAccess = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        await fetch('https://js.stripe.com/v3/', {
          method: 'HEAD',
          mode: 'no-cors',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
      } catch (error) {
        console.log("Error checking Stripe domains:", error);
        if (error.name === 'AbortError' || 
            error.message?.includes('ERR_BLOCKED_BY_CLIENT') || 
            error.message?.includes('Failed to fetch')) {
          console.log("Detected potential network blocking of Stripe domains");
          setNetworkBlockDetected(true);
          setConnectionError(true);
          toast({
            variant: "destructive",
            title: "Blokada połączenia do Stripe",
            description: "Wykryto możliwą blokadę połączeń do systemu płatności. Wyłącz AdBlock i inne blokady, aby kontynuować."
          });
        }
      }
    };
    
    checkStripeAccess();
  }, [networkBlockDetected]);
  
  // Checks if the current intent is stale and should be refreshed
  const isIntentStale = useCallback((): boolean => {
    if (!intentFetchTime) return true;
    
    const now = new Date();
    const timeDiff = now.getTime() - intentFetchTime.getTime();
    // Reducing the max intent age to 15 seconds for even faster refresh
    const maxIntentAge = 15 * 1000;
    
    return timeDiff > maxIntentAge;
  }, [intentFetchTime]);
  
  // Fetch a new payment intent from the server, with rate limiting
  const fetchPaymentIntent = useCallback(async () => {
    // Prevent multiple simultaneous fetch requests
    if (isIntentFetching) {
      console.log("Intent fetch already in progress, skipping duplicate request");
      return;
    }
    
    // Add rate limiting to prevent too many requests in rapid succession
    const now = Date.now();
    if (now - lastFetchTimestamp < 2000) { // 2 second cooldown
      console.log("Fetch requests too frequent, adding delay");
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    setIsIntentFetching(true);
    setLastFetchTimestamp(Date.now());
    setLoading(true);
    setError(null);
    setConnectionError(false);
    
    try {
      console.log(`Fetching ${paymentType} payment intent for ${tokenAmount[0]} tokens`);
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          paymentType: paymentType,
          tokenAmount: tokenAmount[0],
          customerId: customerId
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
        
        setPaymentIntent({
          id: data.id,
          clientSecret: data.clientSecret,
          timestamp: data.timestamp || new Date().toISOString()
        });
        
        setIntentFetchTime(new Date());
        setIntentFailures(0);
        
        if (data.customerId) {
          setCustomerId(data.customerId);
          console.log("Customer ID received:", data.customerId);
        }
      } else {
        throw new Error("Nie otrzymano klucza klienta od serwera płatności");
      }
    } catch (error) {
      console.error('Error fetching payment intent:', error);
      
      setIntentFailures(prev => prev + 1);
      
      if (error.message?.includes('Failed to fetch') || 
          error.message?.includes('Network Error') ||
          error.message?.includes('ERR_BLOCKED_BY_CLIENT') ||
          error.message?.includes('AbortError')) {
        setConnectionError(true);
        setNetworkBlockDetected(true);
        setError('Błąd połączenia z systemem płatności. Proszę sprawdzić połączenie internetowe lub wyłączyć blokady (np. adblock).');
        
        toast({
          variant: "destructive",
          title: "Błąd połączenia",
          description: "Wykryto blokadę połączenia do Stripe. Wyłącz AdBlock i inne blokady, aby kontynuować płatność."
        });
      } else {
        setError(error.message || 'Wystąpił nieoczekiwany błąd podczas inicjalizacji płatności');
        
        toast({
          variant: "destructive",
          title: "Błąd inicjalizacji płatności",
          description: error.message || "Nie można nawiązać połączenia z systemem płatności. Spróbuj ponownie."
        });
      }
    } finally {
      setLoading(false);
      setIsIntentFetching(false);
    }
  }, [paymentType, tokenAmount, customerId, isIntentFetching, lastFetchTimestamp]);
  
  // Update token balance after successful payment
  const updateTokenBalance = async (amount: number) => {
    try {
      const { data: memberData, error: memberError } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id || '')
        .single();
      
      if (memberError || !memberData?.workspace_id) {
        console.error("Error finding workspace:", memberError);
        return false;
      }
      
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .select('token_balance')
        .eq('id', memberData.workspace_id)
        .maybeSingle();
      
      if (workspaceError) {
        console.error("Error fetching workspace data:", workspaceError);
        return false;
      }
      
      const currentBalance = workspaceData?.token_balance ?? 0;
      const newBalance = currentBalance + amount;
      
      console.log(`Updating token balance: Current=${currentBalance}, Adding=${amount}, New=${newBalance}`);
      
      const { error: updateError } = await supabase
        .from('workspaces')
        .update({ 
          token_balance: newBalance,
          balance_auto_topup: paymentType === 'subscription'
        })
        .eq('id', memberData.workspace_id);
      
      if (updateError) {
        console.error("Error updating token balance:", updateError);
        return false;
      } else {
        console.log(`Token balance updated from ${currentBalance} to ${newBalance}`);
        console.log(`Auto-topup set to ${paymentType === 'subscription'}`);
        return true;
      }
    } catch (error) {
      console.error("Error updating token balance:", error);
      return false;
    }
  };
  
  // Create initial charge for subscription setup
  const createInitialCharge = async (paymentMethodId: string) => {
    setProcessingSetupConfirmation(true);
    
    try {
      console.log("Creating initial charge with payment method:", paymentMethodId);
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          paymentType: 'subscription',
          tokenAmount: tokenAmount[0],
          paymentMethodId,
          customerId
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
      
      if (data?.status !== 'succeeded') {
        throw new Error(`Payment not successful. Status: ${data?.status || 'unknown'}`);
      }
      
      const balanceUpdated = await updateTokenBalance(tokenAmount[0]);
      if (!balanceUpdated) {
        throw new Error("Nie udało się zaktualizować salda tokenów");
      }
      
      if (onSuccess) {
        onSuccess(paymentType, tokenAmount[0]);
      }
      
      onOpenChange(false);
      
      navigate(`/onboarding?success=true&tokens=${tokenAmount[0]}`);
      
      toast({
        title: "Płatność zrealizowana",
        description: `Twoje konto zostało pomyślnie doładowane o ${tokenAmount[0]} tokenów. Automatyczne doładowywanie zostało aktywowane.`,
      });
      
    } catch (error) {
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
  
  // Handle form submission for payment processing
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
      // Clear any previous validation state
      cardElement.update({});
      
      // Ensure we have a fresh intent before proceeding
      if (isIntentStale() || !paymentIntent?.clientSecret) {
        console.log("Intent is stale or missing, fetching fresh intent before confirmation");
        await fetchPaymentIntent();
        
        if (!paymentIntent?.clientSecret) {
          throw new Error("Nie udało się uzyskać nowego klucza płatności. Proszę spróbować ponownie.");
        }
      }
      
      console.log(`Processing ${paymentType} payment with client secret starting with ${paymentIntent.clientSecret?.slice(0, 10)}...`);
      
      if (paymentType === 'one-time') {
        console.log("Using confirmCardPayment for one-time payment");
        const result = await stripe.confirmCardPayment(paymentIntent.clientSecret!, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: 'Test Customer'
            }
          }
        });
        
        if (result.error) {
          console.error("Payment confirmation error:", result.error);
          
          if (result.error.message?.includes("No such payment_intent") || 
              result.error.code === 'resource_missing') {
            console.log("Payment intent no longer valid, fetching a new one...");
            setPaymentIntent(null);
            await fetchPaymentIntent();
            
            if (paymentIntent?.clientSecret) {
              setError("Sesja płatności wygasła i została odświeżona. Proszę spróbować płatność ponownie.");
            } else {
              throw new Error("Nie udało się odnowić sesji płatności. Proszę odświeżyć stronę i spróbować ponownie.");
            }
            return;
          }
          
          throw result.error;
        }
        
        console.log("Payment result:", result);
        
        if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
          console.log("Payment successful! Updating token balance.");
          const balanceUpdated = await updateTokenBalance(tokenAmount[0]);
          
          if (!balanceUpdated) {
            throw new Error("Nie udało się zaktualizować salda tokenów");
          }
          
          if (onSuccess) {
            onSuccess(paymentType, tokenAmount[0]);
          }
          
          onOpenChange(false);
          
          navigate(`/onboarding?success=true&tokens=${tokenAmount[0]}`);
          
          toast({
            title: "Płatność zrealizowana",
            description: `Twoje konto zostało pomyślnie doładowane o ${tokenAmount[0]} tokenów`,
          });
        } else if (result.paymentIntent && result.paymentIntent.status === 'requires_action') {
          console.log("3D Secure authentication required...");
        } else {
          console.error("Unexpected payment status:", result.paymentIntent?.status);
          throw new Error(`Płatność nie została zakończona pomyślnie. Status: ${result.paymentIntent?.status || 'nieznany'}`);
        }
      } else {
        console.log("Using confirmCardSetup for subscription setup");
        // For subscription, first get a fresh setup intent if needed
        if (isIntentStale()) {
          console.log("Setup intent may be stale, fetching a new one before confirmation");
          await fetchPaymentIntent();
          
          // Wait a moment to ensure the new intent is ready
          await new Promise(resolve => setTimeout(resolve, 500));
          
          if (!paymentIntent?.clientSecret) {
            throw new Error("Nie udało się uzyskać klucza dla konfiguracji płatności");
          }
        }
        
        // Double check we have a valid client secret before proceeding
        if (!paymentIntent?.clientSecret) {
          throw new Error("Brak klucza klienta dla konfiguracji płatności. Odśwież stronę i spróbuj ponownie.");
        }
        
        try {
          const result = await stripe.confirmCardSetup(paymentIntent.clientSecret, {
            payment_method: {
              card: cardElement,
              billing_details: {
                name: 'Test Customer'
              }
            }
          });
          
          if (result.error) {
            console.error("Setup confirmation error:", result.error);
            console.error("Error code:", result.error.code);
            
            if (result.error.message?.includes("No such setupintent") || 
                result.error.code === 'resource_missing') {
              console.log("Setup intent no longer valid, fetching a new one...");
              setPaymentIntent(null);
              
              // Fetch a new intent
              await fetchPaymentIntent();
              
              // Add a small delay to ensure the new intent is registered
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              // After fetching new intent, re-check if we have a valid client secret
              if (paymentIntent?.clientSecret) {
                setError("Sesja konfiguracji płatności wygasła i została odświeżona. Proszę spróbować ponownie z nowym kluczem.");
              } else {
                throw new Error("Nie udało się odnowić sesji płatności. Proszę odświeżyć stronę i spróbować ponownie.");
              }
              return;
            }
            
            throw result.error;
          }
          
          console.log("Setup result:", result);
          
          const setupIntent = result.setupIntent;
          
          if (setupIntent && setupIntent.status === 'succeeded') {
            const paymentMethodId = typeof setupIntent.payment_method === 'string' 
              ? setupIntent.payment_method 
              : setupIntent.payment_method?.id;
              
            if (!paymentMethodId) {
              throw new Error("Nie można uzyskać identyfikatora metody płatności");
            }
            
            await createInitialCharge(paymentMethodId);
          } else {
            throw new Error(`Nieudane ustawienie metody płatności. Status: ${setupIntent?.status || 'nieznany'}`);
          }
        } catch (error) {
          // Check if the error is related to the setup intent
          if (error.message?.includes("No such setupintent") || 
              error.code === 'resource_missing') {
            console.log("Setup intent issue detected:", error);
            
            setPaymentIntent(null);
            setError("Wystąpił problem z sesją płatności - spróbujemy ponownie...");
            
            // Get a fresh intent and try again
            await fetchPaymentIntent();
            throw new Error("Sesja płatności wygasła. Proszę spróbować ponownie z odświeżoną sesją.");
          } else {
            throw error;
          }
        }
      }
      
    } catch (error) {
      console.error('Payment error:', error);
      
      const stripeErrorCode = error?.code || error?.decline_code;
      
      if (stripeErrorCode) {
        console.log("Stripe error code:", stripeErrorCode);
      }
      
      const intentExpiredError = 
        error.message?.includes("No such setupintent") || 
        error.message?.includes("No such payment_intent") ||
        error.message?.includes("expired") ||
        error.message?.includes("Intent with id pi_") ||
        error.message?.includes("Intent with id seti_") ||
        error.message?.includes("resource_missing");
      
      if (intentExpiredError && retryCount < 3) {
        setRetryCount(prev => prev + 1);
        setError("Sesja płatności wygasła - odświeżamy dane płatności, proszę poczekać...");
        
        if (cardElement) {
          cardElement.clear();
        }
        
        setPaymentIntent(null);
        
        // Add a small delay before fetching new intent
        await new Promise(resolve => setTimeout(resolve, 1000));
        await fetchPaymentIntent();
        
        setError("Sesja płatności została odświeżona. Proszę spróbować ponownie.");
      } else if (error.message?.includes('ERR_BLOCKED_BY_CLIENT') || 
                error.message?.includes('Failed to fetch')) {
        setNetworkBlockDetected(true);
        setConnectionError(true);
        setError("Wykryto blokadę połączenia do Stripe. Wyłącz AdBlock lub inne blokady sieciowe i spróbuj ponownie.");
        
        toast({
          variant: "destructive",
          title: "Blokada połączenia",
          description: "Wykryto blokadę połączenia do systemu płatności. Wyłącz AdBlock i inne blokady, aby kontynuować."
        });
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
  
  // Auto-refresh stale intents
  useEffect(() => {
    if (!open || !intentFetchTime || isIntentFetching) return;
    
    const checkInterval = setInterval(() => {
      const now = new Date();
      const timeSinceLastFetch = now.getTime() - intentFetchTime.getTime();
      
      // If intent is older than 10 seconds and we're not already loading or processing,
      // refresh it proactively to prevent expiration issues
      if (timeSinceLastFetch > 10000 && !loading && !processingSetupConfirmation && !isIntentFetching) {
        console.log("Intent is getting stale, refreshing proactively...");
        fetchPaymentIntent();
      }
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(checkInterval);
  }, [open, intentFetchTime, loading, processingSetupConfirmation, isIntentFetching, fetchPaymentIntent]);
  
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
          
          {(connectionError || networkBlockDetected) && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-md">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
                <div>
                  <h3 className="font-medium">Wykryto blokadę połączenia do systemu płatności!</h3>
                  <p className="text-sm mt-1">
                    Strona płatności Stripe jest blokowana przez Twój przeglądarkę. Aby kontynuować, wykonaj następujące kroki:
                  </p>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-sm">
                    <li>Wyłącz rozszerzenia blokujące reklamy (AdBlock, uBlock Origin itp.)</li>
                    <li>Wyłącz blokady JavaScript i ciasteczek</li>
                    <li>Sprawdź czy zapora sieciowa nie blokuje połączeń</li>
                    <li>Spróbuj otworzyć w trybie incognito lub użyj innej przeglądarki</li>
                  </ul>
                  <div className="mt-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fetchPaymentIntent()}
                      disabled={loading || isIntentFetching}
                      className="text-xs"
                    >
                      {loading || isIntentFetching ? (
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
            <div className="text-xs text-gray-500">
              Do testów użyj numeru karty: 4242 4242 4242 4242, dowolnej przyszłej daty ważności (MM/RR) i dowolnego CVC (3 cyfry)
            </div>
          </div>
          
          {error && !connectionError && !networkBlockDetected && (
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
              disabled={loading || processingSetupConfirmation || isIntentFetching}
            >
              Anuluj
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !stripe || !elements || processingSetupConfirmation || connectionError || networkBlockDetected || isIntentFetching || !paymentIntent?.clientSecret}
            >
              {loading || processingSetupConfirmation || isIntentFetching ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {processingSetupConfirmation ? 'Przetwarzanie płatności...' : isIntentFetching ? 'Przygotowanie sesji...' : 'Przygotowanie...'}
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
