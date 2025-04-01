
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface PerformanceIndicatorsWidgetProps {
  className?: string;
}

const PerformanceIndicatorsWidget: React.FC<PerformanceIndicatorsWidgetProps> = ({ className }) => {
  const data = [
    {
      name: 'Tydzień 1',
      czas_selekcji: 4.2,
      czas_rozmowy: 2.8,
    },
    {
      name: 'Tydzień 2',
      czas_selekcji: 3.8,
      czas_rozmowy: 2.5,
    },
    {
      name: 'Tydzień 3',
      czas_selekcji: 3.6,
      czas_rozmowy: 2.6,
    },
    {
      name: 'Tydzień 4',
      czas_selekcji: 3.2,
      czas_rozmowy: 2.1,
    },
    {
      name: 'Tydzień 5',
      czas_selekcji: 3.0,
      czas_rozmowy: 2.0,
    },
    {
      name: 'Tydzień 6',
      czas_selekcji: 3.2,
      czas_rozmowy: 1.8,
    },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Wskaźniki wydajności</CardTitle>
        <CardDescription>
          Średni czas selekcji i przeprowadzania rozmów w ostatnich tygodniach
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="czas_selekcji" 
                stroke="#1a56db" 
                name="Średni czas selekcji (dni)" 
                activeDot={{ r: 8 }} 
              />
              <Line 
                type="monotone" 
                dataKey="czas_rozmowy" 
                stroke="#6366f1" 
                name="Średni czas rozmowy (dni)" 
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceIndicatorsWidget;
