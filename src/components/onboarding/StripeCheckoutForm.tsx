import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  paymentType: 'one-time' | 'auto-recharge';
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
  
  const [sessionId] = useState(`checkout-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
  
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
  const [rateLimited, setRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);
  const [forceNewIntent, setForceNewIntent] = useState(false);
  const [purposelyDelaying, setPurposelyDelaying] = useState(false);
  const operationTimestamps = useRef<{[key: string]: number}>({});

  const timeOperation = (operation: string) => {
    operationTimestamps.current[operation] = Date.now();
    log(`Starting operation: ${operation}`);
    return () => {
      const startTime = operationTimestamps.current[operation];
      if (startTime) {
        const duration = Date.now() - startTime;
        log(`Completed operation: ${operation} - Duration: ${duration}ms`);
        delete operationTimestamps.current[operation];
      }
    };
  };
  
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
      setRateLimited(false);
      setRetryAfter(0);
      setForceNewIntent(true);
      setPurposelyDelaying(false);
      
      log('Setting timeout to fetch payment intent');
      const timeout = setTimeout(() => {
        log('Initial intent fetch triggered');
        fetchPaymentIntent(true);
      }, 500);
      
      return () => {
        clearTimeout(timeout);
        log('Checkout dialog closed, cleanup performed');
      };
    }
  }, [open, log]);
  
  useEffect(() => {
    if (networkBlockDetected) {
      log('Network block already detected, skipping Stripe access check');
      return;
    }
    
    log('Checking Stripe domains access');
    const checkStripeAccess = async () => {
      try {
        log('Testing connectivity to Stripe domain');
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          log('Stripe domain access check timed out');
          controller.abort();
        }, 5000);
        
        await fetch('https://js.stripe.com/v3/', {
          method: 'HEAD',
          mode: 'no-cors',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        log('Successfully connected to Stripe domain');
      } catch (error) {
        log('Error checking Stripe domains:', error);
        
        if (error.name === 'AbortError' || 
            error.message?.includes('ERR_BLOCKED_BY_CLIENT') || 
            error.message?.includes('Failed to fetch')) {
          log('Detected potential network blocking of Stripe domains');
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
  }, [networkBlockDetected, log]);
  
  const isIntentStale = useCallback((): boolean => {
    if (!intentFetchTime) {
      log('No intent fetch time recorded, considering intent stale');
      return true;
    }
    
    const now = new Date();
    const timeDiff = now.getTime() - intentFetchTime.getTime();
    const maxIntentAge = 20 * 1000;
    
    const isStale = timeDiff > maxIntentAge;
    log(`Intent staleness check: age=${timeDiff}ms, max=${maxIntentAge}ms, isStale=${isStale}`);
    return isStale;
  }, [intentFetchTime, log]);
  
  const waitFor = async (ms: number, reason: string): Promise<void> => {
    log(`Purposely delaying for ${ms}ms: ${reason}`);
    setPurposelyDelaying(true);
    return new Promise(resolve => {
      setTimeout(() => {
        log(`Delay of ${ms}ms complete: ${reason}`);
        setPurposelyDelaying(false);
        resolve();
      }, ms);
    });
  };

  const fetchPaymentIntent = useCallback(async (force = false) => {
    const endTracking = timeOperation('fetchPaymentIntent');

    if (isIntentFetching) {
      log("Intent fetch already in progress, skipping duplicate request");
      endTracking();
      return;
    }
    
    const now = Date.now();
    
    log(`Fetch request received. Force=${force}, Last fetch=${lastFetchTimestamp ? new Date(lastFetchTimestamp).toISOString() : 'never'}`);
    log(`Time since last fetch: ${now - lastFetchTimestamp}ms`);
    
    if (!force && now - lastFetchTimestamp < 3000) {
      log("Fetch requests too frequent, adding delay");
      
      if (rateLimited && retryAfter > 0) {
        log(`Rate limited by server, waiting ${retryAfter} seconds`);
        setError(`Zbyt wiele żądań. Odczekaj ${retryAfter} sekund przed ponowną próbą.`);
        endTracking();
        return;
      }
      
      const waitTime = 3000 - (now - lastFetchTimestamp);
      log(`Enforcing local rate limit, wait time: ${waitTime}ms`);
      setError(`Odczekaj ${Math.ceil(waitTime/1000)} sekund przed odświeżeniem sesji płatności.`);
      endTracking();
      return;
    }
    
    setIsIntentFetching(true);
    setLastFetchTimestamp(Date.now());
    setLoading(true);
    setError(null);
    setConnectionError(false);
    
    try {
      log(`Fetching ${paymentType} payment intent for ${tokenAmount[0]} tokens${forceNewIntent ? ' (forcing new intent)' : ''}`);
      
      const requestStart = Date.now();
      log('Invoking create-checkout-session function', {
        paymentType,
        tokenAmount: tokenAmount[0],
        customerId,
        forceNewIntent: forceNewIntent || force
      });
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          paymentType: paymentType,
          tokenAmount: tokenAmount[0],
          customerId: customerId,
          forceNewIntent: forceNewIntent || force,
          sessionId
        }
      });
      
      log(`Function response received after ${Date.now() - requestStart}ms`);
      
      setForceNewIntent(false);
      
      if (error) {
        log("Supabase function error:", error);
        throw new Error(`Error invoking payment function: ${error.message}`);
      }
      
      if (!data) {
        log("No data received from payment service");
        throw new Error("No data received from payment service");
      }
      
      if (data?.error) {
        log("Payment service error:", data.error);
        
        if (data.rateLimited) {
          log(`Rate limited by server: retry after ${data.retryAfter || 10}s`);
          setRateLimited(true);
          setRetryAfter(data.retryAfter || 10);
          throw new Error(`Zbyt wiele żądań. Odczekaj ${data.retryAfter || 10} sekund przed ponowną próbą.`);
        }
        
        throw new Error(data.error);
      }
      
      if (data?.clientSecret) {
        log(`Received new client secret: ${data.clientSecret.substring(0, 10)}...`);
        log(`Intent ID: ${data.id}`);
        
        await waitFor(200, 'After receiving client secret');
        
        setPaymentIntent({
          id: data.id,
          clientSecret: data.clientSecret,
          timestamp: data.timestamp || new Date().toISOString(),
          customerId: data.customerId
        });
        
        setIntentFetchTime(new Date());
        setIntentFailures(0);
        setRateLimited(false);
        setRetryAfter(0);
        
        if (data.customerId) {
          log(`Customer ID received: ${data.customerId}`);
          setCustomerId(data.customerId);
        }
      } else {
        log("No client secret received");
        throw new Error("Nie otrzymano klucza klienta od serwera płatności");
      }
    } catch (error) {
      log('Error fetching payment intent:', error);
      
      setIntentFailures(prev => prev + 1);
      log(`Intent failures increased to ${intentFailures + 1}`);
      
      if (error.message?.includes('Failed to fetch') || 
          error.message?.includes('Network Error') ||
          error.message?.includes('ERR_BLOCKED_BY_CLIENT') ||
          error.message?.includes('AbortError')) {
        log('Network or connectivity error detected');
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
      log('Intent fetch completed');
      endTracking();
    }
  }, [paymentType, tokenAmount, customerId, isIntentFetching, lastFetchTimestamp, rateLimited, retryAfter, forceNewIntent, intentFailures, log, waitFor]);
  
  const updateTokenBalance = async (amount: number) => {
    const endTracking = timeOperation('updateTokenBalance');

    try {
      log(`Updating token balance: +${amount}`);
      log('Getting current user');
      const user = (await supabase.auth.getUser()).data.user;
      
      if (!user) {
        log('No authenticated user found');
        endTracking();
        return false;
      }
      
      log(`Finding workspace for user: ${user.id}`);
      const { data: memberData, error: memberError } = await supabase
        .from('workspace_members')
        .select('workspace_id')
        .eq('user_id', user.id)
        .single();
      
      if (memberError || !memberData?.workspace_id) {
        log('Error finding workspace:', memberError);
        endTracking();
        return false;
      }
      
      const workspaceId = memberData.workspace_id;
      log(`Found workspace: ${workspaceId}`);
      
      log('Fetching current workspace token balance');
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .select('token_balance')
        .eq('id', workspaceId)
        .maybeSingle();
      
      if (workspaceError) {
        log('Error fetching workspace data:', workspaceError);
        endTracking();
        return false;
      }
      
      const currentBalance = workspaceData?.token_balance ?? 0;
      const newBalance = currentBalance + amount;
      
      log(`Updating token balance: Current=${currentBalance}, Adding=${amount}, New=${newBalance}`);
      
      log(`Setting auto-topup to ${paymentType === 'auto-recharge'}`);
      const { error: updateError } = await supabase
        .from('workspaces')
        .update({ 
          token_balance: newBalance,
          balance_auto_topup: paymentType === 'auto-recharge'
        })
        .eq('id', workspaceId);
      
      if (updateError) {
        log('Error updating token balance:', updateError);
        endTracking();
        return false;
      } else {
        log(`Token balance updated from ${currentBalance} to ${newBalance}`);
        log(`Auto-topup set to ${paymentType === 'auto-recharge'}`);
        endTracking();
        return true;
      }
    } catch (error) {
      log('Error updating token balance:', error);
      endTracking();
      return false;
    }
  };
  
  const createInitialCharge = async (paymentMethodId: string) => {
    const endTracking = timeOperation('createInitialCharge');
    
    log(`Creating initial charge with payment method: ${paymentMethodId.substring(0, 5)}...`);
    setProcessingSetupConfirmation(true);
    
    try {
      await waitFor(300, 'Before initial charge');
      
      log('Invoking create-checkout-session for initial charge', {
        paymentType: 'auto-recharge',
        tokenAmount: tokenAmount[0],
        paymentMethodId: `${paymentMethodId.substring(0, 5)}...`,
        customerId: customerId ? `${customerId.substring(0, 5)}...` : null
      });
      
      const requestStart = Date.now();
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          paymentType: 'auto-recharge',
          tokenAmount: tokenAmount[0],
          paymentMethodId,
          customerId,
          createCharge: true,
          sessionId
        }
      });
      
      log(`Initial charge response received after ${Date.now() - requestStart}ms`);
      
      if (error) {
        log('Supabase function error:', error);
        throw new Error(`Error processing payment: ${error.message}`);
      }
      
      if (data?.error) {
        log('Payment service error:', data.error);
        throw new Error(data.error);
      }
      
      log('Initial charge created:', data);
      
      if (data?.status !== 'succeeded') {
        log(`Payment not successful. Status: ${data?.status || 'unknown'}`);
        throw new Error(`Payment not successful. Status: ${data?.status || 'unknown'}`);
      }
      
      log('Updating token balance');
      const balanceUpdated = await updateTokenBalance(tokenAmount[0]);
      if (!balanceUpdated) {
        log('Failed to update token balance');
        throw new Error("Nie udało się zaktualizować salda tokenów");
      }
      
      log('Token balance updated successfully');
      
      if (onSuccess) {
        log('Calling onSuccess callback');
        onSuccess(paymentType, tokenAmount[0]);
      }
      
      log('Closing payment dialog');
      onOpenChange(false);
      
      log('Navigating to success page');
      navigate(`/onboarding?success=true&tokens=${tokenAmount[0]}`);
      
      toast({
        title: "Płatność zrealizowana",
        description: `Twoje konto zostało pomyślnie doładowane o ${tokenAmount[0]} tokenów. ${
          paymentType === 'auto-recharge' ? 'Automatyczne doładowywanie zostało aktywowane.' : ''
        }`,
      });
      
    } catch (error) {
      log('Error creating initial charge:', error);
      setError(error.message || "Wystąpił błąd podczas przetwarzania płatności początkowej");
      
      toast({
        variant: "destructive",
        title: "Błąd płatności",
        description: error.message || "Wystąpił błąd podczas przetwarzania płatności. Spróbuj ponownie.",
      });
    } finally {
      setProcessingSetupConfirmation(false);
      log('Initial charge process completed');
      endTracking();
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endTracking = timeOperation('handleSubmit');
    
    log('Payment form submitted');
    
    if (!stripe || !elements) {
      log('Stripe not loaded');
      setError("Stripe nie został załadowany. Odśwież stronę i spróbuj ponownie.");
      endTracking();
      return;
    }
    
    const cardElement = elements.getElement(CardElement);
    
    if (!cardElement) {
      log('Card element not found');
      setError('Nie można znaleźć elementu karty');
      endTracking();
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      log('Updating card element');
      cardElement.update({});
      
      if (isIntentStale() || !paymentIntent?.clientSecret) {
        log('Intent is stale or missing, fetching fresh intent before confirmation');
        setForceNewIntent(true);
        await fetchPaymentIntent(true);
        
        await waitFor(1000, 'After fetching fresh intent');
        
        if (!paymentIntent?.clientSecret) {
          log('Failed to get new payment intent client secret');
          throw new Error("Nie udało się uzyskać nowego klucza płatności. Proszę spróbować ponownie.");
        }
      }
      
      log(`Processing ${paymentType} payment with client secret starting with ${paymentIntent.clientSecret?.slice(0, 10)}...`);
      
      if (paymentType === 'one-time') {
        log('Confirming one-time payment');
        log('Intent ID:', paymentIntent.id);
        log('Client secret starts with:', paymentIntent.clientSecret?.slice(0, 10));
        
        await waitFor(500, 'Before payment confirmation');
        
        const result = await stripe.confirmCardPayment(paymentIntent.clientSecret!, {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: 'Test Customer'
            }
          }
        });
        
        log('Payment confirmation result:', result);
        
        if (result.error) {
          log('Payment confirmation error:', result.error);
          log('Error code:', result.error.code);
          log('Error message:', result.error.message);
          
          if (result.error.message?.includes("No such payment_intent") || 
              result.error.code === 'resource_missing') {
            log('Payment intent no longer valid, fetching a new one...');
            setPaymentIntent(null);
            setForceNewIntent(true);
            
            await fetchPaymentIntent(true);
            
            await waitFor(1000, 'After fetching new payment intent');
            
            if (paymentIntent?.clientSecret) {
              log('New payment intent fetched successfully');
              setError("Sesja płatności wygasła i została odświeżona. Proszę spróbować płatność ponownie.");
            } else {
              log('Failed to refresh payment intent');
              throw new Error("Nie udało się odnowić sesji płatności. Proszę odświeżyć stronę i spróbować ponownie.");
            }
            endTracking();
            return;
          }
          
          throw result.error;
        }
        
        log('Payment result:', result);
        
        if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
          log('Payment successful! Updating token balance.');
          const balanceUpdated = await updateTokenBalance(tokenAmount[0]);
          
          if (!balanceUpdated) {
            log('Failed to update token balance');
            throw new Error("Nie udało się zaktualizować salda tokenów");
          }
          
          log('Token balance updated successfully');
          
          if (onSuccess) {
            log('Calling onSuccess callback');
            onSuccess(paymentType, tokenAmount[0]);
          }
          
          log('Closing payment dialog');
          onOpenChange(false);
          
          log('Navigating to success page');
          navigate(`/onboarding?success=true&tokens=${tokenAmount[0]}`);
          
          toast({
            title: "Płatność zrealizowana",
            description: `Twoje konto zostało pomyślnie doładowane o ${tokenAmount[0]} tokenów`,
          });
        } else if (result.paymentIntent && result.paymentIntent.status === 'requires_action') {
          log('3D Secure authentication required...');
        } else {
          log(`Unexpected payment status: ${result.paymentIntent?.status}`);
          throw new Error(`Płatność nie została zakończona pomyślnie. Status: ${result.paymentIntent?.status || 'nieznany'}`);
        }
      } else {
        log('Using confirmCardSetup for auto-recharge setup');
        
        if (!paymentIntent?.clientSecret) {
          log('No client secret for setup confirmation');
          throw new Error("Brak klucza klienta dla konfiguracji płatności. Odśwież stronę i spróbuj ponownie.");
        }
        
        log('Setup intent ID:', paymentIntent.id);
        log('Setup client secret starts with:', paymentIntent.clientSecret.slice(0, 10));
        
        try {
          log('Verifying setup intent exists, waiting before confirmation...');
          await waitFor(1000, 'Before setup confirmation');
          
          try {
            const result = await stripe.confirmCardSetup(paymentIntent.clientSecret, {
              payment_method: {
                card: cardElement,
                billing_details: {
                  name: 'Test Customer'
                }
              }
            });
            
            log('Setup confirmation result:', result);
            
            if (result.error) {
              log('Setup confirmation error:', result.error);
              log('Error code:', result.error.code);
              log('Error message:', result.error.message);
              
              if (result.error.message?.includes("No such setupintent") || 
                  result.error.message?.includes("resource_missing") || 
                  result.error.code === 'resource_missing') {
                log('Setup intent expired or invalid, forcing a new one...');
                
                setPaymentIntent(null);
                setForceNewIntent(true);
                
                log('Fetching new setup intent');
                await fetchPaymentIntent(true);
                
                log('Waiting before continuing');
                await waitFor(2000, 'After fetching new setup intent due to resource missing');
                
                if (!paymentIntent?.clientSecret) {
                  log('Failed to get new setup intent');
                  throw new Error("Nie udało się odnowić sesji płatności. Spróbujesz ponownie za chwilę.");
                } else {
                  log('New setup intent fetched successfully');
                  setError("Sesja płatności została odświeżona. Proszę spróbować ponownie.");
                  endTracking();
                  return;
                }
              }
              
              throw result.error;
            }
            
            log('Setup result:', result);
            
            const setupIntent = result.setupIntent;
            
            if (setupIntent && setupIntent.status === 'succeeded') {
              const paymentMethodId = typeof setupIntent.payment_method === 'string' 
                ? setupIntent.payment_method 
                : setupIntent.payment_method?.id;
                
              if (!paymentMethodId) {
                log('Cannot get payment method ID');
                throw new Error("Nie można uzyskać identyfikatora metody płatności");
              }
              
              log(`Payment method ID obtained: ${paymentMethodId.substring(0, 5)}...`);
              
              await waitFor(500, 'Before creating initial charge');
              
              await createInitialCharge(paymentMethodId);
            } else {
              log(`Setup failed. Status: ${setupIntent?.status || 'unknown'}`);
              throw new Error(`Nieudane ustawienie metody płatności. Status: ${setupIntent?.status || 'nieznany'}`);
            }
          } catch (error) {
            log('Setup intent error:', error);
            
            if (error.message?.includes("No such setupintent") || 
                error.code === 'resource_missing' || 
                error.message?.includes("resource_missing")) {
              log('Setup intent issue detected:', error);
              
              setPaymentIntent(null);
              setForceNewIntent(true);
              setError("Wystąpił problem z sesją płatności - odświeżamy dane...");
              
              log('Fetching new setup intent');
              await fetchPaymentIntent(true);
              
              log('Waiting before continuing');
              await waitFor(2000, 'After fetching new setup intent due to error');
              
              throw new Error("Sesja płatności została odświeżona. Proszę spróbować ponownie.");
            } else {
              throw error;
            }
          }
        } catch (verificationError) {
          log('Intent verification error:', verificationError);
          throw verificationError;
        }
      }
      
    } catch (error) {
      log('Payment error:', error);
      
      const stripeErrorCode = error?.code || error?.decline_code;
      
      if (stripeErrorCode) {
        log('Stripe error code:', stripeErrorCode);
      }
      
      const intentExpiredError = 
        error.message?.includes("No such setupintent") || 
        error.message?.includes("No such payment_intent") ||
        error.message?.includes("expired") ||
        error.message?.includes("Intent with id pi_") ||
        error.message?.includes("Intent with id seti_") ||
        error.message?.includes("resource_missing");
      
      if (intentExpiredError && retryCount < 3) {
        log(`Intent expired, retry attempt ${retryCount + 1}/3`);
        setRetryCount(prev => prev + 1);
        setError("Sesja płatności wygasła - odświeżamy dane płatności, proszę poczekać...");
        
        if (cardElement) {
          log('Clearing card element');
          cardElement.clear();
        }
        
        setPaymentIntent(null);
        setForceNewIntent(true);
        
        log('Waiting before fetching new intent');
        await waitFor(2000, 'Before fetching new intent after expiration');
        
        log('Fetching new payment intent');
        await fetchPaymentIntent(true);
        
        await waitFor(1000, 'After fetching new intent after expiration');
        
        setError("Sesja płatności została odświeżona. Proszę spróbować ponownie.");
      } else if (error.message?.includes('ERR_BLOCKED_BY_CLIENT') || 
                error.message?.includes('Failed to fetch')) {
        log('Network blocking detected');
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
          log('Clearing card element');
          cardElement.clear();
        }
      }
    } finally {
      setLoading(false);
      log('Payment submission process completed');
      endTracking();
    }
  };
  
  useEffect(() => {
    if (!open || !intentFetchTime || isIntentFetching) {
      return;
    }
    
    if (isIntentStale()) {
      log('Intent refresh check: intent is stale, scheduling refresh');
      
      const refreshTimeout = setTimeout(() => {
        if (!loading && !processingSetupConfirmation && !isIntentFetching && !purposelyDelaying) {
          log('Refreshing stale intent automatically');
          setForceNewIntent(true);
          fetchPaymentIntent();
        } else {
          log('Skipping auto-refresh due to ongoing operations', {
            loading,
            processingSetupConfirmation,
            isIntentFetching,
            purposelyDelaying
          });
        }
      }, 2000);
      
      return () => {
        clearTimeout(refreshTimeout);
        log('Cleared intent refresh timeout');
      };
    } else {
      log('Intent refresh check: intent is still fresh');
    }
  }, [open, intentFetchTime, loading, processingSetupConfirmation, isIntentFetching, isIntentStale, fetchPaymentIntent, log, purposelyDelaying]);
  
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
                      onClick={() => {
                        log('Manual retry after connection error');
                        setForceNewIntent(true);
                        fetchPaymentIntent(true);
                      }}
                      disabled={loading || isIntentFetching || purposelyDelaying}
                      className="text-xs"
                    >
                      {loading || isIntentFetching || purposelyDelaying ? (
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
                onChange={(e) => {
                  if (e.error) {
                    log('Card element error:', e.error);
                  }
                  if (e.complete) {
                    log('Card element complete');
                  }
                }}
                onReady={() => log('Card element ready')}
              />
            </div>
            <div className="text-xs text-gray-500">
              Do testów użyj numeru karty: 4242 4242 4242 4242, dowolnej przyszłej daty ważności (MM/RR) i dowolnego CVC (3 cyfry)
            </div>
          </div>
          
          {error && !connectionError && !networkBlockDetected && (
            <div className="text-sm text-red-500">
              {error}
              {(isIntentStale() || !paymentIntent?.clientSecret) && (
                <Button 
                  type="button" 
                  size="sm" 
                  variant="ghost" 
                  className="ml-2 text-xs h-6 px-2" 
                  onClick={() => {
                    log('Manual intent refresh requested');
                    setForceNewIntent(true);
                    fetchPaymentIntent(true);
                  }}
                  disabled={isIntentFetching || purposelyDelaying}
                >
                  {isIntentFetching || purposelyDelaying ? (
                    <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Odświeżanie...</>
                  ) : (
                    <>Odśwież sesję</>
                  )}
                </Button>
              )}
            </div>
          )}
          
          <div className="text-xs text-gray-500 mt-2">
            {paymentType === 'one-time' 
              ? 'Jednorazowa płatność bez zapisywania danych karty'
              : 'Zapisujemy dane Twojej karty, aby móc automatycznie doładowywać konto gdy liczba tokenów spadnie poniżej 10'
            }
          </div>

          <div className="text-xs text-gray-500">
            Debug: {isIntentStale() ? 'Intent stale' : 'Intent fresh'} 
            {intentFetchTime && ` (Age: ${new Date().getTime() - intentFetchTime.getTime()}ms)`}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                log('Payment cancelled by user');
                onOpenChange(false);
              }}
              disabled={loading || processingSetupConfirmation || isIntentFetching || purposelyDelaying}
            >
              Anuluj
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !stripe || !elements || processingSetupConfirmation || connectionError || networkBlockDetected || isIntentFetching || purposelyDelaying || !paymentIntent?.clientSecret}
            >
              {loading || processingSetupConfirmation || isIntentFetching || purposelyDelaying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {processingSetupConfirmation ? 'Przetwarzanie płatności...' : 
                   isIntentFetching ? 'Przygotowanie sesji...' : 
                   purposelyDelaying ? 'Łączenie z systemem...' :
                   'Przygotowanie...'}
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
