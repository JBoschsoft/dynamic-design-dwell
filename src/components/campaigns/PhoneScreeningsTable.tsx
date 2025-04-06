
import React from 'react';
import { 
  Badge, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow,
  Button
} from '@/components/ui';
import { Phone, Users } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';

interface PhoneScreening {
  id: string;
  candidateId: string;
  candidateName: string;
  date: string;
  duration: number;
  result: string;
  notes: string;
  skills: string[];
  interviewer: string;
}

interface PhoneScreeningsTableProps {
  phoneScreenings: PhoneScreening[];
  onScheduleScreening: () => void;
}

const PhoneScreeningsTable: React.FC<PhoneScreeningsTableProps> = ({ 
  phoneScreenings,
  onScheduleScreening 
}) => {
  const formatDateTime = (dateString: string) => {
    return format(parseISO(dateString), 'd MMMM yyyy, HH:mm', { locale: pl });
  };

  const getScreeningResultBadge = (result: string) => {
    switch(result) {
      case 'positive':
        return <Badge className="bg-green-500">Pozytywny</Badge>;
      case 'negative':
        return <Badge variant="destructive">Negatywny</Badge>;
      case 'neutral':
        return <Badge variant="secondary">Neutralny</Badge>;
      default:
        return <Badge variant="outline">{result}</Badge>;
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Rozmowy telefoniczne</h3>
        <Button variant="outline" onClick={onScheduleScreening}>
          <Phone className="mr-2 h-4 w-4" />
          Zaplanuj rozmowę
        </Button>
      </div>
      
      {phoneScreenings.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kandydat</TableHead>
                <TableHead>Data i godzina</TableHead>
                <TableHead>Czas trwania (min)</TableHead>
                <TableHead>Wynik</TableHead>
                <TableHead>Rekruter</TableHead>
                <TableHead>Umiejętności</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {phoneScreenings.map((screening) => (
                <TableRow key={screening.id} className="cursor-pointer">
                  <TableCell className="font-medium">{screening.candidateName}</TableCell>
                  <TableCell>{formatDateTime(screening.date)}</TableCell>
                  <TableCell>{screening.duration}</TableCell>
                  <TableCell>{getScreeningResultBadge(screening.result)}</TableCell>
                  <TableCell>{screening.interviewer}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {screening.skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="bg-gray-100">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-10">
          <Phone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium text-lg mb-1">Brak rozmów telefonicznych</h3>
          <p className="text-muted-foreground mb-4">
            Dla tej kampanii nie przeprowadzono jeszcze żadnych rozmów telefonicznych.
          </p>
          <Button variant="outline" onClick={onScheduleScreening}>
            Zaplanuj pierwszą rozmowę
          </Button>
        </div>
      )}
    </>
  );
};

export default PhoneScreeningsTable;
