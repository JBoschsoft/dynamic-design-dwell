import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
  Button, Label, Input, Loader2
} from "@/components/ui";
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

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
  const [cardName, setCardName] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    if (!cardName) {
      setError('Proszę podać imię i nazwisko na karcie');
      return;
    }
    
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Wystąpił błąd z formularzem płatności');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (Math.random() > 0.2) {
        if (onSuccess) {
          onSuccess(paymentType, tokenAmount[0]);
        }
        
        onOpenChange(false);
        
        navigate(`/onboarding?success=true&tokens=${tokenAmount[0]}`);
      } else {
        throw new Error("Odmowa autoryzacji karty. Proszę użyć innej metody płatności.");
      }
    } catch (error: any) {
      console.error('Payment error:', error);
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
  
  const calculatePrice = () => {
    const amount = tokenAmount[0];
    const pricePerToken = amount >= 150 ? 5 : amount >= 100 ? 6 : amount >= 50 ? 7 : 8;
    return amount * pricePerToken;
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Płatność za tokeny</DialogTitle>
          <DialogDescription>
            {paymentType === 'one-time' 
              ? 'Podaj dane karty aby dokończyć jednorazowy zakup tokenów'
              : 'Podaj dane karty aby ustawić automatyczną płatność miesięczną'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardName">Imię i nazwisko na karcie</Label>
            <Input 
              id="cardName" 
              value={cardName} 
              onChange={(e) => setCardName(e.target.value)} 
              placeholder="Wprowadź imię i nazwisko"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Dane karty</Label>
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
          
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="flex justify-between">
              <span>Liczba tokenów:</span>
              <span className="font-medium">{tokenAmount[0]}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span>Kwota płatności:</span>
              <span className="font-semibold">{calculatePrice()} PLN</span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              {paymentType === 'one-time' 
                ? 'Jednorazowa płatność'
                : 'Płatność miesięczna, możesz anulować w dowolnym momencie'
              }
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Anuluj
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Przetwarzanie...
                </>
              ) : (
                `Zapłać ${calculatePrice()} PLN`
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default StripeCheckoutForm;
