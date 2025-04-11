
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Alert, AlertTitle, AlertDescription,
  Card, CardHeader, CardContent, CardTitle, CardDescription,
  CheckCircle2, ArrowRight, Info, ShieldCheck
} from "@/components/ui";

interface SuccessStepProps {
  paymentType: 'one-time' | 'auto-recharge';
  tokenAmount: number[];
  autoRechargeAmount: number[];
  onNext: () => void;
}

const SuccessStep: React.FC<SuccessStepProps> = ({
  paymentType,
  tokenAmount,
  autoRechargeAmount,
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
  
  const amount = paymentType === 'one-time' ? tokenAmount[0] : autoRechargeAmount[0];
  const totalPrice = calculateTotalPrice(amount);
  
  const handleNextStep = () => {
    onNext();
  };
  
  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md w-full max-w-2xl">
      <div className="flex items-center justify-center mb-6">
        <div className="bg-green-100 p-3 rounded-full">
          <CheckCircle2 className="h-6 w-6 text-green-500" />
        </div>
      </div>
      
      <h2 className="text-2xl font-bold text-center mb-2">
        Płatność zrealizowana pomyślnie!
      </h2>
      
      <p className="text-gray-600 text-center mb-6">
        Twoje konto zostało pomyślnie skonfigurowane i doładowane tokenami.
      </p>
      
      <Alert className="bg-blue-50 border-blue-200 mb-6">
        <Info className="h-4 w-4 text-blue-500" />
        <AlertTitle className="text-blue-700 font-medium">Konfiguracja konta zakończona</AlertTitle>
        <AlertDescription className="text-blue-700">
          Twoje konto zostało pomyślnie skonfigurowane i doładowane tokenami. Możesz teraz korzystać z pełnej funkcjonalności platformy.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-6">
        <Card className="border-primary/20 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Podsumowanie</CardTitle>
            <CardDescription>
              Szczegóły Twojej transakcji
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
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
        
        <Alert className="bg-green-50 border-green-200">
          <ShieldCheck className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-700 font-medium">Zostałeś dodany jako Administrator</AlertTitle>
          <AlertDescription className="text-green-700">
            Twoje konto zostało ustawione jako Administrator Przestrzeni Roboczej. Masz pełne uprawnienia do zarządzania zespołem i ustawieniami.
          </AlertDescription>
        </Alert>
        
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-center text-sm text-gray-600">
            Dziękujemy za dokonanie płatności. Teraz możesz przejść do kolejnego kroku konfiguracji.
          </p>
        </div>
      </div>
      
      <div className="mt-8">
        <Button onClick={handleNextStep} className="w-full bg-primary hover:bg-primary/90">
          Przejdź do następnego kroku <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default SuccessStep;
