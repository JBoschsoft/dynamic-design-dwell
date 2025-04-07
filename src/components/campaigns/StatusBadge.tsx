
import React from 'react';
import { Badge } from '@/components/ui';
import { Campaign } from './types';

interface StatusBadgeProps {
  status: Campaign['status'];
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch(status) {
    case 'active':
      return <Badge className="bg-green-500">Aktywna</Badge>;
    case 'draft':
      return <Badge variant="outline">Szkic</Badge>;
    case 'closed':
      return <Badge variant="secondary">Zakończona</Badge>;
    case 'paused':
      return <Badge variant="destructive">Wstrzymana</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default StatusBadge;
