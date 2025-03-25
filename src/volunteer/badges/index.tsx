import React from 'react';
import { useAuth } from '@/lib/authContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Award } from 'lucide-react';
import { VolunteerLayout } from '@/components/layouts/VolunteerLayout';
import AccessibilityMenu from '@/components/AccessibilityMenu';


// Mock data (you can replace this with real data from your API)
const badges = [
  {
    id: '1',
    name: 'First Steps',
    description: 'Completed your first volunteer activity',
    icon: '🌱',
    date: 'Jul 25, 2023',
    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
  },
  {
    id: '2',
    name: 'Tech Helper',
    description: 'Assisted in a technology-based volunteer event',
    icon: '💻',
    date: 'Jul 25, 2023',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
  },
  {
    id: '3',
    name: 'Early Bird',
    description: 'Arrived early and helped with setup',
    icon: '🐦',
    date: 'Jul 25, 2023',
    color: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
  },
];

export const VolunteerBadges = () => {
  const { user } = useAuth();

  return (
    <VolunteerLayout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">My Badges</h1>
          <p className="text-muted-foreground">
            View your earned badges and achievements from volunteer activities.
          </p>
        </div>
        
        <div className="grid gap-4 md:grid-cols-3">
          {badges.map((badge) => (
            <Card key={badge.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{badge.name}</CardTitle>
                  <div className={`w-12 h-12 flex items-center justify-center text-2xl rounded-full ${badge.color}`}>
                    {badge.icon}
                  </div>
                </div>
                <CardDescription>
                  {badge.description}
                </CardDescription>
              </CardHeader>
              <CardFooter className="pt-2">
                <div className="text-xs text-muted-foreground">
                  Earned on {badge.date}
                </div>
              </CardFooter>
            </Card>
          ))}
          <Card className="flex flex-col items-center justify-center p-6 border-dashed">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-2">
              <Award className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">More badges await!</h3>
            <p className="text-sm text-muted-foreground text-center">
              Participate in more events to unlock additional badges and achievements.
            </p>
          </Card>
        </div>
        <AccessibilityMenu/>
      </div>
    </VolunteerLayout>
  );
}; 