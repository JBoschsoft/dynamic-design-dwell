
import React from 'react';
import { 
  Button,
  RadioGroup, RadioGroupItem,
  Label,
  Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription,
  Slider,
  CreditCard as CreditCardIcon, Repeat, DollarSign, TrendingDown, 
  Gauge, Lock, RefreshCcw, ArrowLeft, ArrowRight, Loader2, CheckCircle2
} from "@/components/ui";

import { 
  calculateTokenPrice, 
  getDiscountPercentage, 
  calculateTotalPrice, 
  formatTokenValue, 
  getPriceTierDescription 
} from './utils';

interface PaymentStepProps {
  paymentType: 'one-time' | 'subscription';
  setPaymentType: (value: 'one-time' | 'subscription') => void;
  tokenAmount: number[];
  setTokenAmount: (value: number[]) => void;
  subscriptionAmount: number[];
  setSubscriptionAmount: (value: number[]) => void;
  onNext: () => void;
  onPrevious: () => void;
  paymentLoading: boolean;
  paymentSuccess: boolean;
}

const PaymentStep: React.FC<PaymentStepProps> = ({
  paymentType,
  setPaymentType,
  tokenAmount,
  setTokenAmount,
  subscriptionAmount,
  setSubscriptionAmount,
  onNext,
  onPrevious,
  paymentLoading,
  paymentSuccess
}) => {
  
  const formatSubscriptionValue = (value: number[]) => {
    const amount = value[0];
    const price = calculateTokenPrice(amount);
    return `${amount} tokenów (${price} PLN/token)`;
  };
  
  const handleDirectNextStep = () => {
    onNext();
  };
  
  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md w-full max-w-2xl">
      <div className="flex items-center justify-center mb-6">
        <div className="bg-primary/10 p-3 rounded-full">
          <CreditCardIcon className="h-6 w-6 text-primary" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-center mb-2">
        Wybierz plan płatności
      </h2>
      
      <p className="text-gray-600 text-center mb-8">
        Aby aktywować funkcje platformy, wybierz preferowany wariant płatności.
      </p>
      
      <div className="space-y-6">
        <RadioGroup 
          value={paymentType} 
          onValueChange={(value) => setPaymentType(value as 'one-time' | 'subscription')}
          className="space-y-4"
        >
          <div className={`border rounded-lg p-4 transition-all duration-300 ${paymentType === 'subscription' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="subscription" id="subscription" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="subscription" className="text-base font-medium flex items-center">
                  <Repeat className="mr-2 h-5 w-5" />
                  Włącz automatyczne płatności
                </Label>
                
                {paymentType === 'subscription' && (
                  <div className="mt-6 space-y-6 animate-fade-in">
                    <div className="bg-blue-50 border border-blue-100 rounded-md p-4 flex items-start text-sm">
                      <CheckCircle2 className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                      <p>Twoja karta zostanie automatycznie obciążona, gdy liczba dostępnych tokenów spadnie poniżej <strong>10</strong>.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>10 tokenów</span>
                        <span>1000 tokenów</span>
                      </div>
                      <Slider 
                        value={subscriptionAmount} 
                        onValueChange={setSubscriptionAmount}
                        min={10}
                        max={1000}
                        step={5}
                        showValue={true}
                        formatValue={formatSubscriptionValue}
                        className="py-4"
                      />
                    </div>

                    <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                      <div className="flex items-center mb-2">
                        <TrendingDown className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm font-medium">{getPriceTierDescription(subscriptionAmount[0])}</span>
                        <div className="ml-auto bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded">
                          Zniżka {getDiscountPercentage(subscriptionAmount[0])}%
                        </div>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-gradient-to-r from-primary/50 to-primary h-2.5 rounded-full"
                          style={{ width: `${Math.min((subscriptionAmount[0] / 200) * 100, 100)}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between mt-2 text-xs text-gray-500">
                        <span>8 PLN/token</span>
                        <span>7 PLN/token</span>
                        <span>6 PLN/token</span>
                        <span>5 PLN/token</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>1-49</span>
                        <span>50-99</span>
                        <span>100-149</span>
                        <span>150+</span>
                      </div>
                    </div>
                    
                    <Card className="border-primary/20 shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <Gauge className="mr-2 h-5 w-5 text-primary" />
                          Automatyczne płatności
                        </CardTitle>
                        <CardDescription>
                          Szczegóły doładowania tokenów
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2 pt-0">
                        <div className="flex justify-between">
                          <span>Próg doładowania:</span>
                          <span className="font-medium">poniżej 10 tokenów</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Ilość tokenów:</span>
                          <span className="font-medium">{subscriptionAmount[0]} tokenów</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cena za token:</span>
                          <span className="font-medium">{calculateTokenPrice(subscriptionAmount[0])} PLN</span>
                        </div>
                        <div className="border-t pt-2 mt-2 flex justify-between text-lg font-bold">
                          <span>Kwota doładowania:</span>
                          <span className="text-primary">{calculateTotalPrice(subscriptionAmount[0])} PLN</span>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="flex flex-col gap-3 pt-0">
                        <div className="bg-gray-50 p-3 rounded-md border border-gray-100 w-full">
                          <h4 className="text-sm font-medium mb-2 flex items-center">
                            <CreditCardIcon className="h-4 w-4 mr-1 text-gray-500" />
                            Informacje o metodzie płatności
                          </h4>
                          <p className="text-xs text-gray-500 mb-3">
                            Po kliknięciu przycisku "Zapłać i kontynuuj" zostaniesz przekierowany do bezpiecznej strony płatności Stripe.
                          </p>
                          <div className="flex items-center space-x-1 text-xs text-gray-600">
                            <Lock className="h-3 w-3" />
                            <span>Bezpieczna płatność przez Stripe</span>
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className={`border rounded-lg p-4 transition-all duration-300 ${paymentType === 'one-time' ? 'border-primary bg-primary/5' : 'border-gray-200'}`}>
            <div className="flex items-start space-x-3">
              <RadioGroupItem value="one-time" id="one-time" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="one-time" className="text-base font-medium flex items-center">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Kup tokeny jednorazowo
                </Label>
                
                {paymentType === 'one-time' && (
                  <div className="mt-6 space-y-6 animate-fade-in">
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>1 token</span>
                        <span>1000 tokenów</span>
                      </div>
                      <Slider 
                        value={tokenAmount} 
                        onValueChange={setTokenAmount}
                        min={1}
                        max={1000}
                        step={1}
                        showValue={true}
                        formatValue={formatTokenValue}
                        className="py-4"
                      />
                      
                      <div className="bg-gray-50 p-3 rounded-md border border-gray-100">
                        <div className="flex items-center mb-2">
                          <TrendingDown className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm font-medium">{getPriceTierDescription(tokenAmount[0])}</span>
                          {tokenAmount[0] >= 50 && (
                            <div className="ml-auto bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded">
                              Zniżka {getDiscountPercentage(tokenAmount[0])}%
                            </div>
                          )}
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-gradient-to-r from-primary/50 to-primary h-2.5 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${Math.min(tokenAmount[0] / 200 * 100, 100)}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex justify-between mt-2 text-xs text-gray-500">
                          <span>8 PLN/token</span>
                          <span>7 PLN/token</span>
                          <span>6 PLN/token</span>
                          <span>5 PLN/token</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400">
                          <span>1-49</span>
                          <span>50-99</span>
                          <span>100-149</span>
                          <span>150+</span>
                        </div>
                      </div>
                    </div>
                    
                    <Card className="border-primary/20 shadow-sm">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <Gauge className="mr-2 h-5 w-5 text-primary" />
                          Podsumowanie zakupu
                        </CardTitle>
                        <CardDescription>
                          Szczegóły transakcji
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2 pt-0">
                        <div className="flex justify-between">
                          <span>Ilość tokenów:</span>
                          <span className="font-medium">{tokenAmount[0]}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cena za token:</span>
                          <span className="font-medium">{calculateTokenPrice(tokenAmount[0])} PLN</span>
                        </div>
                        <div className="border-t pt-2 mt-2 flex justify-between text-lg font-bold">
                          <span>Razem do zapłaty:</span>
                          <span className="text-primary">{calculateTotalPrice(tokenAmount[0])} PLN</span>
                        </div>
                      </CardContent>
                      
                      <CardFooter className="flex flex-col gap-3 pt-0">
                        <div className="bg-gray-50 p-3 rounded-md border border-gray-100 w-full">
                          <h4 className="text-sm font-medium mb-2 flex items-center">
                            <CreditCardIcon className="h-4 w-4 mr-1 text-gray-500" />
                            Informacje o płatności
                          </h4>
                          <p className="text-xs text-gray-500 mb-3">
                            Po kliknięciu przycisku "Zapłać i kontynuuj" zostaniesz przekierowany do bezpiecznej strony płatności Stripe.
                          </p>
                          <div className="flex items-center space-x-1 text-xs text-gray-600">
                            <Lock className="h-3 w-3" />
                            <span>Bezpieczna płatność przez Stripe</span>
                          </div>
                        </div>
                      </CardFooter>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </div>
        </RadioGroup>
        
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-600 mt-8">
          <p className="flex items-center">
            <RefreshCcw size={18} className="mr-2 text-gray-400" />
            Możesz w każdej chwili zmienić rodzaj płatności w ustawieniach swojego konta.
          </p>
        </div>
      </div>
      
      <div className="mt-8 flex flex-col space-y-4">
        <div className="flex space-x-3">
          <Button 
            variant="outline"
            onClick={onPrevious}
            className="w-1/3 px-5"
            disabled={paymentLoading || paymentSuccess}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Wstecz
          </Button>
          
          <Button 
            onClick={onNext}
            className="w-2/3 px-5 bg-primary hover:bg-primary/90"
            disabled={paymentLoading || paymentSuccess}
          >
            {paymentLoading ? (
              <span className="flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                Przetwarzanie płatności...
              </span>
            ) : (
              <>
                Zapłać i kontynuuj <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

        <Button 
          variant="secondary"
          onClick={handleDirectNextStep}
          className="w-full px-5"
          disabled={paymentLoading || paymentSuccess}
        >
          Przejdź do następnego kroku 
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PaymentStep;
