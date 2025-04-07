
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui';
import { Candidate } from './types';

interface ProfessionalDetailsProps {
  candidate: Candidate;
}

const ProfessionalDetails: React.FC<ProfessionalDetailsProps> = ({ candidate }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Szczegóły zawodowe</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {candidate.jobTitle && (
          <div>
            <p className="text-sm text-muted-foreground">Stanowisko</p>
            <p>{candidate.jobTitle}</p>
          </div>
        )}
        {candidate.experience && (
          <div>
            <p className="text-sm text-muted-foreground">Doświadczenie</p>
            <p>{candidate.experience}</p>
          </div>
        )}
        {candidate.education && (
          <div>
            <p className="text-sm text-muted-foreground">Wykształcenie</p>
            <p>{candidate.education}</p>
          </div>
        )}
        {candidate.salary && (
          <div>
            <p className="text-sm text-muted-foreground">Oczekiwane wynagrodzenie</p>
            <p>{candidate.salary}</p>
          </div>
        )}
        {candidate.availability && (
          <div>
            <p className="text-sm text-muted-foreground">Dostępność</p>
            <p>{candidate.availability}</p>
          </div>
        )}
        {candidate.linkedin && (
          <div>
            <p className="text-sm text-muted-foreground">LinkedIn</p>
            <a href={candidate.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {candidate.linkedin}
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfessionalDetails;
