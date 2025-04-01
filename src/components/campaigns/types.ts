
export interface Campaign {
  id: string;
  name: string;
  position: string;
  department: string;
  owner?: string; 
  status: 'active' | 'draft' | 'closed' | 'paused';
  startDate: string;
  endDate: string | null;
  location: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  candidatesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignsListProps {
  refreshTrigger?: number;
}

export interface CampaignsTableProps {
  campaigns: Campaign[];
  allCampaigns: Campaign[];
  onEditCampaign: (id: string) => void;
  onDeleteCampaign: (id: string) => void;
}

export interface CampaignsSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCampaignAdded: () => void;
}

export interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  startIndex: number;
  endIndex: number;
  totalCampaigns: number;
  pageSize: number;
  onPageSizeChange: (size: string) => void;
}

export interface CampaignFormValues {
  name: string;
  position: string;
  department: string;
  location: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  status: 'active' | 'draft' | 'closed' | 'paused';
  description: string;
  requirements: string[];
  responsibilities: string[];
}
