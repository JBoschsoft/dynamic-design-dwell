
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

interface AdBlockerWarningProps {
  isVisible: boolean;
}

const AdBlockerWarning: React.FC<AdBlockerWarningProps> = ({ isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Problem z płatnościami</AlertTitle>
      <AlertDescription>
        <p>
          Wykryto blokadę zasobów Stripe. Rozwiązania:
        </p>
        <ul className="list-disc pl-5 mt-2 text-sm">
          <li>Wyłącz bloker reklam (AdBlock, uBlock, etc.)</li>
          <li>Dodaj tę stronę do wyjątków w blokadzie</li>
          <li>Użyj innej przeglądarki</li>
        </ul>
        <p className="text-xs mt-2">
          Bez dostępu do zasobów Stripe nie będzie możliwe przeprowadzenie płatności.
        </p>
      </AlertDescription>
    </Alert>
  );
};

export default AdBlockerWarning;
