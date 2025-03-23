import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { VolunteerLayout } from '@/components/layouts/VolunteerLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getTasksForVolunteer } from '@/services/database.service';
import { notificationService } from '@/services/notification.service';
import { pointsService } from '@/services/points.service';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export const VolunteerTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      // Get tasks assigned to the volunteer
      const { data, error } = await getTasksForVolunteer(user.id);
      
      if (error) throw error;
      
      console.log("Fetched volunteer tasks:", data);
      
      // Get notifications for additional details
      const { data: notifications } = await notificationService.getVolunteerNotifications(user.id);
      
      console.log("Volunteer notifications:", notifications);
      
      // Merge task data with notification status if available
      const mergedTasks = data.map(task => {
        const notification = notifications?.find(n => 
          n.task_assignment_id && n.task_assignment_id === task.id
        );
        
        return {
          ...task,
          notification_status: notification?.task_assignment?.notification_status || task.notification_status || 'pending',
          notification_id: notification?.id,
          task_assignment_id: task.id // The task ID from getTasksForVolunteer is actually the task_assignment ID
        };
      });
      
      console.log("Merged tasks with notifications:", mergedTasks);
      
      setTasks(mergedTasks || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const invitationTasks = tasks.filter(task => task.notification_status === 'sent');
  const upcomingTasks = tasks.filter(task => 
    (task.notification_status === 'accept' || task.status === 'accepted') && 
    task.status !== 'completed'
  );
  const completedTasks = tasks.filter(task => task.status === 'completed');

  const handleAccept = async (taskId, assignmentId) => {
    try {
      console.log(`Accepting task: task=${taskId}, assignment=${assignmentId}`);
      
      if (!assignmentId) {
        console.error("No assignment ID found for task", taskId);
        toast.error('Could not accept task: missing assignment information');
        return;
      }
      
      const { success, error } = await notificationService.handleTaskResponse(
        assignmentId,
        user.id,
        'accept'
      );
      
      if (success) {
        toast.success('Task accepted successfully');
        await fetchTasks(); // Refresh tasks
      } else {
        throw error;
      }
    } catch (error) {
      console.error('Error accepting task:', error);
      toast.error('Failed to accept task');
    }
  };

  const handleReject = async (taskId, assignmentId) => {
    try {
      console.log(`Rejecting task: task=${taskId}, assignment=${assignmentId}`);
      
      if (!assignmentId) {
        console.error("No assignment ID found for task", taskId);
        toast.error('Could not reject task: missing assignment information');
        return;
      }
      
      const { success, error } = await notificationService.handleTaskResponse(
        assignmentId,
        user.id,
        'reject'
      );
      
      if (success) {
        toast.success('Task rejected');
        await fetchTasks(); // Refresh tasks
      } else {
        throw error;
      }
    } catch (error) {
      console.error('Error rejecting task:', error);
      toast.error('Failed to reject task');
    }
  };

  const handleComplete = async (taskId, assignmentId) => {
    try {
      console.log(`Completing task: task=${taskId}, assignment=${assignmentId}`);
      
      if (!assignmentId) {
        console.error("No assignment ID found for task", taskId);
        toast.error('Could not complete task: missing assignment information');
        return;
      }
      
      // Update task assignment status to completed
      const { data, error } = await supabase
        .from('task_assignment')
        .update({ status: 'completed' })
        .eq('id', assignmentId)
        .single();
      
      if (error) throw error;
      
      // Award points for task completion (10 points per task)
      try {
        const task = tasks.find(t => t.task_assignment_id === assignmentId);
        await pointsService.addPoints({
          volunteerId: user.id,
          points: 10,
          reason: `Completed task: ${task?.title || 'Task'}`,
          metadata: {
            taskId: taskId,
            assignmentId: assignmentId,
            eventId: task?.event_id
          }
        });
        toast.success('Task marked as completed and points awarded!');
      } catch (pointsError) {
        console.error('Error awarding points:', pointsError);
        // Don't fail the entire operation if points couldn't be awarded
        toast.success('Task marked as completed, but there was an issue awarding points');
      }
      
      await fetchTasks(); // Refresh tasks
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error('Failed to mark task as completed');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'sent':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Invitation</Badge>;
      case 'accept':
        return <Badge className="bg-blue-100 text-blue-800">Accepted</Badge>;
      case 'accepted':
        return <Badge className="bg-blue-100 text-blue-800">Accepted</Badge>;
      case 'reject':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'expired':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Expired</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Render loading state
  if (loading) {
    return (
      <VolunteerLayout>
        <div className="space-y-6">
          <div className="flex flex-col space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">My Tasks</h1>
            <p className="text-muted-foreground">
              Track and manage your assigned tasks for upcoming and past events.
            </p>
          </div>
          
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </VolunteerLayout>
    );
  }

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
                            <Badge variant="outline" className="mr-2">{task.event?.title}</Badge>
                            {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(task.notification_status || task.status)}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleComplete(task.id, task.task_assignment_id)}
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
                            <Badge variant="outline" className="mr-2">{task.event?.title}</Badge>
                            {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No deadline'}
                          </div>
                        </div>
                        <div>
                          {getStatusBadge(task.notification_status)}
                          <div className="flex gap-2 mt-2">
                            <Button 
                              size="sm" 
                              variant="default" 
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => handleAccept(task.id, task.task_assignment_id)}
                            >
                              Accept
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              onClick={() => handleReject(task.id, task.task_assignment_id)}
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
                  Tasks you have successfully completed
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
                            <Badge variant="outline" className="mr-2">{task.event?.title}</Badge>
                            {task.completion_date ? new Date(task.completion_date).toLocaleDateString() : 'Recently completed'}
                          </div>
                        </div>
                        <div>
                          {getStatusBadge('completed')}
                        </div>
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