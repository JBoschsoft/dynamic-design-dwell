
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui';
import { Input } from '@/components/ui';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Search, UserPlus, Download, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock data for demo purposes
const mockCandidates = Array(100).fill(null).map((_, i) => ({
  id: `c-${i}`,
  name: `Kandydat ${i + 1}`,
  email: `kandydat${i + 1}@example.com`,
  position: ['Developer', 'Designer', 'Manager', 'Tester', 'Analyst'][i % 5],
  stage: ['Nowy', 'Screening', 'Wywiad', 'Oferta', 'Zatrudniony', 'Odrzucony'][i % 6],
  source: ['LinkedIn', 'Aplikacja', 'Polecenie', 'ATS', 'Inne'][i % 5],
  appliedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
}));

interface CandidatesListProps {
  refreshTrigger?: number;
}

const CandidatesList: React.FC<CandidatesListProps> = ({ refreshTrigger }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState('appliedAt');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Filter candidates based on search query
  const filteredCandidates = mockCandidates.filter(candidate => 
    candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    candidate.position.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Calculate pagination
  const totalCandidates = filteredCandidates.length;
  const totalPages = Math.ceil(totalCandidates / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalCandidates);
  const paginatedCandidates = filteredCandidates.slice(startIndex, endIndex);
  
  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if there are fewer than maxVisiblePages
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      // Calculate middle pages
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if we're near the beginning or end
      if (currentPage <= 3) {
        endPage = Math.min(totalPages - 1, 4);
      } else if (currentPage >= totalPages - 2) {
        startPage = Math.max(2, totalPages - 3);
      }
      
      // Add ellipsis if needed
      if (startPage > 2) {
        pageNumbers.push('ellipsis-start');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push('ellipsis-end');
      }
      
      // Always show last page
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  const handlePageSizeChange = (value: string) => {
    const newPageSize = parseInt(value);
    setPageSize(newPageSize);
    // Reset to first page when changing page size
    setCurrentPage(1);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Szukaj kandydatów..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="h-4 w-4" />
            <span>Filtry</span>
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            <span>Eksport</span>
          </Button>
          <Button size="sm" className="gap-2">
            <UserPlus className="h-4 w-4" />
            <span>Dodaj kandydata</span>
          </Button>
        </div>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nazwa</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Stanowisko</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Źródło</TableHead>
              <TableHead>Data aplikacji</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCandidates.length > 0 ? (
              paginatedCandidates.map((candidate) => (
                <TableRow key={candidate.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{candidate.name}</TableCell>
                  <TableCell>{candidate.email}</TableCell>
                  <TableCell>{candidate.position}</TableCell>
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
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Wyświetlanie {startIndex + 1}-{endIndex} z {totalCandidates} wyników</span>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Pokaż:</span>
            <Select 
              value={pageSize.toString()} 
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="w-[80px] h-8">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="200">200</SelectItem>
                <SelectItem value="300">300</SelectItem>
                <SelectItem value="400">400</SelectItem>
                <SelectItem value="500">500</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            
            {getPageNumbers().map((pageNumber, index) => (
              pageNumber === 'ellipsis-start' || pageNumber === 'ellipsis-end' ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={`page-${pageNumber}`}>
                  <PaginationLink 
                    isActive={currentPage === pageNumber}
                    onClick={() => setCurrentPage(Number(pageNumber))}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              )
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};

export default CandidatesList;
