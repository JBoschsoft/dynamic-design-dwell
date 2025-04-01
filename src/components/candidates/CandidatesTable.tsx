
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { CandidateTableProps } from './types';
import { formatDate } from './utils';

const CandidatesTable: React.FC<CandidateTableProps> = ({ candidates }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nazwa</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Telefon</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Źródło</TableHead>
            <TableHead>Data aplikacji</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidates.length > 0 ? (
            candidates.map((candidate) => (
              <TableRow key={candidate.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="font-medium">{candidate.name}</TableCell>
                <TableCell>{candidate.email}</TableCell>
                <TableCell>{candidate.phone}</TableCell>
                <TableCell>
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${candidate.stage === 'Nowy' ? 'bg-blue-100 text-blue-800' : ''}
                    ${candidate.stage === 'Screening' ? 'bg-purple-100 text-purple-800' : ''}
                    ${candidate.stage === 'Wywiad' ? 'bg-amber-100 text-amber-800' : ''}
                    ${candidate.stage === 'Oferta' ? 'bg-green-100 text-green-800' : ''}
                    ${candidate.stage === 'Zatrudniony' ? 'bg-emerald-100 text-emerald-800' : ''}
                    ${candidate.stage === 'Odrzucony' ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {candidate.stage}
                  </div>
                </TableCell>
                <TableCell>{candidate.source}</TableCell>
                <TableCell>{formatDate(candidate.appliedAt)}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Brak wyników dla podanych kryteriów wyszukiwania.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default CandidatesTable;
