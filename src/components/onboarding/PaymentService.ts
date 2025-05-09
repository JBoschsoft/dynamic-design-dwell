
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Timeout utilities
export const waitFor = async (ms: number, reason: string, logFn?: (message: string, data?: any) => void): Promise<void> => {
  if (logFn) logFn(`Purposely delaying for ${ms}ms: ${reason}`);
  return new Promise(resolve => {
    setTimeout(() => {
      if (logFn) logFn(`Delay of ${ms}ms complete: ${reason}`);
      resolve();
    }, ms);
  });
};

// Check if payment intent is stale
export const isIntentStale = (intentFetchTime: Date | null, staleness = 10000, logFn?: (message: string, data?: any) => void): boolean => {
  if (!intentFetchTime) {
    if (logFn) logFn('No intent fetch time recorded, considering intent stale');
    return true;
  }
  
  const now = new Date();
  const timeDiff = now.getTime() - intentFetchTime.getTime();
  
  const isStale = timeDiff > staleness;
  if (logFn) logFn(`Intent staleness check: age=${timeDiff}ms, max=${staleness}ms, isStale=${isStale}`);
  return isStale;
};

// Cached intent to prevent redundant calls
let cachedIntent: {
  paymentType: string;
  tokenAmount: number;
  clientSecret: string;
  id: string;
  timestamp: number;
  customerId?: string;
} | null = null;

