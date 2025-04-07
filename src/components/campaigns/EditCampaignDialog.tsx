
import React, { useState } from 'react';
import { Campaign } from './types';
import { CalendarIcon, Save, X, Plus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface EditCampaignDialogProps {
  campaign: Campaign;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedCampaign: Campaign) => void;
}

const EditCampaignDialog: React.FC<EditCampaignDialogProps> = ({
  campaign,
  isOpen,
  onClose,
  onSave,
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    ...campaign,
    startDate: campaign.startDate ? campaign.startDate : new Date().toISOString(),
    endDate: campaign.endDate ? campaign.endDate : null,
  });
  
  const [requirements, setRequirements] = useState<string[]>(
    campaign.requirements || []
  );
  
  const [responsibilities, setResponsibilities] = useState<string[]>(
    campaign.responsibilities || []
  );

  // Convert ISO strings to Date objects for the datepicker
  const startDate = parseISO(formData.startDate);
  const endDate = formData.endDate ? parseISO(formData.endDate) : null;

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEndDateChange = (date: Date | undefined) => {
    setFormData((prev) => ({
      ...prev,
      endDate: date ? date.toISOString() : null,
    }));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty requirements and responsibilities
    const filteredRequirements = requirements.filter(req => req.trim() !== '');
    const filteredResponsibilities = responsibilities.filter(resp => resp.trim() !== '');

    // If end date is selected, check that it's valid
    if (formData.endDate) {
      const endDateObj = parseISO(formData.endDate);
      const startDateObj = parseISO(formData.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (endDateObj < startDateObj) {
        toast({
          title: "Błędna data zakończenia",
          description: "Data zakończenia nie może być wcześniejsza niż data rozpoczęcia",
          variant: "destructive"
        });
        return;
      }
    }
    
    const updatedCampaign = {
      ...formData,
      requirements: filteredRequirements,
      responsibilities: filteredResponsibilities,
      updatedAt: new Date().toISOString(),
    };
    
    onSave(updatedCampaign);
    toast({
      title: "Zapisano zmiany",
      description: "Kampania została zaktualizowana pomyślnie",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edytuj kampanię</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium">Stanowisko</label>
              <Input 
                value={formData.position} 
                onChange={(e) => handleChange('position', e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Dział</label>
              <Input 
                value={formData.department} 
                onChange={(e) => handleChange('department', e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Lokalizacja</label>
              <Input 
                value={formData.location} 
                onChange={(e) => handleChange('location', e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select 
                value={formData.status}
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Wybierz status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Szkic</SelectItem>
                  <SelectItem value="active">Aktywna</SelectItem>
                  <SelectItem value="paused">Wstrzymana</SelectItem>
                  <SelectItem value="closed">Zakończona</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Data rozpoczęcia (nieedytowalny)</label>
              <Input 
                value={format(startDate, 'dd.MM.yyyy', { locale: pl })}
                disabled={true}
                className="mt-1 bg-gray-100"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Data zakończenia</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal mt-1",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    {endDate ? (
                      format(endDate, "PPP", { locale: pl })
                    ) : (
                      <span>Wybierz datę (opcjonalnie)</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate || undefined}
                    onSelect={handleEndDateChange}
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today || date < startDate;
                    }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <label className="text-sm font-medium">Hiring Manager</label>
              <Input 
                value={formData.owner || ''} 
                onChange={(e) => handleChange('owner', e.target.value)}
                className="mt-1"
                placeholder="Imię i nazwisko menedżera"
              />
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <label className="text-sm font-medium">Hiring Manager Email</label>
              <Input 
                value={formData.ownerEmail || ''} 
                onChange={(e) => handleChange('ownerEmail', e.target.value)}
                type="email"
                className="mt-1"
                placeholder="adres@email.com"
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium">Opis stanowiska</label>
            <Textarea 
              value={formData.description} 
              onChange={(e) => handleChange('description', e.target.value)}
              className="mt-1 min-h-[100px]"
            />
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Wymagania</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addRequirement}
              >
                <Plus className="h-4 w-4 mr-2" />
                Dodaj wymaganie
              </Button>
            </div>
            <div className="space-y-2">
              {requirements.map((req, index) => (
                <div key={index} className="flex gap-2">
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
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Obowiązki</label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addResponsibility}
              >
                <Plus className="h-4 w-4 mr-2" />
                Dodaj obowiązek
              </Button>
            </div>
            <div className="space-y-2">
              {responsibilities.map((resp, index) => (
                <div key={index} className="flex gap-2">
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
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Anuluj
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              Zapisz zmiany
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditCampaignDialog;
