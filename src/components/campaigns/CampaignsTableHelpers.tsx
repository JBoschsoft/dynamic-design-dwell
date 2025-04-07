
import React from 'react';
import { format, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';
import { Checkbox } from '@/components/ui';

export const formatDate = (dateString: string | null) => {
  if (!dateString) return '–';
  return format(parseISO(dateString), 'd MMM yyyy', { locale: pl });
};

interface SelectAllCheckboxProps {
  checked: boolean;
  indeterminate: boolean;
  onChange: (checked: boolean) => void;
  indeterminateClass: string;
}

export const SelectAllCheckbox: React.FC<SelectAllCheckboxProps> = ({ 
  checked, 
  indeterminate, 
  onChange, 
  indeterminateClass 
}) => {
  return (
    <Checkbox 
      checked={checked}
      onCheckedChange={onChange}
      aria-label="Zaznacz wszystkie kampanie"
      data-state={indeterminate ? "indeterminate" : checked ? "checked" : "unchecked"}
      className={indeterminateClass}
    />
  );
};

interface CampaignCheckboxProps {
  campaignId: string;
  isSelected: boolean;
  onSelectionChange: (id: string, checked: boolean) => void;
}

export const CampaignCheckbox: React.FC<CampaignCheckboxProps> = ({ 
  campaignId, 
  isSelected, 
  onSelectionChange 
}) => {
  return (
    <Checkbox 
      checked={isSelected}
      onCheckedChange={(checked) => onSelectionChange(campaignId, !!checked)}
      aria-label={`Zaznacz kampanię ${campaignId}`}
    />
  );
};
