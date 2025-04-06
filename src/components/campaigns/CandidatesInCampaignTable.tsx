
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
import { UserPlus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { pl } from 'date-fns/locale';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  appliedDate: string;
  source: string;
  rating: number;
}

interface CandidatesInCampaignTableProps {
  candidates: Candidate[];
  onAddCandidate: () => void;
}

const CandidatesInCampaignTable: React.FC<CandidatesInCampaignTableProps> = ({ 
  candidates,
  onAddCandidate
}) => {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nie określono';
    return format(parseISO(dateString), 'd MMMM yyyy', { locale: pl });
  };

  const getCandidateStatusBadge = (status: string) => {
    switch(status) {
      case 'new':
        return <Badge variant="outline">Nowy</Badge>;
      case 'screening':
        return <Badge className="bg-blue-500">Screening</Badge>;
      case 'interview':
        return <Badge className="bg-purple-500">Wywiad</Badge>;
      case 'offer':
        return <Badge className="bg-amber-500">Oferta</Badge>;
      case 'hired':
        return <Badge className="bg-green-500">Zatrudniony</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Odrzucony</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Lista kandydatów</h3>
        <Button onClick={onAddCandidate}>
          <UserPlus className="mr-2 h-4 w-4" />
          Dodaj kandydata
        </Button>
      </div>
      
      {candidates.length > 0 ? (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imię i nazwisko</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data aplikacji</TableHead>
                <TableHead>Źródło</TableHead>
                <TableHead>Ocena</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {candidates.map((candidate) => (
                <TableRow key={candidate.id} className="cursor-pointer">
                  <TableCell className="font-medium">{candidate.name}</TableCell>
                  <TableCell>{candidate.email}</TableCell>
                  <TableCell>{candidate.phone}</TableCell>
                  <TableCell>{getCandidateStatusBadge(candidate.status)}</TableCell>
                  <TableCell>{formatDate(candidate.appliedDate)}</TableCell>
                  <TableCell>{candidate.source}</TableCell>
                  <TableCell>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <svg 
                          key={i}
                          xmlns="http://www.w3.org/2000/svg" 
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill={i < candidate.rating ? "currentColor" : "none"} 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          className={i < candidate.rating ? "text-yellow-400" : "text-gray-300"}
                        >
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
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
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium text-lg mb-1">Brak kandydatów</h3>
          <p className="text-muted-foreground mb-4">
            Ta kampania nie ma jeszcze przypisanych kandydatów.
          </p>
          <Button onClick={onAddCandidate}>
            Dodaj kandydatów
          </Button>
        </div>
      )}
    </>
  );
};

export default CandidatesInCampaignTable;
