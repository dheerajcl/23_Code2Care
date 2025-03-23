import React, { useState } from 'react';
import { useAuth } from '@/lib/authContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VolunteerLayout } from '@/components/layouts/VolunteerLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data (you can replace this with real data from your API)
const initialTasks = [
  {
    id: '1',
    eventId: '1',
    eventTitle: 'Digital Literacy Workshop',
    title: 'Setup equipment',
    description: 'Setup computers and assistive technology devices',
    date: 'Aug 15, 2023',
    time: '9:00 AM - 10:00 AM',
    status: 'todo'
  },
  {
    id: '2',
    eventId: '1',
    eventTitle: 'Digital Literacy Workshop',
    title: 'Teaching assistance',
    description: 'Help participants with hands-on exercises',
    date: 'Aug 15, 2023',
    time: '10:00 AM - 1:00 PM',
    status: 'todo'
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
  {
    id: '4',
    eventId: '5',
    eventTitle: 'Coding for Accessibility Workshop',
    title: 'Frontend development assistance',
    description: 'Help teach HTML/CSS accessibility best practices',
    date: 'Aug 22, 2023',
    time: '10:00 AM - 2:00 PM',
    status: 'invitation'
  },
  {
    id: '5',
    eventId: '6',
    eventTitle: 'Community Garden Day',
    title: 'Garden setup assistance',
    description: 'Help setup accessible garden beds and tools',
    date: 'Sep 5, 2023',
    time: '8:00 AM - 12:00 PM',
    status: 'invitation'
  }
];

export const VolunteerTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState(initialTasks);

  const invitationTasks = tasks.filter(task => task.status === 'invitation');
  const upcomingTasks = tasks.filter(task => task.status === 'todo');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  const handleAccept = (taskId) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, status: 'todo' } : task
      )
    );
  };

  const handleReject = (taskId) => {
    setTasks(prevTasks => 
      prevTasks.filter(task => task.id !== taskId)
    );
  };

  const handleComplete = (taskId) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, status: 'completed' } : task
      )
    );
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'invitation':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Invitation</Badge>;
      case 'todo':
        return <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <VolunteerLayout>
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
          <p className="text-muted-foreground">
            Track and manage your assigned tasks for upcoming and past events.
          </p>
        </div>
        
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="upcoming">
              Tasks in Progress ({upcomingTasks.length})
            </TabsTrigger>
            <TabsTrigger value="invitations">
              Invitations ({invitationTasks.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedTasks.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming">
            <Card>
              <CardHeader>
                <CardTitle>Accepted Tasks</CardTitle>
                <CardDescription>
                  Your accepted tasks for upcoming events
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
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(task.status)}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleComplete(task.id)}
                          >
                            Mark Complete
                          </Button>
                        </div>
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
          </TabsContent>
          
          <TabsContent value="invitations">
            <Card>
              <CardHeader>
                <CardTitle>Task Invitations</CardTitle>
                <CardDescription>
                  Event organizers have invited you to these tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {invitationTasks.map((task) => (
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
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(task.status)}
                          <div className="flex gap-2 mt-2">
                            <Button 
                              size="sm" 
                              variant="default" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleAccept(task.id)}
                            >
                              Accept
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => handleReject(task.id)}
                            >
                              Decline
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {invitationTasks.length === 0 && (
                    <div className="text-center py-6 text-muted-foreground">
                      No pending invitations.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="completed">
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
                        {getStatusBadge(task.status)}
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
          </TabsContent>
        </Tabs>
      </div>
    </VolunteerLayout>
  );
};