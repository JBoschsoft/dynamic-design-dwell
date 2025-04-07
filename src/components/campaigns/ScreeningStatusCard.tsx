import React from 'react';
import { Card, CardHeader, CardContent, CardTitle, Badge } from '@/components/ui';
import { Users, Calendar, Zap, Clock } from 'lucide-react';
import { Campaign } from '@/components/campaigns/types';
interface ScreeningStatusCardProps {
  campaign: Campaign;
  screeningCandidatesCount: number;
  candidatesWithManagerCount: number;
  tokensUsed: number;
}
const ScreeningStatusCard: React.FC<ScreeningStatusCardProps> = ({
  campaign,
  screeningCandidatesCount,
  candidatesWithManagerCount,
  tokensUsed
}) => {
  // Determine if screenings are currently active
  const isScreeningActive = campaign.status === 'active' && screeningCandidatesCount > 0;
  const getScreeningStatusBadge = () => {
    if (campaign.status !== 'active') {
      return <Badge variant="secondary">Wstrzymane</Badge>;
    }
    if (screeningCandidatesCount > 0) {
      return <Badge className="bg-green-500">W trakcie</Badge>;
    }
    return <Badge variant="outline">Nie rozpoczęto</Badge>;
  };
  return <Card>
      <CardHeader>
        <CardTitle>Status Screeningow</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium">Status screeningu</div>
          <div>{getScreeningStatusBadge()}</div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium">Kandydaci w procesie dzisiaj</div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{screeningCandidatesCount}</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium">Spotkania z Hiring Managerem</div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>{candidatesWithManagerCount}</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm font-medium">Wykorzystane tokeny</div>
          <div className="flex items-center">
            <Zap className="h-4 w-4 mr-1" />
            <span>{tokensUsed}</span>
          </div>
        </div>
      </CardContent>
    </Card>;
};
export default ScreeningStatusCard;