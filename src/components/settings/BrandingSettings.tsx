
import React, { useState } from 'react';
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
  Separator
} from '@/components/ui';
import { toast } from '@/hooks/use-toast';
import { Upload } from 'lucide-react';

const formSchema = z.object({
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Podaj poprawny kolor w formacie HEX.",
  }),
  secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Podaj poprawny kolor w formacie HEX.",
  }).optional(),
  accentColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message: "Podaj poprawny kolor w formacie HEX.",
  }).optional(),
  careerPageTitle: z.string().min(2, {
    message: "Tytuł musi zawierać co najmniej 2 znaki.",
  }),
  careerPageDescription: z.string().max(1000, {
    message: "Opis nie może przekraczać 1000 znaków.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const BrandingSettings = () => {
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("/placeholder.svg");
  
  const defaultValues: Partial<FormValues> = {
    primaryColor: "#1a56db",
    secondaryColor: "#4338ca",
    accentColor: "#818cf8",
    careerPageTitle: "Dołącz do naszego zespołu",
    careerPageDescription: "Szukamy utalentowanych osób, które pomogą nam zmieniać świat.",
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = (data: FormValues) => {
    console.log(data, { logo });
    // Save data to server
    toast({
      title: "Zapisano ustawienia brandingu",
      description: "Zmiany zostały zapisane pomyślnie.",
    });
  };

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Branding</h2>
        <p className="text-sm text-muted-foreground">
          Dostosuj wygląd i styl Twojej marki w systemie.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Logo firmy</CardTitle>
              <CardDescription>
                Twoje logo będzie wyświetlane w aplikacji i w wiadomościach do kandydatów.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col space-y-4">
                <div className="flex items-center gap-4">
                  <div className="h-24 w-24 rounded-md border flex items-center justify-center bg-background overflow-hidden">
                    <img 
                      src={logoPreview} 
                      alt="Logo firmy" 
                      className="h-full w-full object-contain" 
                    />
                  </div>
                  <div className="flex-1">
                    <label 
                      htmlFor="logo-upload" 
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Prześlij logo
                      <input 
                        type="file" 
                        id="logo-upload" 
                        accept="image/*" 
                        className="sr-only" 
                        onChange={handleLogoChange}
                      />
                    </label>
                    <p className="text-sm text-muted-foreground mt-2">
                      Zalecany rozmiar: 512x512px, format: PNG, SVG lub JPG.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kolory</CardTitle>
              <CardDescription>
                Dostosuj schemat kolorów do swojej marki.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="primaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kolor podstawowy</FormLabel>
                      <div className="flex gap-2">
                        <div 
                          className="h-10 w-10 rounded-md border"
                          style={{ backgroundColor: field.value }}
                        />
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="secondaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kolor pomocniczy</FormLabel>
                      <div className="flex gap-2">
                        <div 
                          className="h-10 w-10 rounded-md border"
                          style={{ backgroundColor: field.value }}
                        />
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="accentColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kolor akcentujący</FormLabel>
                      <div className="flex gap-2">
                        <div 
                          className="h-10 w-10 rounded-md border"
                          style={{ backgroundColor: field.value }}
                        />
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Strona kariery</CardTitle>
              <CardDescription>
                Dostosuj wygląd Twojej publicznej strony z ofertami pracy.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="careerPageTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tytuł strony</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="careerPageDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opis strony</FormLabel>
                    <FormControl>
                      <textarea 
                        className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Ten tekst będzie wyświetlany na stronie kariery Twojej firmy.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div>
                <Separator className="my-4" />
                <h3 className="text-sm font-medium mb-2">Podgląd</h3>
                <div className="border rounded-md p-6 bg-background">
                  <div className="mb-4">
                    <img 
                      src={logoPreview} 
                      alt="Logo firmy" 
                      className="h-12 w-auto" 
                    />
                  </div>
                  <h1 className="text-2xl font-bold mb-2" style={{ color: form.watch('primaryColor') }}>
                    {form.watch('careerPageTitle')}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {form.watch('careerPageDescription')}
                  </p>
                </div>
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

export default BrandingSettings;
