
export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  stage: 'Nowy' | 'Screening' | 'Wywiad' | 'Oferta' | 'Zatrudniony' | 'Odrzucony';
  source: string;
  appliedAt: Date;
  // Additional candidate fields
  jobTitle?: string;
  linkedin?: string;
  experience?: string;
  education?: string;
  salary?: string;
  availability?: string;
  notes?: string;
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

// Updated types for the candidate form
export interface CandidateFormProps {
  onSubmit: (candidate: Omit<Candidate, 'id'>) => void;
  isOpen: boolean;
  onClose: () => void;
}

export interface CandidateFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  stage: Candidate['stage'];
  source: string;
}

