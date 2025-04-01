
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
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center">Potwierdzenie jednorazowej płatności</AlertDialogTitle>
          <AlertDialogDescription className="text-center px-4">
            Wybierasz opcję jednorazowego zakupu tokenów. Czy chcesz włączyć automatyczne płatności?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:justify-center sm:gap-4">
          <AlertDialogCancel className="mt-0 w-full sm:w-auto">
            Nie, chcę zmienić wybór
          </AlertDialogCancel>
          <AlertDialogAction className="w-full sm:w-auto" onClick={onConfirm}>
            Tak, kontynuuj z jednorazową płatnością
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PaymentConfirmDialog;
