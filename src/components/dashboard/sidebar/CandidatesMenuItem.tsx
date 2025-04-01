
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';
import { SidebarMenuButton } from '@/components/ui/sidebar';
import RecentCandidates from './RecentCandidates';

interface CandidatesMenuItemProps {
  isRecentCandidatesOpen: boolean;
  setIsRecentCandidatesOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CandidatesMenuItem = ({ 
  isRecentCandidatesOpen, 
  setIsRecentCandidatesOpen 
}: CandidatesMenuItemProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isCandidatePath = location.pathname.startsWith('/dashboard/candidates');

  const handleCandidatesClick = () => {
    navigate('/dashboard/candidates');
  };

  const handleToggleAccordion = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent navigation when clicking the toggle
    setIsRecentCandidatesOpen(prev => !prev);
  };

  return (
    <div className="relative">
      <SidebarMenuButton 
        onClick={handleCandidatesClick}
        className={`flex-1 ${isCandidatePath ? 'font-medium text-sidebar-accent-foreground bg-sidebar-accent' : ''}`}
      >
        <div className="flex items-center gap-2">
          <Users />
          <span>Kandydaci</span>
        </div>
      </SidebarMenuButton>
      
      <RecentCandidates 
        isRecentCandidatesOpen={isRecentCandidatesOpen}
        setIsRecentCandidatesOpen={setIsRecentCandidatesOpen}
        onToggle={handleToggleAccordion}
      />
    </div>
  );
};

export default CandidatesMenuItem;
