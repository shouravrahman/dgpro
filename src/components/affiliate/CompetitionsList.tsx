'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  Users,
  DollarSign,
  Calendar,
  Medal,
  Target,
  TrendingUp,
} from 'lucide-react';
import {
  useAffiliateCompetitions,
  useCompetitionLeaderboard,
} from '@/hooks/useAffiliate';
import { formatDistanceToNow, format } from 'date-fns';
import { toast } from 'sonner';

export function CompetitionsList() {
  const [selectedCompetition, setSelectedCompetition] = useState<string | null>(
    null
  );

  const { competitions, isLoading, error, joinCompetition, isJoining } =
    useAffiliateCompetitions({
      status: 'active',
    });

  const { data: leaderboardData } = useCompetitionLeaderboard(
    selectedCompetition || ''
  );

  const handleJoinCompetition = (competitionId: string) => {
    joinCompetition(competitionId, {
      onSuccess: () => {
        toast.success('Successfully joined the competition!');
      },
      onError: (error) => {
        toast.error(error.message || 'Failed to join competition');
      },
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'upcoming':
        return 'bg-blue-100 text-blue-800';
      case 'ended':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateProgress = (startDate: string, endDate: string) => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const now = Date.now();

    if (now < start) return 0;
    if (now > end) return 100;

    return ((now - start) / (end - start)) * 100;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Failed to load competitions</p>
        <p className="text-sm text-gray-500 mt-1">{error.message}</p>
      </div>
    );
  }

  const competitionsList = competitions?.competitions || [];

  return (
    <div className="space-y-6">
      {/* Active Competitions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {competitionsList.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="text-center py-12">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No active competitions
              </h3>
              <p className="text-gray-600">
                Check back later for new affiliate competitions and challenges.
              </p>
            </CardContent>
          </Card>
        ) : (
          competitionsList.map((competition) => {
            const progress = calculateProgress(
              competition.startDate,
              competition.endDate
            );
            const isActive = competition.status === 'active';
            const isUpcoming = competition.status === 'upcoming';
            const hasEnded = competition.status === 'ended';

            return (
              <Card key={competition.id} className="relative overflow-hidden">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-yellow-600" />
                        {competition.name}
                      </CardTitle>
                      <CardDescription>
                        {competition.description}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(competition.status)}>
                      {competition.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Prize Pool */}
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5 text-yellow-600" />
                      <span className="font-medium">Prize Pool</span>
                    </div>
                    <span className="text-xl font-bold text-yellow-700">
                      ${competition.prizePool.toLocaleString()}
                    </span>
                  </div>

                  {/* Timeline */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Timeline</span>
                      <span className="font-medium">
                        {Math.round(progress)}% complete
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        Started{' '}
                        {format(new Date(competition.startDate), 'MMM d')}
                      </span>
                      <span>
                        Ends {format(new Date(competition.endDate), 'MMM d')}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    {isUpcoming && (
                      <Button
                        onClick={() => handleJoinCompetition(competition.id)}
                        disabled={isJoining}
                        className="flex-1"
                      >
                        {isJoining ? 'Joining...' : 'Join Competition'}
                      </Button>
                    )}

                    {(isActive || hasEnded) && (
                      <Button
                        variant="outline"
                        onClick={() =>
                          setSelectedCompetition(
                            selectedCompetition === competition.id
                              ? null
                              : competition.id
                          )
                        }
                        className="flex-1"
                      >
                        <Medal className="h-4 w-4 mr-2" />
                        View Leaderboard
                      </Button>
                    )}
                  </div>

                  {/* Competition Rules */}
                  {competition.rules &&
                    Object.keys(competition.rules).length > 0 && (
                      <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                        <strong>Rules:</strong>{' '}
                        {JSON.stringify(competition.rules)}
                      </div>
                    )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Leaderboard */}
      {selectedCompetition && leaderboardData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Competition Leaderboard
            </CardTitle>
            <CardDescription>
              {leaderboardData.competition.name} - Current standings
            </CardDescription>
          </CardHeader>
          <CardContent>
            {leaderboardData.leaderboard.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No participants yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leaderboardData.leaderboard.map((participant, index) => (
                  <div
                    key={participant.affiliateId}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      index < 3
                        ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
                        : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0
                            ? 'bg-yellow-500 text-white'
                            : index === 1
                              ? 'bg-gray-400 text-white'
                              : index === 2
                                ? 'bg-orange-600 text-white'
                                : 'bg-gray-200 text-gray-700'
                        }`}
                      >
                        {participant.badge || index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{participant.userName}</p>
                        <p className="text-sm text-gray-600">
                          Code: {participant.affiliateCode}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        ${participant.totalEarnings.toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {participant.totalReferrals} referrals
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
