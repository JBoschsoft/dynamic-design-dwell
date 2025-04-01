
export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string; // Added phone field
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

// New interfaces for the refactored components
export interface CandidatesImportProps {
  onImportSuccess?: () => void;
}

export interface ImportCSVProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export interface ImportPasteProps {
  pastedText: string;
  onPastedTextChange: (text: string) => void;
}

export interface ImportManualProps {
  manualInput: string;
  onManualInputChange: (text: string) => void;
}

export interface ImportATSProps {
  selectedAts: string;
  onSelectedAtsChange: (ats: string) => void;
  atsApiKey: string;
  onAtsApiKeyChange: (key: string) => void;
  atsProjectId: string;
  onAtsProjectIdChange: (id: string) => void;
}
