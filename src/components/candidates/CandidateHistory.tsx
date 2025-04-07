
import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui';
import { CandidateHistoryEvent } from './types';
import { UserPlus, Briefcase, CalendarClock, CheckCircle } from 'lucide-react';

interface CandidateHistoryProps {
  history?: CandidateHistoryEvent[];
}

const CandidateHistory: React.FC<CandidateHistoryProps> = ({ history }) => {
  // Default history events if none provided
  const defaultHistory: CandidateHistoryEvent[] = [
    {
      id: '1',
      title: 'Dodano do systemu',
      description: 'Kandydat został dodany do systemu',
      date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
      icon: UserPlus
    },
    {
      id: '2',
      title: 'Dodano do kampanii rekrutacyjnej',
      description: 'Kandydat dodany do kampanii "Developer React"',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      icon: Briefcase
    },
    {
      id: '3',
      title: 'Zaplanowano spotkanie',
      description: 'Spotkanie z Hiring Managerem',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      icon: CalendarClock
    },
    {
      id: '4',
      title: 'Zatrudniony',
      description: 'Kandydat przyjął ofertę zatrudnienia',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      icon: CheckCircle
    }
  ];

  const displayHistory = history || defaultHistory;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historia kandydata</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {displayHistory.map((event, index) => (
            <div key={event.id} className="relative pl-8">
              {index < displayHistory.length - 1 && (
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
