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
import { Trophy, Medal } from 'lucide-react';

interface LeaderboardEntry {
  volunteer_id: string;
  first_name: string;
  last_name: string;
  total_points: number;
  badge_count: number;
  rank: number;
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
      return <span className="text-sm font-medium">{rank}</span>;
  }
};

export const Leaderboard = () => {
  const { data: leaderboard, isLoading, error } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => pointsService.getLeaderboard(10),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Volunteers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
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
          <div className="text-center text-red-500">
            Failed to load leaderboard
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Volunteers</CardTitle>
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
            {leaderboard?.map((entry: LeaderboardEntry) => (
              <TableRow key={entry.volunteer_id}>
                <TableCell className="font-medium">
                  {getRankIcon(entry.rank)}
                </TableCell>
                <TableCell>
                  {entry.first_name} {entry.last_name}
                </TableCell>
                <TableCell className="text-right">{entry.total_points}</TableCell>
                <TableCell className="text-right">{entry.badge_count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}; 