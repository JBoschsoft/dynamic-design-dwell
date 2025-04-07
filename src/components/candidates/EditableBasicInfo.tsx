
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Candidate } from './types';
import { Pen, Save, X } from 'lucide-react';
import { formatDate } from './utils';

interface EditableBasicInfoProps {
  candidate: Candidate;
  onUpdate: (updatedData: Partial<Candidate>) => void;
}

const EditableBasicInfo: React.FC<EditableBasicInfoProps> = ({ candidate, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    email: candidate.email,
    phone: candidate.phone,
    stage: candidate.stage,
    source: candidate.source,
    // The date will be handled differently since it requires a date picker
  });
  
  const handleInputChange = (field: string, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSave = () => {
    onUpdate(editData);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditData({
      email: candidate.email,
      phone: candidate.phone,
      stage: candidate.stage,
      source: candidate.source,
    });
    setIsEditing(false);
  };
  
  const stageOptions = ['Nowy', 'Screening', 'Wywiad', 'Oferta', 'Zatrudniony', 'Odrzucony'];
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Informacje podstawowe</h3>
        {isEditing ? (
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              <X className="h-4 w-4 mr-1" /> Anuluj
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" /> Zapisz
            </Button>
          </div>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
            <Pen className="h-4 w-4 mr-1" /> Edytuj
          </Button>
        )}
      </div>
      
      <div>
        <p className="text-sm text-muted-foreground">Email</p>
        {isEditing ? (
          <Input 
            value={editData.email} 
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="mt-1"
          />
        ) : (
          <p>{candidate.email}</p>
        )}
      </div>
      
      <div>
        <p className="text-sm text-muted-foreground">Telefon</p>
        {isEditing ? (
          <Input 
            value={editData.phone} 
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="mt-1"
          />
        ) : (
          <p>{candidate.phone}</p>
        )}
      </div>
      
      <div>
        <p className="text-sm text-muted-foreground">Status</p>
        {isEditing ? (
          <Select 
            value={editData.stage} 
            onValueChange={(value) => handleInputChange('stage', value as Candidate['stage'])}
          >
            <SelectTrigger className="mt-1 w-full">
              <SelectValue placeholder="Wybierz status" />
            </SelectTrigger>
            <SelectContent>
              {stageOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1
            ${candidate.stage === 'Nowy' ? 'bg-blue-100 text-blue-800' : ''}
            ${candidate.stage === 'Screening' ? 'bg-purple-100 text-purple-800' : ''}
            ${candidate.stage === 'Wywiad' ? 'bg-amber-100 text-amber-800' : ''}
            ${candidate.stage === 'Oferta' ? 'bg-green-100 text-green-800' : ''}
            ${candidate.stage === 'Zatrudniony' ? 'bg-emerald-100 text-emerald-800' : ''}
            ${candidate.stage === 'Odrzucony' ? 'bg-red-100 text-red-800' : ''}
          `}>
            {candidate.stage}
          </div>
        )}
      </div>
      
      <div>
        <p className="text-sm text-muted-foreground">Źródło</p>
        {isEditing ? (
          <Input 
            value={editData.source} 
            onChange={(e) => handleInputChange('source', e.target.value)}
            className="mt-1"
          />
        ) : (
          <p>{candidate.source}</p>
        )}
      </div>
      
      <div>
        <p className="text-sm text-muted-foreground">Data aplikacji</p>
        <p>{formatDate(candidate.appliedAt)}</p>
        {/* Note: Date editing is omitted for simplicity. In a real application, you would use a date picker here */}
      </div>
    </div>
  );
};

export default EditableBasicInfo;
