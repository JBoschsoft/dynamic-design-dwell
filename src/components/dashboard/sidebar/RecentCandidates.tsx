
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ChevronDown, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { mockCandidates } from '@/components/candidates/mockData';

interface RecentCandidate {
  id: string;
  firstName: string;
  lastName: string;
  viewedAt: Date;
}

interface RecentCandidatesProps {
  isRecentCandidatesOpen: boolean;
  setIsRecentCandidatesOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onToggle: (e: React.MouseEvent) => void;
}

const RecentCandidates = ({ 
  isRecentCandidatesOpen, 
  setIsRecentCandidatesOpen,
  onToggle 
}: RecentCandidatesProps) => {
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  
  const [recentCandidates, setRecentCandidates] = useState<RecentCandidate[]>(() => {
    const saved = localStorage.getItem('recentlyViewedCandidates');
    return saved ? JSON.parse(saved) : [];
  });

  const isCandidatesListPage = location.pathname === '/dashboard/candidates';
  const isSpecificCandidate = location.pathname.includes('/dashboard/candidates/') && id;
  
  const currentCandidate = isSpecificCandidate ? 
    mockCandidates.find(c => c.id === id) : null;
  
  // Update recent candidates when viewing a specific candidate
  useEffect(() => {
    if (currentCandidate && id) {
      const newRecentCandidate = {
        id: currentCandidate.id,
        firstName: currentCandidate.firstName,
        lastName: currentCandidate.lastName,
        viewedAt: new Date()
      };
      
      setRecentCandidates(prev => {
        const filtered = prev.filter(c => c.id !== id);
        const updated = [newRecentCandidate, ...filtered];
        const limited = updated.slice(0, 10);
        
        localStorage.setItem('recentlyViewedCandidates', JSON.stringify(limited));
        
        return limited;
      });
    }
  }, [currentCandidate, id]);

  // Auto-open the accordion only when on the candidates list page
  useEffect(() => {
    if (isCandidatesListPage && !isRecentCandidatesOpen) {
      setIsRecentCandidatesOpen(true);
    }
  }, [isCandidatesListPage, isRecentCandidatesOpen, setIsRecentCandidatesOpen]);

  if (recentCandidates.length === 0) {
    return null;
  }

  return (
    <Collapsible 
      open={isRecentCandidatesOpen} 
      onOpenChange={setIsRecentCandidatesOpen}
    >
      <div className="flex items-center w-full">
        <CollapsibleTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 p-0 hover:bg-transparent"
            onClick={onToggle}
          >
            <ChevronDown 
              className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isRecentCandidatesOpen ? 'rotate-180' : 'rotate-0'}`} 
            />
          </Button>
        </CollapsibleTrigger>
      </div>
      
      <CollapsibleContent className="pl-8 pr-2 pt-1 pb-0">
        <div className="flex flex-col space-y-1">
          {isSpecificCandidate && currentCandidate && (
            <Link 
              to={`/dashboard/candidates/${id}`}
              className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md bg-sidebar-accent/50 font-medium"
            >
              <User className="h-3 w-3" />
              <span className="truncate">{`${currentCandidate.firstName} ${currentCandidate.lastName}`}</span>
            </Link>
          )}
          
          <div className="flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground mt-2">
            <Clock className="h-3 w-3" />
            <span>Ostatnio przeglądane</span>
          </div>
          
          {recentCandidates
            .filter(c => !isSpecificCandidate || c.id !== id)
            .slice(0, 5)
            .map(candidate => (
              <Link 
                key={candidate.id}
                to={`/dashboard/candidates/${candidate.id}`}
                className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-sidebar-accent/30"
              >
                <User className="h-3 w-3" />
                <span className="truncate">{`${candidate.firstName} ${candidate.lastName}`}</span>
              </Link>
            ))
          }
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default RecentCandidates;
