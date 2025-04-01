
import React from 'react';
import { PaginationControlsProps } from './types';
import { 
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  startIndex,
  endIndex,
  totalCampaigns,
  pageSize,
  onPageSizeChange
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-center mt-4 gap-4">
      <div className="text-sm text-muted-foreground">
        Wyświetlanie {startIndex + 1}-{endIndex} z {totalCampaigns} kampanii
      </div>
      
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 mr-4">
          <span className="text-sm text-muted-foreground">Kampanii na stronie:</span>
          <Select
            value={pageSize.toString()}
            onValueChange={onPageSizeChange}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={pageSize.toString()} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <span className="text-sm px-2">
          {currentPage} / {totalPages}
        </span>
        
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default PaginationControls;
