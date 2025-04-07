
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Candidate } from './types';
import { Pen, Save, X } from 'lucide-react';
import { formatDate } from './utils';
import EditableField from './EditableField';

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
        <EditButtonGroup 
          isEditing={isEditing} 
          onCancel={handleCancel} 
          onSave={handleSave}
          onEdit={() => setIsEditing(true)}
        />
      </div>
      
      <EditableField
        label="Email"
        value={editData.email}
        isEditing={isEditing}
        onChange={(value) => handleInputChange('email', value)}
      />
      
      <EditableField
        label="Telefon"
        value={editData.phone}
        isEditing={isEditing}
        onChange={(value) => handleInputChange('phone', value)}
      />
      
      <EditableField
        label="Status"
        value={editData.stage}
        isEditing={isEditing}
        onChange={(value) => handleInputChange('stage', value as Candidate['stage'])}
        type="select"
        options={stageOptions}
        readOnlyComponent={
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
        }
      />
      
      <EditableField
        label="Źródło"
        value={editData.source}
        isEditing={isEditing}
        onChange={(value) => handleInputChange('source', value)}
      />
      
      <div>
        <p className="text-sm text-muted-foreground">Data aplikacji</p>
        <p>{formatDate(candidate.appliedAt)}</p>
      </div>
    </div>
  );
};

interface EditButtonGroupProps {
  isEditing: boolean;
  onCancel: () => void;
  onSave: () => void;
  onEdit: () => void;
}

const EditButtonGroup: React.FC<EditButtonGroupProps> = ({ 
  isEditing, 
  onCancel, 
  onSave, 
  onEdit 
}) => {
  return isEditing ? (
    <div className="flex gap-2">
      <Button size="sm" variant="ghost" onClick={onCancel}>
        <X className="h-4 w-4 mr-1" /> Anuluj
      </Button>
      <Button size="sm" onClick={onSave}>
        <Save className="h-4 w-4 mr-1" /> Zapisz
      </Button>
    </div>
  ) : (
    <Button size="sm" variant="ghost" onClick={onEdit}>
      <Pen className="h-4 w-4 mr-1" /> Edytuj
    </Button>
  );
};

export default EditableBasicInfo;
