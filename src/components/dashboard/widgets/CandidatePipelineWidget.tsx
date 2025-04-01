
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { ResponsiveContainer, PieChart, Pie, Tooltip, Cell, Legend } from 'recharts';

interface CandidatePipelineWidgetProps {
  className?: string;
}

const CandidatePipelineWidget: React.FC<CandidatePipelineWidgetProps> = ({ className }) => {
  const data = [
    { name: 'Nowi', value: 35, color: '#1a56db' },
    { name: 'W selekcji', value: 24, color: '#4338ca' },
    { name: 'Po rozmowie', value: 18, color: '#6366f1' },
    { name: 'Zaakceptowani', value: 12, color: '#818cf8' },
    { name: 'Odrzuceni', value: 11, color: '#c7d2fe' },
  ];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Pipeline kandydatów</CardTitle>
        <CardDescription>
          Dystrybucja kandydatów na różnych etapach rekrutacji
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}`, 'Liczba kandydatów']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default CandidatePipelineWidget;
