
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface EditableFieldProps {
  label: string;
  value: string;
  isEditing: boolean;
  onChange?: (value: string) => void;
  type?: 'text' | 'select';
  options?: string[];
  className?: string;
  readOnlyComponent?: React.ReactNode;
}

const EditableField: React.FC<EditableFieldProps> = ({ 
  label, 
  value, 
  isEditing, 
  onChange, 
  type = 'text',
  options = [],
  className = '',
  readOnlyComponent
}) => {
  return (
    <div className={className}>
      <p className="text-sm text-muted-foreground">{label}</p>
      {isEditing ? (
        type === 'text' ? (
          <Input 
            value={value} 
            onChange={(e) => onChange?.(e.target.value)}
            className="mt-1"
          />
        ) : (
          <Select 
            value={value} 
            onValueChange={(value) => onChange?.(value)}
          >
            <SelectTrigger className="mt-1 w-full">
              <SelectValue placeholder={`Wybierz ${label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      ) : (
        readOnlyComponent || <p>{value}</p>
      )}
    </div>
  );
};

export default EditableField;
