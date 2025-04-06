import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CampaignFormValues } from './types';
import { DialogFooter } from '@/components/ui';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Button,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { CalendarIcon, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { mockCampaigns } from './mockData';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Nazwa kampanii musi mieć min. 3 znaki' }),
  position: z.string().min(2, { message: 'Stanowisko jest wymagane' }),
  department: z.string().min(2, { message: 'Dział jest wymagany' }),
  location: z.string().min(2, { message: 'Lokalizacja jest wymagana' }),
  startDate: z.date({ required_error: 'Data rozpoczęcia jest wymagana' }),
  endDate: z.date().optional().nullable(),
  status: z.enum(['active', 'draft', 'closed', 'paused']),
  description: z.string().min(10, { message: 'Opis musi mieć min. 10 znaków' }),
});

interface CampaignFormProps {
  initialData?: Partial<CampaignFormValues>;
  onSubmit: (campaignId: string) => void;
  onCancel: () => void;
}

const CampaignForm: React.FC<CampaignFormProps> = ({ 
  initialData, 
  onSubmit,
  onCancel
}) => {
  const [requirements, setRequirements] = useState<string[]>(
    initialData?.requirements || ['']
  );
  
  const [responsibilities, setResponsibilities] = useState<string[]>(
    initialData?.responsibilities || ['']
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      position: initialData?.position || '',
      department: initialData?.department || '',
      location: initialData?.location || '',
      startDate: initialData?.startDate || new Date(),
      endDate: initialData?.endDate || null,
      status: initialData?.status || 'draft',
      description: initialData?.description || '',
    },
  });

  const handleFormSubmit = (values: z.infer<typeof formSchema>) => {
    const formData = {
      ...values,
      requirements: requirements.filter(req => req.trim() !== ''),
      responsibilities: responsibilities.filter(resp => resp.trim() !== ''),
    };
    
    console.log('Form submitted with values:', formData);
    
    // Create a new campaign object
    const campaignId = `campaign-${Date.now()}`;
    const newCampaign = {
      id: campaignId,
      name: formData.name,
      position: formData.position,
      department: formData.department,
      location: formData.location,
      startDate: formData.startDate.toISOString(),
      endDate: formData.endDate ? formData.endDate.toISOString() : null,
      status: formData.status,
      description: formData.description,
      requirements: formData.requirements,
      responsibilities: formData.responsibilities,
      candidatesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add the new campaign to the mockCampaigns array
    mockCampaigns.unshift(newCampaign);
    
    onSubmit(campaignId);
  };

  // Handle requirements fields
  const addRequirement = () => {
    setRequirements([...requirements, '']);
  };

  const removeRequirement = (index: number) => {
    const newRequirements = [...requirements];
    newRequirements.splice(index, 1);
    setRequirements(newRequirements);
  };

  const updateRequirement = (index: number, value: string) => {
    const newRequirements = [...requirements];
    newRequirements[index] = value;
    setRequirements(newRequirements);
  };

  // Handle responsibilities fields
  const addResponsibility = () => {
    setResponsibilities([...responsibilities, '']);
  };

  const removeResponsibility = (index: number) => {
    const newResponsibilities = [...responsibilities];
    newResponsibilities.splice(index, 1);
    setResponsibilities(newResponsibilities);
  };

  const updateResponsibility = (index: number, value: string) => {
    const newResponsibilities = [...responsibilities];
    newResponsibilities[index] = value;
    setResponsibilities(newResponsibilities);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nazwa kampanii *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="np. Frontend Developer 2024" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stanowisko *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="np. Senior Frontend Developer" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dział *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="np. Inżynieria" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lokalizacja *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="np. Warszawa, Remote" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data rozpoczęcia *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: pl })
                        ) : (
                          <span>Wybierz datę</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data zakończenia</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP", { locale: pl })
                        ) : (
                          <span>Wybierz datę (opcjonalnie)</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value || undefined}
                      onSelect={field.onChange}
                      disabled={(date) => {
                        const startDate = form.getValues("startDate");
                        return startDate ? date < startDate : false;
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status *</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Wybierz status kampanii" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="draft">Szkic</SelectItem>
                    <SelectItem value="active">Aktywna</SelectItem>
                    <SelectItem value="paused">Wstrzymana</SelectItem>
                    <SelectItem value="closed">Zakończona</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Opis stanowiska *</FormLabel>
              <FormControl>
                <Textarea 
                  {...field} 
                  placeholder="Opisz stanowisko, zakres obowiązków, wymagania..." 
                  className="min-h-[100px]" 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div>
          <FormLabel>Wymagania</FormLabel>
          <div className="space-y-2 mt-2">
            {requirements.map((req, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={req}
                  onChange={(e) => updateRequirement(index, e.target.value)}
                  placeholder="np. Min. 3 lata doświadczenia w React"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeRequirement(index)}
                  disabled={requirements.length === 1 && index === 0}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRequirement}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Dodaj wymaganie
            </Button>
          </div>
        </div>
        
        <div>
          <FormLabel>Obowiązki</FormLabel>
          <div className="space-y-2 mt-2">
            {responsibilities.map((resp, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={resp}
                  onChange={(e) => updateResponsibility(index, e.target.value)}
                  placeholder="np. Rozwój aplikacji frontendowej"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeResponsibility(index)}
                  disabled={responsibilities.length === 1 && index === 0}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addResponsibility}
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Dodaj obowiązek
            </Button>
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>
            Anuluj
          </Button>
          <Button type="submit">Zapisz kampanię</Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default CampaignForm;