// Fetch a new payment intent - for both one-time and auto-recharge options
export const fetchPaymentIntent = async (
  paymentType: 'one-time' | 'auto-recharge',
  tokenAmount: number,
  customerId: string | null,
  forceNewIntent: boolean,
  setIsIntentFetching: (val: boolean) => void,
  setLastFetchTimestamp: (val: number) => void,
  setLoading: (val: boolean) => void,
  setError: (val: string | null) => void,
  setConnectionError: (val: boolean) => void,
  setPaymentIntent: (val: any) => void,
  setIntentFetchTime: (val: Date) => void,
  setIntentFailures: (val: number | ((prev: number) => number)) => void,
  setRateLimited: (val: boolean) => void,
  setRetryAfter: (val: number) => void,
  setForceNewIntent: (val: boolean) => void,
  logFn: (message: string, data?: any) => void,
  sessionId: string,
  waitFn: (ms: number, reason: string) => Promise<void>
) => {
  
  // Check if we can use cached intent to avoid creating new ones unnecessarily
  // For one-time payments, use a shorter cache validity (5 seconds) to reduce chances of expiration
  const cacheValidityMs = paymentType === 'one-time' ? 5000 : 15000;
  
  if (!forceNewIntent && cachedIntent && 
      cachedIntent.paymentType === paymentType && 
      cachedIntent.tokenAmount === tokenAmount &&
      (Date.now() - cachedIntent.timestamp < cacheValidityMs)) {
    
    logFn(`Using cached ${paymentType} payment intent from ${Date.now() - cachedIntent.timestamp}ms ago`);
    
    setPaymentIntent({
      id: cachedIntent.id,
      clientSecret: cachedIntent.clientSecret,
      timestamp: new Date(cachedIntent.timestamp).toISOString(),
      customerId: cachedIntent.customerId,
      amount: cachedIntent.tokenAmount
    });
    
    setIntentFetchTime(new Date(cachedIntent.timestamp));
    return {
      clientSecret: cachedIntent.clientSecret,
      intentId: cachedIntent.id,
      customerId: cachedIntent.customerId,
      timestamp: new Date(cachedIntent.timestamp).toISOString(),
      amount: cachedIntent.tokenAmount
    };
  }

  // If we're not using cache, proceed with new intent creation
  if (setIsIntentFetching) setIsIntentFetching(true);
  setLastFetchTimestamp(Date.now());
  setLoading(true);
  setError(null);
  setConnectionError(false);
  
  try {
    logFn(`Fetching ${paymentType} payment intent for ${tokenAmount} tokens${forceNewIntent ? ' (forcing new intent)' : ''}`);
    
    const requestStart = Date.now();
    logFn('Invoking create-checkout-session function', {
      paymentType,
      tokenAmount,
      customerId,
      forceNewIntent,
      sessionId
    });
    
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        paymentType,
        tokenAmount,
        customerId,
        forceNewIntent,
        sessionId
      }
    });
    
    logFn(`Function response received after ${Date.now() - requestStart}ms`);
    
    setForceNewIntent(false);
    
    if (error) {
      logFn("Supabase function error:", error);
      throw new Error(`Error invoking payment function: ${error.message}`);
    }
    
    if (!data) {
      logFn("No data received from payment service");
      throw new Error("No data received from payment service");
    }
    
    if (data?.error) {
      logFn("Payment service error:", data.error);
      
      if (data.rateLimited) {
        logFn(`Rate limited by server: retry after ${data.retryAfter || 10}s`);
        setRateLimited(true);
        setRetryAfter(data.retryAfter || 10);
        throw new Error(`Zbyt wiele żądań. Odczekaj ${data.retryAfter || 10} sekund przed ponowną próbą.`);
      }
      
      throw new Error(data.error);
    }
    
    if (data?.clientSecret) {
      logFn(`Received new client secret: ${data.clientSecret.substring(0, 10)}...`);
      logFn(`Intent ID: ${data.id}`);
      
      // Add a small delay before setting the new intent
      await waitFn(200, 'After receiving client secret');
      
      // Update cache with new intent
      cachedIntent = {
        paymentType,
        tokenAmount,
        clientSecret: data.clientSecret,
        id: data.id,
        timestamp: Date.now(),
        customerId: data.customerId
      };
      
      setPaymentIntent({
        id: data.id,
        clientSecret: data.clientSecret,
        timestamp: data.timestamp || new Date().toISOString(),
        customerId: data.customerId,
        amount: data.amount
      });
      
      setIntentFetchTime(new Date());
      setIntentFailures(0);
      setRateLimited(false);
      setRetryAfter(0);
      
      if (data.customerId) {
        logFn(`Customer ID received: ${data.customerId}`);
        return {
          customerId: data.customerId,
          clientSecret: data.clientSecret,
          intentId: data.id,
          timestamp: data.timestamp || new Date().toISOString(),
          amount: data.amount
        };
      }
      
      return {
        clientSecret: data.clientSecret,
        intentId: data.id,
        timestamp: data.timestamp || new Date().toISOString(),
        amount: data.amount
      };
    } else {
      logFn("No client secret received");
      throw new Error("Nie otrzymano klucza klienta od serwera płatności");
    }
  } catch (error) {
    logFn('Error fetching payment intent:', error);
    
    setIntentFailures(prev => {
      const newVal = typeof prev === 'number' ? prev + 1 : 1;
      logFn(`Intent failures increased to ${newVal}`);
      return newVal;
    });
    
    // Clear cache on error
    cachedIntent = null;
    
    if (error.message?.includes('Failed to fetch') || 
        error.message?.includes('Network Error') ||
        error.message?.includes('ERR_BLOCKED_BY_CLIENT') ||
        error.message?.includes('AbortError')) {
      logFn('Network or connectivity error detected');
      setConnectionError(true);
      
      toast({
        variant: "destructive",
        title: "Błąd połączenia",
        description: "Wykryto blokadę połączenia do Stripe. Wyłącz AdBlock i inne blokady, aby kontynuować płatność."
      });
      throw error;
    } else {
      setError(error.message || 'Wystąpił nieoczekiwany błąd podczas inicjalizacji płatności');
      
      toast({
        variant: "destructive",
        title: "Błąd inicjalizacji płatności",
        description: error.message || "Nie można nawiązać połączenia z systemem płatności. Spróbuj ponownie."
      });
      throw error;
    }
  } finally {
    setLoading(false);
    if (setIsIntentFetching) setIsIntentFetching(false);
    logFn('Intent fetch completed');
  }
};

