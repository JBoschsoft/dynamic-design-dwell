
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui';
import { CandidateHistoryEvent } from './types';

interface CandidateHistoryProps {
  history: CandidateHistoryEvent[];
}

const CandidateHistory: React.FC<CandidateHistoryProps> = ({ history }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historia kandydata</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {history.map((event, index) => (
            <div key={event.id} className="relative pl-8">
              {index < history.length - 1 && (
                <div className="absolute left-3.5 top-8 bottom-0 w-px bg-border" />
              )}
              
              <div className="absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full border bg-background">
                <event.icon className="h-4 w-4 text-primary" />
              </div>
              
              <div>
                <h4 className="font-medium">{event.title}</h4>
                <p className="text-sm text-muted-foreground mb-1">
                  {event.description}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(event.date).toLocaleDateString('pl-PL', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CandidateHistory;
