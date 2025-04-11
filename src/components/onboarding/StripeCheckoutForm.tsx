
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
import { fetchPaymentIntent, updateTokenBalance, isIntentStale, createInitialCharge, waitFor } from './PaymentService';

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
  amount?: number;
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
  const [cardElementReady, setCardElementReady] = useState(false);
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const operationTimestamps = useRef<{[key: string]: number}>({});
  const intentCreationLock = useRef<boolean>(false);
  const paymentLock = useRef<boolean>(false);
  const cardElementRef = useRef<any>(null);

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
      setCardElementReady(false);
      
      log('Setting timeout to fetch payment intent');
      const timeout = setTimeout(() => {
        log('Initial intent fetch triggered');
        fetchInitialIntent();
      }, 500);
      
      return () => {
        clearTimeout(timeout);
        log('Checkout dialog closed, cleanup performed');
        intentCreationLock.current = false;
        paymentLock.current = false;
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
  
  const waitForDelay = async (ms: number, reason: string): Promise<void> => {
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

  const fetchInitialIntent = async () => {
    if (intentCreationLock.current) {
      log('Intent creation already in progress, skipping duplicate fetch');
      return;
    }
    
    intentCreationLock.current = true;
    log('Setting intent creation lock');
    
    try {
      await fetchPaymentIntent(
        paymentType,
        tokenAmount[0],
        customerId,
        forceNewIntent,
        setIsIntentFetching,
        setLastFetchTimestamp,
        setLoading,
        setError,
        setConnectionError,
        setPaymentIntent,
        setIntentFetchTime,
        setIntentFailures,
        setRateLimited,
        setRetryAfter,
        setForceNewIntent,
        log,
        sessionId,
        waitForDelay
      ).then(result => {
        if (result?.customerId) {
          setCustomerId(result.customerId);
        }
      }).catch(err => {
        log(`Error in initial fetch: ${err.message}`);
      });
    } finally {
      setTimeout(() => {
        intentCreationLock.current = false;
        log('Released intent creation lock');
      }, 500);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (paymentLock.current) {
      log('Payment already in progress, ignoring duplicate submission');
      return;
    }
    
    paymentLock.current = true;
    const endTracking = timeOperation('handleSubmit');
    
    log('Payment form submitted');
    
    try {
      if (!stripe || !elements) {
        log('Stripe not loaded');
        setError("Stripe nie został załadowany. Odśwież stronę i spróbuj ponownie.");
        endTracking();
        paymentLock.current = false;
        return;
      }
      
      if (!cardElementReady) {
        log('Card element not ready');
        setError('Element karty nie jest gotowy. Proszę poczekać lub odświeżyć stronę.');
        endTracking();
        paymentLock.current = false;
        return;
      }
      
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        log('Card element not found');
        setError('Nie można znaleźć elementu karty');
        endTracking();
        paymentLock.current = false;
        return;
      }
      
      setLoading(true);
      setError(null);
      setPaymentInProgress(true);
      
      // Store reference to card element for possible reuse
      cardElementRef.current = cardElement;
      
      // Make sure we have a fresh intent
      if (isIntentStale(intentFetchTime) || !paymentIntent?.clientSecret) {
        log('Intent is stale or missing, fetching fresh intent before confirmation');
        
        if (!intentCreationLock.current) {
          setForceNewIntent(true);
          
          await fetchInitialIntent();
          
          await waitForDelay(1000, 'After fetching fresh intent');
          
          if (!paymentIntent?.clientSecret) {
            log('Failed to get new payment intent client secret');
            throw new Error("Nie udało się uzyskać nowego klucza płatności. Proszę spróbować ponownie.");
          }
        } else {
          log('Intent creation already in progress, waiting for it to complete');
          await new Promise((resolve) => setTimeout(resolve, 2000));
          
          if (!paymentIntent?.clientSecret) {
            log('Still no payment intent client secret after waiting');
            throw new Error("Nie udało się uzyskać klucza płatności. Proszę spróbować ponownie.");
          }
        }
      }
      
      log(`Processing ${paymentType} payment with client secret starting with ${paymentIntent.clientSecret?.slice(0, 10)}...`);
      
      // Handle one-time payment flow
      if (paymentType === 'one-time') {
        log('Confirming one-time payment');
        log('Intent ID:', paymentIntent.id);
        log('Client secret starts with:', paymentIntent.clientSecret?.slice(0, 10));
        
        await waitForDelay(300, 'Before payment confirmation');
        
        try {
          log('Confirming card payment with card element and client secret');
          
          // This is the key step where we attach the payment method to the payment intent and confirm it
          const result = await stripe.confirmCardPayment(
            paymentIntent.clientSecret!,
            {
              payment_method: {
                card: cardElement,
                billing_details: { 
                  name: 'Lovable Customer' 
                }
              }
            }
          );
          
          log('Payment confirmation result:', result);
          
          if (result.error) {
            log('Payment confirmation error:', result.error);
            throw result.error;
          }
          
          // Payment succeeded
          if (result.paymentIntent && result.paymentIntent.status === 'succeeded') {
            log('Payment successful! Updating token balance.');
            const balanceUpdated = await updateTokenBalance(tokenAmount[0], 'one-time', log);
            
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
            return;
          } else {
            log(`Unexpected payment status: ${result.paymentIntent?.status}`);
            throw new Error(`Płatność nie została zakończona pomyślnie. Status: ${result.paymentIntent?.status || 'nieznany'}`);
          }
        } catch (confirmError) {
          log('Error in confirmCardPayment:', confirmError);
          
          // Handle payment intent expiration
          if (confirmError.message?.includes("No such payment_intent") || 
              confirmError.code === 'resource_missing') {
            log('Payment intent no longer valid, fetching a new one...');
            setPaymentIntent(null);
            setForceNewIntent(true);
            
            await fetchInitialIntent();
            await waitForDelay(1000, 'After fetching new payment intent');
            
            setError("Sesja płatności wygasła i została odświeżona. Proszę spróbować płatność ponownie.");
            throw confirmError;
          }
          
          throw confirmError;
        }
      } else {
        // Auto-recharge setup flow
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
            // Confirm the setup intent with the card element
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
              
              // Create the initial charge with the setup payment method
              await createInitialCharge(
                paymentMethodId,
                customerId,
                tokenAmount[0],
                onSuccess,
                onOpenChange,
                navigate,
                log,
                waitFor,
                sessionId
              );
            } else {
              log(`Setup failed. Status: ${setupIntent?.status || 'unknown'}`);
              throw new Error(`Nieudane ustawienie metody płatności. Status: ${setupIntent?.status || 'nieznany'}`);
            }
          } catch (error) {
            log('Setup intent error:', error);
            
            // Handle setup intent expiration
            if (error.message?.includes("No such setupintent") || 
                error.code === 'resource_missing' || 
                error.message?.includes("resource_missing")) {
              log('Setup intent issue detected:', error);
              
              setPaymentIntent(null);
              setForceNewIntent(true);
              setError("Wystąpił problem z sesją płatności - odświeżamy dane...");
              
              log('Fetching new setup intent');
              await fetchPaymentIntent(
                paymentType,
                tokenAmount[0],
                customerId,
                true,
                setIsIntentFetching,
                setLastFetchTimestamp,
                setLoading,
                setError,
                setConnectionError,
                setPaymentIntent,
                setIntentFetchTime,
                setIntentFailures,
                setRateLimited,
                setRetryAfter,
                setForceNewIntent,
                log,
                sessionId,
                waitFor
              );
              
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
      
      // Handle intent expiration
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
        
        const cardElement = cardElementRef.current;
        if (cardElement) {
          log('Clearing card element');
          cardElement.clear();
        }
        
        setPaymentIntent(null);
        setForceNewIntent(true);
        
        log('Waiting before fetching new intent');
        await waitForDelay(2000, 'Before fetching new intent after expiration');
        
        log('Fetching new payment intent');
        await fetchPaymentIntent(
          paymentType,
          tokenAmount[0],
          customerId,
          true,
          setIsIntentFetching,
          setLastFetchTimestamp,
          setLoading,
          setError,
          setConnectionError,
          setPaymentIntent,
          setIntentFetchTime,
          setIntentFailures,
          setRateLimited,
          setRetryAfter,
          setForceNewIntent,
          log,
          sessionId,
          waitForDelay
        );
        
        await waitForDelay(1000, 'After fetching new intent after expiration');
        
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
        
        const cardElement = cardElementRef.current;
        if (cardElement) {
          log('Clearing card element');
          cardElement.clear();
        }
      }
    } finally {
      setLoading(false);
      setPaymentInProgress(false);
      paymentLock.current = false;
      log('Payment submission process completed');
      endTracking();
    }
  };

  // Automatically refresh stale intents
  useEffect(() => {
    if (!open || !intentFetchTime || isIntentFetching) {
      return;
    }
    
    if (isIntentStale(intentFetchTime)) {
      log('Intent refresh check: intent is stale, scheduling refresh');
      
      const refreshTimeout = setTimeout(() => {
        if (!loading && !processingSetupConfirmation && !isIntentFetching && !purposelyDelaying && !intentCreationLock.current) {
          log('Refreshing stale intent automatically');
          setForceNewIntent(true);
          fetchInitialIntent();
        } else {
          log('Skipping auto-refresh due to ongoing operations', {
            loading,
            processingSetupConfirmation,
            isIntentFetching,
            purposelyDelaying,
            intentLocked: intentCreationLock.current
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
  }, [open, intentFetchTime, loading, processingSetupConfirmation, isIntentFetching, purposelyDelaying]);
  
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
                        fetchInitialIntent();
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
                  setCardElementReady(true);
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
              {(isIntentStale(intentFetchTime) || !paymentIntent?.clientSecret) && (
                <Button 
                  type="button" 
                  size="sm" 
                  variant="ghost" 
                  className="ml-2 text-xs h-6 px-2" 
                  onClick={() => {
                    log('Manual intent refresh requested');
                    setForceNewIntent(true);
                    fetchInitialIntent();
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
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                log('Payment cancelled by user');
                onOpenChange(false);
              }}
              disabled={loading || processingSetupConfirmation || isIntentFetching || purposelyDelaying || paymentInProgress}
            >
              Anuluj
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !stripe || !elements || !cardElementReady || processingSetupConfirmation || 
                       connectionError || networkBlockDetected || isIntentFetching || purposelyDelaying || 
                       !paymentIntent?.clientSecret || intentCreationLock.current || paymentInProgress || paymentLock.current}
            >
              {loading || processingSetupConfirmation || isIntentFetching || purposelyDelaying || 
               intentCreationLock.current || paymentInProgress ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {processingSetupConfirmation ? 'Przetwarzanie płatności...' : 
                   isIntentFetching ? 'Przygotowanie sesji...' : 
                   purposelyDelaying ? 'Łączenie z systemem...' :
                   paymentInProgress ? 'Przetwarzanie płatności...' :
                   intentCreationLock.current ? 'Inicjalizacja płatności...' :
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
