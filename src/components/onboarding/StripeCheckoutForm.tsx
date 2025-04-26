
import React, { useState, useEffect } from 'react';
import {
  PaymentElement,
  LinkAuthenticationElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';
import { X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { calculateTokenPrice, calculateTotalPrice } from '@/components/onboarding/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import AdBlockerWarning from './AdBlockerWarning';

// Simple logger
const log = (...args: any[]) => {
  console.log('[StripeCheckout]', ...args);
};

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
  const stripe = useStripe();
  const elements = useElements();
  
  // Component state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'initial' | 'processing' | 'requires_action' | 'succeeded' | 'canceled'>('initial');
  const [sessionId, setSessionId] = useState<string>('');
  const [adBlockerDetected, setAdBlockerDetected] = useState(false);
  
  // Amount to charge
  const amount = tokenAmount[0];
  
  // Create a unique session ID
  useEffect(() => {
    setSessionId(`checkout-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`);
  }, []);
  
  // Detect ad blockers
  useEffect(() => {
    const detectAdBlocker = async () => {
      try {
        // Try to fetch a known Stripe resource
        const testRequest = await fetch('https://js.stripe.com/v3/fingerprinted/js/checkout-f5e4e490f539c60f9b8d.js', { 
          method: 'HEAD',
          mode: 'no-cors'
        });
        
        // If we get here, the request wasn't blocked
        setAdBlockerDetected(false);
      } catch (error) {
        // If request failed, likely blocked by ad blocker
        console.error('Possible ad blocker detected:', error);
        setAdBlockerDetected(true);
      }
    };
    
    detectAdBlocker();
  }, []);
  
  // Fetch user data and create payment intent
  useEffect(() => {
    const fetchUserDataAndCreateIntent = async () => {
      try {
        // Get current authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) {
          log('No authenticated user found');
          return;
        }
        
        // Get user's workspace using the security definer function
        const { data: workspaceId, error: workspaceError } = await supabase.rpc('get_user_workspace_id');
        
        if (workspaceError || !workspaceId) {
          log('Error getting workspace ID:', workspaceError);
          return;
        }
        
        // Get workspace data
        const { data: workspace, error: workspaceDataError } = await supabase
          .from('workspaces')
          .select('admin_email, admin_phone, stripe_customer_id')
          .eq('id', workspaceId)
          .single();
        
        if (workspaceDataError) {
          log('Error fetching workspace data:', workspaceDataError);
          return;
        }
        
        const workspaceData = workspace;
        
        // Use admin_email if available, otherwise fall back to the authenticated user's email
        setUserEmail(workspace.admin_email || user.email);
        
        // Create a payment intent via our edge function
        const { data, error } = await supabase.functions.invoke('create-checkout-session', {
          body: {
            paymentType,
            tokenAmount: amount,
            sessionId,
            timestamp: Date.now(),
            email: userEmail,
            customerId: workspaceData?.stripe_customer_id
          }
        });
        
        if (error || !data?.clientSecret) {
          log('Error creating payment intent:', error || 'No client secret returned');
          setPaymentError(error?.message || 'Wystąpił błąd podczas tworzenia płatności. Spróbuj ponownie.');
          return;
        }
        
        log('Payment intent created:', data);
        setClientSecret(data.clientSecret);
        
      } catch (error: any) {
        log('Error in initialization:', error);
        setPaymentError(error?.message || 'Wystąpił błąd podczas inicjalizacji płatności.');
      }
    };
    
    if (stripe && elements && open) {
      fetchUserDataAndCreateIntent();
    }
  }, [stripe, elements, open, paymentType, amount, sessionId, userEmail]);
  
  // Check payment status
  useEffect(() => {
    let interval: number;
    
    if (paymentStatus === 'processing' && clientSecret) {
      const paymentIntentId = clientSecret.split('_secret_')[0];
      
      interval = window.setInterval(async () => {
        try {
          log('Checking payment status for intent:', paymentIntentId);
          
          const { data, error } = await supabase.functions.invoke('create-checkout-session', {
            body: {
              checkStatus: true,
              paymentIntentId
            }
          });
          
          if (error) {
            log('Error checking payment status:', error);
            return;
          }
          
          log('Payment status check result:', data);
          
          if (data.status === 'succeeded') {
            setPaymentStatus('succeeded');
            clearInterval(interval);
            
            // Call onSuccess callback with payment details
            if (onSuccess) {
              onSuccess(paymentType, amount);
            }
            
            // Close modal after 1 second to show success state
            setTimeout(() => onOpenChange(false), 1000);
          }
          
        } catch (error) {
          log('Error checking payment status:', error);
        }
      }, 2000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [paymentStatus, clientSecret, paymentType, amount, onSuccess, onOpenChange]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements || !clientSecret) {
      log('Stripe not initialized or missing client secret');
      return;
    }
    
    try {
      setIsProcessing(true);
      setPaymentError(null);
      
      if (!firstName || !lastName) {
        setPaymentError('Proszę podać imię i nazwisko');
        setIsProcessing(false);
        return;
      }
      
      const fullName = `${firstName} ${lastName}`;
      log('Using billing details:', { name: fullName, email: userEmail });
      
      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/onboarding?success=true&tokens=${amount}`,
          payment_method_data: {
            billing_details: {
              name: fullName,
              email: userEmail,
              // Phone is omitted to avoid Stripe error
            },
          },
        },
        redirect: 'if_required'
      });
      
      log('Payment confirmation result:', result);
      
      if (result.error) {
        // Show error message
        setPaymentError(result.error.message || 'Wystąpił błąd podczas przetwarzania płatności');
        setPaymentStatus('canceled');
      } else if (result.paymentIntent) {
        // Check payment intent status
        switch (result.paymentIntent.status) {
          case 'succeeded':
            setPaymentStatus('succeeded');
            // Call onSuccess callback with payment details
            if (onSuccess) {
              onSuccess(paymentType, amount);
            }
            // Close modal after 1 second to show success state
            setTimeout(() => onOpenChange(false), 1000);
            break;
            
          case 'processing':
            setPaymentStatus('processing');
            break;
            
          case 'requires_action':
            setPaymentStatus('requires_action');
            // The payment requires additional actions
            log('Payment requires additional actions');
            break;
            
          default:
            setPaymentStatus('canceled');
            setPaymentError('Status płatności: ' + result.paymentIntent.status);
        }
      }
    } catch (error: any) {
      log('Error in payment submission:', error);
      setPaymentError(error?.message || 'Wystąpił nieoczekiwany błąd');
      setPaymentStatus('canceled');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Calculate price based on amount and tiers
  const pricePerToken = calculateTokenPrice(amount);
  const totalPrice = calculateTotalPrice(amount);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Płatność</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6" 
              onClick={() => onOpenChange(false)}
              disabled={isProcessing}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        {paymentStatus === 'succeeded' ? (
          <div className="p-4 text-center">
            <div className="text-green-500 text-2xl font-bold mb-2">Płatność zakończona sukcesem!</div>
            <div className="text-gray-600">
              Twoje konto zostało doładowane o {amount} tokenów.
            </div>
            <Button 
              className="mt-4" 
              onClick={() => onOpenChange(false)}
            >
              Zamknij
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <AdBlockerWarning isVisible={adBlockerDetected} />
            
            {paymentError && (
              <div className="p-3 bg-red-50 text-red-500 rounded-md border border-red-200 text-sm">
                {paymentError}
              </div>
            )}
            
            <div className="bg-gray-50 p-4 rounded-md">
              <div className="flex justify-between mb-2">
                <span className="font-medium">{amount} tokenów</span>
                <span className="font-medium">{pricePerToken} PLN / token</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>Łączna kwota:</span>
                <span>{totalPrice} PLN</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Imię</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full border rounded-md p-2"
                  disabled={isProcessing}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Nazwisko</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full border rounded-md p-2"
                  disabled={isProcessing}
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Dane kontaktowe</label>
              <div className="border rounded-md p-3 bg-gray-50">
                <div className="text-xs text-gray-500">
                  Email: {userEmail || 'Brak - zaloguj się aby kontynuować'}
                </div>
              </div>
            </div>
            
            {clientSecret && (
              <div>
                <label className="block text-sm font-medium mb-1">Metoda płatności</label>
                <div className="border rounded-md p-3">
                  <PaymentElement
                    options={{
                      defaultValues: {
                        billingDetails: {
                          name: `${firstName} ${lastName}`.trim() || undefined,
                          email: userEmail || undefined,
                        }
                      },
                      fields: {
                        billingDetails: {
                          name: 'auto',
                          email: 'auto',
                          phone: 'never'
                        }
                      },
                      layout: {
                        type: 'tabs',
                        defaultCollapsed: false,
                        radios: true,
                        spacedAccordionItems: true
                      },
                      terms: {
                        card: 'never',
                        ideal: 'never',
                      },
                      wallets: {
                        applePay: 'never',
                        googlePay: 'never'
                      }
                    }}
                    onChange={(event) => {
                      log('Payment element change:', event);
                      setPaymentError(null);
                    }}
                  />
                </div>
              </div>
            )}
            
            <div className="pt-3">
              <Button
                type="submit"
                className="w-full bg-primary"
                disabled={!stripe || !elements || isProcessing || paymentStatus === 'processing'}
              >
                {isProcessing || paymentStatus === 'processing' ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Przetwarzanie...
                  </span>
                ) : (
                  <>Zapłać {totalPrice} PLN</>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default StripeCheckoutForm;
