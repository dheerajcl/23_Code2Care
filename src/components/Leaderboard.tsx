import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { pointsService } from '@/services/points.service';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal, Award } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';
import { useAuth } from '@/lib/authContext';

interface LeaderboardEntry {
  volunteer_id: string;
  first_name: string;
  last_name: string;
  total_points: number;
  badge_count: number;
  rank: number;
  profile_image?: string;
}

const getRankIcon = (rank: number) => {
  switch (rank) {
    case 1:
      return <Trophy className="h-5 w-5 text-yellow-500" />;
    case 2:
      return <Medal className="h-5 w-5 text-gray-400" />;
    case 3:
      return <Medal className="h-5 w-5 text-amber-600" />;
    default:
      return <span className="text-gray-500">{rank}</span>;
  }
};

export const Leaderboard = () => {
  const { user } = useAuth();
  
  // Query for the leaderboard
  const { data: leaderboard, isLoading: leaderboardLoading, error: leaderboardError } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => pointsService.getLeaderboard(10),
    retryDelay: 1000,
    retry: 3
  });
  
  // Query for the user's rank
  const { data: userRank, isLoading: rankLoading } = useQuery({
    queryKey: ['volunteer-rank', user?.id],
    queryFn: () => user?.id ? pointsService.getVolunteerRank(user.id) : null,
    enabled: !!user?.id,
    retryDelay: 1000,
    retry: 3
  });
  
  const isLoading = leaderboardLoading || rankLoading;
  const error = leaderboardError;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Volunteers</CardTitle>
        </CardHeader>
        <CardContent>
          <LoadingSpinner size="medium" text="Loading leaderboard..." />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Volunteers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500 py-4">
            Failed to load leaderboard. Please try again later.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Top Volunteers</CardTitle>
        {userRank && (
          <div className="flex items-center gap-2 bg-red-50 p-2 rounded-md dark:bg-red-900 leaderboard-highlight">
            <Award className="h-5 w-5 text-rose-500 leaderboard-highlight-icon" />
            <span className="text-sm font-medium">Your Rank: {userRank.rank}</span>
            <span className="text-sm text-muted-foreground">({userRank.points} points)</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Rank</TableHead>
              <TableHead>Volunteer</TableHead>
              <TableHead className="text-right">Points</TableHead>
              <TableHead className="text-right">Badges</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard && leaderboard.length > 0 ? (
              leaderboard.map((entry: LeaderboardEntry, index: number) => (
                <TableRow 
                  key={entry.volunteer_id}
                  className={user?.id === entry.volunteer_id ? "bg-red-50 dark:bg-red-900 leaderboard-highlight" : ""}
                >
                  <TableCell className="font-medium">
                    {getRankIcon(index + 1)}
                  </TableCell>
                  <TableCell>
                    {entry.first_name} {entry.last_name}
                  </TableCell>
                  <TableCell className="text-right">{entry.total_points}</TableCell>
                  <TableCell className="text-right">{entry.badge_count}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                  No volunteers on the leaderboard yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}; 