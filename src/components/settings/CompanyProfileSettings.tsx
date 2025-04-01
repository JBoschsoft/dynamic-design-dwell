
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  Form,
  FormControl,
  FormDescription,
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
  Textarea
} from '@/components/ui';
import { toast } from '@/hooks/use-toast';

const formSchema = z.object({
  companyName: z.string().min(2, {
    message: "Nazwa firmy musi zawierać co najmniej 2 znaki.",
  }),
  industry: z.string().min(1, {
    message: "Wybierz branżę.",
  }),
  size: z.string().min(1, {
    message: "Wybierz rozmiar firmy.",
  }),
  website: z.string().url({
    message: "Podaj poprawny adres URL.",
  }).optional().or(z.literal('')),
  description: z.string().max(500, {
    message: "Opis nie może przekraczać 500 znaków.",
  }).optional(),
  email: z.string().email({
    message: "Podaj poprawny adres email.",
  }),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CompanyProfileSettings = () => {
  // Default values from onboarding or previous settings
  const defaultValues: Partial<FormValues> = {
    companyName: "Acme Inc.",
    industry: "technology",
    size: "11-50",
    website: "https://example.com",
    description: "Opis firmy.",
    email: "kontakt@example.com",
    phone: "+48 123 456 789",
    address: "ul. Przykładowa 1",
    city: "Warszawa",
    postalCode: "00-001",
    country: "Polska",
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = (data: FormValues) => {
    console.log(data);
    // Save data to server
    toast({
      title: "Zapisano zmiany",
      description: "Informacje o firmie zostały zaktualizowane.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Profil firmy</h2>
        <p className="text-sm text-muted-foreground">
          Zaktualizuj informacje o Twojej firmie.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Podstawowe informacje</CardTitle>
              <CardDescription>
                Te informacje są widoczne dla użytkowników i kandydatów.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nazwa firmy</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Branża</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wybierz branżę" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="technology">Technologia</SelectItem>
                          <SelectItem value="finance">Finanse</SelectItem>
                          <SelectItem value="healthcare">Ochrona zdrowia</SelectItem>
                          <SelectItem value="education">Edukacja</SelectItem>
                          <SelectItem value="retail">Handel detaliczny</SelectItem>
                          <SelectItem value="manufacturing">Produkcja</SelectItem>
                          <SelectItem value="other">Inna</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rozmiar firmy</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Wybierz rozmiar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1-10">1-10 pracowników</SelectItem>
                          <SelectItem value="11-50">11-50 pracowników</SelectItem>
                          <SelectItem value="51-200">51-200 pracowników</SelectItem>
                          <SelectItem value="201-500">201-500 pracowników</SelectItem>
                          <SelectItem value="501-1000">501-1000 pracowników</SelectItem>
                          <SelectItem value="1000+">Ponad 1000 pracowników</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Strona internetowa</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opis firmy</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Krótki opis Twojej firmy..."
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormDescription>
                      Maks. 500 znaków. Opis będzie widoczny na stronie kariery.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dane kontaktowe</CardTitle>
              <CardDescription>
                Informacje kontaktowe Twojej firmy.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email kontaktowy</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
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
                    <FormLabel>Telefon</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Adres</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Miasto</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kod pocztowy</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kraj</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button type="submit">Zapisz zmiany</Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
};

export default CompanyProfileSettings;
