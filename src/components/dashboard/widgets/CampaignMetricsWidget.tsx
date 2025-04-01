
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface CampaignMetricsWidgetProps {
  className?: string;
}

const CampaignMetricsWidget: React.FC<CampaignMetricsWidgetProps> = ({ className }) => {
  const data = [
    {
      name: 'Sty',
      aktywne: 5,
      zakończone: 2,
    },
    {
      name: 'Lut',
      aktywne: 6,
      zakończone: 3,
    },
    {
      name: 'Mar',
      aktywne: 8,
      zakończone: 4,
    },
    {
      name: 'Kwi',
      aktywne: 7,
      zakończone: 5,
    },
    {
      name: 'Maj',
      aktywne: 9,
      zakończone: 6,
    },
    {
      name: 'Cze',
      aktywne: 8,
      zakończone: 7,
    },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Statystyki kampanii</CardTitle>
        <CardDescription>
          Przegląd kampanii rekrutacyjnych w ciągu ostatnich 6 miesięcy
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="aktywne" fill="#1a56db" name="Aktywne kampanie" />
              <Bar dataKey="zakończone" fill="#6366f1" name="Zakończone kampanie" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaignMetricsWidget;