// Attach a payment method to a payment intent
export const attachPaymentMethod = async (
  paymentIntentId: string,
  paymentMethodId: string,
  sessionId: string,
  logFn: (message: string, data?: any) => void
): Promise<{ updated: boolean, status: string, paymentMethodId?: string }> => {
  logFn(`Attaching payment method ${paymentMethodId.substring(0, 5)}... to payment intent ${paymentIntentId.substring(0, 5)}...`);
  
  try {
    // Add a small delay before calling the function
    await waitFor(300, 'Before attaching payment method', logFn);
    
    const response = await supabase.functions.invoke('create-checkout-session', {
      body: {
        attachMethod: true,
        paymentIntentId,
        paymentMethodId,
        sessionId
      }
    });
    
    // Better error handling to catch and properly report Supabase errors
    if (response.error) {
      logFn('Error from Supabase function:', response.error);
      throw new Error(`Function error: ${response.error.message || response.error.toString()}`);
    }
    
    const { data, error } = response;
    
    if (error) {
      logFn('Error attaching payment method:', error);
      throw new Error(`Failed to attach payment method: ${error.message}`);
    }
    
    if (data?.error) {
      logFn('Payment service error:', data.error);
      throw new Error(data.error);
    }
    
    logFn('Payment method attachment result:', data);
    
    // Return the possibly updated payment method ID from the server
    return {
      updated: data.updated || false,
      status: data.status || 'unknown',
      paymentMethodId: data.paymentMethodId || paymentMethodId
    };
  } catch (error) {
    logFn('Error attaching payment method:', error);
    throw error;
  }
};

// Confirm a payment intent
export const confirmPaymentIntent = async (
  paymentIntentId: string,
  sessionId: string,
  logFn: (message: string, data?: any) => void
): Promise<{ status: string, clientSecret?: string, requiresAction: boolean }> => {
  logFn(`Confirming payment intent ${paymentIntentId.substring(0, 5)}...`);
  
  try {
    // Add a small delay before calling the function
    await waitFor(300, 'Before confirming payment intent', logFn);
    
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        confirmIntent: true,
        paymentIntentId,
        sessionId
      }
    });
    
    if (error) {
      logFn('Error confirming payment intent:', error);
      throw new Error(`Failed to confirm payment intent: ${error.message}`);
    }
    
    if (data?.error) {
      logFn('Payment service error:', data.error);
      throw new Error(data.error);
    }
    
    logFn('Payment intent confirmation result:', data);
    return data;
  } catch (error) {
    logFn('Error confirming payment intent:', error);
    throw error;
  }
};

// Update token balance after payment
export const updateTokenBalance = async (amount: number, paymentType: 'one-time' | 'auto-recharge', logFn: (message: string, data?: any) => void) => {
  
  try {
    logFn(`Updating token balance: +${amount}`);
    logFn('Getting current user');
    const user = (await supabase.auth.getUser()).data.user;
    
    if (!user) {
      logFn('No authenticated user found');
      return false;
    }
    
    logFn(`Finding workspace for user: ${user.id}`);
    const { data: memberData, error: memberError } = await supabase
      .from('workspace_members')
      .select('workspace_id')
      .eq('user_id', user.id)
      .single();
    
    if (memberError || !memberData?.workspace_id) {
      logFn('Error finding workspace:', memberError);
      return false;
    }
    
    const workspaceId = memberData.workspace_id;
    logFn(`Found workspace: ${workspaceId}`);
    
    logFn('Fetching current workspace token balance');
    const { data: workspaceData, error: workspaceError } = await supabase
      .from('workspaces')
      .select('token_balance')
      .eq('id', workspaceId)
      .maybeSingle();
    
    if (workspaceError) {
      logFn('Error fetching workspace data:', workspaceError);
      return false;
    }
    
    const currentBalance = workspaceData?.token_balance ?? 0;
    const newBalance = currentBalance + amount;
    
    logFn(`Updating token balance: Current=${currentBalance}, Adding=${amount}, New=${newBalance}`);
    
    logFn(`Setting auto-topup to ${paymentType === 'auto-recharge'}`);
    const { error: updateError } = await supabase
      .from('workspaces')
      .update({ 
        token_balance: newBalance,
        balance_auto_topup: paymentType === 'auto-recharge'
      })
      .eq('id', workspaceId);
    
    if (updateError) {
      logFn('Error updating token balance:', updateError);
      return false;
    } else {
      logFn(`Token balance updated from ${currentBalance} to ${newBalance}`);
      logFn(`Auto-topup set to ${paymentType === 'auto-recharge'}`);
      return true;
    }
  } catch (error) {
    logFn('Error updating token balance:', error);
    return false;
  }
};

