import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { notificationService } from '@/services/notification.service';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/authContext';
import { toast } from 'sonner';

export const TaskResponse = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [taskDetails, setTaskDetails] = useState<any>(null);
  
  // Get parameters from URL
  const taskAssignmentId = searchParams.get('id');
  const action = searchParams.get('action');
  const token = searchParams.get('token');
  
  useEffect(() => {
    const processTaskResponse = async () => {
      setLoading(true);
      
      try {
        if (!taskAssignmentId || !action || !token) {
          throw new Error('Missing required parameters');
        }
        
        if (action !== 'accept' && action !== 'reject') {
          throw new Error('Invalid action');
        }
        
        // Verify token (improved validation)
        const decodedToken = Buffer.from(token, 'base64').toString('utf-8');
        const [storedAssignmentId, volunteerId] = decodedToken.split(':');
        
        // Add additional validation
        const { data: assignment } = await supabase
          .from('task_assignment')
          .select('volunteer_id')
          .eq('id', storedAssignmentId)
          .single();
        
        if (!assignment || assignment.volunteer_id !== volunteerId) {
          throw new Error('Invalid or tampered token');
        }
        
        // Get task assignment details to verify and show feedback
        const { data: assignmentDetails, error: assignmentError } = await supabase
          .from('task_assignment')
          .select(`
            *,
            task:task_id(*),
            event:event_id(*),
            volunteer:volunteer_id(*)
          `)
          .eq('id', storedAssignmentId)
          .single();
        
        if (assignmentError) throw assignmentError;
        
        if (!assignmentDetails) {
          throw new Error('Task assignment not found');
        }
        
        // Store task details for display
        setTaskDetails(assignmentDetails);
        
        // Check if already responded
        if (assignmentDetails.notification_status !== 'sent' && assignmentDetails.notification_status !== 'pending') {
          setError(`You have already ${assignmentDetails.notification_status === 'accept' ? 'accepted' : 'rejected'} this task.`);
          setLoading(false);
          return;
        }
        
        // Process response
        const { success: responseSuccess, error: responseError } = await notificationService.handleTaskResponse(
          storedAssignmentId,
          volunteerId,
          action
        );
        
        if (responseError) throw responseError;
        
        setSuccess(true);
      } catch (err) {
        console.error('Error processing task response:', err);
        setError(err.message || 'Failed to process your response');
      } finally {
        setLoading(false);
      }
    };
    
    processTaskResponse();
  }, [taskAssignmentId, action, token]);
  
  const handleNavigateHome = () => {
    navigate('/volunteer/dashboard');
  };
  
  const handleNavigateToTasks = () => {
    navigate('/volunteer/tasks');
  };
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Icons.spinner className="mx-auto h-12 w-12 animate-spin text-primary" />
          <h2 className="mt-4 text-xl font-semibold">Processing your response...</h2>
          <p className="mt-2 text-muted-foreground">Please wait while we update your task status.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex h-screen items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {error ? "Something went wrong" : (
              success ? (
                action === 'accept' ? "Task Accepted" : "Task Declined"
              ) : "Task Response"
            )}
          </CardTitle>
          <CardDescription>
            {taskDetails && `${taskDetails.task.title} for ${taskDetails.event.title}`}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error ? (
            <div className="p-4 text-center">
              <Icons.alertTriangle className="h-12 w-12 mx-auto text-destructive" />
              <p className="mt-4">{error}</p>
            </div>
          ) : (
            success ? (
              <div className="p-4 text-center">
                {action === 'accept' ? (
                  <>
                    <Icons.checkCircle className="h-12 w-12 mx-auto text-green-500" />
                    <p className="mt-4">You have successfully accepted this task. Thank you for your commitment!</p>
                    {taskDetails && (
                      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                        <h3 className="font-medium">{taskDetails.task.title}</h3>
                        <p className="text-sm mt-1">{taskDetails.task.description}</p>
                        <p className="text-sm mt-2">
                          <span className="font-medium">Event:</span> {taskDetails.event.title}
                        </p>
                        {taskDetails.task.deadline && (
                          <p className="text-sm mt-1">
                            <span className="font-medium">Deadline:</span> {new Date(taskDetails.task.deadline).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <Icons.xCircle className="h-12 w-12 mx-auto text-destructive" />
                    <p className="mt-4">You have declined this task. Thank you for your response.</p>
                  </>
                )}
              </div>
            ) : (
              <div className="p-4 text-center">
                <p>Unable to process your response.</p>
              </div>
            )
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button onClick={handleNavigateHome} variant="outline" className="w-full sm:w-auto">
            Go to Dashboard
          </Button>
          <Button onClick={handleNavigateToTasks} variant="default" className="w-full sm:w-auto">
            View My Tasks
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}; 