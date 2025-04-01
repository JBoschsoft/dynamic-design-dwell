
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CandidateFormProps, CandidateFormValues } from "./types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui";
import { useNavigate } from "react-router-dom";

const candidateFormSchema = z.object({
  firstName: z.string().min(2, { message: "Imię jest wymagane" }),
  lastName: z.string().min(2, { message: "Nazwisko jest wymagane" }),
  email: z.string().email({ message: "Nieprawidłowy adres email" }),
  phone: z.string().min(9, { message: "Numer telefonu jest wymagany" }),
  stage: z.enum(["Nowy", "Screening", "Wywiad", "Oferta", "Zatrudniony", "Odrzucony"]),
});

const CandidateForm: React.FC<CandidateFormProps> = ({ onSubmit, isOpen, onClose }) => {
  const navigate = useNavigate();
  
  const form = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      stage: "Nowy",
    },
  });

  const handleSubmit = (values: CandidateFormValues) => {
    // Since we're using firstName and lastName separately in the form,
    // but the API might expect a combined name, we'll handle that here
    const newCandidate = {
      ...values,
      source: "Manual", // Default source
      appliedAt: new Date(),
    };
    
    onSubmit(newCandidate);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dodaj nowego kandydata</DialogTitle>
          <DialogDescription>
            Wprowadź podstawowe informacje o kandydacie. Dodatkowe dane można uzupełnić później na stronie profilu.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imię*</FormLabel>
                    <FormControl>
                      <Input placeholder="Jan" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nazwisko*</FormLabel>
                    <FormControl>
                      <Input placeholder="Kowalski" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email*</FormLabel>
                    <FormControl>
                      <Input placeholder="jan.kowalski@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon*</FormLabel>
                    <FormControl>
                      <Input placeholder="+48 123 456 789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="stage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wybierz status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Nowy">Nowy</SelectItem>
                        <SelectItem value="Screening">Screening</SelectItem>
                        <SelectItem value="Wywiad">Wywiad</SelectItem>
                        <SelectItem value="Oferta">Oferta</SelectItem>
                        <SelectItem value="Zatrudniony">Zatrudniony</SelectItem>
                        <SelectItem value="Odrzucony">Odrzucony</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={onClose}>
                Anuluj
              </Button>
              <Button type="submit">Dodaj kandydata</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CandidateForm;
