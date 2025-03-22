import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { pointsService } from '@/services/points.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from 'lucide-react';

interface BadgeData {
  id: string;
  badge: {
    name: string;
    description: string;
    icon: string;
    points: number;
  };
  earned_at: string;
}

export const BadgeDisplay = ({ volunteerId }: { volunteerId: string }) => {
  const { data: badges, isLoading, error } = useQuery({
    queryKey: ['badges', volunteerId],
    queryFn: () => pointsService.getVolunteerBadges(volunteerId),
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Badges</CardTitle>
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
          <CardTitle>Your Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-red-500">
            Failed to load badges
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Badge className="h-5 w-5" />
          Your Badges
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {badges?.map((badge: BadgeData) => (
            <Card key={badge.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 text-2xl">
                    {badge.badge.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{badge.badge.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {badge.badge.description}
                    </p>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Earned {new Date(badge.earned_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {badges?.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-8">
              No badges earned yet. Keep participating to earn badges!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 