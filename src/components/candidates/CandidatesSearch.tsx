
import React from 'react';
import { Input } from '@/components/ui';
import { Search, Filter, Download, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CandidatesSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const CandidatesSearch: React.FC<CandidatesSearchProps> = ({ 
  searchQuery, 
  onSearchChange 
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
      <div className="relative w-full md:w-72">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input 
          placeholder="Szukaj kandydatów..." 
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
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
  );
};

export default CandidatesSearch;
