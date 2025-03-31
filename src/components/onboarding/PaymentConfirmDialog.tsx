
import React from 'react';
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, 
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui";

interface PaymentConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const PaymentConfirmDialog: React.FC<PaymentConfirmDialogProps> = ({
  open,
  onOpenChange,
  onConfirm
}) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Potwierdzenie jednorazowej płatności</AlertDialogTitle>
          <AlertDialogDescription>
            Wybierasz opcję jednorazowego zakupu tokenów. Czy na pewno nie chcesz włączyć automatycznych płatności, 
            które doładują konto, gdy liczba tokenów spadnie poniżej 10?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>
            Nie, chcę zmienić wybór
          </AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Tak, kontynuuj z jednorazową płatnością
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PaymentConfirmDialog;
