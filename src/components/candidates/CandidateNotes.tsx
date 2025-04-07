
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, Button } from '@/components/ui';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { Pen } from 'lucide-react';
import { formatDate } from './utils';

interface NoteEntry {
  id: string;
  text: string;
  createdAt: Date;
  createdBy: string;
}

interface CandidateNotesProps {
  notes: NoteEntry[];
  onAddNote: (note: string) => void;
}

const CandidateNotes: React.FC<CandidateNotesProps> = ({ notes, onAddNote }) => {
  const [isAddingNote, setIsAddingNote] = useState(false);
  
  const form = useForm<{ noteText: string }>({
    defaultValues: {
      noteText: ''
    }
  });
  
  const handleAddNote = (data: { noteText: string }) => {
    if (data.noteText.trim()) {
      onAddNote(data.noteText);
      setIsAddingNote(false);
      form.reset();
    }
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Notatki</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => setIsAddingNote(true)}
        >
          <Pen className="h-4 w-4" />
          <span>Dodaj notatkę</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {isAddingNote && (
          <div className="mb-6 border rounded-md p-4 bg-muted/30">
            <form onSubmit={form.handleSubmit(handleAddNote)}>
              <div className="mb-3">
                <Textarea
                  placeholder="Wpisz notatkę..."
                  className="w-full min-h-[100px]"
                  {...form.register('noteText')}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setIsAddingNote(false);
                    form.reset();
                  }}
                >
                  Anuluj
                </Button>
                <Button type="submit" size="sm">
                  Zapisz
                </Button>
              </div>
            </form>
          </div>
        )}
        
        {notes.length > 0 ? (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="border rounded-md p-4">
                <p className="whitespace-pre-wrap mb-3">{note.text}</p>
                <div className="text-xs text-muted-foreground flex justify-between">
                  <span>{note.createdBy}</span>
                  <span>{formatDate(note.createdAt)} {note.createdAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground italic">Brak notatek</p>
        )}
      </CardContent>
    </Card>
  );
};

export default CandidateNotes;
