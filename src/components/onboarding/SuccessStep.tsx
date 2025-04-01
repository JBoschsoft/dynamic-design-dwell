
import React from 'react';
import { 
  Button, 
  Alert, AlertTitle, AlertDescription,
  Card, CardHeader, CardContent, CardTitle,
  CheckCircle2, ArrowRight, Info
} from "@/components/ui";
import { useNavigate } from 'react-router-dom';

interface SuccessStepProps {
  paymentType: 'one-time' | 'subscription';
  tokenAmount: number[];
  subscriptionAmount: number[];
  onNext: () => void;
}

const SuccessStep: React.FC<SuccessStepProps> = ({
  paymentType,
  tokenAmount,
  subscriptionAmount,
  onNext
}) => {
  const navigate = useNavigate();
  
  const calculateTokenPrice = (quantity: number) => {
    if (quantity >= 150) return 5;
    if (quantity >= 100) return 6;
    if (quantity >= 50) return 7;
    return 8;
  };
  
  const calculateTotalPrice = (amount: number) => {
    const tokenPrice = calculateTokenPrice(amount);
    return amount * tokenPrice;
  };
  
  const amount = paymentType === 'one-time' ? tokenAmount[0] : subscriptionAmount[0];
  const totalPrice = calculateTotalPrice(amount);
  
  return (
    <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-2xl">
      <div className="flex items-center justify-center mb-6">
        <div className="rounded-full bg-green-100 p-3">
          <CheckCircle2 className="h-8 w-8 text-green-500" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-center mb-6">
        Płatność zrealizowana pomyślnie!
      </h2>
      
      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertTitle>Konfiguracja konta zakończona</AlertTitle>
        <AlertDescription>
          Twoje konto zostało pomyślnie skonfigurowane i doładowane tokenami. Możesz teraz korzystać z pełnej funkcjonalności platformy.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Podsumowanie</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Typ płatności:</span>
              <span className="font-medium">{paymentType === 'one-time' ? 'Jednorazowa' : 'Automatyczna'}</span>
            </div>
            <div className="flex justify-between">
              <span>Zakupione tokeny:</span>
              <span className="font-medium">{amount}</span>
            </div>
            <div className="flex justify-between">
              <span>Kwota płatności:</span>
              <span className="font-medium">{totalPrice} PLN</span>
            </div>
          </CardContent>
        </Card>
        
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-center text-sm text-gray-600">
            Dziękujemy za dokonanie płatności. Teraz możesz przejść do korzystania z platformy.
          </p>
        </div>
      </div>
      
      <div className="mt-8">
        <Button onClick={onNext} className="w-full">
          Przejdź do panelu głównego <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SuccessStep;
