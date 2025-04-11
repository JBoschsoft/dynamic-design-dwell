
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  Button, Label, Loader2, Card, CardContent, Input
} from "@/components/ui";
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
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

// Define the expected workspace data structure with optional fields for admin_email and admin_phone
interface WorkspaceData {
  id: string;
  name: string;
  stripe_customer_id?: string;
  admin_email?: string; 
  admin_phone?: string;
  // Include other fields from the workspaces table
  industry: string;
  company_size: string;
  token_balance?: number;
  balance_auto_topup?: boolean;
  created_at?: string;
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
  const [paymentElementReady, setPaymentElementReady] = useState(false);
  const [paymentIntent, setPaymentIntent] = useState<{
    clientSecret: string;
    id: string;
    timestamp: string;
    customerId?: string;
  } | null>(null);
  const [intentFetchTime, setIntentFetchTime] = useState<Date | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userPhone, setUserPhone] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [workspaceData, setWorkspaceData] = useState<WorkspaceData | null>(null);
  
  const log = useCallback((message: string, data?: any) => {
    if (data) {
      console.log(`[CHECKOUT-${sessionId}] ${message}`, data);
    } else {
      console.log(`[CHECKOUT-${sessionId}] ${message}`);
    }
  }, [sessionId]);
  
  const isIntentValid = useCallback(() => {
    if (!intentFetchTime) return false;
    
    const MAX_INTENT_AGE_MS = 2 * 60 * 1000;
    const now = new Date();
    const timeDiff = now.getTime() - intentFetchTime.getTime();
    
    const isValid = timeDiff <= MAX_INTENT_AGE_MS;
    if (!isValid) {
      log(`Payment intent is too old (${timeDiff}ms), refreshing`);
    }
    return isValid;
  }, [intentFetchTime, log]);
  
  useEffect(() => {
    const fetchWorkspaceData = async () => {
      try {
        // First get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.id) {
          log('No authenticated user found');
          setUserEmail(user?.email || null); // Set email from auth user as fallback
          return;
        }
        
        // Get user's workspace directly using a single query without accessing workspace_members
        const { data: workspaces, error: workspacesError } = await supabase
          .from('workspaces')
          .select('*')
          .limit(1);
          
        if (workspacesError || !workspaces?.length) {
          log('Error fetching workspace:', workspacesError);
          // Set email from auth user as fallback
          setUserEmail(user.email);
          return;
        }
        
        const workspace = workspaces[0] as WorkspaceData;
        
        log('Workspace data fetched:', workspace);
        setWorkspaceData(workspace);
        
        // Use admin_email if available, otherwise fall back to the authenticated user's email
        setUserEmail(workspace.admin_email || user.email);
        setUserPhone(workspace.admin_phone || null);
        
      } catch (error) {
        log('Error fetching workspace data:', error);
        // Try to get user email directly from auth as fallback
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.email) {
          setUserEmail(user.email);
        }
      }
    };
    
    fetchWorkspaceData();
  }, [log]);
  
  const createPaymentIntent = async () => {
    if (loading) return;
    
    setLoading(true);
    try {
      log('Creating payment intent');
      
      const { data, error: functionError } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          paymentType,
          tokenAmount: tokenAmount[0],
          sessionId,
          timestamp: Date.now(),
          email: userEmail,
          phone: userPhone,
          customerId: workspaceData?.stripe_customer_id
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
      
      setPaymentIntent({
        clientSecret: data.clientSecret,
        id: data.id,
        timestamp: new Date().toISOString(),
        customerId: data.customerId
      });
      setIntentFetchTime(new Date());
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
  
  useEffect(() => {
    if (open && stripe && elements && !paymentIntent) {
      log('Checkout dialog opened, creating new payment intent');
      setError(null);
      createPaymentIntent();
    }
  }, [open, stripe, elements, paymentIntent]);

  useEffect(() => {
    if (paymentIntent?.clientSecret && stripe && elements) {
      log('Setting up payment element with client secret');
    }
  }, [paymentIntent?.clientSecret, stripe, elements]);

  useEffect(() => {
    if (!open) {
      log('Checkout dialog closed, cleaning up');
      setTimeout(() => {
        setPaymentIntent(null);
        setIntentFetchTime(null);
      }, 500);
      setPaymentElementReady(false);
      setError(null);
    }
  }, [open, log]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    log('Payment form submitted');
    
    if (!stripe || !elements) {
      setError("Stripe nie został załadowany. Odśwież stronę i spróbuj ponownie.");
      return;
    }
    
    if (!paymentElementReady) {
      setError('Element płatności nie jest gotowy. Proszę poczekać lub odświeżyć stronę.');
      return;
    }
    
    if (!paymentIntent?.clientSecret) {
      setError('Brak klucza klienta. Proszę odświeżyć stronę i spróbować ponownie.');
      return;
    }
    
    if (!firstName.trim() || !lastName.trim()) {
      setError('Proszę podać imię i nazwisko.');
      return;
    }
    
    if (!userEmail) {
      setError('Brak adresu email. Proszę odświeżyć stronę lub zalogować się ponownie.');
      return;
    }
    
    if (!isIntentValid()) {
      log('Intent no longer valid, creating a new one before confirming');
      await createPaymentIntent();
      if (!paymentIntent?.clientSecret) return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      log(`Confirming payment for intent: ${paymentIntent.id.substring(0, 10)}...`);
      
      const { error: submitError } = await elements.submit();
      if (submitError) {
        log('Payment submission error:', submitError);
        throw new Error(submitError.message || "Payment submission failed");
      }
      
      const fullName = `${firstName} ${lastName}`;
      log('Using billing details:', { name: fullName, email: userEmail, phone: userPhone });
      
      const result = await stripe.confirmPayment({
        elements,
        clientSecret: paymentIntent.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/onboarding?success=true&tokens=${tokenAmount[0]}`,
          payment_method_data: {
            billing_details: {
              name: fullName,
              email: userEmail,
              phone: userPhone || undefined,
            },
          },
        },
        redirect: 'if_required'
      });
      
      if (result.error) {
        log('Payment confirmation error:', result.error);
        
        if (result.error.type === 'validation_error') {
          throw new Error(result.error.message || "Validation failed");
        }
        
        if (result.error.type === 'invalid_request_error' && 
            result.error.message?.includes('No such payment_intent')) {
          log('Payment intent not found, need to create a new one');
          setPaymentIntent(null);
          setError('Sesja płatności wygasła. Proszę spróbować ponownie.');
          return;
        }
        
        throw new Error(result.error.message || "Payment confirmation failed");
      }
      
      if (result.paymentIntent?.status === 'succeeded') {
        log('Payment successful! Updating token balance.');
        const balanceUpdated = await updateTokenBalance(tokenAmount[0], paymentType, log);
        
        if (!balanceUpdated) {
          log('Failed to update token balance');
          throw new Error("Nie udało się zaktualizować salda tokenów");
        }
        
        log('Token balance updated successfully');
        
        // If workspaceData exists and paymentIntent.customer exists from the response, update it in the workspace
        if (workspaceData?.id && paymentIntent.customerId) {
          log('Updating Stripe customer ID in workspace');
          await supabase
            .from('workspaces')
            .update({ 
              stripe_customer_id: paymentIntent.customerId
            })
            .eq('id', workspaceData.id);
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
      } else if (result.paymentIntent?.status === 'processing') {
        log('Payment processing, waiting for completion');
        toast({
          title: "Płatność w trakcie przetwarzania",
          description: "Twoja płatność jest przetwarzana. Aktualizacja salda może zająć kilka chwil.",
        });
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
  
  if (!paymentIntent?.clientSecret || !stripe || !elements) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Płatność za tokeny</DialogTitle>
            <DialogDescription>
              {loading ? 'Przygotowywanie płatności...' : 'Inicjalizacja bramki płatności'}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
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
            <Label>Dane do faktury</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName" className="text-xs mb-1 block">Imię</Label>
                <Input 
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Podaj imię"
                  required
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="text-xs mb-1 block">Nazwisko</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Podaj nazwisko"
                  required
                />
              </div>
            </div>
            <div className="text-xs text-gray-500">
              Email: {userEmail || 'Brak - zaloguj się aby kontynuować'}
              {userPhone && <div>Telefon: {userPhone}</div>}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Dane płatności</Label>
            <div className="border rounded-md">
              <PaymentElement
                id="payment-element"
                options={{
                  layout: 'tabs',
                  defaultValues: {
                    billingDetails: {
                      name: `${firstName} ${lastName}`.trim() || undefined,
                      email: userEmail || undefined,
                      phone: userPhone || undefined,
                    }
                  },
                  fields: {
                    billingDetails: {
                      name: 'never',
                      email: 'never',
                      phone: 'never',
                      address: {
                        country: 'auto',
                        postalCode: 'auto',
                        line1: 'auto',
                        line2: 'auto',
                        city: 'auto',
                        state: 'auto',
                      }
                    }
                  },
                  wallets: {
                    applePay: 'auto',
                    googlePay: 'auto'
                  }
                }}
                onChange={(event) => {
                  setPaymentElementReady(event.complete);
                  setError(null);
                  if (event.complete) {
                    log('Payment element complete');
                  }
                }}
                onReady={() => {
                  log('Payment element ready');
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
              disabled={loading || !stripe || !elements || !paymentElementReady || !firstName.trim() || !lastName.trim() || !userEmail}
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
