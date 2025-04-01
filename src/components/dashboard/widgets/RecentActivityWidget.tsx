
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import { Badge } from '@/components/ui';

interface RecentActivityWidgetProps {
  className?: string;
}

const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({ className }) => {
  const activities = [
    { 
      id: 1, 
      type: 'Nowy kandydat', 
      description: 'Anna Nowak aplikowała na stanowisko Frontend Developer', 
      date: '12 min temu',
      status: 'Nowy'
    },
    { 
      id: 2, 
      type: 'Zaktualizowana aplikacja', 
      description: 'Marcin Kowalczyk zaktualizował swoje CV', 
      date: '43 min temu',
      status: 'Aktualizacja'
    },
    { 
      id: 3, 
      type: 'Zaplanowana rozmowa', 
      description: 'Rozmowa z Janem Wiśniewskim zaplanowana na jutro', 
      date: '1 godz temu',
      status: 'Rozmowa'
    },
    { 
      id: 4, 
      type: 'Zakończona selekcja', 
      description: 'Zakończono proces selekcji dla stanowiska UX Designer', 
      date: '3 godz temu',
      status: 'Zakończone'
    },
    { 
      id: 5, 
      type: 'Nowa kampania', 
      description: 'Utworzono nową kampanię rekrutacyjną: Backend Developer', 
      date: '5 godz temu',
      status: 'Kampania'
    },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Nowy': return 'bg-green-100 text-green-800';
      case 'Aktualizacja': return 'bg-blue-100 text-blue-800';
      case 'Rozmowa': return 'bg-purple-100 text-purple-800';
      case 'Zakończone': return 'bg-gray-100 text-gray-800';
      case 'Kampania': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Ostatnia aktywność</CardTitle>
        <CardDescription>
          Najnowsze aktywności w systemie
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Typ</TableHead>
              <TableHead>Szczegóły</TableHead>
              <TableHead>Kiedy</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>
                  <Badge className={getStatusColor(activity.status)}>
                    {activity.status}
                  </Badge>
                </TableCell>
                <TableCell>{activity.description}</TableCell>
                <TableCell>{activity.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RecentActivityWidget;