// Process initial charge for auto-recharge
export const createInitialCharge = async (
  paymentMethodId: string,
  customerId: string | null,
  tokenAmount: number,
  onSuccess: ((paymentType: string, amount: number) => void) | undefined,
  onOpenChange: (open: boolean) => void,
  navigate: (path: string) => void,
  logFn: (message: string, data?: any) => void,
  waitForFn: (ms: number, reason: string) => Promise<void>,
  sessionId: string
) => {
  
  logFn(`Creating initial charge with payment method: ${paymentMethodId.substring(0, 5)}...`);
  
  try {
    // Add a small delay before processing
    await waitForFn(300, 'Before initial charge');
    
    logFn('Invoking create-checkout-session for initial charge', {
      paymentType: 'auto-recharge',
      tokenAmount,
      paymentMethodId: `${paymentMethodId.substring(0, 5)}...`,
      customerId: customerId ? `${customerId.substring(0, 5)}...` : null,
      sessionId
    });
    
    const requestStart = Date.now();
    const { data, error } = await supabase.functions.invoke('create-checkout-session', {
      body: {
        paymentType: 'auto-recharge',
        tokenAmount,
        paymentMethodId,
        customerId,
        createCharge: true,
        sessionId
      }
    });
    
    logFn(`Initial charge response received after ${Date.now() - requestStart}ms`);
    
    if (error) {
      logFn('Supabase function error:', error);
      throw new Error(`Error processing payment: ${error.message}`);
    }
    
    if (data?.error) {
      logFn('Payment service error:', data.error);
      throw new Error(data.error);
    }
    
    logFn('Initial charge created:', data);
    
    if (data?.status !== 'succeeded') {
      logFn(`Payment not successful. Status: ${data?.status || 'unknown'}`);
      throw new Error(`Payment not successful. Status: ${data?.status || 'unknown'}`);
    }
    
    logFn('Updating token balance');
    const balanceUpdated = await updateTokenBalance(tokenAmount, 'auto-recharge', logFn);
    if (!balanceUpdated) {
      logFn('Failed to update token balance');
      throw new Error("Nie udało się zaktualizować salda tokenów");
    }
    
    logFn('Token balance updated successfully');
    
    if (onSuccess) {
      logFn('Calling onSuccess callback');
      onSuccess('auto-recharge', tokenAmount);
    }
    
    logFn('Closing payment dialog');
    onOpenChange(false);
    
    logFn('Navigating to success page');
    navigate(`/onboarding?success=true&tokens=${tokenAmount}`);
    
    toast({
      title: "Płatność zrealizowana",
      description: `Twoje konto zostało pomyślnie doładowane o ${tokenAmount} tokenów. Automatyczne doładowywanie zostało aktywowane.`,
    });
    
    return true;
  } catch (error) {
    logFn('Error creating initial charge:', error);
    
    toast({
      variant: "destructive",
      title: "Błąd płatności",
      description: error.message || "Wystąpił błąd podczas przetwarzania płatności. Spróbuj ponownie.",
    });
    
    throw error;
  }
};
