import React from 'react';
import { useAuth } from '@/lib/authContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { VolunteerLayout } from '@/components/layouts/VolunteerLayout';

// Mock data (you can replace this with real data from your API)
const tasks = [
  {
    id: '1',
    eventId: '1',
    eventTitle: 'Digital Literacy Workshop',
    title: 'Setup equipment',
    description: 'Setup computers and assistive technology devices',
    date: 'Aug 15, 2023',
    time: '9:00 AM - 10:00 AM',
    status: 'upcoming'
  },
  {
    id: '2',
    eventId: '1',
    eventTitle: 'Digital Literacy Workshop',
    title: 'Teaching assistance',
    description: 'Help participants with hands-on exercises',
    date: 'Aug 15, 2023',
    time: '10:00 AM - 1:00 PM',
    status: 'upcoming'
  },
  {
    id: '3',
    eventId: '4',
    eventTitle: 'Blind Cricket Workshop',
    title: 'Equipment management',
    description: 'Manage and distribute cricket equipment to participants',
    date: 'Jul 25, 2023',
    time: '9:00 AM - 12:00 PM',
    status: 'completed'
  },
];

export const VolunteerTasks = () => {
  const { user } = useAuth();

  const upcomingTasks = tasks.filter(task => task.status === 'upcoming');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  return (
    <VolunteerLayout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
          <p className="text-muted-foreground">
            Track and manage your assigned tasks for upcoming and past events.
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tasks</CardTitle>
              <CardDescription>
                Your assigned tasks for upcoming events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{task.title}</h3>
                        <div className="text-sm mt-1">{task.description}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <Badge variant="outline" className="mr-2">{task.eventTitle}</Badge>
                          {task.date} | {task.time}
                        </div>
                      </div>
                      <Badge>{task.status}</Badge>
                    </div>
                  </div>
                ))}
                {upcomingTasks.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    No upcoming tasks assigned.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Completed Tasks</CardTitle>
              <CardDescription>
                Tasks you have completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedTasks.map((task) => (
                  <div key={task.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{task.title}</h3>
                        <div className="text-sm mt-1">{task.description}</div>
                        <div className="text-sm text-muted-foreground mt-1">
                          <Badge variant="outline" className="mr-2">{task.eventTitle}</Badge>
                          {task.date} | {task.time}
                        </div>
                      </div>
                      <Badge variant="secondary">{task.status}</Badge>
                    </div>
                  </div>
                ))}
                {completedTasks.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground">
                    No completed tasks yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </VolunteerLayout>
  );
}; 