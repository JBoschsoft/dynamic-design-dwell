
import React from 'react';
import { Button } from '@/components/ui';
import { Users } from 'lucide-react';

const RecruitmentTeam: React.FC = () => {
  return (
    <div className="text-center py-10">
      <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="font-medium text-lg mb-1">Brak zespołu rekrutacyjnego</h3>
      <p className="text-muted-foreground mb-4">
        Dodaj członków zespołu odpowiedzialnych za tę kampanię rekrutacyjną.
      </p>
      <Button>
        Dodaj członków zespołu
      </Button>
    </div>
  );
};

export default RecruitmentTeam;
