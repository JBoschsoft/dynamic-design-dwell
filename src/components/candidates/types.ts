
export interface Candidate {
  id: string;
  name: string;
  email: string;
  position: string;
  stage: 'Nowy' | 'Screening' | 'Wywiad' | 'Oferta' | 'Zatrudniony' | 'Odrzucony';
  source: string;
  appliedAt: Date;
}

export interface CandidatesListProps {
  refreshTrigger?: number;
}

export interface CandidateTableProps {
  candidates: Candidate[];
}

export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  startIndex: number;
  endIndex: number;
  totalCandidates: number;
  pageSize: number;
  onPageSizeChange: (value: string) => void;
}
